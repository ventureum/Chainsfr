/* eslint-disable */
var path = require('path')

module.exports = function override(config, env) {
  config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' }
    })
    config.output = {
      ...config.output,
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js',
      globalObject: 'this'
}
  return config;
}