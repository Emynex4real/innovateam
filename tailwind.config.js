module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['Roboto', 'sans-serif'], // Define fonts correctly
        body: ['Lato', 'sans-serif'],   // Ensure no syntax issues
      }
    },
  },
  plugins: [],
};
