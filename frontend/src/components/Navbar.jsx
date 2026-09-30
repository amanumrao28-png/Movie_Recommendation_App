import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  Sparkles,
  Flame,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Star,
  SlidersHorizontal,
  X,
  PlusCircle,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { createUser } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    currentUserId,
    isAuthenticated,
    userStatus,
    sampleUsers,
    switchUser,
    refreshUserStatus,
    logout,
  } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Close mobile drawer on route navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      switchUser(customInput.trim());
      setCustomInput('');
      setShowProfileModal(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) return;

    setCreateLoading(true);
    setCreateError(null);
    try {
      const createdUser = await createUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
      });
      switchUser(createdUser.id);
      setShowCreateModal(false);
      setShowProfileModal(false);
      setNewUsername('');
      setNewEmail('');
      refreshUserStatus();
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create new user.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 1. CineSphere Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-red-400 bg-clip-text text-transparent font-display">
                  CineSphere
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-widest text-red-500 font-mono -mt-1">
                  Cinematic AI
                </span>
              </div>
            </Link>

            {/* 2. Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 text-sm font-medium bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
              {/* Home - always visible */}
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl transition-all ${
                  isActive('/')
                    ? 'bg-red-600/20 text-red-400 font-semibold border border-red-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>

              {/* Protected Links - Only visible when user is logged in */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/explore"
                    className={`px-4 py-2 rounded-xl transition-all ${
                      isActive('/explore')
                        ? 'bg-red-600/20 text-red-400 font-semibold border border-red-500/30 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Discover
                  </Link>

                  <Link
                    to="/recommendations"
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive('/recommendations')
                        ? 'bg-red-600/20 text-red-400 font-semibold border border-red-500/30 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Recommendations
                  </Link>

                  <Link
                    to="/my-ratings"
                    className={`px-4 py-2 rounded-xl transition-all ${
                      isActive('/my-ratings')
                        ? 'bg-red-600/20 text-red-400 font-semibold border border-red-500/30 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    My Ratings
                  </Link>

                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive('/profile')
                        ? 'bg-red-600/20 text-red-400 font-semibold border border-red-500/30 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-gray-300" />
                    Profile
                  </Link>
                </>
              )}
            </div>

            {/* 3. Auth & User Actions */}
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* User Profile Pill button */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2.5 glass-pill hover:border-white/25 rounded-2xl px-3.5 py-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md">
                      {(currentUser?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors">
                        {currentUser?.username || `User #${currentUserId}`}
                      </div>
                    </div>

                    {userStatus && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border ${
                          userStatus.has_rating_history
                            ? 'bg-purple-900/60 text-purple-300 border-purple-500/40 glow-violet'
                            : 'bg-amber-900/60 text-amber-300 border-amber-500/40 glow-gold'
                        }`}
                      >
                        {userStatus.has_rating_history ? (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" /> SVD
                          </>
                        ) : (
                          <>
                            <Flame className="w-2.5 h-2.5 text-amber-400" /> Popular
                          </>
                        )}
                      </span>
                    )}
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-gray-400 hover:text-white glass-pill hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl glass-pill hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/10"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/40 transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white glass-pill hover:bg-white/10 transition-colors border border-white/10 ml-1 flex items-center justify-center cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Animated Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden glass-header border-t border-white/10 px-5 pt-3 pb-6 space-y-2 overflow-hidden bg-[#070a14]/95 backdrop-blur-3xl"
            >
              {/* Home - always visible */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/')
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Home
              </Link>

              {/* Protected Links - Only visible when user is logged in */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/explore')
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Discover Catalog
                  </Link>

                  <Link
                    to="/recommendations"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/recommendations')
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Recommendations
                  </Link>

                  <Link
                    to="/my-ratings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/my-ratings')
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    My Ratings
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/profile')
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Profile & Settings
                  </Link>
                </>
              )}

              {/* Mobile Auth actions */}
              <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl glass-pill text-center text-xs font-semibold text-white border border-white/15"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-center text-xs font-semibold text-white shadow-lg shadow-red-600/40"
                    >
                      Register
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 flex items-center justify-center gap-1.5 mt-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Switch User / Demo Presets
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Profile Modal / Developer Switcher */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-red-600 flex items-center justify-center text-xl font-bold text-white shadow-xl">
                {currentUserId}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {currentUser?.username ? `${currentUser.username} (ID #${currentUserId})` : `User Profile #${currentUserId}`}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Recommendation Engine Mode:{' '}
                  <strong className={userStatus?.has_rating_history ? 'text-purple-400' : 'text-amber-400'}>
                    {userStatus?.has_rating_history ? 'Collaborative Filtering (SVD)' : 'Cold-Start (Popularity)'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Presets and Testing */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Users with Rating History (SVD Mode)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sampleUsers.users_with_history.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => {
                        switchUser(u.user_id);
                        setShowProfileModal(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        currentUserId === u.user_id
                          ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                          : 'glass-pill text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      User #{u.user_id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Cold Start Users (Zero Ratings)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sampleUsers.users_without_history.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => {
                        switchUser(u.user_id);
                        setShowProfileModal(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        currentUserId === u.user_id
                          ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                          : 'glass-pill text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      User #{u.user_id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <form onSubmit={handleCustomSubmit} className="pt-2">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Switch to Any User ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter User ID (e.g. 101)"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Switch
                  </button>
                </div>
              </form>

              {/* Create User Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">Need a fresh testing account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 glass-pill hover:bg-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-red-500" /> Create New User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1 font-display">Create CineSphere User</h3>
            <p className="text-xs text-gray-400 mb-5">
              New users start with zero ratings and receive Popularity-based recommendations.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cinephile_01"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@cinesphere.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {createError && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-xl p-2.5">
                  {createError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 glass-pill text-xs font-medium text-gray-300 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/40 transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
