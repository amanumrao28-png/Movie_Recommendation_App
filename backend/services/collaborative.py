from typing import List, Dict, Any, Set, Optional
from backend.services.data_loader import (
    get_movies_df,
    get_user_rated_movies,
    get_movies_lookup,
    load_svd_model
)

def get_collaborative_recommendations(
    user_id: int,
    top_n: int = 10,
    rated_movies: Optional[Set[int]] = None,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Collaborative filtering recommendation using pre-trained Surprise SVD model:
    1. Get all movie IDs from movies.csv.
    2. Exclude already-rated movies (passed from database layer or loaded from historical ratings).
    3. Predict ratings for unrated movies using model.predict(user_id, movie_id).
    4. Sort candidate movies by predicted rating descending.
    5. Return Top 10 movies.
    
    DO NOT use gender, age, or any demographic information.
    """
    # 1. Load the pre-trained SVD model
    model = load_svd_model()

    # 2. Get all candidate movie IDs
    movies_df = get_movies_df()
    all_movies = movies_df["movie_id"].unique()

    # 3. Determine already-rated movies to exclude
    excluded_movies: Set[int] = set()
    if rated_movies is not None:
        excluded_movies = set(rated_movies)
    else:
        user_ratings_map = get_user_rated_movies()
        excluded_movies = set(user_ratings_map.get(user_id, set()))

    # 4. Predict ratings for movies the user has not yet rated
    predictions = []
    for movie_id in all_movies:
        if movie_id not in excluded_movies:
            # model.predict(uid, iid) strictly takes user_id and movie_id
            pred = model.predict(user_id, movie_id)
            predictions.append((movie_id, float(pred.est)))

    # 5. Sort candidate movies by predicted rating descending
    predictions.sort(key=lambda x: x[1], reverse=True)

    # 6. Take Top N using offset for refreshing variety
    top_candidates = predictions[offset : offset + top_n]
    if not top_candidates and predictions:
        top_candidates = predictions[:top_n]

    # Format return objects
    lookup = get_movies_lookup()
    recommendations: List[Dict[str, Any]] = []

    for movie_id, score in top_candidates:
        meta = lookup.get(movie_id, {})
        recommendations.append({
            "movie_id": int(movie_id),
            "movie_title": meta.get("movie_title", "Unknown Title"),
            "movie_genres": meta.get("movie_genres", ""),
            "genre_names": meta.get("genre_names", []),
            "poster_url": meta.get("poster_url"),
            "predicted_rating": round(score, 2)
        })

    return recommendations
