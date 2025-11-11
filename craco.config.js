const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
        fs: false,
        net: false,
        tls: false,
      };
      
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      
      // Ignore Node.js modules warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ];
      
      return webpackConfig;
    },
  },
};