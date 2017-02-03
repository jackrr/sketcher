module.exports = {
  entry: './public/main.js',
  output: {
    path: './public/bin',
    filename: 'main.bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.json?$/,
      loader: 'json'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: ['transform-object-rest-spread']
      }
    }]
  }
};
