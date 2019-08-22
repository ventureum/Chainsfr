/* eslint-disable */
var path = require('path')

module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function(config, env) {
    // ...add your webpack config
    // suppress grpc warnings
    config.module.exprContextCritical = false
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
      exclude: /node_modules/,
    })
    config.output = {
      ...config.output,
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js',
      globalObject: 'this',
    }
  return config;
  },
  // The Jest config to use when running your jest tests - note that the normal rewires do not
  // work here.
  jest: function(config) {
    config.transformIgnorePatterns = ["node_modules/(?!(@atlaskit)/)"]
    return config;
  }
}