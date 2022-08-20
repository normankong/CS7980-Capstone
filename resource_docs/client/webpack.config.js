const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
  },
  devtool: "inline-source-map",
  // devServer: {
  //   static: "./dist",
  // },

  devServer: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/socket.io': 'http://localhost:8080',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: "My Awesome application",
      myPageHeader: "Hello World",
      template: "./src/index.html",
      filename: "index.html", //relative to root of the application
    }),
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
    new Dotenv()
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {

    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    alias: {
      quill: path.resolve(__dirname, "node_modules/quill/"),
    },
  },
};
