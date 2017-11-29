var path = require('path');
var webpack = require('webpack');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
    filename: "css/[name].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: './app.js',
  context: path.resolve(__dirname, "src"),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/bundle.js',
    library: 'EntryPoint',
    libraryExport: '_entry_return_',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(jpg|gif|png)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: './images/[name].[ext]'
          }
        }]
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: './css/[name].[ext]'
          }
        }]
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [{
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }],
            // use style-loader in development
            fallback: "style-loader"
        })
      }
    ]
  },
  plugins: [
    extractSass,
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
