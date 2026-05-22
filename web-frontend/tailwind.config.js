/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: '#e85d26',
        'brand-dark': '#c2410c',
        'brand-50': '#fef3ec',
        bg: '#fdf6f0',
        surface: '#ffffff',
        border: '#ede8e3',
        'border-mid': '#ddd5cc',
        textPrimary: '#1a1210',
        textSecondary: '#5c5048',
        textMuted: '#9e8f87',
        success: '#16a34a',
        'success-bg': '#d1fae5',
        warning: '#d97706',
        'warning-bg': '#fef3c7',
        info: '#1d4ed8',
        'info-bg': '#dbeafe',
      }
    },
  },
  plugins: [],
}