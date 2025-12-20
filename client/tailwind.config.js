/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Desktop/tablet-first breakpoints (different from customer mobile-first)
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Main colors from design system
        charcoal: "#242424", // Primary dark background
        white: "#ffffff", // Text on dark, light backgrounds
        naples: "#ffdc64", // Primary accent (buttons, highlights)
        // Supporting colors
        antiflash: "#f0f0f0", // Light backgrounds, borders
        black: "#000000", // Pure black for emphasis
        arylide: "#dcc864", // Darker yellow for hover states

        // Neutral scale replacing the blue primary scale
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Neutral/Grayscale scale replacing purple secondary scale
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        gradient: {
          primary: '#ffdc64', // Naples Yellow
          secondary: '#dcc864', // Arylide Yellow
          accent: '#242424', // Charcoal
          warm: '#fbbf24',
          cool: '#f59e0b',
          sunset: '#d97706',
          ocean: '#b45309',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        'sidebar': '100vh',
        'content': 'calc(100vh - 4rem)',
      },
      maxWidth: {
        'content': '1440px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(47,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(45,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(0,0%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(40,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(42,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(0,0%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(45,100%,76%,1) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'gradient-xy': 'gradientXY 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 220, 100, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 220, 100, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientY: {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        gradientXY: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 220, 100, 0.5)',
        'glow-lg': '0 0 30px rgba(255, 220, 100, 0.6)',
        'glow-yellow': '0 0 20px rgba(255, 220, 100, 0.5)',
        'glow-yellow-lg': '0 0 30px rgba(255, 220, 100, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(255, 220, 100, 0.3)',
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
