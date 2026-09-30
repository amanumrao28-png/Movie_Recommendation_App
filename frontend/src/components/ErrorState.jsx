import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable ErrorState component with glassmorphism design,
 * customizable message, animated retry button, and optional secondary action.
 */
const ErrorState = ({
  title = 'Service Temporarily Unavailable',
  message = 'Unable to communicate with the CineSphere recommendation backend. Please check your connection or retry.',
  onRetry,
  isRetrying = false,
  icon: CustomIcon,
  actionText = 'Retry Connection',
  secondaryAction,
  className = '',
}) => {
  const displayMessage = typeof message === 'string'
    ? message
    : (Array.isArray(message)
        ? message.map((m) => (typeof m === 'object' ? (m.msg || JSON.stringify(m)) : String(m))).join(', ')
        : (message && typeof message === 'object' ? JSON.stringify(message) : String(message || '')));

  const IconComponent = CustomIcon || (displayMessage.toLowerCase().includes('network') ? WifiOff : AlertCircle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`p-8 sm:p-10 rounded-3xl glass-panel border border-red-800/60 text-center max-w-lg mx-auto my-10 shadow-2xl relative overflow-hidden glow-crimson bg-[#0c101c]/90 ${className}`}
    >
      {/* Top red glow accent */}
      <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* Animated Glowing Error Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-700/60 flex items-center justify-center mx-auto mb-5 text-red-400 shadow-xl shadow-red-950/40">
        <IconComponent className="w-8 h-8 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-display tracking-tight">
        {title}
      </h3>

      {/* Message */}
      <p className="text-xs sm:text-sm text-gray-300/90 mb-6 leading-relaxed max-w-md mx-auto font-light">
        {displayMessage}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 text-white transition-transform ${
                isRetrying ? 'animate-spin' : 'group-hover:rotate-180 duration-500'
              }`}
            />
            <span>{isRetrying ? 'Retrying...' : actionText}</span>
          </button>
        )}

        {secondaryAction && secondaryAction.to && (
          <Link
            to={secondaryAction.to}
            className="w-full sm:w-auto px-5 py-3 glass-pill hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span>{secondaryAction.text}</span>
          </Link>
        )}

        {secondaryAction && secondaryAction.onClick && !secondaryAction.to && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="w-full sm:w-auto px-5 py-3 glass-pill hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            {secondaryAction.text}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorState;
