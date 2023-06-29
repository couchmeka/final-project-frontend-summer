const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

const env = dotenv.config().parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './index.js', // Update this to the path of your renderer file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
      test: /\.png$/,
      use: [
        {
          loader: 'file-loader',
        },
      ]
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CssMinimizerPlugin(),
    new webpack.DefinePlugin(envKeys)
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  target: 'electron-renderer',
};

