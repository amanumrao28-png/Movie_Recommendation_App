/**
 * Standard MovieLens 1M Genre Mapping
 * Maps numeric codes (0, 7, 4, etc.) to human-readable names.
 */
export const GENRE_MAP = {
  0: 'Action',
  1: 'Adventure',
  2: 'Animation',
  3: "Children's",
  4: 'Comedy',
  5: 'Crime',
  6: 'Documentary',
  7: 'Drama',
  8: 'Fantasy',
  9: 'Film-Noir',
  10: 'Horror',
  11: 'Musical',
  12: 'Mystery',
  13: 'Romance',
  14: 'Sci-Fi',
  15: 'Thriller',
  16: 'War',
  17: 'Western',
  18: 'War',
  19: 'Western',
};

/**
 * Formats a single genre value (number code or string).
 * e.g., "0" -> "Action", "7" -> "Drama", 4 -> "Comedy".
 */
export const formatGenre = (genre) => {
  if (genre === null || genre === undefined || genre === '') return 'Cinema';
  const str = String(genre).trim();
  if (/^\d+$/.test(str)) {
    const code = parseInt(str, 10);
    return GENRE_MAP[code] || `Genre ${code}`;
  }
  return str;
};

/**
 * Parses and returns an array of readable genre names for a movie object.
 */
export const getDisplayGenres = (movie) => {
  if (!movie) return ['Cinema'];

  // 1. If explicit genre_names array is available
  if (Array.isArray(movie.genre_names) && movie.genre_names.length > 0) {
    const formatted = movie.genre_names.map(formatGenre).filter(Boolean);
    if (formatted.length > 0) return formatted;
  }

  // 2. If movie_genres string is available (e.g. "0, 7" or "Action, Drama")
  if (movie.movie_genres) {
    const parts = String(movie.movie_genres).split(',');
    const formatted = parts.map(formatGenre).filter(Boolean);
    if (formatted.length > 0) return formatted;
  }

  return ['Cinema'];
};

/**
 * Returns the primary (first) readable genre for card badges.
 */
export const getPrimaryGenre = (movie) => {
  const genres = getDisplayGenres(movie);
  return genres[0] || 'Cinema';
};

export default {
  GENRE_MAP,
  formatGenre,
  getDisplayGenres,
  getPrimaryGenre,
};
