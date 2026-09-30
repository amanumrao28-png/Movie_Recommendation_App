import uuid
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

from backend.database.database import get_db
from backend.database import crud
from backend.database.schemas import UserResponse
from backend.utils.auth import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username (minimum 3 characters)")
    email: str = Field(..., min_length=5, max_length=255, description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (minimum 6 characters)")

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255, description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str

def generate_session_token(user_id: int) -> str:
    """Generates a secure token string for authenticated sessions."""
    random_part = secrets.token_urlsafe(24)
    return f"cs_{user_id}_{random_part}"

def build_user_response(user, db: Session) -> UserResponse:
    """Builds a rich UserResponse including ratings count and history flags."""
    db_ratings = crud.get_ratings_by_user(db, user.id)
    total_count = len(db_ratings)
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        rating_count=total_count,
        has_rating_history=total_count > 0
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user:
    - Validates unique username and email
    - Hashes password using PBKDF2 HMAC-SHA256
    - Returns authenticated user details and session token
    """
    clean_username = payload.username.strip()
    clean_email = payload.email.strip().lower()

    if "@" not in clean_email or "." not in clean_email.split("@")[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address (e.g., user@domain.com)."
        )

    # Check if username already exists
    if crud.get_user_by_username(db, clean_username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{clean_username}' is already taken. Please choose another."
        )

    # Check if email already exists
    if crud.get_user_by_email(db, clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{clean_email}' is already registered. Please log in instead."
        )

    try:
        pw_hash = hash_password(payload.password)
        new_user = crud.create_user(
            db,
            username=clean_username,
            email=clean_email,
            password_hash=pw_hash
        )

        user_resp = build_user_response(new_user, db)
        token = generate_session_token(new_user.id)

        return AuthResponse(
            user=user_resp,
            token=token,
            message="Account registered successfully."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user via email and password:
    - Verifies PBKDF2 HMAC-SHA256 password hash
    - Returns authenticated user details and session token
    """
    clean_email = payload.email.strip().lower()

    user = crud.get_user_by_email(db, clean_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check password match
    if not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_resp = build_user_response(user, db)
    token = generate_session_token(user.id)

    return AuthResponse(
        user=user_resp,
        token=token,
        message="Login successful."
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Verify authenticated session by user_id and return fresh user profile.
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return build_user_response(user, db)
