import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Info } from 'lucide-react';

/**
 * Small glassmorphism information badge explaining recommendation origin.
 * Friendly, user-centric explanation with zero technical ML jargon.
 */
const RecommendationExplanationBadge = ({
  type = 'popularity',
  isCollaborative = false,
  className = '',
}) => {
  const isCollab =
    isCollaborative ||
    type === 'collaborative' ||
    type === 'collaborative_svd';

  const explanationText = isCollab
    ? 'Recommended based on your movie rating history.'
    : 'Popular because many users rated these movies highly.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all shadow-sm ${
        isCollab
          ? 'bg-purple-950/40 border border-purple-500/30 text-purple-200 glow-violet'
          : 'bg-amber-950/40 border border-amber-500/30 text-amber-200 glow-gold'
      } ${className}`}
    >
      {/* Icon with subtle pulse animation */}
      {isCollab ? (
        <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
      ) : (
        <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      )}

      {/* User-facing explanation text */}
      <span className="tracking-wide">{explanationText}</span>
    </motion.div>
  );
};

export default RecommendationExplanationBadge;
