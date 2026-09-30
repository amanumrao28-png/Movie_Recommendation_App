import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Film,
  Calendar,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Compass,
  Sparkles,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getUserRatings } from '../services/api';
import { useUser } from '../context/UserContext';
import RatingModal from '../components/RatingModal';
import MovieDetails from '../components/MovieDetails';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { getDisplayGenres } from '../utils/genreMap';

// Skeleton loader card for My Ratings
const RatingCardSkeleton = () => (
  <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between animate-pulse">
    <div className="flex gap-4">
      {/* Poster skeleton */}
      <div className="w-20 h-28 bg-white/5 rounded-xl flex-shrink-0" />
      {/* Text skeletons */}
      <div className="flex-grow space-y-2.5 pt-1">
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="flex gap-1 pt-1">
          <div className="h-3.5 w-16 bg-yellow-400/10 rounded-full" />
          <div className="h-3.5 w-12 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
      <div className="h-3 bg-white/5 rounded w-24" />
      <div className="h-3 bg-white/5 rounded w-12" />
    </div>
  </div>
);

// Container variants for staggered entrance
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const FILTER_TIERS = [
  { id: 'all', label: 'All Ratings' },
  { id: '5', label: '5 Stars ★' },
  { id: '4', label: '4 Stars ★' },
  { id: '3', label: '3 Stars ★' },
  { id: 'low', label: '1 - 2 Stars' },
];

const SORT_OPTIONS = [
  { id: 'recent-desc', label: 'Recently Rated (Newest)' },
  { id: 'recent-asc', label: 'Date Rated (Oldest)' },
  { id: 'rating-desc', label: 'Your Rating (Highest First)' },
  { id: 'rating-asc', label: 'Your Rating (Lowest First)' },
  { id: 'title-asc', label: 'Title (A - Z)' },
];

