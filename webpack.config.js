const path = require('path')

const nodeExternals = require('webpack-node-externals');

module.exports = {
	entry: './src/client/V1/MatriangleClient_V1.ts',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.(test|deprecated)\.ts/,
				use: 'ignore-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /(node_modules)|(deprecated)/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	// 参考：<https://juejin.cn/post/7223644725835644989>
	externals: [nodeExternals()],
}
