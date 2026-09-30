import axios from 'axios';

/**
 * Configure API Base URL from the single environment variable: VITE_API_URL.
 * Normalizes input so that values like:
 * - "http://127.0.0.1:8000"
 * - "http://127.0.0.1:8000/api"
 * - "/api"
 * all correctly resolve to the FastAPI /api router endpoints.
 */
const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const rawEnvUrl = (getEnvVar('VITE_API_URL') || getEnvVar('VITE_API_BASE_URL') || '').trim();

const resolveBaseUrl = () => {
  if (!rawEnvUrl) {
    return '/api';
  }
  const stripped = rawEnvUrl.replace(/\/+$/, '');
  // If user provided a host without /api suffix, append /api
  if (stripped.startsWith('http') && !stripped.endsWith('/api')) {
    return `${stripped}/api`;
  }
  return stripped;
};

export const API_BASE_URL = resolveBaseUrl();

/**
 * Reusable Axios instance with base URL, timeout, and interceptors.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach bearer token from localStorage if user is authenticated
apiClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('cinesphere_auth');
      if (stored) {
        const { token } = JSON.parse(stored);
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Ignore localStorage parse errors on request
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful error handling and network status notification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.code === 'ECONNABORTED';

    if (isNetworkError && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cinesphere:network_error', {
          detail: {
            title: 'Backend Offline',
            message:
              'Cannot reach the CineSphere API server. Please check your connection or make sure the FastAPI backend is running.',
          },
        })
      );
    }

    // Standardize error message for callers
    const detail = error.response?.data?.detail;
    let errorMsg = 'An unexpected API error occurred.';
    if (typeof detail === 'string') {
      errorMsg = detail;
    } else if (Array.isArray(detail)) {
      errorMsg = detail.map((d) => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join(', ');
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }

    console.error(`[CineSphere API] ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`, errorMsg);

    return Promise.reject(error);
  }
);

/* ==========================================================================
   REQUIRED API FUNCTIONS
   ========================================================================== */

/**
 * Fetch movie recommendations for a user.
 * GET /api/recommendations/{user_id}?limit={limit}
 * Returns: { user_id, recommendation_type, movies: [...] }
 */
export const getRecommendations = async (userId, limit = 10, offset = 0) => {
  const parsedLimit = parseInt(limit, 10);
  const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
  const parsedOffset = parseInt(offset, 10);
  const safeOffset = !isNaN(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
  const response = await apiClient.get(`/recommendations/${userId}`, {
    params: { limit: safeLimit, offset: safeOffset },
  });
  return response.data;
};

/**
 * Fetch paginated movie catalog with optional search & genre filters.
 * GET /api/movies?page={page}&page_size={pageSize}&search={search}&genre={genre}
 */
export const getMovies = async (params = {}) => {
  const response = await apiClient.get('/movies', { params });
  return response.data;
};

/**
 * Fetch detailed movie information by movie ID.
 * GET /api/movies/{movie_id}
 */
export const getMovie = async (movieId) => {
  const response = await apiClient.get(`/movies/${movieId}`);
  return response.data;
};

/**
 * Fetch similar movies based on ML latent factor similarity.
 * GET /api/movies/{movie_id}/similar?limit={limit}
 */
export const getSimilarMovies = async (movieId, limit = 10) => {
  const response = await apiClient.get(`/movies/${movieId}/similar`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Fetch rating history for a specific user.
 * GET /api/ratings/{user_id}
 */
export const getUserRatings = async (userId) => {
  const response = await apiClient.get(`/ratings/${userId}`);
  return response.data;
};

/**
 * Submit or update a movie rating in SQLite via FastAPI.
 * POST /api/ratings
 * Payload: { user_id, movie_id, rating }
 */
export const submitRating = async (userId, movieId, rating) => {
  const response = await apiClient.post('/ratings', {
    user_id: parseInt(userId, 10),
    movie_id: parseInt(movieId, 10),
    rating: parseFloat(rating),
  });
  return response.data;
};

/**
 * Authenticate existing user with email and password.
 * POST /api/auth/login
 * Payload: { email, password }
 */
export const loginUser = async (data) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Register a new CineSphere account.
 * POST /api/auth/register
 * Payload: { username, email, password }
 */
export const registerUser = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/* ==========================================================================
   SUPPLEMENTARY API HELPERS
   ========================================================================== */

/**
 * Get all available movie genres.
 * GET /api/movies/genres
 */
export const getGenres = async () => {
  const response = await apiClient.get('/movies/genres');
  return response.data;
};

/**
 * Get popular fallback movies.
 * GET /api/movies/popular?limit={limit}
 */
export const getPopularMovies = async (limit = 10) => {
  const response = await apiClient.get('/movies/popular', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get user profile status (e.g., rating count, history flag).
 * GET /api/users/{user_id}/status
 */
export const getUserStatus = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/status`);
  return response.data;
};

/**
 * Get sample users for demo switching.
 * GET /api/users/samples
 */
export const getSampleUsers = async () => {
  const response = await apiClient.get('/users/samples');
  return response.data;
};

/**
 * Create a new guest user profile.
 * POST /api/users
 */
export const createUser = async (data) => {
  const response = await apiClient.post('/users', data);
  return response.data;
};

/**
 * Backend health check.
 * GET /api/health
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Default export consolidating all functions
const api = {
  client: apiClient,
  API_BASE_URL,
  getRecommendations,
  getMovies,
  getMovie,
  getUserRatings,
  submitRating,
  loginUser,
  registerUser,
  getGenres,
  getPopularMovies,
  getUserStatus,
  getSampleUsers,
  createUser,
  checkHealth,
};

export default api;
