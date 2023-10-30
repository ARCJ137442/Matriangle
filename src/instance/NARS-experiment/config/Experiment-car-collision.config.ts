import { iPoint, traverseNDSquareFrame } from 'matriangle-common'
import { NARSEnvConfig, NARSPlayerConfig } from './API'
import plotOption from './PlotData-NARS.config'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv, NARSPlayerAgent } from '../server'
import { nameOfAxis_M } from 'matriangle-api'
import {
	NativeBlockPrototypes,
	NativePlayerEvent,
	PlayerEvent,
} from 'matriangle-mod-native'
import { getAddress } from 'matriangle-mod-message-io-api'
import IMap from 'matriangle-api/server/map/IMap'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import {
	NARSOperation,
	NARSOperationResult,
} from 'matriangle-mod-nar-framework'
import { uint } from 'matriangle-legacy'
import { EChartsOption } from 'echarts'

// 需复用的常量
/** 目标：「安全」 */
const SAFE: string = '[safe]'

/** 信息 */
const info = (config: NARSEnvConfig): string => `
[[实验：NARS小车碰撞]]

[实验主要组成部分]
1. NARS服务器：参与实验的AI，能通过文本方式向实验环境收发信息
2. Matriangle服务端：运行实验环境，向AI提供「感知」并执行AI所发送的「操作」
3. Web客户端：呈现Matriangle的模拟环境，并统计其内部产生的数据
总体连接结构：NARS服务器 ⇄ Matriangle服务端 ⇄ Web客户端

[注意事项]
1. 推荐的启动顺序：NARS服务器⇒Web客户端⇒Matriangle服务端
	- 原理：先启动连接的两端，再启动中间——确保NARS不受「先前经验污染」，保证服务端被客户端连接
2. 对应客户端的启动目录：相应WebUI中的index.html
	- 若客户端后启动，部分连接可能无法建立
3. NARS服务器需要监听服务 ${config.players
	.map<string>((configPlayer): string =>
		getAddress(
			configPlayer.connections.NARS.host,
			configPlayer.connections.NARS.port
		)
	)
	.join('、')} 以便实验环境对接
	- 这个连接主要用于向NARS实现（如OpenNARS、ONA、PyNARS）输入感知运动信息'
`

