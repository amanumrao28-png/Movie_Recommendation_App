import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Film, X, Sparkles } from 'lucide-react';
import { getMovies, getGenres } from '../services/api';
import MovieCard from '../components/MovieCard';
import RatingModal from '../components/RatingModal';
import MovieDetails from '../components/MovieDetails';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

const ExplorePage = () => {
  const [movies, setMovies] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [similarTo, setSimilarTo] = useState(null);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedMovieForRating, setSelectedMovieForRating] = useState(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data))
      .catch((err) => console.error('Failed to load genres:', err));
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();
      const data = await getMovies({
        page,
        page_size: pageSize,
        search: trimmedSearch || undefined,
        genre: selectedGenre || undefined,
      });
      setMovies(data.movies || []);
      setTotal(data.total || 0);
      setSimilarMovies(data.similar_movies || []);
      setSimilarTo(data.similar_to || null);
      setSearchedTerm(trimmedSearch);
    } catch (err) {
      console.error('Failed to load movies:', err);
      setError('Failed to load movie catalog. Please verify the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchedTerm('');
    setSimilarMovies([]);
    setSimilarTo(null);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 rounded-full bg-red-600 shadow-lg shadow-red-600/50" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Cinema Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-4.5">
            Explore 3,700+ films indexed across multiple eras and genres.
          </p>
        </div>

        <div className="glass-pill rounded-2xl px-4 py-2 self-start sm:self-auto flex items-center gap-2 border border-white/10">
          <Film className="w-4 h-4 text-red-500" />
          <span className="text-xs text-gray-300">
            Total Catalog: <strong className="text-white">{total.toLocaleString()}</strong> Movies
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-3xl p-5 mb-8 border border-white/10 space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search movie by title (e.g. Star Wars, Godfather, Toy Story)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-2xl pl-11 pr-24 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 transition-all shadow-inner"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Genre Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => {
              setSelectedGenre('');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === ''
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'glass-pill text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => {
                setSelectedGenre(g);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'glass-pill text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <LoadingSkeleton type="grid" count={20} />
      ) : error ? (
        <ErrorState
          title="Unable to Load Catalog"
          message={error}
          onRetry={fetchMovies}
          isRetrying={loading}
        />
      ) : movies.length === 0 ? (
        <EmptyState
          type="search"
          title="No Matches Found"
          description={`We couldn't find any movie matching "${search || 'the selected criteria'}". Try searching another title or reset genre filters.`}
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearch('');
              setSelectedGenre('');
              setPage(1);
            },
          }}
        />
      ) : (
        <div className="space-y-12">
          {/* Main search results or catalog grid */}
          <div>
            {searchedTerm && (
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Search Results for <strong className="text-white normal-case">"{searchedTerm}"</strong> ({total} film{total === 1 ? '' : 's'})
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {movies.map((m) => (
                <MovieCard
                  key={m.movie_id}
                  movie={m}
                  onRateClick={(movie) => setSelectedMovieForRating(movie)}
                  onCardClick={(movie) => setSelectedMovieForDetails(movie)}
                />
              ))}
            </div>
          </div>

          {/* Similar Movies Section (rendered when searching) */}
          {searchedTerm && similarMovies.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-gradient-to-r from-red-950/25 via-purple-950/20 to-transparent p-5 rounded-3xl border border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                      Similar Movies You May Like
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    10 curated recommendations similar to{' '}
                    <strong className="text-red-400">{similarTo?.movie_title || searchedTerm}</strong> using collaborative filtering.
                  </p>
                </div>
                <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Top 10 Similar
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {similarMovies.map((m) => (
                  <MovieCard
                    key={`sim-${m.movie_id}`}
                    movie={m}
                    onRateClick={(movie) => setSelectedMovieForRating(movie)}
                    onCardClick={(movie) => setSelectedMovieForDetails(movie)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/10">
        <span className="text-xs text-gray-400">
          Page <strong className="text-white">{page}</strong> of{' '}
          <strong className="text-white">{totalPages}</strong> (
          {total.toLocaleString()} total films)
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3.5 py-2 glass-pill hover:bg-white/10 text-gray-300 disabled:opacity-40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 text-xs font-mono font-bold text-white">
            {page}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-3.5 py-2 glass-pill hover:bg-white/10 text-gray-300 disabled:opacity-40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        movie={selectedMovieForRating}
        isOpen={Boolean(selectedMovieForRating)}
        onClose={() => setSelectedMovieForRating(null)}
      />

      {/* Movie Details Modal */}
      <MovieDetails
        movie={selectedMovieForDetails}
        isOpen={Boolean(selectedMovieForDetails)}
        onClose={() => setSelectedMovieForDetails(null)}
      />
    </div>
  );
};

export default ExplorePage;
