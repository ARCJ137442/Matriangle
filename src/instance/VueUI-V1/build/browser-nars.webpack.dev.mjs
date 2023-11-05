import path from 'path'
import { merge } from 'webpack-merge'
import baseConfig from './webpack.base.mjs'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 合并公共配置,并添加开发环境配置
export default merge(baseConfig, {
	entry: path.join(__dirname, '../src/index-browser-nars.ts'), // 入口文件（浏览器端）
	mode: 'development', // 开发模式,打包更加快速,省了代码优化步骤
	devtool: 'eval-cheap-module-source-map', // 源码调试模式,后面会讲
	devServer: {
		port: 3000, // 服务端口号
		compress: false, // gzip压缩,开发环境不开启,提升热更新速度
		hot: true, // 开启热更新，后面会讲vue3模块热替换具体配置
		historyApiFallback: true, // 解决history路由404问题
		static: {
			directory: path.join(__dirname, "../public"), //托管静态资源public文件夹
		}
	}
})
