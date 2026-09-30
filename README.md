# CineSphere 🎬

An end-to-end full-stack Movie Recommendation System built with **React**, **FastAPI**, and **Scikit-Surprise SVD Collaborative Filtering**.

---

## 🏗️ Architecture & Recommendation Logic

CineSphere implements a hybrid dual-mode recommendation strategy strictly following user history:

1. **User With Rating History**:
   - Uses the pre-trained Surprise SVD collaborative filtering model (`backend/models/movie_svd_model.pkl`).
   - Predicts ratings for movies the user has not rated yet.
   - Returns the **Top 10 highest predicted movies**.
   - No demographic features (gender, age) are used.

2. **User Without Rating History (Cold Start)**:
   - Popularity-based recommendation fallback.
   - Calculates IMDB weighted formula score:
     $$W = \left(\frac{v}{v+m}\right) \cdot R + \left(\frac{m}{v+m}\right) \cdot C$$
     where $v$ is rating count, $R$ is average rating, $C$ is mean rating across all movies, and $m$ is the 90th percentile threshold.
   - Returns the **Top 10 popular movies**.

---

## 🔄 Model Lifecycle & Retraining Design

> [!IMPORTANT]
> The active Surprise SVD model is a **static serialized matrix factorization model**. New user ratings submitted through the web app are persisted in SQLite, but the live model does **not** dynamically retrain on every rating (which would cause severe latency and server exhaustion).

### 🛠️ Retraining Pipeline (`training/train_model.py`)

An offline retraining script is provided to periodically update the SVD model:
1. Loads original historical ratings from `ratings.csv`.
2. Extracts all dynamic ratings submitted by users from SQLite (`cinesphere.db`).
3. Combines datasets, resolving any collisions by prioritizing newest ratings.
4. Performs an 80/20 train/test evaluation reporting **RMSE** and **MAE**.
5. Trains the updated SVD model on the full dataset.
6. Automatically creates a timestamped safety backup of the current model in `backend/models/backups/`.
7. Atomically saves the newly trained model to `backend/models/movie_svd_model.pkl`.

### ⚡ Manual Retraining Command

To manually trigger model retraining:
```powershell
python training/train_model.py
```

Options:
- `--epochs 20`: Number of training epochs (default: 20)
- `--factors 100`: Number of latent factors (default: 100)
- `--quick`: Rapid test mode with sample data
- `--no-backup`: Skip saving a backup copy of previous model

### 🔄 Zero-Downtime Hot-Reload

After retraining completes, reload the updated model into the running FastAPI server without restarting:
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/model/reload
```
Check model status and backup history:
```powershell
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8000/api/model/status
```

---

## 📁 Project Structure

```text
Movie_recomendation_App/
├── backend/
│   ├── database/
│   │   ├── database.py                # SQLAlchemy SQLite engine & session
│   │   ├── models.py                  # User and Rating SQLAlchemy models
│   │   ├── crud.py                    # User & rating persistence functions
│   │   └── schemas.py                 # Pydantic schemas
│   ├── routes/
│   │   ├── recommendations.py         # GET /api/recommendations/{user_id}
│   │   ├── movies.py                  # Catalog, search, & genre filtering
│   │   ├── ratings.py                 # POST /api/ratings & GET /api/ratings/{user_id}
│   │   ├── users.py                   # POST /api/users & GET /api/users/{user_id}
│   │   └── model_lifecycle.py         # GET /api/model/status & POST /api/model/reload
│   ├── services/
│   │   ├── data_loader.py             # Dataset & SVD model loader with caching
│   │   ├── popularity.py              # IMDB weighted score popularity service
│   │   └── collaborative.py           # SVD collaborative filtering service
│   ├── data/
│   │   ├── movies.csv
│   │   └── ratings.csv
│   ├── models/
│   │   ├── movie_svd_model.pkl        # Active Surprise SVD model
│   │   └── backups/                   # Timestamped model backups
│   ├── main.py                        # FastAPI entrypoint & CORS
│   └── requirements.txt
│
├── training/
│   └── train_model.py                 # Offline retraining & evaluation pipeline
│
├── frontend/
│   ├── src/
│   │   ├── api/                       # Modular Axios API services
│   │   ├── components/                # Navbar, MovieCard, Banner, Modals
│   │   ├── context/                   # UserContext (user switcher & state)
│   │   ├── pages/                     # Home, Explore, and MyRatings pages
│   │   ├── App.jsx
│   │   └── index.css                  # Tailwind styling
│   ├── package.json
│   ├── vite.config.js                 # Proxy to backend (:8000)
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 How to Run

### 1. Start the Backend (FastAPI)

```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`
