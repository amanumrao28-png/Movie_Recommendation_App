import React from 'react';

/**
 * Reusable LoadingSkeleton component with cinematic glassmorphism shimmer.
 * Supports movie cards, grids, hero banners, and rating cards.
 */
export const LoadingSkeleton = ({
  type = 'card',
  count = 1,
  className = '',
  lines = 3,
}) => {
  if (type === 'grid') {
    return <LoadingSkeletonGrid count={count} className={className} />;
  }

  if (type === 'hero') {
    return <LoadingSkeletonHero className={className} />;
  }

  if (type === 'rating') {
    return <LoadingSkeletonRatingCard className={className} />;
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2.5 animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-white/10 rounded-md overflow-hidden relative"
            style={{ width: `${100 - i * 15}%` }}
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Default: Movie Card Skeleton
  return (
    <div
      className={`relative glass-card rounded-2xl overflow-hidden flex flex-col border border-white/5 bg-gray-950/60 shadow-xl ${className}`}
    >
      {/* Poster Skeleton with aspect ratio */}
      <div className="relative aspect-[2/3] w-full bg-gray-900/90 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        {/* Score pill skeleton */}
        <div className="absolute top-2.5 right-2.5 w-14 h-5 rounded-full bg-white/10 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Info Body Skeleton */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-3 bg-[#0d1322]/80">
        <div className="space-y-2">
          {/* Title bar */}
          <div className="h-4 bg-white/10 rounded-md w-4/5 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          {/* Genre chips */}
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 bg-white/5 rounded-md w-14 overflow-hidden relative" />
            <div className="h-4 bg-white/5 rounded-md w-16 overflow-hidden relative" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="h-3 bg-white/5 rounded w-12" />
          <div className="h-3 bg-white/10 rounded w-10" />
        </div>
      </div>
    </div>
  );
};

export const LoadingSkeletonGrid = ({ count = 10, className = '' }) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} type="card" />
      ))}
    </div>
  );
};

export const LoadingSkeletonHero = ({ className = '' }) => {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden mb-10 border border-white/10 glass-panel p-8 sm:p-12 animate-pulse bg-gray-950/80 ${className}`}
    >
      <div className="max-w-2xl space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded-full" />
        <div className="h-10 sm:h-14 w-4/5 bg-white/15 rounded-2xl" />
        <div className="h-4 w-full bg-white/10 rounded-md" />
        <div className="h-4 w-3/4 bg-white/10 rounded-md" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-40 bg-red-600/30 rounded-2xl" />
          <div className="h-12 w-36 bg-white/10 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const LoadingSkeletonRatingCard = ({ className = '' }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between animate-pulse bg-[#0d1322]/80 ${className}`}
    >
      <div className="flex gap-4">
        <div className="w-20 h-28 bg-white/5 rounded-xl flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
        <div className="flex-grow space-y-2.5 pt-1">
          <div className="h-4 bg-white/10 rounded w-4/5" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="flex gap-1.5 pt-2">
            <div className="h-4 w-20 bg-yellow-400/10 rounded-full" />
            <div className="h-4 w-14 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-3 bg-white/5 rounded w-16" />
      </div>
    </div>
  );
};

// Aliases for clean backward-compatibility with SkeletonGrid and SkeletonCard
export const SkeletonGrid = LoadingSkeletonGrid;
export const SkeletonCard = LoadingSkeleton;

export default LoadingSkeleton;
