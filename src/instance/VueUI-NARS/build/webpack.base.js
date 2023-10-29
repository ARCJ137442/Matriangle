import path from 'path'
import { VueLoaderPlugin } from 'vue-loader'
import HTMLWebpackPlugin from 'html-webpack-plugin'

export default {
	entry: path.join(__dirname, '../src/index.ts'), // 入口文件
	// 打包文件出口
	output: {
		filename: 'static/js/[name].js', // 每个输出js的名称
		path: path.join(__dirname, '../dist'), // 打包结果输出路径
		clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
		publicPath: '/' // 打包后文件的公共前缀路径
	},
	// 配置loader
	module: {
		rules: [
			// 处理Vue
			{
				test: /.vue$/, // 匹配.vue文件
				use: 'vue-loader', // 用vue-loader去解析vue文件
			},
			// 使用Babel处理TS文件
			{
				test: /.ts$/, // 匹配.ts文件
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								"@babel/preset-typescript",
								{
									allExtensions: true, //支持所有文件扩展名(重要)
								},
							],
						]
					}
				}
			},
			// 处理CSS
			{
				test: /\.css$/, //匹配 css 文件
				use: ['style-loader', 'css-loader']
			},
		]
	},
	plugins: [
		// 打包Vue
		new VueLoaderPlugin(), // vue-loader插件
		// 打包HTML
		new HTMLWebpackPlugin({
			filename: 'index.html', // 打包后的文件名
			title: 'Matriangle Vue Client V1 - NARS Experiment', //打包后的页面标题
			publicPath: '.', // 指定父级路径，强制使用相对路径（不指定的话，会导致资源加载错误）
			template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
			inject: true, // 自动注入静态资源
		})
	],
	// 后缀查找
	resolve: {
		extensions: ['.vue', '.ts', '.js', '.json'],
	}
}
