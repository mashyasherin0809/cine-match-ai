# CineMatch AI Syllabus Mapping — Integrated Units 1–5

CineMatch uses the course concepts inside the **same movie recommendation request**. There is no separate AI Units Lab or Run demo section. When a user selects movies and clicks **Recommend**, the backend computes the integrated signals below and uses them to rank the final movie list.

## Unit 1 — Artificial Intelligence Concepts and Intelligent Agents
- **AI application:** the application recommends movies from user selections and catalogue data.
- **Agent behaviour:** selected movies/ratings are percepts; the candidate ranking is the decision process; the returned list is the action; relevance, rating fit and runtime are performance measures.
- **Typical agents:** the workflow has reflex-like preference rules, a catalogue model, a goal (return relevant movies), and a utility score. It is a bounded recommendation agent, not a fully autonomous agent.
- **Problem-solving:** the engine defines candidate movies, evaluates them using several signals, then returns the highest-scoring results.

## Unit 2 — Problem Spaces and Search
- Movies are states in a graph; an edge connects movies that share at least one genre.
- **BFS and DFS** traverse this graph and provide traversal/reachability signals for candidate movies.
- **Greedy Best-First Search** uses genre-set distance to a candidate goal; path length contributes to search ranking.
- A direct genre-overlap heuristic prioritizes movies with genres matching selected favourites. Search signals are part of the same final ranking, not a separate demo.

## Unit 3 — Knowledge Representation and Logic
- Catalogue records map to structured facts: movie ID, title, year, rating and genre.
- **Predicate-style representation:** `LikesGenre(user, g)`, `Genre(movie, g)`, `Rating(movie, r)` and `Recommend(user, movie)` describe preference evidence.
- **Predicate logic and resolution:** a recommendation candidate is supported when a liked-genre fact and the movie's genre fact satisfy the rule. A small resolution-style check contributes a logic eligibility signal.
- Representation concerns include incomplete/sparse ratings, consistent genre labels and subjective catalogue ratings; the engine uses fallbacks for missing similarities and empty genre evidence.

## Unit 4 — Rules, Reasoning and Probability
- **Forward chaining** infers candidate movies from known liked-genre facts.
- **Backward reasoning** starts from the goal of recommending a candidate and checks the required genre evidence.
- **Rule-based expert system:** genre preferences and high catalogue ratings contribute an expert-rule score.
- **Bayes and Bayesian-network idea:** Laplace-smoothed genre-level high-rating estimates contribute a probability signal to the score. This is a simplified conditional model, not a full probabilistic graphical-network library.

## Unit 5 — Learning
- **Induction from examples:** catalogue movies are labelled high-rated at rating >= 4.0; genre-level rates are learned from those labelled examples and influence ranking.
- **Learning in problem solving:** the current session's selected movies create a temporary preference profile; it is not persisted between requests.
- **Learning by analogy:** Jaccard overlap compares candidate genres with genres in selected favourites.
- **Neural-network learning:** a small feed-forward network is trained with backpropagation on catalogue attributes to estimate ratings; its predicted rating is a weighted input to the final score. The dataset is small, so this is a classroom model rather than a validated production predictor.
- **Expert systems:** explicit IF–THEN-style genre/rating rules add another interpretable ranking signal.

## Integrated ranking
The final 1–5 score combines collaborative filtering, genre heuristic, catalogue popularity, graph search, Bayesian estimates, inductive genre patterns, analogy, expert rules, neural predictions, and logic eligibility. These are illustrative educational implementations and are not all trained together as one model. Their weights are manually specified.
