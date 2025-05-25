/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        expletus: ['Expletus Sans', 'sans-serif'],
        'd-din': ['D-din', 'sans-serif'],
        'D-dinExp': ['D-dinExp', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
