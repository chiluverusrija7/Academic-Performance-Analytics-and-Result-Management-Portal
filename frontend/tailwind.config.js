/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        // Deep navy palette — primary design tokens
        navy: {
          950: '#080e1a',
          900: '#0f1824',
          800: '#162032',
          700: '#1e2d42',
          600: '#243550',
        },
        // Brand blue
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent cyan
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)',
        'modal': '0 25px 60px rgba(0,0,0,0.6), 0 10px 25px rgba(0,0,0,0.4)',
        'metric': '0 0 0 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.15)',
        'sidebar': '2px 0 20px rgba(0,0,0,0.3)',
        'toast': '0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'card': '12px',
        'modal': '16px',
        'btn': '8px',
      },
      backgroundImage: {
        'gradient-surface': 'linear-gradient(135deg, rgba(22,32,50,1) 0%, rgba(15,24,36,1) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(22,32,50,0.9) 0%, rgba(15,24,36,0.8) 100%)',
        'gradient-blue': 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
        'gradient-header': 'linear-gradient(90deg, rgba(59,130,246,0.08) 0%, transparent 100%)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