const MyRatingsPage = () => {
  const { currentUserId, currentUser, userStatus, recommendationRevision } = useUser();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent-desc');

  // Modals state
  const [selectedMovieForRating, setSelectedMovieForRating] = useState(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);

  const fetchRatings = async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserRatings(currentUserId);
      const list = Array.isArray(data) ? data : data.ratings || [];
      setRatings(list);
    } catch (err) {
      console.error('Failed to load ratings:', err);
      setError('Unable to load your movie ratings. Please verify the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [currentUserId, recommendationRevision]);

  // Overall Statistics
  const totalCount = ratings.length;
  const avgRating = useMemo(() => {
    if (ratings.length === 0) return '0.0';
    const sum = ratings.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
    return (sum / ratings.length).toFixed(1);
  }, [ratings]);

  // Process Search, Filter, and Sort with useMemo
  const processedRatings = useMemo(() => {
    let result = [...ratings];

    // 1. Search by title
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((item) =>
        (item.movie_title || `Film #${item.movie_id}`).toLowerCase().includes(query)
      );
    }

    // 2. Animated filtering by star tier
    if (selectedFilter !== 'all') {
      if (selectedFilter === '5') {
        result = result.filter((item) => Math.round(Number(item.rating)) === 5);
      } else if (selectedFilter === '4') {
        result = result.filter((item) => Math.round(Number(item.rating)) === 4);
      } else if (selectedFilter === '3') {
        result = result.filter((item) => Math.round(Number(item.rating)) === 3);
      } else if (selectedFilter === 'low') {
        result = result.filter((item) => Math.round(Number(item.rating)) <= 2);
      }
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (selectedSort === 'rating-desc') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (selectedSort === 'rating-asc') {
        return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      if (selectedSort === 'title-asc') {
        return (a.movie_title || '').localeCompare(b.movie_title || '');
      }
      if (selectedSort === 'recent-asc') {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return da - db;
      }
      // default: recent-desc
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });

    return result;
  }, [ratings, searchQuery, selectedFilter, selectedSort]);

  const handleRatingUpdated = () => {
    fetchRatings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      {/* Glassmorphism Page Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden glow-crimson">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* ========================================================= */}
        {/* 1. PAGE HEADER & STATS */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-7 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/40" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                My Ratings
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-5.5 leading-relaxed">
              Displaying all movies rated by{' '}
              <strong className="text-white">
                {currentUser?.username || `User #${currentUserId}`}
              </strong>
              . Persisted in database to power your personalized recommendations.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="glass-pill px-4 py-2.5 rounded-2xl text-center border border-white/10 min-w-[95px]">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Total Rated
              </span>
              <span className="text-lg font-black text-white mt-0.5">{totalCount}</span>
            </div>

            <div className="glass-pill px-4 py-2.5 rounded-2xl text-center border border-white/10 min-w-[95px]">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Avg Rating
              </span>
              <span className="text-lg font-black text-yellow-400 mt-0.5 flex items-center justify-center gap-1 font-mono">
                <Star className="w-4 h-4 fill-yellow-400 inline" /> {avgRating}
              </span>
            </div>

            <div className="glass-pill px-4 py-2.5 rounded-2xl text-center border border-white/10 hidden sm:block min-w-[110px]">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Engine State
              </span>
              <span
                className={`text-xs font-bold mt-0.5 flex items-center justify-center gap-1 ${
                  totalCount > 0 ? 'text-purple-400' : 'text-amber-400'
                }`}
              >
                {totalCount > 0 ? (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-400" /> SVD Active
                  </>
                ) : (
                  <>
                    <Flame className="w-3 h-3 text-amber-400" /> Cold Start
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SEARCH, FILTER & SORT CONTROLS BAR */}
        {/* ========================================================= */}
        <div className="mt-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search by movie title */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your rated movies by title..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="pl-8 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. ANIMATED FILTERING TABS */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-red-500" /> Filter:
          </span>

          {FILTER_TIERS.map((tier) => {
            const isSelected = selectedFilter === tier.id;
            return (
              <motion.button
                key={tier.id}
                type="button"
                onClick={() => setSelectedFilter(tier.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeRatingFilter"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/80 to-rose-600/80 border border-red-500/40 shadow-md -z-10"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <span>{tier.label}</span>
              </motion.button>
            );
          })}

          {/* Matches count indicator */}
          <span className="ml-auto text-[11px] text-gray-500 font-mono">
            Showing {processedRatings.length} of {totalCount}
          </span>
        </div>

        {/* ========================================================= */}
        {/* 4. CONTENT AREA: SKELETONS, EMPTY STATE, OR MOVIE GRID */}
        {/* ========================================================= */}
        <div className="mt-8">
          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <LoadingSkeleton key={idx} type="rating" />
              ))}
            </div>
          )}

          {/* API Error State with Retry Button */}
          {!loading && error && (
            <ErrorState
              title="Unable to Load Ratings"
              message={error}
              onRetry={fetchRatings}
              isRetrying={loading}
              secondaryAction={{
                label: 'Discover Movies',
                to: '/explore',
              }}
            />
          )}

          {/* Empty State: User has zero ratings recorded */}
          {!loading && !error && totalCount === 0 && (
            <EmptyState
              type="ratings"
              action={{
                label: 'Discover Movies',
                to: '/explore',
                icon: Compass,
              }}
            />
          )}

          {/* Filter/Search yields zero matches */}
          {!loading && !error && totalCount > 0 && processedRatings.length === 0 && (
            <EmptyState
              type="search"
              title="No Matching Movies Found"
              description={`No rated movies matched "${searchQuery}" with the selected filter.`}
              action={{
                label: 'Reset Search & Filters',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                },
              }}
            />
          )}

          {/* Responsive Movie Grid */}
          {!loading && processedRatings.length > 0 && (
            <motion.div
              layout
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {processedRatings.map((item) => {
                  const ratingNum = Number(item.rating) || 0;
                  const formattedDate = item.created_at
                    ? new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recently';

                  // Genre chips
                  const genres = getDisplayGenres(item);

                  return (
                    <motion.div
                      layout
                      key={item.movie_id}
                      variants={cardVariants}
                      whileHover={{ y: -4, scale: 1.015 }}
                      transition={{ duration: 0.2 }}
                      onClick={() =>
                        setSelectedMovieForDetails({
                          movie_id: item.movie_id,
                          movie_title: item.movie_title,
                          poster_url: item.poster_url,
                          movie_genres: item.movie_genres,
                          genre_names: item.genre_names,
                          score: ratingNum,
                        })
                      }
                      className="group glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex gap-4">
                        {/* 1. Movie Poster */}
                        <div className="w-20 h-28 bg-gray-950 rounded-xl overflow-hidden flex-shrink-0 relative border border-white/10 shadow-md">
                          {item.poster_url ? (
                            <img
                              src={item.poster_url}
                              alt={item.movie_title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-gray-500 text-[10px]">
                              <Film className="w-6 h-6 mb-1 opacity-50" />
                              Cinema
                            </div>
                          )}

                          {/* Mini poster rating badge */}
                          <div className="absolute top-1 right-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-yellow-400/40 flex items-center gap-0.5 text-[10px] font-bold text-yellow-400">
                            <Star className="w-2.5 h-2.5 fill-yellow-400" />
                            {ratingNum.toFixed(0)}
                          </div>
                        </div>

                        {/* Details column */}
                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            {/* 2. Movie Title */}
                            <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors font-display">
                              {item.movie_title || `Movie #${item.movie_id}`}
                            </h3>

                            {/* 3. Genres */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {genres.slice(0, 2).map((g, gIdx) => (
                                <span
                                  key={gIdx}
                                  className="text-[10px] px-2 py-0.5 rounded-md glass-pill text-gray-300 font-medium truncate max-w-[110px]"
                                >
                                  {g}
                                </span>
                              ))}
                              {genres.length > 2 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md glass-pill text-gray-400">
                                  +{genres.length - 2}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 4. User's Rating */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center text-yellow-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= Math.round(ratingNum)
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                                        : 'text-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-mono font-bold text-yellow-400">
                                {ratingNum.toFixed(1)}
                              </span>
                            </div>

                            {/* Edit rating trigger */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMovieForRating({
                                  movie_id: item.movie_id,
                                  movie_title: item.movie_title,
                                  poster_url: item.poster_url,
                                });
                              }}
                              title="Edit Rating"
                              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 5. Date Rated & ID Footer */}
                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 text-gray-400 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          Rated {formattedDate}
                        </span>

                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rating Modal for Editing */}
      <RatingModal
        movie={selectedMovieForRating}
        isOpen={Boolean(selectedMovieForRating)}
        onClose={() => setSelectedMovieForRating(null)}
        onRatingSuccess={handleRatingUpdated}
      />

      {/* Movie Details Modal */}
      <MovieDetails
        movie={selectedMovieForDetails}
        isOpen={Boolean(selectedMovieForDetails)}
        onClose={() => setSelectedMovieForDetails(null)}
        onRatingUpdated={handleRatingUpdated}
      />
    </div>
  );
};

export default MyRatingsPage;
