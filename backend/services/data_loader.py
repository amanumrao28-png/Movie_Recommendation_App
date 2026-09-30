import os
import pickle
import pandas as pd
from typing import Dict, Set, Any, Optional
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

def resolve_path(relative_to_root: str) -> str:
    """Finds a file whether the command is run from root or inside backend."""
    candidates = [
        relative_to_root,
        os.path.join("backend", relative_to_root),
        str(BASE_DIR / relative_to_root.replace("backend/", "")),
        str(BASE_DIR.parent / relative_to_root)
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return relative_to_root

# File paths
MOVIES_PATH = resolve_path("backend/data/movies.csv")
RATINGS_PATH = resolve_path("backend/data/ratings.csv")
MODEL_PATH = resolve_path("backend/models/movie_svd_model.pkl")

# Cached objects
movies_df: Optional[pd.DataFrame] = None
ratings_df: Optional[pd.DataFrame] = None
svd_model: Any = None
user_rated_movies: Dict[int, Set[int]] = {}
movies_lookup: Dict[int, Dict[str, Any]] = {}

def load_svd_model():
    """
    Loads the existing trained Surprise SVD model.
    DO NOT train or replace the model.
    """
    global svd_model
    if svd_model is not None:
        return svd_model

    target_path = resolve_path("backend/models/movie_svd_model.pkl")
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Trained SVD model not found at {target_path}")

    print(f"[DataLoader] Loading pre-trained SVD model from: {target_path}")
    with open(target_path, "rb") as file:
        svd_model = pickle.load(file)
    print("[DataLoader] SVD model successfully loaded.")
    return svd_model

def reload_svd_model():
    """Forces reloading the SVD model from disk into memory."""
    global svd_model
    svd_model = None
    return load_svd_model()

def is_model_loaded() -> bool:
    """Checks if the SVD model is currently loaded in memory."""
    global svd_model
    return svd_model is not None

def resolve_genre_names(raw_genres_str: str):
    if not raw_genres_str:
        return ["Cinema"]
    try:
        from backend.config import GENRE_MAP
        names = []
        for code in str(raw_genres_str).split(","):
            code_s = code.strip()
            if code_s.isdigit():
                gname = GENRE_MAP.get(int(code_s))
                if gname and gname not in names:
                    names.append(gname)
            elif code_s and code_s not in names:
                names.append(code_s)
        return names if names else ["Cinema"]
    except Exception:
        return [g.strip() for g in str(raw_genres_str).split(",") if g.strip()] or ["Cinema"]

def load_data():
    """
    Loads movies.csv, ratings.csv, and builds in-memory indexes.
    """
    global movies_df, ratings_df, user_rated_movies, movies_lookup
    if movies_df is not None and ratings_df is not None:
        return movies_df, ratings_df

    m_path = resolve_path("backend/data/movies.csv")
    r_path = resolve_path("backend/data/ratings.csv")

    if not os.path.exists(m_path):
        raise FileNotFoundError(f"movies.csv not found at {m_path}")
    if not os.path.exists(r_path):
        raise FileNotFoundError(f"ratings.csv not found at {r_path}")

    print(f"[DataLoader] Loading movies dataset from: {m_path}")
    movies_df = pd.read_csv(m_path)

    print(f"[DataLoader] Loading ratings dataset from: {r_path}")
    ratings_df = pd.read_csv(r_path)

    # Build O(1) movies metadata lookup
    movies_lookup = {}
    for _, row in movies_df.iterrows():
        mid = int(row["movie_id"])
        raw_g = str(row["movie_genres"]) if pd.notna(row["movie_genres"]) else ""
        genre_list = resolve_genre_names(raw_g)
        movies_lookup[mid] = {
            "movie_id": mid,
            "movie_title": str(row["movie_title"]),
            "movie_genres": ", ".join(genre_list),
            "genre_names": genre_list,
            "raw_genres": raw_g,
            "poster_url": str(row["poster_url"]) if pd.notna(row["poster_url"]) else None
        }

    # Group ratings by user_id for fast lookup of already-rated movies
    print("[DataLoader] Indexing user rating history...")
    user_rated_movies = ratings_df.groupby("user_id")["movie_id"].apply(set).to_dict()
    print(f"[DataLoader] Total unique users in ratings history: {len(user_rated_movies)}")

    return movies_df, ratings_df

def get_movies_df() -> pd.DataFrame:
    global movies_df
    if movies_df is None:
        load_data()
    return movies_df

def get_ratings_df() -> pd.DataFrame:
    global ratings_df
    if ratings_df is None:
        load_data()
    return ratings_df

def get_user_rated_movies() -> Dict[int, Set[int]]:
    global user_rated_movies
    if not user_rated_movies:
        load_data()
    return user_rated_movies

def get_movies_lookup() -> Dict[int, Dict[str, Any]]:
    global movies_lookup
    if not movies_lookup:
        load_data()
    return movies_lookup

def has_rating_history(user_id: int) -> bool:
    """
    Checks if a user has any rating history in ratings.csv or dynamic database.
    """
    rated_set = get_user_rated_movies()
    if user_id in rated_set and len(rated_set[user_id]) > 0:
        return True
    
    # Also check dynamic SQLite ratings if table exists
    try:
        from backend.database.database import SessionLocal
        from backend.database import crud
        with SessionLocal() as db:
            db_ratings = crud.get_ratings_by_user(db, user_id)
            if db_ratings and len(db_ratings) > 0:
                return True
    except Exception:
        pass

    return False
