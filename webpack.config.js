const { hostname } = require("os");
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { DefinePlugin, HotModuleReplacementPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackProgressBarPlugin = require("progress-bar-webpack-plugin");
const WebpackDevServerWaitpage = require("webpack-dev-server-waitpage");
const { v1: uuid } = require("uuid");

// Imports .env into process.env
const dotenv = require("dotenv").config({ path: resolve(__dirname, ".env") });

// DO NOT MINIFY/UGLIFY AND ENABLE SOURCE MAP
const IS_DEV = process.env.NODE_ENV === "development";

// FORCE SOURCE MAP EVEN ON BUILD
const FORCE_DEBUGGING = process.env.DEBUG === "true";

const build = resolve(__dirname, "build");

module.exports = {
	mode: process.env.NODE_ENV,
	entry: {
		main: "./source/index.js"
	},
	output: {
		path: build,
		publicPath: "./",
		filename: "[name].[fullhash].js",
		assetModuleFilename: "assets/[hash][ext][query]"
	},
	resolve: {
		extensions: [".js", ".json"],
		alias: {
			"~": resolve(__dirname, "./"),
			"@": resolve(__dirname, "./source")
		},
		fallback: {
			path: require.resolve("path-browserify")
		}
	},
	module: {
		rules: [
			// {
			// 	enforce: "pre",
			// 	test: /\.js$/,
			// 	exclude: /node_modules/,
			// 	loader: "eslint-loader",
			// 	options: {
			// 		failOnError: true
			// 	}
			// },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					"babel-loader",
					// "eslint-loader"
				]
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							esModule: false
						}
					},
					"postcss-loader",
					"sass-loader"
				]
			},
			{
				test: /\.html$/,
				use: "html-loader"
			},
			{
				test: /\.hbs$/,
				use: "handlebars-loader"
			},
			{
				test: /\.(glb|hdr)$/,
				type: "asset/resource"
			},
			{
				test: /\.(glsl|vs|fs)$/,
				type: "asset/source"
			},
			{
				test: /\.(png|gif)$/,
				type: "asset/resource"
			}
		]
	},
	target: "web",
	devServer: {
		open: false,
		https: false,
		host: "0.0.0.0",
		port: 8000,
		public: `${ hostname() }:8000`,
		contentBase: build,
		publicPath: "/",
		disableHostCheck: true,
		hot: true,
		compress: true,
		historyApiFallback: true,
		before( app, server ){

			app.use(WebpackDevServerWaitpage(server));

		}
	},
	devtool: IS_DEV || FORCE_DEBUGGING ? "source-map" : false,
	plugins: [
		new DefinePlugin({
			"process.env.BASE_PATH": JSON.stringify(process.env.BASE_PATH)
		}),
		new MiniCssExtractPlugin(),
		new HTMLWebpackPlugin({
			publicPath: "./",
			title: "CH5-100",
			filename: "index.html",
			template: resolve(__dirname, "source/index.hbs")
		}),
		new HotModuleReplacementPlugin(),
		WebpackDevServerWaitpage.plugin(),
		new WebpackProgressBarPlugin()
	]
};
