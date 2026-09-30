from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database.database import get_db
from backend.database import crud
from backend.database.schemas import RatingCreate, RatingResponse, UserRatingHistoryResponse
from backend.services.data_loader import get_movies_lookup

router = APIRouter(prefix="/ratings", tags=["Ratings"])

def map_genre_codes(genres_str: str) -> List[str]:
    try:
        from backend.config import GENRE_MAP
        if not genres_str:
            return []
        names = []
        for code in str(genres_str).split(","):
            code_s = code.strip()
            if code_s.isdigit():
                gname = GENRE_MAP.get(int(code_s))
                if gname and gname not in names:
                    names.append(gname)
            elif code_s and code_s not in names:
                names.append(code_s)
        return names
    except Exception:
        return [g.strip() for g in str(genres_str).split(",") if g.strip()]

@router.post("", response_model=RatingResponse)
def save_or_update_movie_rating(payload: RatingCreate, db: Session = Depends(get_db)):
    """
    Save or update a movie rating in SQLite using SQLAlchemy.
    If the user has already rated the movie, the existing rating is updated.
    Otherwise, a new rating is inserted.
    """
    lookup = get_movies_lookup()
    if payload.movie_id not in lookup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {payload.movie_id} does not exist in the catalog."
        )

    # Ensure user exists in database; if not, create user to satisfy foreign key
    user = crud.get_user(db, payload.user_id)
    if not user:
        try:
            user = crud.create_user(
                db,
                username=f"user_{payload.user_id}",
                email=f"user_{payload.user_id}@cinesphere.local",
                user_id=payload.user_id
            )
        except Exception:
            db.rollback()
            # If user already exists by ID or collided, retry with unique suffix
            import uuid
            user = crud.get_user(db, payload.user_id)
            if not user:
                user = crud.create_user(
                    db,
                    username=f"user_{payload.user_id}_{uuid.uuid4().hex[:6]}",
                    email=f"user_{payload.user_id}_{uuid.uuid4().hex[:6]}@cinesphere.local",
                    user_id=payload.user_id
                )

    try:
        saved_rating = crud.save_or_update_rating(
            db,
            user_id=payload.user_id,
            movie_id=payload.movie_id,
            rating_value=payload.rating
        )
        movie_meta = lookup[payload.movie_id]
        genres_str = movie_meta.get("movie_genres", "")
        genre_list = map_genre_codes(genres_str)

        return RatingResponse(
            id=saved_rating.id,
            user_id=saved_rating.user_id,
            movie_id=saved_rating.movie_id,
            rating=saved_rating.rating,
            created_at=saved_rating.created_at,
            movie_title=movie_meta.get("movie_title"),
            poster_url=movie_meta.get("poster_url"),
            movie_genres=genres_str,
            genre_names=genre_list
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist rating in database: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserRatingHistoryResponse)
def get_user_rating_history(user_id: int, db: Session = Depends(get_db)):
    """
    Return the user's rating history from the SQLite database (plus historical dataset for seeded users).
    """
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id must be a positive integer."
        )

    try:
        import datetime
        import pandas as pd
        ratings = crud.get_ratings_by_user(db, user_id)
        lookup = get_movies_lookup()
        rated_movie_ids = set()

        items = []
        for r in ratings:
            rated_movie_ids.add(r.movie_id)
            meta = lookup.get(r.movie_id, {})
            genres_str = meta.get("movie_genres", "")
            genre_list = map_genre_codes(genres_str)
            items.append(RatingResponse(
                id=r.id,
                user_id=r.user_id,
                movie_id=r.movie_id,
                rating=r.rating,
                created_at=r.created_at,
                movie_title=meta.get("movie_title", "Unknown"),
                poster_url=meta.get("poster_url"),
                movie_genres=genres_str,
                genre_names=genre_list
            ))
        return UserRatingHistoryResponse(
            user_id=user_id,
            total_ratings=len(items),
            ratings=items
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user rating history: {str(e)}"
        )
