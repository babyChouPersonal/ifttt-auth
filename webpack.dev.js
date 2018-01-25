const merge = require('webpack-merge');
const common = require('./webpack.common.js');


common.output.publicPath = '/oauth/dist/';

module.exports = merge(common, {
  devtool: 'inline-source-map'
});