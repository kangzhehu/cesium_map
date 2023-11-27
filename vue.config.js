const path = require("path");
// eslint-disable-next-line no-unused-vars
const TerserPlugin = require('terser-webpack-plugin');
 
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const cesiumSource = './node_modules/cesium/Source'
 
// eslint-disable-next-line no-unused-vars
function resolve(dir) {
  return path.join(__dirname, dir);
}
 
module.exports = {
  devServer: {
    port: 8888,
    open: true,
  
  },
  configureWebpack: {
    output: {
      sourcePrefix: ' ' // 1 让webpack 正确处理多行字符串配置 amd参数
    },
    amd: { // 2
      toUrlUndefined: true // webpack在cesium中能友好的使用require
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve('src'),
        'components': path.resolve('src/components'),
        'assets': path.resolve('src/assets'),
        'views': path.resolve('src/views'),
        'cesium': path.resolve(__dirname, cesiumSource)
      }
    },
    plugins: [ // 4
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Workers'), to: 'Workers' }]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }]),
      new webpack.DefinePlugin({ // 5
        CESIUM_BASE_URL: JSON.stringify('./')
      })
    ], 
    module: {
        rules: [
        {
        test: /\.js$/,
        use: {
        loader: '@open-wc/webpack-import-meta-loader',
        },
        },
      ]}
  
  }
};
