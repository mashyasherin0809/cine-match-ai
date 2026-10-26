# Viva Questions — AI-Based Movie Recommendation System

1. **What is a recommendation system?**  
   A system that filters and ranks items that may be relevant to a user.

2. **What is collaborative filtering?**  
   It uses historical user-item interactions, such as ratings, to estimate preferences.

3. **What is item-based collaborative filtering?**  
   It compares items based on rating patterns and recommends items similar to those the user likes.

4. **What is cosine similarity?**  
   A vector similarity measure based on the cosine of the angle between two vectors.

5. **Why use a heuristic?**  
   It combines additional preference signals, such as genre overlap, into candidate ranking.

6. **What is the role of Flask?**  
   Flask serves the web page and provides API endpoints for recommendations and evaluation.

7. **What is Precision@5?**  
   The fraction of the top five recommendations that are relevant.

8. **What is Recall@5?**  
   The fraction of relevant held-out items that appear among the top five recommendations.

9. **What is a cold-start problem?**  
   It occurs when there is not enough interaction data for a new user or movie.

10. **Why use CSV?**  
    CSV is easy to inspect and suitable for a small offline prototype.

11. **Why exclude selected movies from results?**  
    The app aims to recommend movies the user has not already selected as watched.

12. **Does the app use a neural network?**  
    No. It uses collaborative filtering and heuristic ranking.

13. **What is the purpose of the genre bonus?**  
    It raises the score of movies that share genres with selected high-rated movies.

14. **Are the evaluation results production-quality?**  
    No. The dataset is synthetic and the evaluation is a small educational demonstration.

15. **How can the project be improved?**  
    Use a larger dataset, robust cross-validation, more advanced models and additional ranking metrics.

## Integrated AI syllabus questions (Units 1–5)

**Q: How are Unit 1 intelligent-agent concepts used?**
A: The system receives selected movies and ratings as percepts, ranks candidates toward the goal of relevance, and returns recommendations as its action.

**Q: Where are BFS, DFS and Best-First Search used?**
A: The engine builds a graph where movies connect through shared genres. BFS and DFS traverse it; greedy Best-First Search uses genre distance to contribute a search signal to ranking.

**Q: How is knowledge represented?**
A: Movie IDs, titles, years, ratings and genres are structured catalogue facts. Genre predicates support the recommendation rule and resolution-style eligibility check.

**Q: How are forward and backward reasoning used?**
A: Forward chaining infers candidates from liked-genre facts. Backward reasoning starts with the goal of recommending a candidate and checks whether a shared genre supports it.

**Q: Where is Bayes' theorem used?**
A: Smoothed genre-level frequencies estimate high-rating likelihoods. The resulting probability signal contributes to the weighted score; it is an educational approximation, not a fully calibrated Bayesian network.

**Q: How does learning from examples work?**
A: Catalogue movies are labelled high-rated when their rating is at least 4.0. Genre-level frequencies are estimated from these examples and used in ranking.

**Q: What is learning by analogy?**
A: The engine compares candidate genres with genres of the user's selected movies using Jaccard similarity.

**Q: Is a neural network used in the main recommender?**
A: Yes. A small feed-forward network is trained with backpropagation on movie attributes to estimate ratings; the predicted rating contributes to the final score. It is trained on a small sample for educational purposes.

**Q: Are these methods trained together as one model?**
A: No. They are separate, interpretable algorithmic signals combined using manually selected weights in one recommendation pipeline.
