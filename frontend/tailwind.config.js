/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c7d6ff',
          300: '#a1baff',
          400: '#7394ff',
          500: '#4767ff',
          600: '#2e42ff',
          700: '#2534e6',
          800: '#222db9',
          900: '#212c93',
          950: '#151a56',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
