import numpy as np
from typing import List, Dict, Any, Optional
from backend.services.data_loader import load_svd_model, get_movies_lookup

_normalized_qi: Optional[np.ndarray] = None
_cached_model = None

def get_similar_movies(movie_id: int, top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Computes top N similar movies using:
    1. Pre-trained SVD item latent factor cosine similarity (Collaborative Filtering).
    2. Graceful fallback to genre overlap similarity if movie is outside trainset.
    """
    global _normalized_qi, _cached_model
    lookup = get_movies_lookup()
    target_meta = lookup.get(movie_id)
    if not target_meta:
        return []

    try:
        model = load_svd_model()
        if hasattr(model, 'qi') and hasattr(model, 'trainset'):
            inner_id = model.trainset.to_inner_iid(movie_id)

            if _normalized_qi is None or _cached_model is not model:
                norms = np.linalg.norm(model.qi, axis=1, keepdims=True)
                norms[norms == 0] = 1e-9
                _normalized_qi = model.qi / norms
                _cached_model = model

            target_vec = _normalized_qi[inner_id]
            sims = np.dot(_normalized_qi, target_vec)

            top_indices = np.argsort(-sims)
            results = []
            for idx in top_indices:
                if idx == inner_id:
                    continue
                raw_id = model.trainset.to_raw_iid(idx)
                m = lookup.get(raw_id)
                if m:
                    sim_val = max(0.0, min(1.0, float(sims[idx])))
                    results.append({
                        "movie_id": m["movie_id"],
                        "movie_title": m["movie_title"],
                        "movie_genres": m["movie_genres"],
                        "genre_names": m.get("genre_names", []),
                        "poster_url": m.get("poster_url"),
                        "similarity_score": round(sim_val, 3),
                        "score": round(3.5 + (sim_val * 1.5), 1),
                        "recommendation_type": "similar"
                    })
                if len(results) >= top_n:
                    break

            if results:
                return results
    except Exception as e:
        # Fall back to genre similarity if movie not in SVD trainset or error
        pass

    # Genre overlap fallback
    target_genres = set(target_meta.get("genre_names", []))
    candidates = []
    for mid, m in lookup.items():
        if mid == movie_id:
            continue
        g_set = set(m.get("genre_names", []))
        overlap = len(target_genres.intersection(g_set))
        if overlap > 0:
            candidates.append((overlap, m))

    candidates.sort(key=lambda x: x[0], reverse=True)
    fallback_results = []
    for overlap, m in candidates[:top_n]:
        fallback_results.append({
            "movie_id": m["movie_id"],
            "movie_title": m["movie_title"],
            "movie_genres": m["movie_genres"],
            "genre_names": m.get("genre_names", []),
            "poster_url": m.get("poster_url"),
            "similarity_score": round(overlap / max(len(target_genres), 1), 2),
            "score": 4.5,
            "recommendation_type": "similar"
        })

    return fallback_results
