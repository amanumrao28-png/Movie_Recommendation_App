import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RATING_LABELS = {
  1: 'Poor / Did not enjoy',
  2: 'Fair / Mediocre',
  3: 'Good / Entertaining',
  4: 'Great / Highly Recommended',
  5: 'Masterpiece / Essential Cinema',
};

const STAR_SIZES = {
  sm: { icon: 'w-4 h-4', container: 'gap-1', text: 'text-xs' },
  md: { icon: 'w-7 h-7', container: 'gap-1.5', text: 'text-sm' },
  lg: { icon: 'w-9 h-9', container: 'gap-2', text: 'text-base' },
};

const StarRating = ({
  rating = 0,
  onRatingChange,
  interactive = true,
  size = 'md',
  showLabel = true,
  showValue = true,
  className = '',
}) => {
  const [internalHover, setInternalHover] = useState(null);
  const [justSelectedStar, setJustSelectedStar] = useState(null);

  const displayRating = internalHover !== null ? internalHover : (rating || 0);
  const sizeConfig = STAR_SIZES[size] || STAR_SIZES.md;

  const handleStarClick = (val) => {
    if (!interactive) return;
    setJustSelectedStar(val);
    if (onRatingChange) {
      onRatingChange(val);
    }
    // Reset the pop animation trigger after a brief duration
    setTimeout(() => {
      setJustSelectedStar(null);
    }, 450);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Stars Row */}
      <div className={`flex items-center justify-center ${sizeConfig.container}`}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= Math.round(displayRating);
          const isSelected = justSelectedStar === starValue;

          return (
            <motion.button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => interactive && setInternalHover(starValue)}
              onMouseLeave={() => interactive && setInternalHover(null)}
              whileHover={interactive ? { scale: 1.25, y: -2 } : {}}
              whileTap={interactive ? { scale: 0.88 } : {}}
              animate={
                isSelected
                  ? {
                      scale: [1, 1.45, 0.95, 1],
                      rotate: [0, -14, 14, 0],
                      filter: [
                        'drop-shadow(0 0 0px rgba(250,204,21,0))',
                        'drop-shadow(0 0 16px rgba(250,204,21,0.9))',
                        'drop-shadow(0 0 8px rgba(250,204,21,0.6))',
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 0.4,
                ease: 'easeOut',
              }}
              className={`relative p-1 rounded-lg focus:outline-none transition-colors will-change-transform ${
                interactive ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={interactive ? `${starValue} Star${starValue > 1 ? 's' : ''}: ${RATING_LABELS[starValue]}` : undefined}
            >
              {/* Star Icon */}
              <Star
                className={`${sizeConfig.icon} transition-all duration-200 ${
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                    : 'text-gray-600/80 hover:text-yellow-400/80'
                }`}
              />

              {/* Ambient Glow behind active star on hover */}
              {interactive && isFilled && (
                <span
                  className="absolute inset-0 rounded-full bg-yellow-400/10 blur-sm pointer-events-none -z-10"
                />
              )}
            </motion.button>
          );
        })}

        {/* Numeric Value Pill */}
        {showValue && (
          <motion.span
            key={displayRating}
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`ml-2 font-mono font-bold text-yellow-400 ${sizeConfig.text}`}
          >
            {displayRating > 0 ? Number(displayRating).toFixed(1) : '0.0'}
            <span className="text-gray-500 font-normal text-xs ml-0.5">/5</span>
          </motion.span>
        )}
      </div>

      {/* Descriptive Text Label with AnimatePresence */}
      {showLabel && displayRating > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={displayRating}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-gray-300 font-medium mt-1.5 text-center tracking-wide"
          >
            {RATING_LABELS[Math.round(displayRating)] || ''}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default StarRating;
