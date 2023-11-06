/**
 * 专用：小车碰撞实验 2玩家
 * * 用于特定的「小车碰撞实验」
 * * 📍一般不会频繁更改
 */
import experimentCarCollisionConfigConstructor from './config/Experiment-car-collision.config.template'
import nodeServicesModifier from './config/node-services.modifier'
import { NARSEnv } from './NARSEnv'
import experimentCarCollision2pModifier from './config/Experiment-car-collision-2p.modifier'
import multiPlayerPlotModifierHueShift from './config/multi-player-plot-hueShift.modifier'
import { chainApply } from 'matriangle-common'
import { NARSEnvConfig } from './config/API'

/** 创建环境 */
export function envConstructor(
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return new NARSEnv(
		chainApply(
			// ! 原配置
			experimentCarCollisionConfigConstructor(
				// 构造器的额外配置
				{
					// 地图尺寸
					map_sizes: [5, 5, 5],
				}
			),
			...modifiers
		)
	)
}

/** 环境修饰器 */
export const envModifiers_default: ((env: NARSEnvConfig) => NARSEnvConfig)[] = [
	// 新增玩家
	experimentCarCollision2pModifier,
	// 支持多玩家图表 + 色调偏移
	multiPlayerPlotModifierHueShift,
	// 在Node环境下运行
	nodeServicesModifier,
]
