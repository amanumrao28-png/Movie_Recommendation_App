import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  WifiOff,
  Star,
  X,
  Sparkles,
} from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/35',
    glow: 'glow-green shadow-emerald-950/40',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    bar: 'bg-emerald-500/50',
    gradient: 'from-emerald-500 via-teal-400 to-emerald-600',
  },
  error: {
    icon: AlertCircle,
    border: 'border-red-500/35',
    glow: 'glow-crimson shadow-red-950/40',
    iconBg: 'bg-red-500/15 border-red-500/30 text-red-400',
    bar: 'bg-red-500/50',
    gradient: 'from-red-600 via-rose-500 to-red-600',
  },
  network_error: {
    icon: WifiOff,
    border: 'border-rose-500/40',
    glow: 'glow-crimson shadow-rose-950/50',
    iconBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    bar: 'bg-rose-500/60',
    gradient: 'from-rose-600 via-red-500 to-amber-600',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/35',
    glow: 'glow-gold shadow-amber-950/40',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    bar: 'bg-amber-500/50',
    gradient: 'from-amber-500 via-yellow-400 to-amber-600',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/35',
    glow: 'shadow-blue-950/40',
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    bar: 'bg-blue-500/50',
    gradient: 'from-blue-500 via-indigo-400 to-purple-600',
  },
};

/**
 * Reusable glassmorphic Toast notification card with Framer Motion transitions.
 */
export const Toast = ({ toast, onDismiss }) => {
  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.success;
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -25, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl glass-panel border ${config.border} bg-[#0b101d]/95 backdrop-blur-2xl shadow-2xl p-4 ${config.glow}`}
    >
      {/* Top accent gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

      <div className="flex items-start gap-3.5">
        {/* Glowing type icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center mt-0.5 ${config.iconBg}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content body */}
        <div className="flex-grow min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white font-display leading-tight">
              {toast.title}
            </h4>
            {toast.rating && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {Number(toast.rating).toFixed(1)}
              </span>
            )}
          </div>

          {toast.movieTitle && (
            <p className="text-xs font-semibold text-gray-200 mt-0.5 truncate">
              {toast.movieTitle}
            </p>
          )}

          <p className="text-xs text-gray-300/80 mt-1 leading-relaxed">{toast.message}</p>

          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick && toast.action.onClick();
                  onDismiss(toast.id);
                }}
                className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      {toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bar}`}
        />
      )}
    </motion.div>
  );
};

export default Toast;
