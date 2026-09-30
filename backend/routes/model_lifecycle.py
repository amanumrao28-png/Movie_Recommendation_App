import os
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
from backend.services.data_loader import reload_svd_model, resolve_path, is_model_loaded

router = APIRouter(prefix="/model", tags=["Model Lifecycle"])

@router.get("/status")
def get_model_status() -> Dict[str, Any]:
    """
    Returns metadata about the active SVD model:
    file path, modification timestamp, file size, and loaded status.
    """
    model_path = resolve_path("backend/models/movie_svd_model.pkl")
    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model file not found on disk"
        )

    stat = os.stat(model_path)
    last_modified = datetime.fromtimestamp(stat.st_mtime).isoformat()
    size_mb = round(stat.st_size / (1024 * 1024), 2)

    backup_dir = Path(model_path).parent / "backups"
    backups = []
    if backup_dir.exists():
        backups = [f.name for f in backup_dir.glob("*.pkl")]

    return {
        "model_file": os.path.basename(model_path),
        "is_loaded_in_memory": is_model_loaded(),
        "size_mb": size_mb,
        "last_modified": last_modified,
        "available_backups": backups,
        "lifecycle_note": "SVD model is a static trained model. Retrain offline using training/train_model.py, then trigger /api/model/reload."
    }

@router.post("/reload")
def reload_model_in_memory() -> Dict[str, Any]:
    """
    Hot-reloads the SVD model from disk into the running application memory.
    Use after running an offline retraining job.
    """
    try:
        new_model = reload_svd_model()
        return {
            "success": True,
            "message": "SVD recommendation model successfully reloaded into memory.",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload SVD model: {str(e)}"
        )
