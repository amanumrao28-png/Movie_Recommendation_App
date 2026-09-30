/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cine: {
          bg: "#06080f",
          dark: "#0b0f19",
          card: "#111726",
          cardHover: "#161f33",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.22)",
          primary: "#e50914",
          primaryHover: "#f40612",
          accent: "#e50914",
          violet: "#8b5cf6",
          gold: "#f59e0b",
          muted: "#94a3b8",
          subtle: "#64748b"
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        display: [
          'Outfit',
          'Inter',
          'sans-serif'
        ]
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulseGlow 8s ease-in-out infinite',
        'blob-drift': 'blobDrift 16s ease-in-out infinite alternate',
        'shimmer': 'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        blobDrift: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '100%': { transform: 'translate(-25px, 25px) scale(0.95)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'cine': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'cine-glow': '0 0 35px -5px rgba(229, 9, 20, 0.35)',
        'cine-violet': '0 0 35px -5px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
