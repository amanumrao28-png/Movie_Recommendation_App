import React, { useState, useEffect } from 'react';
import { Star, X, Check, Loader2, Film, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import StarRating from './StarRating';

const RatingModal = ({ movie, isOpen, onClose, onRatingSuccess }) => {
  const { currentUser, currentUserId, submitRating, getUserRating } = useUser();
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [imageError, setImageError] = useState(false);

  // Sync with existing rating if user already rated this movie
  useEffect(() => {
    if (movie && isOpen) {
      const existing = getUserRating(movie.movie_id);
      if (existing !== null && existing !== undefined) {
        setRating(Math.round(existing));
      } else {
        setRating(5);
      }
      setError(null);
      setSuccess(false);
      setImageError(false);
    }
  }, [movie, isOpen, getUserRating]);

  // Keyboard accessibility (Escape key) and body scroll lock
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movie) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Submits via Axios, updates local state, shows glassmorphism toast, triggers rec refresh
      await submitRating(movie.movie_id, rating, movie.movie_title);
      setSuccess(true);
      if (onRatingSuccess) {
        onRatingSuccess(movie.movie_id, rating);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.detail || 'Failed to submit rating to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && movie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative glass-panel border border-white/15 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl z-10 glow-crimson"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div>
              <h3 id="rating-modal-title" className="font-bold text-white text-base font-display">
                {hasExistingRating ? 'Update Your Rating' : 'Rate Movie'}
              </h3>
              <p className="text-[11px] text-gray-400">
                Updating profile for{' '}
                <span className="text-red-400 font-semibold">{currentUser?.username || `User #${currentUserId}`}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close rating modal"
              className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex gap-4 items-center mb-6">
              {movie.poster_url && !imageError ? (
                <img
                  src={movie.poster_url}
                  alt={movie.movie_title}
                  loading="lazy"
                  className="w-16 h-24 object-cover rounded-xl shadow-lg border border-white/10 flex-shrink-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-24 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 flex flex-col items-center justify-center text-xs text-gray-400 flex-shrink-0 p-1 text-center">
                  <Film className="w-6 h-6 mb-1 text-red-500 opacity-60" />
                  <span className="text-[9px] line-clamp-1">{movie.movie_title}</span>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
                  {movie.movie_title}
                </h4>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">
                  Movie ID #{movie.movie_id}
                </div>

                {hasExistingRating && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>Your Rating: {Number(existingRating).toFixed(1)} / 5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Animated Star Rating with subtle glow */}
            <div className="my-5 bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-inner">
              <StarRating
                rating={rating}
                onRatingChange={(newVal) => setRating(newVal)}
                size="lg"
                showLabel={true}
                showValue={true}
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl p-3 mb-4 text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="text-xs text-green-400 bg-green-950/40 border border-green-800 rounded-xl p-3 mb-4 flex items-center justify-center gap-2 font-medium">
                <Check className="w-4 h-4" /> Rating successfully stored in database!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 glass-pill text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" /> Saved!
                  </>
                ) : hasExistingRating ? (
                  'Update Rating'
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;
