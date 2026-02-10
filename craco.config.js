module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/jspdf/,
          /node_modules\/jspdf-autotable/
        ]
      });
      return webpackConfig;
    }
  }
};
