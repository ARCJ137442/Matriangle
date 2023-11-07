import { identity, key, mapObject } from 'matriangle-common/utils'
import { NARSEnvConfig, NARSPlayerConfig } from './API'

// 需复用的常量 //
export function playerAlpha2Beta(
	playerAlpha: NARSPlayerConfig
): NARSPlayerConfig {
	// 第二个玩家Beta
	return {
		// 继承自第一个玩家Alpha
		...playerAlpha,
		// 属性参数（对接母体逻辑）
		attributes: {
			...playerAlpha.attributes,
			// 特有的名称
			name: 'Beta',
		},

		// 网络连接
		connections: {
			NARS: {
				...playerAlpha.connections.NARS,
				port: 8000,
			},
			dataShow: {
				// 共用「数据显示」接口
				...playerAlpha.connections.dataShow,
			},
			// 特有的控制键
			controlKey: 'Beta',
		},

		// 数据显示
		dataShow: {
			...playerAlpha.dataShow,
			dataNameMap: {
				// * 统一后缀加`B`
				...mapObject<string>(
					playerAlpha.dataShow.dataNameMap,
					identity<key>,
					(value: string): string => value + 'B'
				),
			},
		},

		// 计时参数
		timing: {
			/** 单位执行速度:感知 */
			unitAITickSpeed: 1,

			/** 目标提醒相对倍率 */
			goalRemindRate: 3, // 因子「教学目标」 3 5 10 0x100000000

			/** Babble相对倍率 */
			babbleRate: 1,

			/** 「长时间无操作⇒babble」的阈值 */
			babbleThreshold: 1,
		},

		// !【2023-11-04 22:00:37】暂时和Alpha一个NAL属性
		NAL: {
			...playerAlpha.NAL,
		},

		// !【2023-11-04 22:00:37】暂时和Alpha一个行为(behavior)
		behavior: {
			...playerAlpha.behavior,
		},
	}
}

// 开始配置 //
export default function (originalConfig: NARSEnvConfig): NARSEnvConfig {
	/** 获取玩家Alpha */
	const playerAlpha: NARSPlayerConfig =
		originalConfig.players[originalConfig.players.length - 1]
	// * 识别名为「Alpha」⇒添加新玩家Beta
	if (playerAlpha.attributes.name === 'Alpha')
		originalConfig.players.push(playerAlpha2Beta(playerAlpha))
	return originalConfig
}
