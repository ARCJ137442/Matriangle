import { merge } from 'webpack-merge'
import baseConfig from './webpack.base.mjs'
import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default merge(baseConfig, {
	entry: path.join(__dirname, '../src/index-node.ts'), // 入口文件（Node端）
	mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
})
