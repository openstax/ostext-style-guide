const path = require('path');

const config = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/assets/js/app.js'),
  output: {
    path: path.resolve(__dirname, 'dist/assets/js'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

module.exports = config;
