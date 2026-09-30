import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, Film, Sparkles, Flame, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import StarRating from './StarRating';
import RecommendationExplanationBadge from './RecommendationExplanationBadge';
import { getDisplayGenres } from '../utils/genreMap';

// Performant GPU-accelerated spring transitions
const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 350 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 16,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const MovieDetails = ({ movie, isOpen, onClose, onRatingUpdated }) => {
  const { currentUser, currentUserId, submitRating, getUserRating, isAuthenticated } = useUser();

  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [imageError, setImageError] = useState(false);

  // Sync selected rating with user's rating from context
  useEffect(() => {
    if (!isOpen || !movie) return;

    const existing = getUserRating(movie.movie_id);
    if (existing !== null && existing !== undefined) {
      setSelectedRating(Math.round(existing));
    } else {
      setSelectedRating(5);
    }
    setSuccessMessage(false);
    setSubmitError(null);
    setImageError(false);
  }, [isOpen, movie, getUserRating]);

  // Keyboard accessibility (Escape key) and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const existingRating = movie ? getUserRating(movie.movie_id) : null;
  const hasExistingRating = existingRating !== null && existingRating !== undefined;

  const isCollaborative =
    movie?.recommendation_type === 'collaborative' ||
    movie?.recommendation_type === 'collaborative_svd';
  const isPopularity = movie?.recommendation_type === 'popularity';

  const displayScore = movie
    ? (movie.score !== undefined
        ? movie.score
        : movie.predicted_rating !== undefined
        ? movie.predicted_rating
        : movie.popularity_score !== undefined
        ? movie.popularity_score
        : movie.avg_rating)
    : null;

  // Handle rating submission without page reload
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!movie) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitRating(movie.movie_id, selectedRating, movie.movie_title);
      setSuccessMessage(true);

      if (onRatingUpdated) {
        onRatingUpdated(movie.movie_id, selectedRating);
      }

      setTimeout(() => {
        setSuccessMessage(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setSubmitError(err.response?.data?.detail || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && movie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md will-change-[opacity]"
        />

        {/* Modal Window Container */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-details-title"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative glass-panel rounded-3xl max-w-2xl w-full overflow-hidden border border-white/15 z-10 shadow-2xl will-change-transform glow-crimson"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close movie details modal"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* 1. Large Poster */}
            <div className="w-full md:w-5/12 aspect-[2/3] md:aspect-auto relative bg-gray-950 overflow-hidden flex-shrink-0">
              {movie.poster_url && !imageError ? (
                <img
                  src={movie.poster_url}
                  alt={movie.movie_title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-900 to-black">
                  <Film className="w-12 h-12 mb-3 text-red-500 opacity-60" />
                  <span className="text-sm font-semibold text-white line-clamp-2 px-2">
                    {movie.movie_title}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Cinema Catalog</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent md:hidden" />
            </div>

            {/* 2. Details Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
              <div>
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {isCollaborative && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-sm glow-violet">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      Predicted Rating: {displayScore ? Number(displayScore).toFixed(2) : '5.0'} / 5.0
                    </span>
                  )}
                  {isPopularity && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm glow-gold">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Popularity Score: {displayScore ? Number(displayScore).toFixed(2) : '4.20'}
                    </span>
                  )}

                  {/* Your Rating Badge if Rated */}
                  {hasExistingRating && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-bold glow-gold">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      Your Rating: {Number(existingRating).toFixed(1)}
                    </span>
                  )}

                  <span className="text-xs text-gray-500 font-mono ml-auto">ID #{movie.movie_id}</span>
                </div>

                {/* Movie Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
                  {movie.movie_title}
                </h2>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {getDisplayGenres(movie).map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md glass-pill text-xs font-medium text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Recommendation explanation badge */}
                {(isCollaborative || isPopularity) && (
                  <div className="mt-3">
                    <RecommendationExplanationBadge
                      type={movie.recommendation_type}
                      isCollaborative={isCollaborative}
                    />
                  </div>
                )}

                {/* Prominent "Your Rating" Status Banner */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  {hasExistingRating ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">
                          Your Rating
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center text-yellow-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= Math.round(existingRating)
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                                    : 'text-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-white text-sm font-mono">
                            {Number(existingRating).toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved in Database
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      You haven't rated this movie yet. Rate below to personalize your recommendations.
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Selector from 1 to 5 & Submit Rating Button */}
              {isAuthenticated ? (
                <form onSubmit={handleSubmitRating} className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-200">
                      {hasExistingRating ? 'Update Your Rating (1 - 5)' : 'Rate This Movie (1 - 5)'}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {currentUser?.username ? `@${currentUser.username}` : `User #${currentUserId}`}
                    </span>
                  </div>

                  {/* Animated Star Rating Component */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-4">
                    <StarRating
                      rating={selectedRating}
                      onRatingChange={(newVal) => setSelectedRating(newVal)}
                      size="md"
                      showLabel={true}
                      showValue={true}
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Rating...
                        </>
                      ) : successMessage ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Rating Saved!
                        </>
                      ) : hasExistingRating ? (
                        'Update Rating'
                      ) : (
                        'Submit Rating'
                      )}
                    </button>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-400 mt-2 bg-red-950/40 p-2 rounded-lg border border-red-800">
                      {submitError}
                    </p>
                  )}

                  {successMessage && (
                    <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Rating persisted in database! Recommendations refreshed.
                    </p>
                  )}
                </form>
              ) : (
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sign in to Rate</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Rating movies is only available for registered members to personalize AI recommendations.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all text-center whitespace-nowrap"
                  >
                    Sign In to Rate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default MovieDetails;