/** 配置 */
const config: NARSEnvConfig = {
	// 根据自身输出 实验/配置 信息
	info,
	// 网络连接地址
	connections: {
		controlService: { host: '127.0.0.1', port: 3002 },
		displayService: { host: '127.0.0.1', port: 8080 },
	},

	// 地图参数
	map: {
		/** 地图初始化 */
		initMaps: (): IMap[] => {
			const maps: IMap[] = []

			// 构造参数 //
			const SIZES = new iPoint().copyFromArgs(
				// 【2023-10-27 16:51:08】目前是二维
				5,
				5
			)

			// 存储结构 //
			const storage = new MapStorageSparse(SIZES.length)
			// * 大体结构：#__C__#
			// 填充边框
			traverseNDSquareFrame(
				new iPoint().copyFrom(SIZES).fill(0),
				new iPoint().copyFrom(SIZES).addFromSingle(-1),
				(p: iPoint): void => {
					storage.setBlock(
						p,
						NativeBlockPrototypes.COLORED.softCopy()
					)
				}
			)

			// 注册 //
			maps.push(new Map_V1('model', storage))

			return maps
		},
	},

	// 绘图参数：直接引用外部配置
	plot: {
		initialOption: plotOption,
	},

	// 玩家参数
	players: [
		// 第一个玩家Alpha
		{
			// 属性参数（对接母体逻辑）
			attributes: {
				name: 'Alpha',
				health: {
					initialHP: 100,
					initialMaxHP: 100,
					initialHeal: 0,
					initialLives: 0,
					lifeNotDecay: true,
				},
				appearance: {
					lineColor: 0,
					fillColor: 0,
				},
			},

			// 网络连接
			connections: {
				NARS: { host: '127.0.0.1', port: 8765 },
				dataShow: { host: '127.0.0.1', port: 3030 },
				controlKey: 'Alpha',
			},

			// 数据显示
			dataShow: {
				// * 无⇒保持原样
				dataNameMap: {
					/*
					成功率: '成功率',
					教学成功率: '教学成功率',
					自主成功率: '自主成功率',
					激活率: '激活率',
				 */
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

			// 词项常量池 & 词法模板
			NAL: {
				SELF: '{SELF}',
				/** 表示「正向目标」的词项组 */
				POSITIVE_GOALS: [SAFE],
				/** 暂时没有「负向目标」 */
				NEGATIVE_GOALS: [],
				positiveTruth: '%1.0;0.9%',
				negativeTruth: '%0.0;0.9%',
				/** 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
				op_output: (op: NARSOperation): string =>
					`${op[0]}([${op.slice(1).join(', ')}])`,
				/** 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
				op_input: (op: NARSOperation): string =>
					`<(*, ${op.slice(1).join(', ')}) --> ${op[0]}>`,
			},

			// 行为参数
			behavior: {
				/** @implements 实现：初始化 */
				init: (
					env: NARSEnv,
					event: PlayerEvent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					registerOperation: (op: [string, ...string[]]) => void
				): void => {
					// 「方向控制」消息 // * 操作：`移动(自身)` 即 `(*, 自身) --> ^移动`
					let name: string
					// * 基于先前与他人的交流，这里借用「left⇒负方向移动，right⇒正方向移动」「同操作符+不同参数≈不同操作」的思想，使用「^left({SELF}, x)」表达「向x轴负方向移动」（其它移动方式可类推）
					const rl = ['right', 'left'] // 先右后左，先正后负
					for (name of rl) {
						// 遍历各个维度，产生操作
						for (
							let i = 0;
							i < host.map.storage.numDimension;
							++i
						) {
							// 负/正方向 //
							registerOperation([
								// * 样例：['^left', '{SELF}', 'x']
								'^' + name, // 朝负/正方向 // ! 不要忘记尖号
								selfConfig.NAL.SELF,
								nameOfAxis_M(i),
							])
						}
					}
				},
				/** @implements 实现：位置感知 */
				AITick: (
					env: NARSEnv,
					event: PlayerEvent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					posPointer: iPoint,
					send2NARS: (message: string) => void
				): void => {
					// 指针归位
					posPointer.copyFrom(self.position)
					for (let i = 0; i < host.map.storage.numDimension; ++i) {
						// 负半轴
						posPointer[i]--
						if (!self.testCanGoTo(host, posPointer)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> [${nameOfAxis_M(
									i
								)}_left_blocked]>. :|: ${
									selfConfig.NAL.positiveTruth
								}`
							)
						}
						// 从负到正
						posPointer[i] += 2
						if (!self.testCanGoTo(host, posPointer)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> [${nameOfAxis_M(
									i
								)}_right_blocked]>. :|: ${
									selfConfig.NAL.positiveTruth
								}`
							)
						}
						// 归位⇒下一座标轴
						posPointer[i]--
					}
				},
				/** @implements babble：取随机操作 */
				babble: (
					env: NARSEnv,
					agent: NARSPlayerAgent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix
				): NARSOperation => agent.randomRegisteredOperation(),
				/**
				 * @implements 根据操作移动
				 * * 索引即方向
				 */
				operate: (
					env: NARSEnv,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					op: NARSOperation,
					operateI: uint | -1,
					send2NARS: (message: string) => void
				): NARSOperationResult => {
					// 有操作⇒行动&反馈
					if (operateI >= 0) {
						// 缓存点
						// oldP.copyFrom(self.position)
						const oldP = new iPoint().copyFrom(self.position)
						self.moveToward(host, operateI)
						// 位置相同⇒移动失败⇒「撞墙」⇒负反馈
						if (oldP.isEqual(self.position)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> ${SAFE}>. :|: ${selfConfig.NAL.negativeTruth}`
							)
							return false
						}

						// 否则⇒移动成功⇒「没撞墙」⇒「安全」⇒正反馈
						else {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> ${SAFE}>. :|: ${selfConfig.NAL.positiveTruth}`
							)
							return true
						}
					} else
						console.warn(
							`未知的操作「(${selfConfig.NAL.op_output(op)})」`
						)
					// 没执行⇒没成功
					return false
				},
				feedback: (
					env: NARSEnv,
					event: string,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					send2NARS: (message: string) => void
				): void => {
					// 预处理 //
					switch (event) {
						// 拒绝「世界刻」
						case NativePlayerEvent.TICK:
							break
						// * 默认向NARS发送Narsese * //
						default:
							// ! 这里实际上是「以客户端为主体，借客户端发送消息」
							send2NARS(`<{SELF} --> [${event}]>. :|:`)
							break
					}
				},
			},
		},
		// 第二个玩家Beta
		{
			// 属性参数（对接母体逻辑）
			attributes: {
				name: 'Beta',
				health: {
					initialHP: 100,
					initialMaxHP: 100,
					initialHeal: 0,
					initialLives: 0,
					lifeNotDecay: true,
				},
				appearance: {
					lineColor: 0,
					fillColor: 0,
				},
			},

			// 网络连接
			connections: {
				NARS: { host: '127.0.0.1', port: 8000 },
				dataShow: { host: '127.0.0.1', port: 3030 },
				controlKey: 'Beta',
			},

			// 数据显示
			dataShow: {
				dataNameMap: {
					成功率: '成功率B',
					教学成功率: '教学成功率B',
					自主成功率: '自主成功率B',
					激活率: '激活率B',
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

			// 词项常量池 & 词法模板
			NAL: {
				SELF: '{SELF}',
				/** 表示「正向目标」的词项组 */
				POSITIVE_GOALS: [SAFE],
				/** 暂时没有「负向目标」 */
				NEGATIVE_GOALS: [],
				positiveTruth: '%1.0;0.9%',
				negativeTruth: '%0.0;0.9%',
				/** 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
				op_output: (op: NARSOperation): string =>
					`${op[0]}([${op.slice(1).join(', ')}])`,
				/** 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
				op_input: (op: NARSOperation): string =>
					`<(*, ${op.slice(1).join(', ')}) --> ${op[0]}>`,
			},

			// 行为参数
			behavior: {
				/** @implements 实现：初始化 */
				init: (
					env: NARSEnv,
					event: PlayerEvent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					registerOperation: (op: [string, ...string[]]) => void
				): void => {
					// 「方向控制」消息 // * 操作：`移动(自身)` 即 `(*, 自身) --> ^移动`
					let name: string
					// * 基于先前与他人的交流，这里借用「left⇒负方向移动，right⇒正方向移动」「同操作符+不同参数≈不同操作」的思想，使用「^left({SELF}, x)」表达「向x轴负方向移动」（其它移动方式可类推）
					const rl = ['right', 'left'] // 先右后左，先正后负
					for (name of rl) {
						// 遍历各个维度，产生操作
						for (
							let i = 0;
							i < host.map.storage.numDimension;
							++i
						) {
							// 负/正方向 //
							registerOperation([
								// * 样例：['^left', '{SELF}', 'x']
								'^' + name, // 朝负/正方向 // ! 不要忘记尖号
								selfConfig.NAL.SELF,
								nameOfAxis_M(i),
							])
						}
					}
				},
				/** @implements 实现：位置感知 */
				AITick: (
					env: NARSEnv,
					event: PlayerEvent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					posPointer: iPoint,
					send2NARS: (message: string) => void
				): void => {
					// 指针归位
					posPointer.copyFrom(self.position)
					for (let i = 0; i < host.map.storage.numDimension; ++i) {
						// 负半轴
						posPointer[i]--
						if (!self.testCanGoTo(host, posPointer)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> [${nameOfAxis_M(
									i
								)}_left_blocked]>. :|: ${
									selfConfig.NAL.positiveTruth
								}`
							)
						}
						// 从负到正
						posPointer[i] += 2
						if (!self.testCanGoTo(host, posPointer)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> [${nameOfAxis_M(
									i
								)}_right_blocked]>. :|: ${
									selfConfig.NAL.positiveTruth
								}`
							)
						}
						// 归位⇒下一座标轴
						posPointer[i]--
					}
				},
				/** @implements babble：取随机操作 */
				babble: (
					env: NARSEnv,
					agent: NARSPlayerAgent,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix
				): NARSOperation => agent.randomRegisteredOperation(),
				/**
				 * @implements 根据操作移动
				 * * 索引即方向
				 */
				operate: (
					env: NARSEnv,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					op: NARSOperation,
					operateI: uint | -1,
					send2NARS: (message: string) => void
				): NARSOperationResult => {
					// 有操作⇒行动&反馈
					if (operateI >= 0) {
						// 缓存点
						// oldP.copyFrom(self.position)
						const oldP = new iPoint().copyFrom(self.position)
						self.moveToward(host, operateI)
						// 位置相同⇒移动失败⇒「撞墙」⇒负反馈
						if (oldP.isEqual(self.position)) {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> ${SAFE}>. :|: ${selfConfig.NAL.negativeTruth}`
							)
							return false
						}

						// 否则⇒移动成功⇒「没撞墙」⇒「安全」⇒正反馈
						else {
							send2NARS(
								`<${selfConfig.NAL.SELF} --> ${SAFE}>. :|: ${selfConfig.NAL.positiveTruth}`
							)
							return true
						}
					} else
						console.warn(
							`未知的操作「(${selfConfig.NAL.op_output(op)})」`
						)
					// 没执行⇒没成功
					return false
				},
				feedback: (
					env: NARSEnv,
					event: string,
					self: IPlayer,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					send2NARS: (message: string) => void
				): void => {
					// 预处理 //
					switch (event) {
						// 拒绝「世界刻」
						case NativePlayerEvent.TICK:
							break
						// * 默认向NARS发送Narsese * //
						default:
							// ! 这里实际上是「以客户端为主体，借客户端发送消息」
							send2NARS(`<{SELF} --> [${event}]>. :|:`)
							break
					}
				},
			},
		},
	],
}
// * 魔改图表，使之并行支持「多NARS智能体」数据曲线
config.plot.initialOption = ((option: EChartsOption): EChartsOption => {
	// 遍历所有玩家的图表配置
	for (const player of config.players) {
		// * legend
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
		// * series
		if (option.series !== undefined && Array.isArray(option.series)) {
			// 遍历原先所有名称
			for (const seriesSetting of option.series)
				if (
					typeof seriesSetting.name ===
						'string' /* 只处理字符串名称 */ &&
					seriesSetting.name in player.dataShow.dataNameMap
				) {
					// 名称在里边⇒映射名称，追加
					option.series.push({
						// 先拷贝
						...seriesSetting,
						// ! 后覆盖
						name: player.dataShow.dataNameMap[seriesSetting.name],
					})
				}
		}
	}
	console.log(option)

	// 返回
	return option
})(config.plot.initialOption)
export default config
