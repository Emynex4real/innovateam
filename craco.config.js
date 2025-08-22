module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "stream": require.resolve("stream-browserify")
        }
      },
      performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
      }
    }
  },
  devServer: {
    port: 3000, // Set to 3000 (change to 5002 if you want to keep the current port)
    open: true, // Automatically open the browser
    historyApiFallback: true // Handle client-side routing
  }
};