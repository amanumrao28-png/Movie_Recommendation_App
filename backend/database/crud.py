from datetime import datetime
from typing import Optional, List, Set
from sqlalchemy.orm import Session
from backend.database.models import User, Rating

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, user_id: Optional[int] = None, password_hash: Optional[str] = None) -> User:
    try:
        user = User(
            id=user_id if user_id is not None else None,
            username=username.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise

def save_or_update_rating(db: Session, user_id: int, movie_id: int, rating_value: float) -> Rating:
    """
    Saves or updates a movie rating for a user.
    If the user has already rated this movie, updates the rating.
    Otherwise, creates a new rating record.
    """
    # Check if existing rating exists
    existing = db.query(Rating).filter(
        Rating.user_id == user_id,
        Rating.movie_id == movie_id
    ).first()

    if existing:
        existing.rating = float(rating_value)
        existing.created_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_rating = Rating(
            user_id=user_id,
            movie_id=movie_id,
            rating=float(rating_value),
            created_at=datetime.utcnow()
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating

def get_ratings_by_user(db: Session, user_id: int) -> List[Rating]:
    """
    Returns all ratings created by the specified user, ordered by most recent.
    """
    return db.query(Rating).filter(Rating.user_id == user_id).order_by(Rating.created_at.desc()).all()

def has_user_ratings(db: Session, user_id: int) -> bool:
    """
    Checks if a user has any rating history recorded in the database.
    """
    count = db.query(Rating).filter(Rating.user_id == user_id).count()
    return count > 0

def get_user_rated_movie_ids(db: Session, user_id: int) -> Set[int]:
    """
    Returns a set of movie IDs that the user has rated in the database.
    """
    ratings = db.query(Rating.movie_id).filter(Rating.user_id == user_id).all()
    return {r.movie_id for r in ratings}
