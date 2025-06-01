module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "stream": require.resolve("stream-browserify")
        }
      }
    }
  }
}; 