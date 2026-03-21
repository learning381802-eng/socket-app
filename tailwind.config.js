/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        socket: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#8098f9',
          500: '#6173f3',
          600: '#4a52e8',
          700: '#3d40d4',
          800: '#3336ab',
          900: '#2f3187',
          950: '#1c1d52',
        },
        surface: {
          50: '#f8f9fc',
          100: '#f0f2f8',
          200: '#e4e7f0',
          300: '#cdd2e3',
          400: '#9aa3c0',
          500: '#6b7494',
          600: '#505978',
          700: '#404762',
          800: '#363b52',
          900: '#1e2236',
          950: '#13162a',
        }
      },
      animation: {
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        slideInLeft: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(97, 115, 243, 0.3)',
        'glow-sm': '0 0 10px rgba(97, 115, 243, 0.2)',
        'message': '0 2px 8px rgba(0,0,0,0.08)',
        'panel': '0 8px 32px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
