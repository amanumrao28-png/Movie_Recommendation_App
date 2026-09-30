import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  ArrowDown,
  Film,
  RefreshCw,
  Compass,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useRecommendations } from '../hooks/useRecommendations';
import MovieCard from '../components/MovieCard';
import RatingModal from '../components/RatingModal';
import MovieDetails from '../components/MovieDetails';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import RecommendationExplanationBadge from '../components/RecommendationExplanationBadge';

// Container motion variants for staggered grid animation
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

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUserId, currentUser, isAuthenticated, userStatus } = useUser();
  const {
    recommendations,
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

  const handleRateClick = (movie) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    setSelectedMovieForRating(movie);
  };

  const handleGetRecommendationsClick = () => {
    const el = document.getElementById('recommendations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    fetchRecommendations(10);
  };

  const handleRatingSuccess = () => {
    fetchRecommendations(10);
  };

  return (
    <div className="relative z-10">
      {/* ========================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Large Cinematic Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')`,
          }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/80 to-[#06080f]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080f] via-[#06080f]/75 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.12)_0,transparent_70%)]" />

        {/* Hero Content Container with Entrance Animations */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Status Chip */}
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-white/15 text-xs font-semibold text-gray-200 mb-6 shadow-lg"
            >
              {isCollaborative ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Personalized SVD Collaborative Filtering Active</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending & Popularity Engine</span>
                </>
              )}
              <span className="text-gray-500">•</span>
              <span className="text-red-400 font-mono">{currentUser?.username || `User #${currentUserId}`}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-amber-500/30 text-xs font-semibold text-amber-300 mb-6 shadow-lg glow-gold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending & Popular Cinema • Guest Mode</span>
            </motion.div>
          )}

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight font-display leading-[1.08] max-w-4xl"
          >
            Discover Your Next{' '}
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Favorite Movie
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-light"
          >
            Personalized cinema recommendations powered by machine learning matrix
            factorization. Rate movies you love to unlock hyper-tailored SVD collaborative predictions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* CTA Button: "Get Recommendations" */}
            <button
              onClick={handleGetRecommendationsClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-sm sm:text-base font-bold shadow-xl shadow-red-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
              Get Recommendations
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>

            <Link
              to="/explore"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel hover:bg-white/10 text-white text-sm sm:text-base font-semibold border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-gray-300" />
              Explore 3,700+ Movies
            </Link>
          </motion.div>

          {/* Feature Highlights Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-red-500" />
              <span>Surprise SVD Matrix Factorization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              <span>IMDB Weighted Popularity Formula</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Zero Demographic Profiling</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. RECOMMENDATION SECTION */}
      {/* ========================================================= */}
      <section id="recommendations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        {/* Recommendation Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {/* Small Label */}
            {isCollaborative ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-900/50 border border-purple-500/40 glow-violet mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Based On Your Ratings
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-900/50 border border-amber-500/40 glow-gold mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Popular Picks
              </span>
            )}

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-1">
              {isCollaborative ? 'Recommended For You' : 'Popular Movies For You'}
            </h2>

            {/* User-facing Glassmorphism Recommendation Explanation Badge */}
            <div className="mt-3">
              <RecommendationExplanationBadge type={recType} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRecommendations(10)}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-gray-200 transition-all border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 1. Loading Skeleton */}
        {loading && <LoadingSkeleton type="grid" count={10} />}

        {/* 2. API Error State with Retry Button */}
        {error && !loading && (
          <ErrorState
            title="Unable to Load Recommendations"
            message={error}
            onRetry={() => fetchRecommendations(10)}
            isRetrying={loading}
          />
        )}

        {/* 3. Empty Recommendation State */}
        {!loading && !error && moviesList.length === 0 && (
          <EmptyState
            type="recommendations"
            action={{ label: 'Discover Movies', to: '/explore', icon: Compass }}
          />
        )}

        {/* 4. MOVIE CARD GRID with Framer Motion Staggered Animations */}
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
                onRateClick={handleRateClick}
                onCardClick={(m) => setSelectedMovieForDetails(m)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Modals */}
      <RatingModal
        movie={selectedMovieForRating}
        isOpen={Boolean(selectedMovieForRating)}
        onClose={() => setSelectedMovieForRating(null)}
        onRatingSuccess={handleRatingSuccess}
      />

      <MovieDetails
        movie={selectedMovieForDetails}
        isOpen={Boolean(selectedMovieForDetails)}
        onClose={() => setSelectedMovieForDetails(null)}
        onRatingUpdated={handleRatingSuccess}
      />
    </div>
  );
};

export default HomePage;
