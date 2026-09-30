import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Film, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';

const formVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.25 } },
};

const RegisterPage = () => {
  const { register, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      await register({ username, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.detail || 'Failed to create your CineSphere account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      {/* Background cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0,transparent_70%)] pointer-events-none" />

      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl relative overflow-hidden glow-crimson"
      >
        {/* Top Accent Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-xl shadow-red-600/30 border border-red-500/30 mb-4">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 font-light">
            Join CineSphere to receive hyper-tailored movie recommendations.
          </p>
        </div>

        {/* Notification / Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: null });
                }}
                placeholder="cinephile_alex"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                  fieldErrors.username ? 'border-red-500/70' : 'border-white/10 hover:border-white/20'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                }}
                placeholder="alex@cinema.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                  fieldErrors.email ? 'border-red-500/70' : 'border-white/10 hover:border-white/20'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                  fieldErrors.password ? 'border-red-500/70' : 'border-white/10 hover:border-white/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Checkpoints */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Data Safety</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>SVD Collaborative ML</span>
          </div>
        </div>

        {/* Switch to Login */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 ml-1 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
