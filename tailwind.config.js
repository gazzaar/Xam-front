/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        expletus: ['Expletus Sans', 'sans-serif'],
        'd-din': ['D-din', 'sans-serif'],
        'D-dinExp': ['D-dinExp', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
