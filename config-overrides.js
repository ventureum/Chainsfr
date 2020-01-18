/* eslint-disable */
var path = require('path')
const WorkerPlugin = require('worker-plugin')

module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function(config, env) {
    // ...add your webpack config
    // suppress grpc warnings
    config.module.exprContextCritical = false
    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(new WorkerPlugin())
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