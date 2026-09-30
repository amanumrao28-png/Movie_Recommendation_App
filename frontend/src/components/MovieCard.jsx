import React, { useState } from 'react';
import { Star, Film, Sparkles, Flame, Eye, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

import { getPrimaryGenre } from '../utils/genreMap';

// Framer motion variants for staggered grid entrance
export const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const MovieCard = ({ movie, onRateClick, onCardClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { getUserRating, isAuthenticated } = useUser();

  const userRating = movie.user_rating !== undefined ? movie.user_rating : getUserRating(movie.movie_id);
  const hasUserRated = userRating !== null && userRating !== undefined;

  const isCollaborative =
    movie.recommendation_type === 'collaborative' ||
    movie.recommendation_type === 'collaborative_svd';
  const isPopularity = movie.recommendation_type === 'popularity';

  const displayScore =
    movie.score !== undefined
      ? movie.score
      : movie.predicted_rating !== undefined
      ? movie.predicted_rating
      : movie.popularity_score !== undefined
      ? movie.popularity_score
      : movie.avg_rating || 4.5;

  const firstGenre = getPrimaryGenre(movie);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.025 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      tabIndex={0}
      role="article"
      aria-label={`Movie: ${movie.movie_title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick && onCardClick(movie);
        }
      }}
      className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer border transition-all duration-300 will-change-transform focus-visible:ring-2 focus-visible:ring-red-500 ${
        hasUserRated
          ? 'border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-500/10'
          : 'border-white/10 hover:border-white/25 hover:shadow-2xl hover:shadow-red-600/10'
      }`}
      onClick={() => onCardClick && onCardClick(movie)}
    >
      {/* 1. Large Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-[#0b0f19] overflow-hidden">
        {movie.poster_url && !imageError ? (
          <img
            src={movie.poster_url}
            alt={movie.movie_title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 will-change-transform ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 text-center bg-gradient-to-b from-[#111726] to-[#070a12] border-b border-white/5">
            <div className="w-full flex justify-between items-center opacity-40">
              <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400">CineSphere</span>
              <Film className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="my-auto px-1">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-2 text-red-500 shadow-inner">
                <Film className="w-5 h-5 opacity-70" />
              </div>
              <h4 className="text-xs font-bold text-gray-200 line-clamp-3 leading-snug font-display">
                {movie.movie_title}
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-mono">
              #{movie.movie_id}
            </span>
          </div>
        )}

        {/* Ambient Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges Container */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
          {/* "Your Rating" Badge (when already rated) */}
          {hasUserRated ? (
            <span className="inline-flex items-center gap-1 bg-[#0b0f19]/90 backdrop-blur-md text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-yellow-500/40 glow-gold">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              Your Rating: {Number(userRating).toFixed(1)}
            </span>
          ) : (
            <span />
          )}

          {/* Recommendation Score Badge */}
          {displayScore !== undefined && displayScore !== null && (
            <div>
              {isCollaborative ? (
                <span className="inline-flex items-center gap-1 bg-purple-950/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-purple-400/40 glow-violet">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
                  {Number(displayScore).toFixed(1)}
                </span>
              ) : isPopularity ? (
                <span className="inline-flex items-center gap-1 bg-amber-950/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-amber-400/40 glow-gold">
                  <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                  {Number(displayScore).toFixed(1)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                  <Star className="w-2.5 h-2.5 fill-yellow-400" />
                  {Number(displayScore).toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover Glass Overlay, Sliding Information & Action Buttons */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20 border border-white/15">
          {/* Movie Information Slides Upward */}
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider block">
              {isCollaborative ? 'Collaborative SVD' : 'Trending Popular'}
            </span>
            <h4 className="text-sm font-bold text-white line-clamp-2 mt-1 leading-snug font-display">
              {movie.movie_title}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] px-2 py-0.5 rounded-md glass-pill text-gray-300 font-medium">
                {firstGenre}
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">
                  {Number(displayScore).toFixed(1)}
                </span>
              </div>
            </div>

            {/* In-Overlay "Your Rating" Status */}
            {hasUserRated && (
              <div className="mt-3 p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-between text-xs">
                <span className="text-gray-300 text-[11px]">Your Rating:</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {Number(userRating).toFixed(1)} / 5.0
                </span>
              </div>
            )}
          </div>

          {/* Buttons Fade In with Subtle Slide */}
          <div className="space-y-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick && onCardClick(movie);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gray-300" /> View Details
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRateClick && onRateClick(movie);
              }}
              className={`w-full py-2 px-3 rounded-xl text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                isAuthenticated && hasUserRated
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-amber-600/30'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/40'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              {isAuthenticated
                ? (hasUserRated ? `Update Rating (${Number(userRating).toFixed(0)}★)` : 'Rate Movie')
                : 'Sign in to Rate'}
            </button>
          </div>
        </div>
      </div>

      {/* Card Body (Visible when not hovered) */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-[#0d1322]/80">
        <div>
          <h3 className="font-semibold text-sm text-gray-100 group-hover:text-red-400 transition-colors line-clamp-1 font-display">
            {movie.movie_title}
          </h3>

          {/* Genre & Score */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md glass-pill text-gray-400 font-medium truncate max-w-[120px]">
              {firstGenre}
            </span>

            <div className="flex items-center gap-1 text-xs font-bold text-gray-300">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>{Number(displayScore).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          {isAuthenticated && hasUserRated ? (
            <span className="text-yellow-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 text-yellow-400" />
              Your Rating: <strong className="font-mono">{Number(userRating).toFixed(1)}★</strong>
            </span>
          ) : (
            <span className="font-mono text-gray-500">ID #{movie.movie_id}</span>
          )}

          <span className="text-gray-400 group-hover:text-white transition-colors flex items-center gap-1">
            <Star className={`w-3 h-3 ${isAuthenticated && hasUserRated ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
            {isAuthenticated && hasUserRated ? 'Edit' : 'Rate'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
