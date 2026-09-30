#!/usr/bin/env python3
"""
CineSphere Model Lifecycle - Offline Retraining Script

This script trains/retrains the Surprise SVD Collaborative Filtering model:
1. Loads original ratings dataset (ratings.csv).
2. Loads newly submitted user ratings from the SQLite database.
3. Combines both datasets, prioritizing recent database ratings on collision.
4. Performs train/test split to evaluate RMSE and MAE.
5. Retrains the SVD model on the complete combined dataset.
6. Safely backs up the existing model file.
7. Saves the updated model using pickle.

USAGE:
    python training/train_model.py
    python training/train_model.py --epochs 20 --factors 100
    python training/train_model.py --quick
"""

import os
import sys
import time
import shutil
import pickle
import sqlite3
import argparse
from datetime import datetime
from pathlib import Path

import pandas as pd
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split

# Project root resolution
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Default paths
DEFAULT_CSV_PATH = PROJECT_ROOT / "backend" / "data" / "ratings.csv"
DEFAULT_DB_PATH = PROJECT_ROOT / "backend" / "cinesphere.db"
DEFAULT_MODEL_PATH = PROJECT_ROOT / "backend" / "models" / "movie_svd_model.pkl"
BACKUP_DIR = PROJECT_ROOT / "backend" / "models" / "backups"


def load_original_ratings(csv_path: Path) -> pd.DataFrame:
    """Loads historical MovieLens ratings from CSV."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Original ratings CSV not found at: {csv_path}")

    print(f"[1/6] Loading historical ratings from {csv_path.name}...")
    df = pd.read_csv(csv_path)
    # Ensure required columns
    required_cols = {"user_id", "movie_id", "user_rating"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"CSV missing required columns: {required_cols - set(df.columns)}")

    df = df[["user_id", "movie_id", "user_rating"]].copy()
    print(f"      Loaded {len(df):,} historical ratings across {df['user_id'].nunique():,} users.")
    return df


def load_database_ratings(db_path: Path) -> pd.DataFrame:
    """Loads new user ratings recorded in SQLite."""
    if not db_path.exists():
        print(f"[2/6] SQLite database not found at {db_path}. Proceeding with 0 database ratings.")
        return pd.DataFrame(columns=["user_id", "movie_id", "user_rating"])

    print(f"[2/6] Querying dynamic user ratings from {db_path.name}...")
    try:
        conn = sqlite3.connect(db_path)
        query = "SELECT user_id, movie_id, rating AS user_rating FROM ratings"
        db_df = pd.read_sql_query(query, conn)
        conn.close()

        print(f"      Loaded {len(db_df):,} user ratings from SQLite database.")
        return db_df
    except Exception as e:
        print(f"      Warning: Failed to read ratings table ({e}). Proceeding without DB ratings.")
        return pd.DataFrame(columns=["user_id", "movie_id", "user_rating"])


def combine_ratings(csv_df: pd.DataFrame, db_df: pd.DataFrame) -> pd.DataFrame:
    """
    Combines historical CSV ratings and new database ratings.
    If a user rated the same movie in both, the latest database rating is retained.
    """
    print("[3/6] Combining historical and dynamic database ratings...")
    if db_df.empty:
        combined = csv_df.copy()
    else:
        # Concatenate: DB records placed after CSV records
        combined = pd.concat([csv_df, db_df], ignore_index=True)
        # Drop duplicates on (user_id, movie_id), keeping last (the latest DB rating)
        before_count = len(combined)
        combined.drop_duplicates(subset=["user_id", "movie_id"], keep="last", inplace=True)
        deduped = before_count - len(combined)
        if deduped > 0:
            print(f"      Resolved {deduped} duplicate ratings by prioritizing newest database records.")

    print(f"      Final dataset: {len(combined):,} ratings | {combined['user_id'].nunique():,} users | {combined['movie_id'].nunique():,} movies.")
    return combined


def evaluate_and_train_svd(
    ratings_df: pd.DataFrame,
    n_factors: int = 100,
    n_epochs: int = 20,
    lr_all: float = 0.005,
    reg_all: float = 0.02,
    test_size: float = 0.2,
    random_state: int = 42
):
    """
    Evaluates SVD accuracy with a train/test split, then retrains on the full dataset.
    """
    print(f"[4/6] Preparing Surprise dataset (Rating scale: 0.5 - 5.0)...")
    reader = Reader(rating_scale=(0.5, 5.0))
    surprise_data = Dataset.load_from_df(
        ratings_df[["user_id", "movie_id", "user_rating"]],
        reader
    )

    # 1. Validation Split for Evaluation
    print(f"[5/6] Evaluating model accuracy (Test size: {test_size * 100:.0f}%)...")
    trainset, testset = train_test_split(surprise_data, test_size=test_size, random_state=random_state)

    eval_model = SVD(
        n_factors=n_factors,
        n_epochs=n_epochs,
        lr_all=lr_all,
        reg_all=reg_all,
        random_state=random_state
    )

    t0 = time.time()
    eval_model.fit(trainset)
    predictions = eval_model.test(testset)
    eval_time = time.time() - t0

    # Compute validation metrics
    rmse_score = accuracy.rmse(predictions, verbose=False)
    mae_score = accuracy.mae(predictions, verbose=False)

    print(f"      Validation Results (trained in {eval_time:.1f}s):")
    print(f"        -> RMSE : {rmse_score:.4f}")
    print(f"        -> MAE  : {mae_score:.4f}")

    # 2. Train final model on FULL dataset
    print(f"[6/6] Training final production SVD model on 100% of data...")
    full_trainset = surprise_data.build_full_trainset()
    final_model = SVD(
        n_factors=n_factors,
        n_epochs=n_epochs,
        lr_all=lr_all,
        reg_all=reg_all,
        random_state=random_state
    )

    t1 = time.time()
    final_model.fit(full_trainset)
    train_time = time.time() - t1
    print(f"      Full training completed in {train_time:.1f}s.")

    return final_model, rmse_score, mae_score


def save_trained_model(model: SVD, output_path: Path, backup: bool = True):
    """Saves updated model with pickle and creates backup of the previous model."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if backup and output_path.exists():
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / f"movie_svd_model_backup_{timestamp}.pkl"
        shutil.copy2(output_path, backup_path)
        print(f"      Created safety backup of existing model at: {backup_path.name}")

    # Save new model
    temp_target = output_path.with_suffix(".tmp")
    with open(temp_target, "wb") as f:
        pickle.dump(model, f)
    shutil.move(temp_target, output_path)

    file_size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"      Updated model saved successfully: {output_path} ({file_size_mb:.2f} MB)")


