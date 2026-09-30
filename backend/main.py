import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database.database import init_db
from backend.services.data_loader import load_data, load_svd_model
from backend.services.popularity import compute_popularity_table
from backend.routes.recommendations import router as rec_router
from backend.routes.movies import router as movies_router
from backend.routes.ratings import router as ratings_router
from backend.routes.users import router as users_router
from backend.routes.model_lifecycle import router as model_router
from backend.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("========================================")
    print("   Starting CineSphere Recommendation   ")
    print("========================================")
    # Initialize SQLite database
    init_db()
    # Load dataset and index history
    load_data()
    # Load existing pre-trained Surprise SVD model
    load_svd_model()
    # Precompute popularity scoring table
    compute_popularity_table()
    print("CineSphere backend is ready to accept requests.")
    yield

app = FastAPI(
    title="CineSphere Recommendation API",
    version="1.0.0",
    description="Dual-Mode Movie Recommendation System: SVD Collaborative Filtering & Popularity Fallback",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers (both /api/... and root prefixes for developer convenience)
app.include_router(rec_router, prefix="/api")
app.include_router(movies_router, prefix="/api")
app.include_router(ratings_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(model_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/api/health")
@app.get("/health")
def health_status():
    from backend.services.data_loader import get_movies_df, svd_model
    m_df = get_movies_df()
    return {
        "status": "healthy",
        "service": "CineSphere Recommendation Backend",
        "svd_model_loaded": svd_model is not None,
        "total_movies_indexed": len(m_df) if m_df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
