# AI-Based Movie Recommendation System
## 25CS301 Artificial Intelligence — Micro Project 07

### Team Members
- MASHYA SHERIN P — URK25CS1046
- MEERA K — URK25CS1047
- SHRI GOWRI K — URK25CS1053
- SAHANA ANGELINE J — URK25CS1111

> Edit this report to match your team's actual implementation and testing. Add screenshots captured from your running application and record the metrics it produces.

## 1. Abstract
CineMatch is an interactive web-based movie recommendation prototype. It presents movie posters and lets users select movies they have watched. The recommendation engine combines item-based collaborative filtering, cosine similarity, genre heuristics, graph search (BFS/DFS/Greedy Best-First), predicate-style logic, forward/backward rule reasoning, Bayesian estimates, induction from catalogue examples, analogy, neural-network rating estimates and expert rules in one weighted ranking pipeline. A Flask backend serves the application and calculates demonstration evaluation metrics.

## 2. Problem Definition
Streaming services offer large movie catalogues. Users may find it difficult to identify movies aligned with their interests. This project demonstrates how an AI recommendation system can use historical rating patterns and selected preferences to prioritize potentially relevant titles.

## 3. Objectives
1. Build a user-friendly interactive movie discovery interface.
2. Apply collaborative filtering to historical user-movie ratings.
3. Rank unseen movies using a heuristic scoring function.
4. Support genre filtering, search and sorting.
5. Evaluate a small demonstration dataset using Precision@5, Recall@5 and runtime.

## 4. Course Outcome Mapping
- **CO1:** Models a simple recommendation agent that receives preference signals and proposes movies.
- **CO2:** Ranks candidates using a heuristic score to prioritize likely relevant options.
- **CO3:** Represents knowledge using movie IDs, genres, years and rating records.
- **CO4:** Combines uncertain signals with a weighted scoring function. This is not a full Bayesian network or probabilistic graphical model.
- **CO5:** Uses patterns in example user ratings through collaborative filtering.

## 5. Scope
The prototype includes 36 movies and a small synthetic ratings file. Users select watched movies and the system returns up to eight recommendations. It demonstrates the full interaction and algorithm flow but does not claim production-scale accuracy.

## 6. Technologies and AI methods
- Python and Flask backend; HTML5, CSS3 and JavaScript frontend
- CSV movie and rating data
- Collaborative filtering with cosine similarity
- BFS, DFS, Greedy Best-First Search and genre heuristics
- Predicate-style knowledge representation, resolution-style checks, forward and backward chaining
- Smoothed Bayesian estimates and rule-based expert scoring
- Induction from examples, genre analogy and a small neural network trained with backpropagation

## 7. System Architecture
1. **Frontend:** renders movie cards, user controls, filters, search and recommendation results.
2. **Flask API:** receives selected movie IDs and calls the recommendation function.
3. **Data layer:** reads movie catalogue and historical ratings from CSV files.
4. **Integrated AI engine:** calculates collaborative scores, graph-search signals, logic/rule evidence, Bayesian and inductive estimates, analogy, neural predictions and expert-rule scores.
5. **Ranking:** combines these signals into one score and returns the top eight recommendations.
5. **Evaluation endpoint:** reports demonstration Precision@5, Recall@5, case count and runtime.

## 8. Integrated Algorithm
1. Load movie and historical rating data and build structured movie/genre facts.
2. Receive the movie IDs and ratings selected by the user; exclude these movies from the candidate set.
3. Calculate item-based collaborative estimates using cosine similarity; use the global mean when no shared rating pattern exists.
4. Traverse the movie-genre state graph with BFS and DFS, and use Greedy Best-First Search plus genre distance to provide search signals.
5. Apply predicate-style genre logic and resolution-style checks; use forward chaining to infer candidates and backward reasoning to test the recommendation goal.
6. Estimate Bayesian high-rating tendencies from smoothed genre counts and derive genre patterns by induction from labelled catalogue examples.
7. Calculate analogy similarity against selected favourites, train a small neural network on catalogue attributes, and evaluate explicit expert rules.
8. Combine all signals using a manually weighted 1–5 score, sort candidates and return the top eight movies.
9. Display recommendation explanations, AI method labels and elapsed time.

## 9. Integrated Score
The final score is a manually weighted combination of collaborative filtering, genre heuristic, popularity, search, Bayesian evidence, inductive genre tendencies, analogy, expert-rule scoring and neural-network rating estimates, with a small logic-support bonus. All signals are clamped to the 1–5 range. Weights are educational design choices, not learned parameters; see `app.py` for the exact coefficients.

## 10. Testing
Record the actual result after running each test.

| Test case | Action | Expected outcome |
|---|---|---|
| 1 | Open the app | Movie catalogue appears |
| 2 | Click a movie card | Purple border and checkmark appear |
| 3 | Search by title | Matching cards remain visible |
| 4 | Choose a genre | Catalogue filters to that genre |
| 5 | Sort by rating or year | Visible cards reorder |
| 6 | Click Recommend without selecting movies | Informative message appears |
| 7 | Select movies and click Recommend | Ranked recommendations appear |
| 8 | Click Clear Selection | Selected cards and results reset |
| 9 | Toggle theme | Light and dark themes switch |
| 10 | Click Evaluate AI model | Evaluation metrics appear |

## 11. Results and Analysis
Fill in the actual values from the running app:
- Precision@5: ______
- Recall@5: ______
- Evaluation cases: ______
- Runtime: ______ ms
- Example recommendations: ______

Precision@K measures the proportion of top-K recommendations that are relevant; Recall@K measures the proportion of relevant held-out items retrieved. Values depend on the small synthetic dataset and simple hold-out procedure, so they are only a demonstration.

## 12. Limitations
- The dataset is synthetic and small.
- Sparse rating data can make similarity estimates weak.
- New users and new movies create a cold-start problem.
- Genre overlap does not understand plot, themes or semantic content.
- Poster URLs require internet access and may occasionally fail.
- The prototype is not a production service.

## 13. Future Enhancements
- Use a larger, properly licensed dataset such as MovieLens.
- Compare item-based and user-based collaborative filtering.
- Add matrix factorization and robust train/test splits.
- Add a user login system and persistent profiles with appropriate privacy controls.
- Include additional ranking metrics and a richer explanation of recommendations.

## 14. Conclusion
CineMatch demonstrates an end-to-end AI recommendation workflow through an interactive web interface. The main recommendation request combines collaborative filtering, graph-search signals, logical and rule reasoning, Bayesian estimates, inductive patterns, analogy, a small neural network and expert-rule scoring. The prototype is suitable for a classroom project; stronger data and validation are needed for real-world performance claims.

---

## AI syllabus integration
All Units 1–5 concepts listed in `AI_SYLLABUS_MAPPING.md` are incorporated into the recommendation pipeline or its internal representation/reasoning. They are not exposed as a separate demonstration page. The search, logic, Bayesian, induction and neural methods are simplified educational implementations; they should not be described as a production-grade jointly trained model.
