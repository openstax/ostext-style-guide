const path = require('path');

const config = {
  devtool: 'source-map',
  entry: ['babel-polyfill', path.resolve(__dirname, 'src/assets/js/app.js')],
  output: {
    path: path.resolve(__dirname, 'dist/assets/js'),
    filename: 'style-guide.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
    // rules: [
    //   {test: /\.(js|jsx)$/, use: 'babel-loader'}
    // ]
  }
};

module.exports = config;
