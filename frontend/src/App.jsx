import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundGlow from './components/BackgroundGlow';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MyRatingsPage from './pages/MyRatingsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// AnimatedRoutes component ensures smooth Framer Motion transitions across pages
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes - Only Home, Login, Register are accessible without login */}
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />

        {/* Protected UI Routes - Require Login */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ExplorePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <PageTransition>
                <RecommendationsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ratings"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MyRatingsPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <Router>
            <div className="relative min-h-screen w-full overflow-x-hidden bg-[#06080f] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
              {/* Ambient Lighting Orbs */}
              <BackgroundGlow />

              {/* Navigation Bar with responsive mobile drawer */}
              <Navbar />

              {/* Main Animated View Area */}
              <main className="flex-grow relative z-10 pt-20">
                <AnimatedRoutes />
              </main>

              {/* Cinematic Footer */}
              <Footer />
            </div>
          </Router>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
