const selected = new Map();
const cards = [...document.querySelectorAll(".movie-card")];
const grid = document.getElementById("movie-grid");
const count = document.getElementById("selected-count");
const genreFilter = document.getElementById("genre-filter");
const sortOrder = document.getElementById("sort-order");
const search = document.getElementById("search");
const toast = document.getElementById("toast");
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function updateCount() { count.textContent = selected.size; }
function selectedPayload() {
  return [...selected.entries()].map(([id, rating]) => ({id, rating}));
}
function toggleMovieCard(card) {
  const id = card.dataset.id;
  if (selected.has(id)) {
    selected.delete(id);
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  } else {
    selected.set(id, 4);
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
  }
  updateCount();
}
cards.forEach(card => card.addEventListener("click", () => toggleMovieCard(card)));

function applyFilters() {
  const genre = genreFilter.value;
  const query = search.value.trim().toLowerCase();
  cards.forEach(card => {
    const genres = card.dataset.genres.split("|");
    const matchesGenre = genre === "All" || genres.includes(genre);
    const matchesSearch = card.dataset.title.includes(query);
    card.hidden = !(matchesGenre && matchesSearch);
  });
  const visible = cards.filter(c => !c.hidden);
  document.getElementById("empty-state").hidden = visible.length !== 0;
  const mode = sortOrder.value;
  visible.sort((a,b) => {
    if (mode === "year-desc") return Number(b.dataset.year) - Number(a.dataset.year);
    if (mode === "year-asc") return Number(a.dataset.year) - Number(b.dataset.year);
    if (mode === "rating-desc") return Number(b.dataset.rating) - Number(a.dataset.rating);
    return a.dataset.title.localeCompare(b.dataset.title);
  });
  visible.forEach(card => grid.appendChild(card));
}
genreFilter.addEventListener("change", () => {
  document.querySelectorAll(".genre").forEach(b => b.classList.toggle("active", b.dataset.genre === genreFilter.value));
  applyFilters();
});
document.querySelectorAll(".genre").forEach(button => button.addEventListener("click", () => {
  genreFilter.value = button.dataset.genre;
  document.querySelectorAll(".genre").forEach(b => b.classList.toggle("active", b === button));
  applyFilters();
}));
sortOrder.addEventListener("change", applyFilters);
search.addEventListener("input", applyFilters);

document.getElementById("clear-btn").addEventListener("click", () => {
  selected.clear();
  cards.forEach(card => { card.classList.remove("selected"); card.setAttribute("aria-pressed","false"); });
  updateCount();
  document.getElementById("recommendation-grid").innerHTML =
    '<div class="recommend-empty"><div class="sparkle">✦</div><strong>Your next favourite movie is waiting.</strong><span>Select movies above and click Recommend.</span></div>';
  document.getElementById("recommend-subtitle").textContent = "Your personalized movie list will appear here.";
  document.getElementById("metrics").hidden = true;
  notify("Your selection has been cleared.");
});
document.getElementById("recommend-btn").addEventListener("click", async () => {
  if (!selected.size) { notify("Select at least one movie you have watched."); return; }
  const age = Number(document.getElementById("age").value);
  if (!Number.isFinite(age) || age < 13 || age > 100) { notify("Enter an age between 13 and 100."); return; }
  const btn = document.getElementById("recommend-btn");
  btn.disabled = true; btn.textContent = "Finding your movies...";
  try {
    const ratings = Object.fromEntries(selected.entries());
    const response = await fetch("/api/recommend", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({selected:[...selected.keys()], ratings, genre:genreFilter.value, age})
    });
    const data = await response.json();
    renderRecommendations(data.recommendations);
    document.getElementById("recommend-subtitle").textContent =
      `Based on ${selected.size} selected movie${selected.size === 1 ? "" : "s"} · Hybrid AI pipeline · ${data.elapsed_ms} ms`;
    document.getElementById("metrics").hidden = true;
    notify("Your recommendations are ready.");
    document.getElementById("recommendation-section").scrollIntoView({behavior:"smooth", block:"start"});
  } catch (e) {
    notify("Could not reach the recommendation engine. Check that Flask is running.");
  } finally {
    btn.disabled = false; btn.innerHTML = "<span>✦</span> Recommend";
  }
});

