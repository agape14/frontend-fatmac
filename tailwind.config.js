/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-pastel': '#FFD1E3',
        'purple-pastel': '#D0BFFF',
        'yellow-pastel': '#FFF6BD',
      },
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'kawaii': '1.5rem', // rounded-3xl equivalent
      },
      boxShadow: {
        'kawaii': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'kawaii-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

