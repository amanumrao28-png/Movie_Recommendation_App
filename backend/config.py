import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

# Load environment variables from .env
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

MOVIES_CSV_PATH = DATA_DIR / "movies.csv"
RATINGS_CSV_PATH = DATA_DIR / "ratings.csv"
SVD_MODEL_PATH = MODELS_DIR / "movie_svd_model.pkl"
DATABASE_PATH = BASE_DIR / "cinesphere.db"

DEFAULT_POSTGRES_URL = "postgresql://postgres.xjrrcrfyyhaxxevrmyhv:Kaman%40123%40456@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_POSTGRES_URL)

# Server configuration
PROJECT_NAME = "CineSphere Recommendation API"
VERSION = "1.0.0"

# Genre mapping based on standard MovieLens 1M indices
GENRE_MAP = {
    0: "Action",
    1: "Adventure",
    2: "Animation",
    3: "Children's",
    4: "Comedy",
    5: "Crime",
    6: "Documentary",
    7: "Drama",
    8: "Fantasy",
    9: "Film-Noir",
    10: "Horror",
    11: "Musical",
    12: "Mystery",
    13: "Romance",
    14: "Sci-Fi",
    15: "Thriller",
    16: "War",
    17: "Western",
    18: "War",
    19: "Western",
}
