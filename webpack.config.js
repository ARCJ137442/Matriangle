const path = require('path')

const nodeExternals = require('webpack-node-externals');

module.exports = {
	// 入口文件 // !【2023-10-18 12:35:07】目前是服务端
	entry: './src/instance/V1/MatriangleServer_V1.ts',
	// 开发者工具：内联源码映射
	devtool: 'inline-source-map',
	// 附加插件
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
	// 需要打包的文件
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	// 输出
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	// 参考：<https://juejin.cn/post/7223644725835644989>
	externals: [nodeExternals({
		// 内部包仍然需要打包进最终版里
		allowlist: [/^matriangle.*/],
	})],
}
