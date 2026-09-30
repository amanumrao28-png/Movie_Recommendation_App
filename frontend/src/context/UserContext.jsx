import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getRecommendations,
  getPopularMovies,
  getUserRatings,
  submitRating as apiSubmitRating,
  loginUser,
  registerUser,
  getUserStatus,
  getSampleUsers,
} from '../services/api';
import { useToast } from './ToastContext';

const UserContext = createContext();

const AUTH_STORAGE_KEY = 'cinesphere_auth';

export const UserProvider = ({ children }) => {
  // Read stored auth session if available
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.user || null;
      }
    } catch (e) {
      console.error('Failed to parse stored auth session:', e);
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token || null;
      }
    } catch (e) {
      console.error('Failed to parse stored token:', e);
    }
    return null;
  });

  // Active user ID (defaults to authenticated user, or null for guest mode)
  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.id) return parsed.user.id;
      }
    } catch (e) {}
    return null;
  });

  // Global React state for recommendations, ratings, userStatus
  const [recommendations, setRecommendations] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userRatingsMap, setUserRatingsMap] = useState({});
  const [userStatus, setUserStatus] = useState(null);
  const [recommendationRevision, setRecommendationRevision] = useState(0);
  const [recOffset, setRecOffset] = useState(0);

  // Unified loading and error states managed by React hooks
  const [loading, setLoading] = useState({
    recommendations: false,
    ratings: false,
    status: false,
    auth: false,
  });

  const [errors, setErrors] = useState({
    recommendations: null,
    ratings: null,
    status: null,
    auth: null,
  });

  const [sampleUsers, setSampleUsers] = useState({
    users_with_history: [],
    users_without_history: [],
  });

  const { showToast } = useToast();
  const isAuthenticated = Boolean(currentUser && token);

  // Fetch sample user presets for the demo switcher
  useEffect(() => {
    getSampleUsers()
      .then((data) => setSampleUsers(data))
      .catch((err) => console.error('Failed to load sample users:', err));
  }, []);

  /**
   * Fetch recommendations for a user.
   * If userId is null (guest mode), fetches popularity-based movies.
   * Supports isRefresh to cycle through fresh batches of top recommendations.
   */
  const fetchRecommendations = useCallback(
    async (userId = currentUserId, limit = 15, isRefresh = false) => {
      const parsedLimit = parseInt(limit, 10);
      const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 15;
      const targetUserId = typeof userId === 'number' || typeof userId === 'string' ? userId : currentUserId;

      let currentOffset = 0;
      if (isRefresh) {
        setRecOffset((prev) => {
          const next = (prev + safeLimit) % 60;
          currentOffset = next;
          return next;
        });
      } else {
        setRecOffset(0);
        currentOffset = 0;
      }

      setLoading((prev) => ({ ...prev, recommendations: true }));
      setErrors((prev) => ({ ...prev, recommendations: null }));
      try {
        if (!targetUserId) {
          // Unauthenticated guest user: strictly popularity recommendations!
          const popList = await getPopularMovies(safeLimit);
          const data = {
            user_id: null,
            recommendation_type: 'popularity',
            recommendations: popList,
            movies: popList,
            has_rating_history: false,
          };
          setRecommendations(data);
          return data;
        }

        const data = await getRecommendations(targetUserId, safeLimit, currentOffset);
        setRecommendations(data);
        return data;
      } catch (err) {
        let msg = 'Unable to load recommendations. Please verify the FastAPI backend is running.';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail.map((d) => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join(', ');
        } else if (err.message) {
          msg = err.message;
        }
        setErrors((prev) => ({ ...prev, recommendations: msg }));
        console.error(`[CineSphere] Failed to load recommendations for user ${targetUserId}:`, err);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, recommendations: false }));
      }
    },
    [currentUserId]
  );

  const refreshRecommendations = useCallback(
    async (limit = 15) => {
      return fetchRecommendations(currentUserId, limit, true);
    },
    [fetchRecommendations, currentUserId]
  );

  /**
   * Fetch rating history for a user from the FastAPI backend.
   */
  const fetchUserRatings = useCallback(
    async (userId = currentUserId) => {
      if (!userId) return [];
      setLoading((prev) => ({ ...prev, ratings: true }));
      setErrors((prev) => ({ ...prev, ratings: null }));
      try {
        const data = await getUserRatings(userId);
        const list = Array.isArray(data) ? data : data.ratings || [];
        setRatings(list);

        const map = {};
        list.forEach((item) => {
          if (item.movie_id) {
            map[item.movie_id] = item.rating;
          }
        });
        setUserRatingsMap(map);
        return list;
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          'Failed to load user ratings from backend.';
        setErrors((prev) => ({ ...prev, ratings: msg }));
        console.error(`[CineSphere] Failed to fetch ratings for user ${userId}:`, err);
        setUserRatingsMap({});
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, ratings: false }));
      }
    },
    [currentUserId]
  );

  /**
   * Fetch profile status for the active user.
   */
  const refreshUserStatus = useCallback(
    async (userId = currentUserId) => {
      if (!userId) return null;
      setLoading((prev) => ({ ...prev, status: true }));
      setErrors((prev) => ({ ...prev, status: null }));
      try {
        const status = await getUserStatus(userId);
        setUserStatus(status);
        return status;
      } catch (err) {
        console.error('Failed to fetch user status:', err);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, status: false }));
      }
    },
    [currentUserId]
  );

  // Synchronize on active user ID change
  useEffect(() => {
    if (currentUserId) {
      refreshUserStatus(currentUserId);
      fetchUserRatings(currentUserId);
      fetchRecommendations(currentUserId);
    } else {
      // Unauthenticated guest user: strictly popularity recommendations!
      setUserRatingsMap({});
      setRatings([]);
      setUserStatus(null);
      fetchRecommendations(null);
    }
  }, [currentUserId, refreshUserStatus, fetchUserRatings, fetchRecommendations]);

  /**
   * User login flow:
   * 1. Authenticate with FastAPI POST /api/auth/login
   * 2. Store session token safely
   * 3. Set current user
   * 4. Fetch recommendations automatically
   * 5. Refresh ratings and status
   */
  const login = async ({ email, password }) => {
    setLoading((prev) => ({ ...prev, auth: true }));
    setErrors((prev) => ({ ...prev, auth: null }));
    try {
      const data = await loginUser({ email, password });
      const { user, token: sessionToken } = data;

      setCurrentUser(user);
      setToken(sessionToken);
      setCurrentUserId(user.id);

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, token: sessionToken })
      );

      // Automatically fetch recommendations and user data for the newly logged-in user
      await Promise.allSettled([
        refreshUserStatus(user.id),
        fetchUserRatings(user.id),
        fetchRecommendations(user.id),
      ]);
      setRecommendationRevision((rev) => rev + 1);

      showToast({
        title: `Welcome, ${user.username}!`,
        message: 'Logged in successfully. Tailoring recommendations for your profile.',
        type: 'success',
      });

      return user;
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Invalid email or password. Please verify your credentials.';
      setErrors((prev) => ({ ...prev, auth: msg }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  /**
   * User registration flow:
   * 1. Register with FastAPI POST /api/auth/register
   * 2. Store session token safely
   * 3. Set current user
   * 4. Fetch cold-start popularity recommendations automatically
   */
  const register = async ({ username, email, password }) => {
    setLoading((prev) => ({ ...prev, auth: true }));
    setErrors((prev) => ({ ...prev, auth: null }));
    try {
      const data = await registerUser({ username, email, password });
      const { user, token: sessionToken } = data;

      setCurrentUser(user);
      setToken(sessionToken);
      setCurrentUserId(user.id);

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, token: sessionToken })
      );

      // Automatically fetch initial recommendations for new user
      await Promise.allSettled([
        refreshUserStatus(user.id),
        fetchUserRatings(user.id),
        fetchRecommendations(user.id),
      ]);
      setRecommendationRevision((rev) => rev + 1);

      showToast({
        title: 'Welcome to CineSphere!',
        message: `Account created for ${user.username}. Start rating movies to personalize predictions.`,
        type: 'success',
      });

      return user;
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Registration failed. Please check your inputs.';
      setErrors((prev) => ({ ...prev, auth: msg }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  /**
   * User logout flow.
   */
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setToken(null);
    setUserRatingsMap({});
    setRatings([]);
    setUserStatus(null);
    // Return to unauthenticated guest mode (no dummy user)
    setCurrentUserId(null);
    setRecommendationRevision((rev) => rev + 1);

    showToast({
      title: 'Signed Out',
      message: 'You have been safely logged out of CineSphere.',
      type: 'info',
    });
  };

  const switchUser = (newId) => {
    if (newId) {
      setCurrentUserId(parseInt(newId, 10));
    } else {
      setCurrentUserId(null);
    }
  };

  /**
   * Submit or update a movie rating:
   * 1. Requires active authenticated user
   * 2. Save rating through FastAPI POST /api/ratings
   * 3. Update local ratings state immediately
   * 4. Refresh recommendations automatically
   * 5. Show glassmorphism toast confirmation
   */
  const submitRating = async (movieId, ratingValue, movieTitle = '') => {
    if (!isAuthenticated || !currentUserId) {
      showToast({
        title: 'Sign In Required',
        message: 'Please sign in to rate movies and unlock personalized recommendations.',
        type: 'warning',
      });
      throw new Error('Please sign in to rate movies.');
    }

    const numericRating = parseFloat(ratingValue);
    const numericMovieId = parseInt(movieId, 10);

    const response = await apiSubmitRating(currentUserId, numericMovieId, numericRating);

    // Update local userRatingsMap immediately
    setUserRatingsMap((prev) => ({
      ...prev,
      [numericMovieId]: numericRating,
    }));

    // Update user status
    setUserStatus((prev) => ({
      ...(prev || {}),
      user_id: currentUserId,
      has_rating_history: true,
      rating_count: (prev?.rating_count || 0) + (userRatingsMap[numericMovieId] ? 0 : 1),
    }));

    // Automatically refresh recommendations and rating history after saving rating
    await Promise.allSettled([
      fetchRecommendations(currentUserId),
      fetchUserRatings(currentUserId),
    ]);
    setRecommendationRevision((rev) => rev + 1);

    showToast({
      title: 'Rating Saved',
      movieTitle: movieTitle || response.movie_title || `Movie #${movieId}`,
      rating: numericRating,
      message: 'Your rating was stored in the database. Recommendations refreshed without reloading.',
    });

    return response;
  };

  const getUserRating = (movieId) => {
    const val = userRatingsMap[movieId] || userRatingsMap[parseInt(movieId, 10)];
    return val !== undefined ? val : null;
  };

  const isMovieRated = (movieId) => {
    return getUserRating(movieId) !== null;
  };

  // Convenient aggregate loading/error booleans for simpler components
  const isAnyLoading = loading.recommendations || loading.ratings || loading.status || loading.auth;
  const currentError = errors.recommendations || errors.ratings || errors.auth || errors.status;

  return (
    <UserContext.Provider
      value={{
        // User state
        currentUser,
        currentUserId,
        token,
        isAuthenticated,
        userStatus,
        sampleUsers,

        // Recommendations state
        recommendations,
        recommendationsLoading: loading.recommendations,
        recommendationsError: errors.recommendations,
        fetchRecommendations,
        refreshRecommendations,

        // Ratings state
        ratings,
        userRatingsMap,
        ratingsLoading: loading.ratings,
        ratingsError: errors.ratings,
        fetchUserRatings,
        submitRating,
        getUserRating,
        isMovieRated,

        // General loading and errors
        loading,
        isLoading: isAnyLoading,
        errors,
        error: currentError,
        isLoadingStatus: loading.status,
        isLoadingRatings: loading.ratings,
        recommendationRevision,

        // Auth actions
        login,
        register,
        logout,
        switchUser,
        refreshUserStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
