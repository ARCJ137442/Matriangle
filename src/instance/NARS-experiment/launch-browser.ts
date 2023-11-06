/**
 * 主文件（浏览器版本）
 * * 🔬可能经常被修改，以用于实验
 * * 不会自主启动，需要从Vue组件中调用启动
 */
import { NARSEnvConfig } from './config/API'
import { envConstructor as envConstructorBase } from './launch$base'
import { NARSEnv } from './NARSEnv'

/** 创建环境的函数 */
export function envConstructor(
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return envConstructorBase(...modifiers)
	// ! modifiers中已经包含默认修饰器
	// // 新增玩家
	// experimentCarCollision2pModifier,
	// // 支持多玩家图表 + 色调偏移
	// multiPlayerPlotModifierHueShift,
	// 在直连修改器下环境下运行
}
