/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        nav: '7.75rem',
      },
      fontFamily: {
        kid: ['"Fredoka"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sky: { light: '#E8F4FD', DEFAULT: '#4ECDC4' },
        sun: { DEFAULT: '#FFE66D', dark: '#F4D03F' },
        berry: { DEFAULT: '#FF6B9D', dark: '#E84A7A' },
        grape: { DEFAULT: '#9B59B6', light: '#BB8FCE' },
        mint: { DEFAULT: '#2ECC71', light: '#58D68D' },
      },
      animation: {
        bounceSlow: 'bounce 2s infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        pop: 'pop 0.3s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
