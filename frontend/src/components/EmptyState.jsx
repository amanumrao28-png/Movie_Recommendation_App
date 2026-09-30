import React from 'react';
import { motion } from 'framer-motion';
import { Film, Compass, Sparkles, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable EmptyState component with cinematic styling and animated entrance.
 * Preconfigured for empty recommendations, empty ratings, and search results.
 */
const EmptyState = ({
  type = 'generic',
  title,
  message,
  action,
  icon: CustomIcon,
  className = '',
}) => {
  // Preset configurations
  let resolvedIcon = CustomIcon || Film;
  let resolvedTitle = title;
  let resolvedMessage = message;
  let resolvedAction = action;

  if (type === 'recommendations') {
    resolvedIcon = CustomIcon || Sparkles;
    resolvedTitle = title || 'No Recommendations Available Yet';
    resolvedMessage =
      message ||
      'Start rating films you love in our cinema catalog to personalize the collaborative recommendation model.';
    resolvedAction = action || {
      label: 'Discover Movies',
      to: '/explore',
      icon: Compass,
    };
  } else if (type === 'ratings') {
    resolvedIcon = CustomIcon || Star;
    resolvedTitle = title || "You haven't rated any movies yet.";
    resolvedMessage =
      message ||
      'Browse our extensive catalog of 3,700+ movies across multiple eras and rate your favorites to build your taste profile.';
    resolvedAction = action || {
      label: 'Discover Movies',
      to: '/explore',
      icon: Compass,
    };
  } else if (type === 'search') {
    resolvedIcon = CustomIcon || Search;
    resolvedTitle = title || 'No Results Found';
    resolvedMessage =
      message || 'We could not find any titles matching your search criteria. Try a different title or keyword.';
  }

  const IconComponent = resolvedIcon;
  const ActionIcon = resolvedAction?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`py-14 sm:py-20 text-center max-w-md mx-auto flex flex-col items-center justify-center p-6 ${className}`}
    >
      {/* Glowing Ambient Glass Circle */}
      <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 text-gray-300 shadow-xl shadow-red-950/20 relative group">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-red-600/15 via-rose-500/10 to-amber-500/15 blur-lg pointer-events-none" />
        <IconComponent className="w-10 h-10 opacity-75 text-red-500 group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display tracking-tight leading-snug">
        {resolvedTitle}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-400 mb-8 leading-relaxed max-w-sm font-light">
        {resolvedMessage}
      </p>

      {/* Action Button */}
      {resolvedAction && resolvedAction.to && (
        <Link
          to={resolvedAction.to}
          className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-red-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
        >
          {ActionIcon && (
            <ActionIcon className="w-4 h-4 text-yellow-300 group-hover:rotate-45 transition-transform duration-300" />
          )}
          <span>{resolvedAction.label}</span>
        </Link>
      )}

      {resolvedAction && resolvedAction.onClick && !resolvedAction.to && (
        <button
          type="button"
          onClick={resolvedAction.onClick}
          className="px-6 py-3 rounded-2xl glass-pill hover:bg-white/10 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4 text-gray-300" />}
          <span>{resolvedAction.label}</span>
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
