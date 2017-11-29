var webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js')

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
    filename: "css/[name].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
});
