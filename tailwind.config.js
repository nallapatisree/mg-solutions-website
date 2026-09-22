/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#82abff',
          400: '#4f83ff',
          500: '#2b5cf6',
          600: '#1c40db',
          700: '#1731ab',
          800: '#162a86',
          900: '#16276b',
          950: '#0d1740'
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#8590a8',
          500: '#66718c',
          600: '#525b73',
          700: '#43495e',
          800: '#2c3040',
          900: '#1a1c26',
          950: '#0f1016'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 2px 14px 0 rgba(15, 16, 22, 0.06)',
        card: '0 4px 24px -4px rgba(15, 16, 22, 0.08)'
      }
    }
  },
  plugins: []
};
