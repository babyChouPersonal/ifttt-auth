//https://webpack.js.org/guides/production/#setup
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

//https://github.com/jaketrent/html-webpack-template/blob/86f285d5c790a6c15263f5cc50fd666d51f974fd/index.html
//https://github.com/jaketrent/html-webpack-template
module.exports = {
	entry: {
		global: './public/javascripts/index.js',
		login: './public/javascripts/signIn.js',
		signUp: './public/javascripts/signUp.js', 
	},
	devtool: 'inline-source-map',
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
		new UglifyJSPlugin()
	]
};

// var titles = {
//     index: "Home",
//     about: "About us",
//     blog: "Blog"
// };
// module.exports = {
//     entry: {
//         index: "./index.js",
//         about: "./about.js",
//         blog: "./blog.js"
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             chunks: ["common", "[name]"],
//             filename: "[name].html",
//             template: "!!html-webpack-plugin/lib/loader.js!./templates/[name].html",
//             inject: "body",
//             title: function(id) {
//                 return titles[id];
//             } // or maybe a shorthand like title: titles?
//         }),
//         new webpack.optimize.UglifyJsPlugin({
//             minimize: true
//         })
//     ]
//     // ... other options
// }