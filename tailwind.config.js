/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust based on your file structure
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)', // Maps to your CSS variable
      },
    },
  },
  plugins: [],
};