import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title = 'Notification',
      message = '',
      movieTitle = '',
      rating = null,
      type = 'success',
      duration = 4000,
      action = null,
    }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, message, movieTitle, rating, type, duration, action };

      setToasts((prev) => {
        // Prevent duplicate network error toasts
        if (type === 'network_error' && prev.some((t) => t.type === 'network_error')) {
          return prev;
        }
        return [...prev, newToast];
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // Automatically catch network error events from apiClient
  useEffect(() => {
    const handleNetworkError = (event) => {
      const detail = event.detail || {};
      showToast({
        title: detail.title || 'Network Connection Error',
        message:
          detail.message ||
          'Unable to reach CineSphere API. Please verify the FastAPI backend server is running.',
        type: 'network_error',
        duration: 6000,
      });
    };

    window.addEventListener('cinesphere:network_error', handleNetworkError);
    return () => {
      window.removeEventListener('cinesphere:network_error', handleNetworkError);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Glassmorphism Toast Container */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
