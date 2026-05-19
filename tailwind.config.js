/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
        },
        accent: {
          DEFAULT: '#0ea5e9',
          warn: '#38bdf8',
          danger: '#f472b6',
        },
        surface: {
          primary: '#f8fafc',
          secondary: '#e2e8f0',
          card: '#ffffff',
          overlay: 'rgba(14, 165, 233, 0.08)',
        },
        dark: {
          primary: '#0a0e1a',
          secondary: '#111827',
          card: '#1e293b',
          overlay: 'rgba(14, 165, 233, 0.12)',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '28px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(14, 165, 233, 0.06)',
        'md': '0 4px 20px rgba(14, 165, 233, 0.08)',
        'lg': '0 8px 40px rgba(14, 165, 233, 0.12)',
        'glow': '0 0 30px rgba(14, 165, 233, 0.25)',
        'blue': '0 4px 20px rgba(59, 130, 246, 0.3)',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-slide-up': 'fadeSlideUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}