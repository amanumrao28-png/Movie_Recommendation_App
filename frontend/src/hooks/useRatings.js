import { useUser } from '../context/UserContext';

/**
 * Custom React hook to consume and manage user ratings state.
 */
export const useRatings = () => {
  const {
    ratings,
    userRatingsMap,
    ratingsLoading,
    ratingsError,
    fetchUserRatings,
    submitRating,
    getUserRating,
    isMovieRated,
    currentUserId,
  } = useUser();

  return {
    ratings,
    userRatingsMap,
    loading: ratingsLoading,
    error: ratingsError,
    getUserRating,
    isMovieRated,
    refetch: () => fetchUserRatings(currentUserId),
    submit: (movieId, rating, title) => submitRating(movieId, rating, title),
  };
};

export default useRatings;
