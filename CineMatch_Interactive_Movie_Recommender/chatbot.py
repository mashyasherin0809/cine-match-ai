"""CineBot conversation and action handling.

The module is deliberately independent of Flask so the recommender remains the
single source of truth for ranking and the chat endpoint stays small.
"""
import json
import os
import re
from difflib import SequenceMatcher, get_close_matches
from typing import Any, Callable, Dict, List, Optional, Tuple


MAX_MESSAGE_LENGTH = 500
VALID_MOODS = {
    "funny": ["Comedy"],
    "hilarious": ["Comedy"],
    "sad": ["Drama"],
    "scary": ["Horror"],
    "frightening": ["Horror"],
    "thrilling": ["Thriller", "Action"],
    "exciting": ["Thriller", "Action"],
    "family": ["Animation", "Children's"],
    "romantic": ["Romance"],
    "space": ["Sci-Fi"],
    "futuristic": ["Sci-Fi"],
}


class CineBot:
    def __init__(
        self,
        movies: List[Dict[str, Any]],
        recommend: Callable[..., List[Dict[str, Any]]],
        signals: Callable[..., Dict[str, Dict[str, Any]]],
    ):
        self.movies = movies
        self.by_id = {movie["movie_id"]: movie for movie in movies}
        self.genres = sorted({genre for movie in movies for genre in movie["genres_list"]})
        self.recommend = recommend
        self.signals = signals

    def handle(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]],
        selected: Optional[List[str]],
        genre: str,
    ) -> Dict[str, Any]:
        clean_message = str(message or "").strip()[:MAX_MESSAGE_LENGTH]
        selected_ids = self.valid_ids(selected or [])
        current_genre = genre if genre in self.genres or genre == "All" else "All"
        if not clean_message:
            return self.fallback_response("Tell me what kind of movie you are in the mood for.")

        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if api_key:
            try:
                return self.llm_response(clean_message, history or [], selected_ids, current_genre, api_key)
            except Exception:
                # The offline engine is intentionally the normal recovery path for
                # unavailable keys, SDK errors, malformed model output, and timeouts.
                pass
        return self.offline_response(clean_message, selected_ids, current_genre)

    def valid_ids(self, ids: List[Any]) -> List[str]:
        return list(dict.fromkeys(str(mid) for mid in ids if str(mid) in self.by_id))

    def valid_actions(self, actions: Any) -> List[Dict[str, Any]]:
        if not isinstance(actions, list):
            return []
        clean = []
        for action in actions[:6]:
            if not isinstance(action, dict):
                continue
            action_type = action.get("type")
            if action_type == "select":
                ids = self.valid_ids(action.get("ids", []))
                if ids:
                    clean.append({"type": "select", "ids": ids})
            elif action_type == "set_genre" and action.get("genre") in self.genres:
                clean.append({"type": "set_genre", "genre": action["genre"]})
            elif action_type in {"recommend", "clear"}:
                clean.append({"type": action_type})
        return clean

    def response(self, reply: str, actions: Any = None, suggestions: Any = None) -> Dict[str, Any]:
        suggestions = suggestions if isinstance(suggestions, list) else []
        suggestions = [str(item)[:100] for item in suggestions if str(item).strip()][:3]
        while len(suggestions) < 3:
            suggestions.append(["Recommend something", "Show me a top-rated movie", "Help"][len(suggestions)])
        return {
            "reply": str(reply)[:1200],
            "actions": self.valid_actions(actions or []),
            "suggested_replies": suggestions,
        }

    def fallback_response(self, reply: str) -> Dict[str, Any]:
        return self.response(reply, suggestions=["Recommend something", "Show me sci-fi", "Help"])

    def movie_matches(self, text: str, limit: int = 3) -> List[Dict[str, Any]]:
        lowered = text.lower()
        exact = [movie for movie in self.movies if movie["title"].lower() in lowered]
        if exact:
            return exact[:limit]
        words = re.sub(r"[^a-z0-9 ]", " ", lowered).split()
        candidates = []
        for movie in self.movies:
            title = movie["title"].lower()
            score = max(
                SequenceMatcher(None, lowered, title).ratio(),
                SequenceMatcher(None, " ".join(words), title).ratio(),
            )
            candidates.append((score, movie))
        return [movie for score, movie in sorted(candidates, reverse=True)[:limit] if score >= 0.48]

    def extract_genres(self, text: str) -> List[str]:
        lowered = text.lower()
        found = [genre for genre in self.genres if genre.lower() in lowered]
        for mood, genres in VALID_MOODS.items():
            if mood in lowered:
                found.extend(genres)
        return list(dict.fromkeys(found))

    def top_movies(self, selected: List[str], genre: str, limit: int = 3) -> List[Dict[str, Any]]:
        return self.recommend(selected, {}, genre if genre != "All" else None, top_n=limit)

    def movie_text(self, movies: List[Dict[str, Any]]) -> str:
        return ", ".join(f"{movie['title']} ({movie['rating']}/5)" for movie in movies)

    def offline_response(self, text: str, selected: List[str], current_genre: str) -> Dict[str, Any]:
        lowered = text.lower()
        if re.search(r"\b(hi|hello|hey|good morning|good evening)\b", lowered):
            return self.response(
                "Hi! I’m CineBot. Tell me a mood, genre, era, or a movie you enjoyed.",
                suggestions=["Recommend me something", "Movies like The Dark Knight", "Best sci-fi"],
            )

        if "help" in lowered or "what can" in lowered:
            return self.response(
                "I can suggest movies, find titles similar to something you liked, set the genre filter, explain a recommendation, or clear your selection.",
                suggestions=["Recommend something", "Show me comedy", "Clear my selection"],
            )

        if "clear" in lowered or "reset" in lowered:
            return self.response("Done — I cleared your selected movies.", [{"type": "clear"}])

        if "why" in lowered and ("recommend" in lowered or "suggest" in lowered):
            matches = self.movie_matches(text)
            if matches:
                movie = matches[0]
                liked_genres = {
                    genre
                    for mid in selected
                    for genre in self.by_id[mid]["genres_list"]
                }
                signal = self.signals(selected, {}) .get(movie["movie_id"], {})
                shared = sorted(set(movie["genres_list"]) & liked_genres)
                reasons = []
                if shared:
                    reasons.append(f"it matches your selected {', '.join(shared)} taste")
                if signal.get("logic_candidate"):
                    reasons.append("the rule and logic signals marked it as a genre candidate")
                if signal.get("analogy_score", 0) > 0:
                    reasons.append("its genres are analogous to your selected movies")
                if signal.get("bayes_score", 0) >= 0.5:
                    reasons.append("the Bayesian and induction signals rate its catalogue attributes positively")
                reasons.append(f"its catalogue rating is {movie['rating']}/5")
                return self.response(f"{movie['title']} was surfaced because " + "; ".join(reasons) + ".")
            return self.fallback_response("Tell me the movie title and I’ll explain which catalogue signals support it.")

        requested_genres = self.extract_genres(text)
        if requested_genres and not any(word in lowered for word in ["like", "similar", "recommend", "suggest", "watch"]):
            chosen = requested_genres[0]
            return self.response(
                f"Here are the catalogue movies in {chosen}. I’ve set the page filter for you.",
                [{"type": "set_genre", "genre": chosen}],
                [f"Recommend {chosen} movies", "Show me top rated", "Clear my selection"],
            )

        if "top rated" in lowered or "best" in lowered:
            results = sorted(self.movies, key=lambda movie: movie["rating"], reverse=True)[:3]
            return self.response(f"Top rated picks: {self.movie_text(results)}.", suggestions=["Show me sci-fi", "Movies like The Godfather", "Help"])

        matches = self.movie_matches(text)
        wants_recommendation = any(word in lowered for word in ["recommend", "suggest", "watch", "like", "similar"])
        if matches and wants_recommendation:
            selected_matches = [movie for movie in matches if movie["movie_id"] not in selected]
            ids = [movie["movie_id"] for movie in selected_matches[:3]]
            combined = list(dict.fromkeys(selected + ids))
            results = self.top_movies(combined, current_genre)
            reply = f"Because you mentioned {self.movie_text(matches[:2])}, try {self.movie_text(results)}."
            actions = ([{"type": "select", "ids": ids}] if ids else []) + [{"type": "recommend"}]
            return self.response(reply, actions, ["Show me something different", "Set a genre", "Why this recommendation?"])

        if wants_recommendation or requested_genres:
            chosen_genre = requested_genres[0] if requested_genres else current_genre
            results = self.top_movies(selected, chosen_genre)
            if results:
                action = [{"type": "set_genre", "genre": chosen_genre}] if chosen_genre in self.genres else []
                return self.response(f"Here are some picks: {self.movie_text(results)}.", action)

        return self.fallback_response("I can help with movie titles, genres, moods, years, and recommendations. Try “show me sci-fi” or “movies like The Dark Knight”.")

    def llm_response(self, text: str, history: List[Dict[str, str]], selected: List[str], genre: str, api_key: str) -> Dict[str, Any]:
        import anthropic

        current = self.top_movies(selected, genre)
        catalogue = [
            {"id": m["movie_id"], "title": m["title"], "year": m["year"], "genres": m["genres"], "rating": m["rating"]}
            for m in self.movies
        ]
        selected_movies = [movie for movie in self.movies if movie["movie_id"] in selected]
        system = (
            "You are CineBot, a concise movie assistant for CineMatch. "
            "Return ONLY strict JSON with keys reply, actions, suggested_replies. "
            "Actions may only be select with catalogue IDs, set_genre with a catalogue genre, recommend, or clear. "
            "Recommend ONLY movies in the supplied catalogue; never invent titles. "
            f"Full movie catalogue: {json.dumps(catalogue)}. "
            f"Currently selected movies: {json.dumps(selected_movies)}. "
            f"Current top recommendations from the CineMatch recommender: {json.dumps([m['movie_id'] for m in current])}. "
            "Keep suggested_replies to exactly three short strings."
        )
        messages = [
            {"role": item["role"], "content": str(item["content"])[:500]}
            for item in history[-10:]
            if isinstance(item, dict) and item.get("role") in {"user", "assistant"} and item.get("content")
        ]
        messages.append({"role": "user", "content": text})
        client = anthropic.Anthropic(api_key=api_key, timeout=8.0)
        result = client.messages.create(model=os.getenv("CHAT_MODEL", "claude-sonnet-5-5"), max_tokens=500, system=system, messages=messages)
        content = result.content[0].text if result.content else "{}"
        parsed = json.loads(content)
        return self.response(parsed.get("reply", "I could not find a good match yet."), parsed.get("actions"), parsed.get("suggested_replies"))
