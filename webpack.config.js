'use strict';

var webpack = require('webpack');
var sprite = require('sprite-webpack-plugin');
var path = require('path');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var sassLintPlugin = require('sasslint-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var distPath = '/dist/';

var ENV = process.env.npm_lifecycle_event;
var isProd = ENV === 'build';

module.exports = function makeWebpackConfig () {

	var config = {};

	config.cache = true;

	config.entry = {
		bundle: path.resolve(__dirname, 'app/scripts/app.js'),
  };

	config.output = {
		path: __dirname + distPath,
		publicPath: isProd ? '/' : 'http://localhost:8080/',
		filename: '[name].[hash].js',
		chunkFilename: isProd ? '[name].[hash].js' : '[name].js'
	};

	if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

	config.module = {
		loaders: [{
				exclude: [/node_modules/],
				loader: 'babel',
				test: /\.js$/,
			}, {
				exclude: [/node_modules/],
		  	loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader'),
				test: /\.scss$/,
			}, {
				exclude: [/node_modules/],
	      loader: 'file',
				test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
			}, {
				exclude: [/node_modules/],
				loader: 'raw',
				test: /\.html$/,
	    }
		],
		preLoaders: [{
	     	test: /\.js$/,
	     	exclude: [/node_modules/],
	     	loader: 'jscs-loader',
		 	}, {
	      test: /\s[a|c]ss$/,
	      exclude: [/node_modules/],
	      loader: 'sasslint'
	    }
		],
	};

	config.postcss = [
		autoprefixer({
			browsers: ['last 2 version']
		})
	];

	config.devServer = {
    contentBase: '/app',
    stats: 'minimal'
  };

	config.jscs = {
		validateIndentation: 2,
    emitErrors: false,
    failOnHint: false,
	};

	config.plugins = [];

  config.plugins.push(
		new HtmlWebpackPlugin({
			template: 'app/index.html',
			inject: 'body'
		}),
    new ExtractTextPlugin('[name].[hash].css', {disable: !isProd}),
		new sprite({
			'source': path.resolve(__dirname, 'app/images/'),
			'imgPath': path.resolve(__dirname, 'app/sprites/'),
			'format': 'png',
			'spriteName': 'sprite',
			'connector': '-',
			'base': 'icon',
			'cssPath': path.resolve(__dirname, 'app/styles/'),
			'prefix': 'icon',
			'processor': 'scss',
			'bundleMode': 'one',
		}),
		new sassLintPlugin({
			context: ['app/styles/custom/'],
		})
  );

  if (isProd) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: true,
				}
			}),
			new CopyWebpackPlugin([{
				from: __dirname + '/app/images/'
			}])
    );
  }

  return config;
}();
