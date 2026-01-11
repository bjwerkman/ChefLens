/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#eff7ed',
          100: '#dcefd9',
          200: '#bfe2b8',
          300: '#9bcc92',
          400: '#76b068',
          500: '#61aa4f', // Thermomix Base
          600: '#4d8a3e',
          700: '#3e6e30',
          800: '#335829',
          900: '#2a4823',
          950: '#152611',
        },
      },
    },
  },
  plugins: [],
}

