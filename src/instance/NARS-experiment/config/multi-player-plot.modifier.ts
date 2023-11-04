import { NARSEnvConfig, NARSPlayerConfig } from './API'
import { SeriesOption } from 'echarts'

/**
 * 根据玩家配置和「旧配置」生成「新配置」
 * @param seriesOption 旧的序列配置
 * @param nowPlayer 新序列归属的玩家配置
 * @param oldName 旧序列名称
 * @returns 新的序列配置
 */
export function defaultSeriesGenerator(
	seriesOption: SeriesOption,
	nowPlayer: NARSPlayerConfig,
	oldName: string
): SeriesOption {
	return {
		// 先拷贝
		...seriesOption,
		// ! 后覆盖
		name: nowPlayer.dataShow.dataNameMap[oldName],
	}
}

/**
 * 魔改图表，使之并行支持「多NARS智能体」数据曲线
 *
 * ! 只有在「多玩家」时生效
 * * 必须在「玩家增加」类修改器后增加
 *
 * @param config 待修改的NARS环境配置
 * @param seriesGenerator （新）序列生成器，用于对每个玩家的序列进行「再生成」（默认只修改名称）
 */
export default function (
	config: NARSEnvConfig,
	seriesGenerator: (
		seriesOption: SeriesOption,
		nowPlayer: NARSPlayerConfig,
		oldName: string
	) => SeriesOption = defaultSeriesGenerator
): NARSEnvConfig {
	const option = config.plot.initialOption
	// 遍历所有玩家的图表配置
	for (const player of config.players) {
		// * legend 图示
		if (
			// ! 前提条件：legend是单个的对象，且里面有`data`数组
			option.legend !== undefined &&
			!Array.isArray(option.legend) &&
			Array.isArray(option.legend?.data)
		) {
			// 遍历原先的所有名称
			for (const legend of option.legend.data)
				if (typeof legend === 'string' /* 只处理字符串 */)
					if (legend in player.dataShow.dataNameMap)
						// 若有映射⇒把映射结果加进去
						option.legend.data.push(
							player.dataShow.dataNameMap[legend]
						)
		}
		// * series 序列
		if (option.series !== undefined && Array.isArray(option.series)) {
			// 遍历原先所有名称
			for (const seriesOption of option.series)
				if (
					typeof seriesOption.name ===
						'string' /* 只处理字符串名称 */ &&
					seriesOption.name in player.dataShow.dataNameMap
				) {
					// 名称在里边⇒映射名称，追加
					option.series.push(
						seriesGenerator(seriesOption, player, seriesOption.name)
					)
				}
		}
	}

	// 返回
	return config
}
