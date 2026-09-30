from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Dict, Any
from backend.services.data_loader import get_movies_df, get_movies_lookup
from backend.services.popularity import get_popularity_recommendations
from backend.services.similarity import get_similar_movies
from backend.config import GENRE_MAP

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("")
def list_movies(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    genre: Optional[str] = Query(default=None)
) -> Dict[str, Any]:
    try:
        lookup = get_movies_lookup()
        movies = list(lookup.values())

        if search:
            q = search.strip().lower()
            movies = [m for m in movies if q in m["movie_title"].lower()]

        if genre:
            g_filter = genre.strip().lower()
            # check both genre names and raw genre string
            movies = [
                m for m in movies
                if g_filter in m.get("movie_genres", "").lower()
                or any(g_filter in GENRE_MAP.get(int(code.strip()), "").lower()
                       for code in m.get("movie_genres", "").split(",") if code.strip().isdigit())
            ]

        total = len(movies)
        start = (page - 1) * page_size
        end = start + page_size

        similar_movies = []
        similar_to = None
        if search and len(movies) > 0:
            target_movie = movies[0]
            similar_movies = get_similar_movies(target_movie["movie_id"], top_n=10)
            similar_to = {
                "movie_id": target_movie["movie_id"],
                "movie_title": target_movie["movie_title"]
            }

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "movies": movies[start:end],
            "similar_movies": similar_movies,
            "similar_to": similar_to
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch movies catalog: {str(e)}"
        )

@router.get("/genres")
def list_genres() -> List[str]:
    return sorted(list(set(GENRE_MAP.values())))

@router.get("/popular")
def popular_movies(limit: int = Query(default=10, ge=1, le=50)) -> List[Dict[str, Any]]:
    try:
        return get_popularity_recommendations(user_id=None, top_n=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch popular movies: {str(e)}"
        )

@router.get("/{movie_id}")
def get_movie_detail(movie_id: int) -> Dict[str, Any]:
    lookup = get_movies_lookup()
    if movie_id not in lookup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found"
        )
    return lookup[movie_id]

@router.get("/{movie_id}/similar")
def movie_similar_recommendations(movie_id: int, limit: int = Query(default=10, ge=1, le=50)) -> List[Dict[str, Any]]:
    return get_similar_movies(movie_id, top_n=limit)
