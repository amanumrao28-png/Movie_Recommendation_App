import pandas as pd
from typing import List, Dict, Any, Optional, Set
from backend.services.data_loader import (
    get_movies_df,
    get_ratings_df,
    get_movies_lookup,
    get_user_rated_movies
)

# Cached popularity dataframe
popular_movies_df: Optional[pd.DataFrame] = None

def compute_popularity_table() -> pd.DataFrame:
    """
    Computes popularity ranking using the IMDB weighted rating formula:
    W = (v / (v + m)) * R + (m / (v + m)) * C
    
    where:
    - v = rating count for the movie
    - R = average rating for the movie
    - C = mean rating across all movies
    - m = 90th percentile of rating count (dampens movies with very few ratings)
    """
    global popular_movies_df
    if popular_movies_df is not None:
        return popular_movies_df

    movies = get_movies_df()
    ratings = get_ratings_df()

    # Calculate average rating and count of ratings per movie
    avg_rating = ratings.groupby("movie_id")["user_rating"].mean()
    count_rating = ratings.groupby("movie_id")["user_rating"].count()

    movies_state = pd.DataFrame({
        "avg_rating": avg_rating,
        "count_rating": count_rating
    }).reset_index()

    # Global mean rating across all movies
    c = float(movies_state["avg_rating"].mean())
    # 90th percentile threshold for vote count
    m = float(movies_state["count_rating"].quantile(0.90))

    # IMDB weighted score calculation
    movies_state["weighted_score"] = (
        (movies_state["count_rating"] / (movies_state["count_rating"] + m)) * movies_state["avg_rating"]
        + (m / (movies_state["count_rating"] + m)) * c
    )

    # Sort descending by weighted popularity score
    sorted_popular = movies_state.sort_values("weighted_score", ascending=False)

    # Merge with movie metadata
    popular_movies_df = sorted_popular.merge(
        movies[["movie_id", "movie_title", "movie_genres", "poster_url"]],
        on="movie_id",
        how="left"
    )

    print(f"[PopularityService] Popularity table computed with {len(popular_movies_df)} movies (m={m:.1f}, C={c:.2f})")
    return popular_movies_df

def get_popularity_recommendations(
    user_id: Optional[int] = None,
    top_n: int = 10,
    rated_movies: Optional[Set[int]] = None,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Returns Top N popular movies:
    - Excludes movies the user has already rated if provided.
    - Uses offset for refreshing variety across batches.
    - Returns movie_id, movie_title, movie_genres, poster_url, popularity_score.
    """
    pop_df = compute_popularity_table()
    lookup = get_movies_lookup()

    # Get movies already rated by user if applicable
    user_rated: Set[int] = set()
    if rated_movies is not None:
        user_rated = set(rated_movies)
    elif user_id is not None:
        user_ratings_map = get_user_rated_movies()
        user_rated = set(user_ratings_map.get(user_id, set()))

    candidates: List[Dict[str, Any]] = []

    for _, row in pop_df.iterrows():
        mid = int(row["movie_id"])
        if mid in user_rated:
            continue

        meta = lookup.get(mid, {})
        candidates.append({
            "movie_id": mid,
            "movie_title": meta.get("movie_title", str(row["movie_title"])),
            "movie_genres": meta.get("movie_genres", str(row["movie_genres"])),
            "genre_names": meta.get("genre_names", []),
            "poster_url": meta.get("poster_url", str(row["poster_url"]) if pd.notna(row["poster_url"]) else None),
            "popularity_score": round(float(row["weighted_score"]), 2),
            "avg_rating": round(float(row["avg_rating"]), 2),
            "rating_count": int(row["count_rating"])
        })

        if len(candidates) >= offset + top_n:
            break

    recommendations = candidates[offset : offset + top_n]
    if not recommendations and candidates:
        recommendations = candidates[:top_n]

    return recommendations
