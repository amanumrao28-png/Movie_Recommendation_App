from fastapi import APIRouter, Query, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional, Set
from backend.database.database import get_db
from backend.database import crud
from backend.services.data_loader import get_user_rated_movies
from backend.services.collaborative import get_collaborative_recommendations
from backend.services.popularity import get_popularity_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/{user_id}")
def get_recommendations(
    user_id: int,
    limit: int = Query(default=10, ge=1, le=100, description="Number of recommendations to return (default 10)"),
    top_n: Optional[int] = Query(default=None, ge=1, le=100, description="Alias for limit"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination or refresh"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Complete Recommendation API:
    
    1. Check whether user exists (returns 404 if not found).
    2. Check whether the user has rating history.
    3. If rating history is empty:
       -> return popularity-based Top 10 movies.
    4. If rating history exists:
       -> use the existing SVD model for collaborative filtering.
    5. Never recommend movies already rated by the user.
    6. Return exactly the requested number of movies when possible.
    """
    # Validate user_id
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id must be a positive integer"
        )

    # Use limit parameter (support top_n as alias)
    requested_count = top_n if top_n is not None else limit

    try:
        # 1. Check whether user exists in database
        user = crud.get_user(db, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} does not exist."
            )

        # 2. Check whether the user has rating history in database
        db_rated_ids: Set[int] = crud.get_user_rated_movie_ids(db, user_id)
        all_rated_movies = db_rated_ids
        has_history = len(all_rated_movies) > 0

        # 3 & 4. Determine recommendation type and execute logic
        if not has_history:
            # Empty rating history: Popularity-based recommendation
            recommendation_type = "popularity"
            raw_recs = get_popularity_recommendations(
                user_id=user_id,
                top_n=requested_count,
                rated_movies=all_rated_movies,
                offset=offset
            )
            # Format movies array with "score"
            movies: List[Dict[str, Any]] = []
            for item in raw_recs:
                if item["movie_id"] in all_rated_movies:
                    continue  # 5. Never recommend movies already rated by user
                movies.append({
                    "movie_id": item["movie_id"],
                    "movie_title": item["movie_title"],
                    "movie_genres": item["movie_genres"],
                    "genre_names": item.get("genre_names", []),
                    "poster_url": item.get("poster_url"),
                    "score": round(float(item.get("popularity_score", 0.0)), 2)
                })
        else:
            # Rating history exists: Collaborative filtering using existing SVD model
            recommendation_type = "collaborative"
            raw_recs = get_collaborative_recommendations(
                user_id=user_id,
                top_n=requested_count,
                rated_movies=all_rated_movies,
                offset=offset
            )
            # Format movies array with "score"
            movies = []
            for item in raw_recs:
                if item["movie_id"] in all_rated_movies:
                    continue  # 5. Never recommend movies already rated by user
                movies.append({
                    "movie_id": item["movie_id"],
                    "movie_title": item["movie_title"],
                    "movie_genres": item["movie_genres"],
                    "genre_names": item.get("genre_names", []),
                    "poster_url": item.get("poster_url"),
                    "score": round(float(item.get("predicted_rating", 0.0)), 2)
                })

        # 6. Return exactly requested number of movies when possible
        final_movies = movies[:requested_count]

        # Exact requested response format
        return {
            "user_id": user_id,
            "recommendation_type": recommendation_type,
            "movies": final_movies,
            # Supporting client convenience aliases
            "has_rating_history": has_history,
            "recommendations": final_movies
        }

    except HTTPException:
        raise
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Required ML or data resource missing: {str(fnf)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error generating recommendations: {str(e)}"
        )
