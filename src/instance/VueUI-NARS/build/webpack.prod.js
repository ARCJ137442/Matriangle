import { merge } from 'webpack-merge'
import baseConfig from './webpack.base'

export default merge(baseConfig, {
	mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
})
