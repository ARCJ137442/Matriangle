/**
 * 主文件（Node版本）
 * * 🔬可能经常被修改，以用于实验
 */
import nodeServicesModifier from './config/node-services.modifier'
import {
	envConstructor as envConstructorBase,
	envModifiers_default,
} from './launch$base-powerup-collection'
import { NARSEnv } from './NARSEnv'

/** 创建的环境 */
const env: NARSEnv = envConstructorBase(
	// 原先的所有配置
	...envModifiers_default,
	// // 新增玩家
	// experimentCarCollision2pModifier,
	// // 支持多玩家图表 + 色调偏移
	// multiPlayerPlotModifierHueShift,
	// 在Node环境下运行
	nodeServicesModifier
)

// 启动
void env.launch()
