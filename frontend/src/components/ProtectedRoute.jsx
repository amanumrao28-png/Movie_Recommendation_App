import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingStatus } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to /login with original location state for smooth post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
