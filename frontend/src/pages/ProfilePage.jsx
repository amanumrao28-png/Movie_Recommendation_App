import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Star, Film, Sparkles, Flame, LogOut, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  const { currentUser, currentUserId, userStatus, userRatingsMap, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ratedCount = Object.keys(userRatingsMap).length || userStatus?.rating_count || 0;
  const isCollaborative = userStatus?.has_rating_history || ratedCount > 0;

  const ratingsValues = Object.values(userRatingsMap);
  const avgRating =
    ratingsValues.length > 0
      ? (ratingsValues.reduce((a, b) => a + b, 0) / ratingsValues.length).toFixed(1)
      : '0.0';

  const userInitial = (currentUser?.username || 'U')[0].toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden glow-crimson"
      >
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* User Avatar Circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-xl shadow-red-600/30 flex items-center justify-center text-3xl font-extrabold text-white border border-white/20">
              {userInitial}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  {currentUser?.username || `User #${currentUserId}`}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/15 text-gray-300">
                  ID #{currentUserId}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  {currentUser?.email || `user_${currentUserId}@cinesphere.local`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  Joined {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-pill hover:bg-red-950/40 hover:text-red-300 text-gray-300 border border-white/10 text-xs font-semibold transition-all group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          {/* Total Movies Rated */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Movies Rated
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white font-mono">{ratedCount}</span>
              <span className="text-xs text-gray-500">rated movies</span>
            </div>
          </div>

          {/* Average Rating */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Average Rating
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-yellow-400 font-mono flex items-center gap-1">
                <Star className="w-6 h-6 fill-yellow-400 inline" /> {avgRating}
              </span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
          </div>

          {/* Recommendation Engine */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Active Recommendation Engine
            </span>
            <div className="mt-2">
              {isCollaborative ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/60 border border-purple-500/40 text-purple-300 glow-violet">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Surprise SVD Filtering
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300 glow-gold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Popularity Cold-Start
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Your CineSphere Hub
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/my-ratings"
              className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/20 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Star className="w-5 h-5 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                    My Ratings
                  </h4>
                  <p className="text-[11px] text-gray-400">View and update your rated movies</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/recommendations"
              className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/20 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                    Personalized Recommendations
                  </h4>
                  <p className="text-[11px] text-gray-400">Explore SVD machine learning picks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Security & Architecture Note */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-gray-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            Authentication is secured via PBKDF2 HMAC-SHA256 password hashing and stored locally with zero demographic tracking.
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
