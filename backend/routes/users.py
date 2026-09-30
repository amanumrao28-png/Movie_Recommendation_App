from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import User
from backend.database.schemas import UserCreate, UserResponse
from backend.database import crud
from backend.services.data_loader import get_user_rated_movies

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user in the SQLite database.
    Ensures username and email are unique.
    New users start with zero ratings (Cold Start).
    """
    # Check if username already taken
    if crud.get_user_by_username(db, payload.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' is already registered."
        )

    # Check if email already taken
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' is already registered."
        )

    try:
        user = crud.create_user(db, username=payload.username, email=payload.email)
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            rating_count=0,
            has_rating_history=False
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/sample/list")
@router.get("/sample")
def get_sample_users(db: Session = Depends(get_db)):
    """
    Returns actual registered users from the Supabase PostgreSQL database.
    """
    db_users = db.query(User).order_by(User.id.asc()).limit(15).all()
    users_with_history = []
    users_without_history = []
    for u in db_users:
        ratings_count = len(crud.get_ratings_by_user(db, u.id))
        user_info = {
            "user_id": u.id,
            "label": f"{u.username} ({ratings_count} ratings)",
            "has_history": ratings_count > 0
        }
        if ratings_count > 0:
            users_with_history.append(user_info)
        else:
            users_without_history.append(user_info)

    return {
        "users_with_history": users_with_history,
        "users_without_history": users_without_history
    }

@router.get("/{user_id}/status")
@router.get("/{user_id}", response_model=UserResponse)
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve user information and rating status from the database.
    """
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id must be a positive integer"
        )

    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    # Count ratings strictly from database
    db_ratings = crud.get_ratings_by_user(db, user.id)
    total_count = len(db_ratings)
    has_history = total_count > 0

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        rating_count=total_count,
        has_rating_history=has_history
    )
