'use strict';

/**
 * Module dependencies.
 * @private
 */
const path              = require('path');
const webpackMerge      = require('webpack-merge');
const webpack           = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = webpackMerge(require('./webpack.base.config'), {
  module: {
    loaders: [
      {
        test:   /\.css$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader')
      }, 
      {
        test:   /\.postcss$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader')
      }, 
      {
        test:   /\.less$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader!less-loader')
      }, 
      {
        test:   /\.sass$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader!sass-loader?indentedSyntax')
      }, 
      {
        test:   /\.scss$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader!sass-loader')
      }, 
      {
        test:   /\.stylus$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader!stylus-loader')
      }, 
      {
        test:   /\.styl$/, 
        loader: ExtractTextPlugin.extract('vue-style-loader', 'css-loader!stylus-loader')
      }
    ]
  }, 

  output: {
    filename:      'js/[name].[chunkhash].js', 
    chunkFilename: 'js/[id].[chunkhash].js'
  }, 

  vue: {
    loaders: {
      css:     ExtractTextPlugin.extract('vue-style-loader', 'css-loader'), 
      postcss: ExtractTextPlugin.extract('vue-style-loader', 'css-loader'), 
      less:    ExtractTextPlugin.extract('vue-style-loader', 'css-loader!less-loader'), 
      sass:    ExtractTextPlugin.extract('vue-style-loader', 'css-loader!sass-loader?indentedSyntax'), 
      scss:    ExtractTextPlugin.extract('vue-style-loader', 'css-loader!sass-loader'), 
      stylus:  ExtractTextPlugin.extract('vue-style-loader', 'css-loader!stylus-loader'), 
      styl:    ExtractTextPlugin.extract('vue-style-loader', 'css-loader!stylus-loader')
    }
  }, 

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }), 
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }), 
    new webpack.optimize.OccurrenceOrderPlugin(), 
    new ExtractTextPlugin('css/[name].[contenthash].css'),
    new HtmlWebpackPlugin({
      filename: path.resolve('./build/www/public/index.html'), 
      template: './src/www/frontend/index.pug', 
      inject:   false, 
      minify:   {
        removeComments:        true, 
        collapseWhitespace:    true, 
        removeAttributeQuotes: true
      }, 
      chunksSortMode: 'dependency'
    }), 
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.resolve('./node_modules')) === 0
        )
      }
    }), 
    new webpack.optimize.CommonsChunkPlugin({
      name:   'manifest',
      chunks: ['vendor']
    })
  ]
});