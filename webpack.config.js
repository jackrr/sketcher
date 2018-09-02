const path = require('path');

module.exports = {
  entry: './public/main.js',
  output: {
    path: path.resolve(__dirname, 'public/bin'),
    filename: 'main.bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.json?$/,
      use: {
        loader: 'json'
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [require('@babel/plugin-proposal-object-rest-spread')]
        }
      }
    }]
  }
};
