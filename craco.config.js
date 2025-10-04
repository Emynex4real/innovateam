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
    port: 3000,
    open: true,
    historyApiFallback: true,
    allowedHosts: 'all'
  }
};