/**
 * 专用：小车碰撞实验 2玩家
 * * 用于特定的「小车碰撞实验」
 * * 📍一般不会频繁更改
 */
import { NARSEnv } from './server'
import experimentCarCollisionConfigConstructor from './config/Experiment-car-collision.config.template'
import nodeServicesModifier from './config/node-services.modifier'
import experimentCarCollision2pModifier from './config/Experiment-car-collision-2p.modifier'
import multiPlayerPlotModifier from './config/multi-player-plot.modifier'
import { chainApply, hueShift4Hex, startswith } from 'matriangle-common'
import { NARSEnvConfig, NARSPlayerConfig } from './config/API'
import { SeriesOption } from 'echarts'

/** 改变图表颜色以区分 */
function colorTransform(color: unknown): unknown {
	if (typeof color === 'string' && startswith(color, '#'))
		return (
			'#' + // 色调位移；样例：#ff0000 -> #ff3333
			hueShift4Hex(parseInt(color.slice(1), 16), 30)
		)
	else throw new Error(`colorTransform: 超出常规的颜色！${String(color)}`)
}

/** 创建环境 */
const env: NARSEnv = new NARSEnv(
	chainApply(
		// 原配置
		experimentCarCollisionConfigConstructor(),
		// 新增玩家
		experimentCarCollision2pModifier,
		// 支持多玩家图表
		(config: NARSEnvConfig): NARSEnvConfig =>
			multiPlayerPlotModifier(
				config,
				// 修改：色调位移
				(
					seriesOption: SeriesOption,
					nowPlayer: NARSPlayerConfig,
					oldName: string
				): SeriesOption => {
					return {
						// 先拷贝
						...seriesOption,
						// ! 后覆盖 这里的「颜色」是确定的
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
						color: colorTransform(seriesOption?.color) as any, // ! 这里一定保证类型
						name: nowPlayer.dataShow.dataNameMap[oldName],
					}
				}
			),
		// 在Node环境下运行
		nodeServicesModifier
	)
)

// 启动
void env.launch()
