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
		'BaTS-server': './src/instance/BaTS-Server/MatriangleServer_BaTS.ts',
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
		filename: '[name].bundle.js', // 使用[name]引入文件名
		/**
		 * 信息类似如下：
		 * @example {
		 * 	hash: '5755f31b833614f68684',
		 * 	runtime: 'BaTS-server',
		 * 	chunk: Chunk {
		 * 		id: 0,
		 * 		ids: [Array],
		 * 		debugId: 1000,
		 * 		name: 'BaTS-server',
		 * 		idNameHints: [SortableSet [Set]],
		 * 		preventIntegration: false,
		 * 		filenameTemplate: undefined,
		 * 		cssFilenameTemplate: undefined,
		 * 		_groups: [SortableSet [Set]],
		 * 		runtime: 'BaTS-server',
		 * 		files: SetDeprecatedArray(0) [Set] {},
		 * 		auxiliaryFiles: Set(0) {},
		 * 		rendered: false,
		 * 		hash: '0ac92c92a6c56c71dae0927a0c598d21',
		 * 		contentHash: [Object: null prototype],
		 * 		renderedHash: '0ac92c92a6c56c71dae0',
		 * 		chunkReason: undefined,
		 * 		extraAsync: false
		 * 	},
		 * 	contentHashType: 'javascript'
		 * }
		 */
		path: path.resolve(__dirname, 'dist'),
	},
	// 参考：<https://juejin.cn/post/7223644725835644989>
	externals: [nodeExternals({
		// 内部包仍然需要打包进最终版里
		allowlist: [/^matriangle.*/],
	})],
}
