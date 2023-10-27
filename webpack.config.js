const path = require('path')

const nodeExternals = require('webpack-node-externals');
/**
 * !【2023-10-27 00:00:15】不能将文件名命名为「webpack.production.config.js」
 * * 这样会导致webpack无法识别正常的config.js
 * * 进而导致「使用默认设置」，然后产生（伪装的）「无法打包src目录」的问题
 */
module.exports = {
	// 生产模式
	mode: 'none',
	// 入口文件 // !【2023-10-18 12:35:07】目前是服务端
	entry: {
		'BaTS-server': './src/instance/V1/MatriangleServer_V1.ts',
		'NARS-car-server': './src/instance/NARS-experiment-car-collision/server.ts'
	},
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
