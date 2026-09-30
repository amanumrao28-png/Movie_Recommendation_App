import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, RefreshCw, AlertCircle, Film, Star, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useRecommendations } from '../hooks/useRecommendations';
import MovieCard from '../components/MovieCard';
import RatingModal from '../components/RatingModal';
import MovieDetails from '../components/MovieDetails';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import RecommendationExplanationBadge from '../components/RecommendationExplanationBadge';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const RecommendationsPage = () => {
  const { currentUserId, currentUser } = useUser();
  const {
    movies: moviesList,
    recommendationType: recType,
    isCollaborative,
    loading,
    error,
    refetch: fetchRecommendations,
  } = useRecommendations();

  // Modals state
  const [selectedMovieForRating, setSelectedMovieForRating] = useState(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          {/* Label Badge */}
          {isCollaborative ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/60 border border-purple-500/40 glow-violet mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Based On Your Ratings
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/40 glow-gold mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Popular Picks
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            {isCollaborative
              ? `Recommended For ${currentUser?.username || `User #${currentUserId}`}`
              : 'Popular Movies For You'}
          </h1>

          {/* User-facing Glassmorphism Recommendation Explanation Badge */}
          <div className="mt-3">
            <RecommendationExplanationBadge type={recType} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-gray-300 transition-all border border-white/10"
          >
            <Compass className="w-3.5 h-3.5 text-gray-400" />
            Explore Catalog
          </Link>

          <button
            type="button"
            onClick={() => fetchRecommendations(15)}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-gray-200 transition-all border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton type="grid" count={10} />}

      {/* Error View */}
      {error && !loading && (
        <ErrorState
          title="Unable to Load Recommendations"
          message={error}
          onRetry={() => fetchRecommendations(15)}
          isRetrying={loading}
          secondaryAction={{
            label: 'Explore Catalog',
            to: '/explore',
          }}
        />
      )}

      {/* Empty Recommendations State */}
      {!loading && !error && moviesList.length === 0 && (
        <EmptyState
          type="recommendations"
          action={{
            label: 'Discover Movies',
            to: '/explore',
            icon: Compass,
          }}
        />
      )}

      {/* Movie Grid */}
      {!loading && !error && moviesList.length > 0 && (
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {moviesList.map((movie) => (
            <MovieCard
              key={movie.movie_id}
              movie={{ ...movie, recommendation_type: recType }}
              onRateClick={(m) => setSelectedMovieForRating(m)}
              onCardClick={(m) => setSelectedMovieForDetails(m)}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <RatingModal
        movie={selectedMovieForRating}
        isOpen={Boolean(selectedMovieForRating)}
        onClose={() => setSelectedMovieForRating(null)}
        onRatingSuccess={() => fetchRecommendations(15)}
      />

      <MovieDetails
        movie={selectedMovieForDetails}
        isOpen={Boolean(selectedMovieForDetails)}
        onClose={() => setSelectedMovieForDetails(null)}
        onRatingUpdated={() => fetchRecommendations(15)}
      />
    </div>
  );
};

export default RecommendationsPage;
