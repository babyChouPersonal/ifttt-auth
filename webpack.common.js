const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		global: './public/javascripts/index.js',
		login: './public/javascripts/signIn.js',
		signUp: './public/javascripts/signUp.js', 
	},
	output: {
		filename: '[name].bundle.js',
		publicPath: '/dist/',
		// publicPath: '/oauth/dist/',
		path: path.resolve(__dirname, './public/dist'),
		libraryTarget: 'var',
		library: 'EntryPoint'
	},
	module: {
		rules:[
			{
				test: /\.(scss)$/,
				use: [{
					loader: 'style-loader', 
				},
				{
					loader: 'css-loader', 
				},
				{
					loader: 'postcss-loader', 
					options: {
						plugins: function () { 
							return [
								require('precss'),
								require('autoprefixer')
							];
						}
					}
				},
				{
					loader: 'sass-loader' 
				}]
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use:[{
						loader: 'babel-loader',
				}]
			},
			{
				test: /\.(jpe?g|JPE?G|png|PNG|gif|GIF|svg|SVG|woff|woff2|eot|ttf)(\?v=\d+\.\d+\.\d+)?$/,
				use:[{
					loader: 'url-loader'
				}]
			}
			// {
			// 	test: /\.(png|svg|jpg|gif)$/,
			// 	use: ['file-loader']
			// }
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			title: 'Sign In',
			title1: 'Please sign in',
			action: '\"./authorize\"',
			signUpPage: false,
			signInPage: true,
			chunks: ['global','login'],
			filename: '../../views/login.html',
			template: './public/viewsTemp/login.tpl.html'
		}),
		new HtmlWebpackPlugin({
			title: 'Sign Up',
			title1: 'Please sign Up',
			action: '\"./signUp\"',
			signUpPage: true,
			signInPage: false,
			chunks: ['global','signUp'],
			filename: '../../views/signUp.html',
			template: './public/viewsTemp/login.tpl.html'
		}),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common' // Specify the common bundle's name.
		})
	]
};