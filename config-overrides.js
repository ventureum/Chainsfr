/* eslint-disable */
var path = require('path')
const WorkerPlugin = require('worker-plugin')

module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function(config, env) {
    // ...add your webpack config
    // suppress grpc warnings
    config.module.exprContextCritical = false

    // remove hot-loader
    if (process.env.REACT_APP_HOT_LOADING === 'false') {
      config.entry = config.entry.filter(e => !e.endsWith('webpackHotDevClient.js'))
    }

    if (!config.plugins) {
      config.plugins = []
    }
    config.plugins.push(new WorkerPlugin())
    config.optimization = {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]

              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`
            }
          }
        }
      }
    }
    return config
  }
}