function posterMarkup(movie, small=false) {
  const title = escapeHtml(movie.title);
  const fallback = `https://placehold.co/180x260/282c3b/ffffff?text=${encodeURIComponent(movie.title)}`;
  const url = movie.poster || fallback;
  return `<img class="${small ? "recommend-poster" : "poster"}" src="${url}" alt="${title} poster" onerror="this.onerror=null;this.src='${fallback}'">`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function renderRecommendations(movies) {
  const target = document.getElementById("recommendation-grid");
  if (!movies.length) {
    target.innerHTML = '<div class="recommend-empty"><strong>No matching recommendations</strong><span>Try another genre or select more movies.</span></div>';
    return;
  }
  target.innerHTML = movies.map(movie => `
    <article class="recommend-card">
      ${posterMarkup(movie, true)}
      <div class="recommend-copy">
        <h3>${escapeHtml(movie.title)}</h3>
        <div class="rating-line"><span class="star">★</span><strong>${movie.rating}</strong><span class="out-of">/ 5 · ${movie.year}</span></div>
        <div class="genre-tags">${movie.genres_list.slice(0,2).map(g=>`<span>${escapeHtml(g)}</span>`).join("")}</div>
        <span class="score-pill">AI score ${movie.score}/5</span>
      </div>
    </article>`).join("");
}
document.getElementById("theme-toggle").addEventListener("change", event => {
  document.body.classList.toggle("light", !event.target.checked);
  document.getElementById("theme-label").textContent = event.target.checked ? "Dark Mode" : "Light Mode";
});
document.getElementById("menu-btn").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("evaluate-btn").addEventListener("click", async () => {
  const btn = document.getElementById("evaluate-btn");
  btn.disabled = true; btn.textContent = "Evaluating...";
  try {
    const response = await fetch("/api/evaluate");
    const m = await response.json();
    const box = document.getElementById("metrics");
    box.innerHTML = `
      <div class="metric"><span>Precision@5</span><strong>${m.precision_at_5}</strong></div>
      <div class="metric"><span>Recall@5</span><strong>${m.recall_at_5}</strong></div>
      <div class="metric"><span>Evaluation cases</span><strong>${m.evaluation_cases}</strong></div>
      <div class="metric"><span>Runtime</span><strong>${m.runtime_ms} ms</strong></div>`;
    box.hidden = false;
    notify("Evaluation complete.");
  } catch(e) { notify("Could not evaluate model. Check Flask server."); }
  finally { btn.disabled = false; btn.textContent = "Evaluate AI model"; }
});

// CineBot stays in memory for this page only; no conversation is persisted.
const chatPanel = document.getElementById("cinebot-panel");
const chatLauncher = document.getElementById("chat-launcher");
const chatMessages = document.getElementById("cinebot-messages");
const chatSuggestions = document.getElementById("cinebot-suggestions");
const chatInput = document.getElementById("cinebot-input");
let chatHistory = [];
let chatOpened = false;

function mentionedMovies(text) {
  return cards.filter(card => text.toLowerCase().includes(card.dataset.title)).slice(0, 4);
}
function appendChatMessage(role, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  const body = document.createElement("div");
  body.className = "chat-bubble";
  body.textContent = text;
  message.appendChild(body);
  if (role === "bot") {
    mentionedMovies(text).forEach(card => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chat-movie-chip";
      const img = card.querySelector(".poster");
      const title = card.querySelector(".card-title").textContent;
      chip.innerHTML = `${img && img.src ? `<img src="${escapeHtml(img.src)}" alt="">` : ""}<span>${escapeHtml(title)}<small>★ ${escapeHtml(card.dataset.rating)}</small></span>`;
      chip.addEventListener("click", () => {
        if (!selected.has(card.dataset.id)) toggleMovieCard(card);
        card.scrollIntoView({behavior: "smooth", block: "center"});
        notify(`${title} selected.`);
      });
      message.appendChild(chip);
    });
  }
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function showSuggestions(items) {
  chatSuggestions.innerHTML = "";
  (items || []).slice(0, 3).forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.textContent = item;
    chip.addEventListener("click", () => sendChatMessage(item));
    chatSuggestions.appendChild(chip);
  });
}
function openChat() {
  chatOpened = true;
  chatPanel.hidden = false;
  chatPanel.classList.add("open");
  chatLauncher.setAttribute("aria-expanded", "true");
  if (!chatMessages.children.length) {
    appendChatMessage("bot", "Welcome to CineBot! I can help you find your next favourite movie.");
    showSuggestions(["Recommend me something", "Movies like The Dark Knight", "Best sci-fi"]);
  }
  chatInput.focus();
}
function closeChat() {
  chatOpened = false;
  chatPanel.classList.remove("open");
  chatPanel.hidden = true;
  chatLauncher.setAttribute("aria-expanded", "false");
  chatLauncher.focus();
}
function runChatActions(actions) {
  (actions || []).forEach(action => {
    if (action.type === "select") {
      (action.ids || []).forEach(id => {
        const card = document.querySelector(`.movie-card[data-id="${CSS.escape(id)}"]`);
        if (card && !selected.has(id)) toggleMovieCard(card);
      });
    } else if (action.type === "set_genre" && [...genreFilter.options].some(option => option.value === action.genre)) {
      genreFilter.value = action.genre;
      genreFilter.dispatchEvent(new Event("change"));
    } else if (action.type === "recommend") {
      document.getElementById("recommend-btn").click();
    } else if (action.type === "clear") {
      document.getElementById("clear-btn").click();
    }
  });
}
async function sendChatMessage(message) {
  const clean = String(message || "").trim();
  if (!clean) return;
  chatInput.value = "";
  appendChatMessage("user", clean);
  chatHistory.push({role: "user", content: clean});
  const typing = document.createElement("div");
  typing.className = "chat-message bot typing";
  typing.textContent = "CineBot is thinking...";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        message: clean,
        history: chatHistory.slice(-10),
        selected: [...selected.keys()],
        genre: genreFilter.value
      })
    });
    const data = await response.json();
    typing.remove();
    appendChatMessage("bot", data.reply || "I couldn't find a match.");
    chatHistory.push({role: "assistant", content: data.reply || ""});
    showSuggestions(data.suggested_replies);
    runChatActions(data.actions);
  } catch (error) {
    typing.remove();
    appendChatMessage("bot", "I’m having trouble reaching the movie assistant. Please try again.");
    showSuggestions(["Recommend something", "Show me sci-fi", "Help"]);
  }
}
chatLauncher.addEventListener("click", () => chatOpened ? closeChat() : openChat());
document.getElementById("chat-close").addEventListener("click", closeChat);
document.getElementById("cinebot-form").addEventListener("submit", event => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
});
document.getElementById("chat-clear").addEventListener("click", () => {
  chatHistory = [];
  chatMessages.innerHTML = "";
  chatSuggestions.innerHTML = "";
  appendChatMessage("bot", "Chat cleared. What would you like to watch?");
  showSuggestions(["Recommend me something", "Movies like The Dark Knight", "Best sci-fi"]);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && chatOpened) closeChat();
});
