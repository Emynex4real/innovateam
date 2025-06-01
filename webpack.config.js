const path = require('path');

module.exports = {
  // ... other webpack configuration
  resolve: {
    fallback: {
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify")
    }
  }
}; 