def main():
    parser = argparse.ArgumentParser(description="CineSphere SVD Model Retraining Pipeline")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV_PATH, help="Path to ratings.csv")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH, help="Path to SQLite database")
    parser.add_argument("--output", type=Path, default=DEFAULT_MODEL_PATH, help="Output path for updated .pkl")
    parser.add_argument("--epochs", type=int, default=20, help="Number of SVD training epochs (default 20)")
    parser.add_argument("--factors", type=int, default=100, help="Number of latent factors (default 100)")
    parser.add_argument("--quick", action="store_true", help="Quick run mode (fewer epochs, small sample)")
    parser.add_argument("--no-backup", action="store_true", help="Skip creating backup of previous model")
    args = parser.parse_args()

    print("==========================================================")
    print("        CineSphere Model Lifecycle: Offline Retraining    ")
    print("==========================================================")
    start_time = time.time()

    # 1 & 2. Load datasets
    csv_df = load_original_ratings(args.csv)
    db_df = load_database_ratings(args.db)

    # 3. Combine datasets
    combined_df = combine_ratings(csv_df, db_df)

    # Quick test mode adjustments if specified
    epochs = 2 if args.quick else args.epochs
    factors = 20 if args.quick else args.factors
    if args.quick:
        print("      [Quick Mode Active] Using sample of 50,000 ratings for rapid test.")
        combined_df = combined_df.sample(n=min(50000, len(combined_df)), random_state=42)

    # 4 & 5. Train & Evaluate
    model, rmse, mae = evaluate_and_train_svd(
        combined_df,
        n_factors=factors,
        n_epochs=epochs
    )

    # 6. Save model
    save_trained_model(model, args.output, backup=not args.no_backup)

    total_time = time.time() - start_time
    print("==========================================================")
    print(f" Retraining pipeline finished in {total_time:.1f}s.")
    print(f" Summary: RMSE={rmse:.4f}, MAE={mae:.4f}")
    print("==========================================================")


if __name__ == "__main__":
    main()
