module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "stream": require.resolve("stream-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
        },
      },
    },
  },
}; 