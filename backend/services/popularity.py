import pandas as pd
from typing import List, Dict, Any, Optional, Set
import os
from backend.services.data_loader import (
    get_movies_df,
    get_movies_lookup,
    get_user_rated_movies,
    resolve_path
)

# Cached popularity dataframe
popular_movies_df: Optional[pd.DataFrame] = None

def compute_popularity_table() -> pd.DataFrame:
    """
    Loads precomputed IMDB weighted popularity rankings table.
    Eliminates runtime grouping of 1M ratings to keep RAM usage minimal on Render.
    """
    global popular_movies_df
    if popular_movies_df is not None:
        return popular_movies_df

    pop_path = resolve_path("backend/data/popular_movies.csv")
    if os.path.exists(pop_path):
        print(f"[PopularityService] Loading precomputed popularity table from: {pop_path}")
        popular_movies_df = pd.read_csv(pop_path)
        print(f"[PopularityService] Popularity table loaded with {len(popular_movies_df)} movies.")
        return popular_movies_df

    # Fallback if popular_movies.csv is missing
    print("[PopularityService] Warning: popular_movies.csv not found, using catalog fallback.")
    movies = get_movies_df()
    popular_movies_df = movies.copy()
    popular_movies_df["weighted_score"] = 3.5
    popular_movies_df["avg_rating"] = 3.5
    popular_movies_df["count_rating"] = 100
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
