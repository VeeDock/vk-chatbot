'use strict';

/**
 * Module dependencies.
 * @private
 */
const path         = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    app: './src/www/frontend/src/main.js'
  }, 

  output: {
    filename:   '[name].js', 
    path:       path.resolve('./build/www/public/static'), 
    publicPath: '/'
  }, 

  resolve: {
    extensions: ['', '.js', '.vue', '.json'], 
    fallback:   [path.resolve('./node_modules')], 
    alias:      {
      'vue$':       'vue/dist/vue.common.js', 
      'src':        path.resolve('./src/www/frontend/src'), 
      'assets':     path.resolve('./src/www/frontend/src/assets'), 
      'components': path.resolve('./src/www/frontend/src/components')
    }
  }, 

  resolveLoader: {
    fallback: [path.resolve('./node_modules')]
  }, 

  module: {
    loaders: [
      {
        test:   /\.vue$/, 
        loader: 'vue'
      }, 

      {
        test:   /\.pug$/, 
        loader: 'pug'
      }, 

      {
        test:   /\.json$/, 
        loader: 'json'
      }, 

      {
        test:   /\.js$/, 
        loader: 'babel', 
        include: [path.resolve('./src/www/frontend/src')], 
        exclude: /node_modules/
      }, 

      {
        test:   /\.(png|jpe?g|gif|svg)(\?.*)?$/, 
        loader: 'url', 
        query:  {
          limit: 10000, 
          name:  'img/[name].[hash:7].[ext]'
        }
      }, 

      {
        test:   /\.(woff2?|eot|ttf|otf)(\?.*)?$/, 
        loader: 'url',
        query:  {
          limit: 10000, 
          name:  'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  }, 

  vue: {
    loaders: {
      css:     'vue-style-loader!css-loader', 
      postcss: 'vue-style-loader!css-loader', 
      less:    'vue-style-loader!css-loader!less-loader', 
      sass:    'vue-style-loader!css-loader!sass-loader?indentedSyntax', 
      scss:    'vue-style-loader!css-loader!sass-loader', 
      stylus:  'vue-style-loader!css-loader!stylus-loader', 
      styl:    'vue-style-loader!css-loader!stylus-loader'
    }, 
    postcss: [
      autoprefixer({ browsers: ['last 2 versions'] })
    ]
  }
}
