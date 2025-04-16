/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5b21b6',
        secondary: '#4c1d95',
        accent: '#7c3aed',
      }
    },
  },
  plugins: [],
}