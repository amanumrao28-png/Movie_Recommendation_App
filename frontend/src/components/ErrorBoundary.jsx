import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06080f] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              An unexpected error occurred while displaying this view.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
