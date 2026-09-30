from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

class UserCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=100, description="Unique username")
    email: str = Field(..., min_length=5, max_length=255, description="Valid email address")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    rating_count: int = 0
    has_rating_history: bool = False

    class Config:
        from_attributes = True

class RatingCreate(BaseModel):
    user_id: int = Field(..., gt=0, description="ID of the user rating the movie")
    movie_id: int = Field(..., gt=0, description="ID of the movie being rated")
    rating: float = Field(..., ge=0.5, le=5.0, description="Rating between 0.5 and 5.0")

class RatingResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: datetime
    movie_title: Optional[str] = None
    poster_url: Optional[str] = None
    movie_genres: Optional[str] = None
    genre_names: Optional[List[str]] = None

    class Config:
        from_attributes = True

class UserRatingHistoryResponse(BaseModel):
    user_id: int
    total_ratings: int
    ratings: List[RatingResponse]
