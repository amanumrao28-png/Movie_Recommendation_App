import { useUser } from '../context/UserContext';

/**
 * Custom React hook to consume and manage recommendations state.
 * Encapsulates loading, error, list parsing, and refetching.
 */
export const useRecommendations = () => {
  const {
    recommendations,
    recommendationsLoading,
    recommendationsError,
    fetchRecommendations,
    refreshRecommendations,
    currentUserId,
    userStatus,
  } = useUser();

  const movies = recommendations?.movies || [];
  const recType =
    recommendations?.recommendation_type ||
    (userStatus?.has_rating_history ? 'collaborative' : 'popularity');
  const isCollaborative = recType === 'collaborative';

  return {
    recommendations,
    movies,
    recommendationType: recType,
    isCollaborative,
    loading: recommendationsLoading,
    error: recommendationsError,
    refetch: (limit = 15) => {
      const parsed = parseInt(limit, 10);
      const safeLimit = !isNaN(parsed) && parsed > 0 ? parsed : 15;
      if (typeof refreshRecommendations === 'function') {
        return refreshRecommendations(safeLimit);
      }
      return fetchRecommendations(currentUserId, safeLimit);
    },
  };
};

export default useRecommendations;
