/**
 * 专用：小车碰撞实验
 * * 用于单人的「小车碰撞」
 * * 用于特定的「小车碰撞实验」
 * * 📍一般不会频繁更改
 */
import nodeServicesModifier from './config/node-services.modifier'
import { envConstructor, envModifiers_default } from './launch$base'
import { NARSEnv } from './NARSEnv'
import experimentCarCollision2pModifier from './config/Experiment-car-collision-2p.modifier'
import multiPlayerPlotModifierHueShift from './config/multi-player-plot-hueShift.modifier'

/** 创建的环境 */
const env: NARSEnv = envConstructor(
	// 构造器的额外配置
	{
		// 二维地图
		map_sizes: [7, 5],
	},
	// 原先的所有配置
	...envModifiers_default,
	// 新增玩家
	experimentCarCollision2pModifier,
	// 支持多玩家图表 + 色调偏移
	multiPlayerPlotModifierHueShift,
	// 在Node环境下运行
	nodeServicesModifier
)

// 启动
void env.launch()
