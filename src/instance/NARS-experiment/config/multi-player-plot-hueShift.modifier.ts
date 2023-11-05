import { NARSEnvConfig, NARSPlayerConfig } from './API'
import { SeriesOption } from 'echarts'
import multiPlayerPlotModifier from './multi-player-plot.modifier'
import { startswith } from 'matriangle-common/utils'
import { hueShift4Hex } from 'matriangle-common/color'

/**
 * * 在「多玩家」的基础上支持「单图表显示」，并**以「色调偏移」区分颜色** *
 * * 把所有玩家的数据显示在一个图表中
 * * 支持「色调偏移」，使得不同玩家的数据曲线更加明显
 */

/** 使用「色调偏移」转换图线颜色，以便区分不同玩家 */
function colorTransform(color: unknown): unknown {
	if (typeof color === 'string' && startswith(color, '#'))
		return (
			'#' + // 色调位移；样例：#ff0000 -> #ff3333
			hueShift4Hex(parseInt(color.slice(1), 16), 30).toString(16)
		)
	else throw new Error(`colorTransform: 超出常规的颜色！${String(color)}`)
}

/**
 * 魔改图表，使之并行支持「多NARS智能体」数据曲线，并增加「不同玩家曲线区分」功能
 * * 这实际上只是一个「预设了序列生成器」的实用特定情况
 *
 * ! 只有在「多玩家」时生效
 * * 必须在「玩家增加」类修改器后增加
 *
 * @param config 待修改的NARS环境配置
 */
export default function (config: NARSEnvConfig): NARSEnvConfig {
	return multiPlayerPlotModifier(
		config,
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
	)
}
