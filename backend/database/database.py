import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import DATABASE_URL, DATABASE_PATH

# Determine dialect and connect args
is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates all tables declared with Base.metadata on Supabase PostgreSQL (or SQLite).
    """
    import backend.database.models  # Ensure models are registered with Base
    Base.metadata.create_all(bind=engine)
    
    # Safe migration for legacy SQLite databases if running locally
    if is_sqlite:
        try:
            with engine.connect() as conn:
                from sqlalchemy import text
                result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
                cols = [row[1] for row in result]
                if "password_hash" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                    conn.commit()
        except Exception as e:
            print(f"[Database] SQLite Column check note: {e}")
        print(f"[Database] SQLite tables initialized with SQLAlchemy at: {DATABASE_PATH}")
    else:
        print("[Database] Supabase PostgreSQL tables initialized successfully (users, ratings).")
