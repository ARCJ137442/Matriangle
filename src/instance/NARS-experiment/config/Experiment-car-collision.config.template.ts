import { iPoint, traverseNDSquareFrame } from 'matriangle-common/geometricTools'
import { NARSEnvConfig, NARSPlayerConfig } from './API'
import plotOption from './PlotData-NARS.config'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { nameOfAxis_M } from 'matriangle-api/server/general/GlobalRot'
import {
	IMessageService,
	getAddress,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import IMap from 'matriangle-api/server/map/IMap'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import {
	NARSOperation,
	NARSOperationRecord,
	NARSOperationRecordFull,
	NARSOperationResult,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { NAIRCmdTypes } from 'matriangle-mod-nar-framework/NAIRCmdTypes.type'
import {
	NativePlayerEvent,
	PlayerEvent,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import Block from 'matriangle-api/server/block/Block'
import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'
import {
	PlayerAction,
	isActionMoveForward,
	toRotFromActionMoveForward,
} from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import {
	simpleNAVMCmd,
	generateCommonNarsese_Binary,
	generateCommonNarsese_TruthValue,
	GCNToCIN_SPIJ,
} from '../common/nal-lib'
import { NARSEnv } from '../NARSEnv'
import { NARSPlayerAgent } from '../NARSPlayerAgent'

// 需复用的常量 //
/** 目标：「安全」 */
export const SAFE: string = '[safe]'

/** 信息 */
export const info = (config: NARSEnvConfig): string => `
[[实验：NARS小车碰撞]]

[实验内容]
1. 主体：AI小车，具有
  	- 感知：简单的边界感知，只有「直接被阻挡」才会收到「阻挡」信号
	- 运动：向所有的「任意维整数角」方向移动（一维2，二维4，三维6……）
2. 地图：简单的「方形边界」
3. 目标：做出「安全」的碰撞——小车靠墙时，不继续往墙壁方向移动

[实验目标]
1. 理解NARS的基本原理
2. 理解NARS的「操作」和「感知」

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
	- 这个连接主要用于向NARS实现（如OpenNARS、ONA、PyNARS）输入感知运动信息
`

/**
 * 简单的实验方块「墙」（原型对象）
 * * 无「附加方块状态」
 * * 只起「阻挡」作用
 */
export const WALL: Block<null> = new Block(
	'AI_Wall', // * 现在使用特殊的名称进行索引（已经在zim_client_block.ts中加入支持）
	new BlockAttributes(0).loadAsSolid(),
	null // 固定方块状态（取自并共用BaTS的数据结构）
)

/** 空白的构造器 */
const BlankMessageServiceConstructor = (): IMessageService => {
	throw new Error('未被替换的「消息服务构造器」！')
}

// 开始配置 //

// 临时变量

/**
 * 额外配置
 * * 一个「config.temple」文件基本确定的是「一个实验」
 *   * 如「小车碰撞」
 * * 一个「额外配置」一般用于**控制实验变量**
 */
export type ExtraCCExperimentConfig = {
	/** 地图尺寸 */
	map_sizes: uint[]
}

/** 配置 */
const configConstructor = (
	// 额外参数 //
	extraConfig: ExtraCCExperimentConfig
): NARSEnvConfig => ({
	// 额外配置
	extraConfig,
	// 根据自身输出 实验/配置 信息
	info,
	// 网络连接地址
	connections: {
		controlService: {
			host: '127.0.0.1',
			port: 3002,
			// 构造服务端
			constructor: BlankMessageServiceConstructor,
		},
		displayService: {
			host: '127.0.0.1',
			port: 8080,
			// 构造服务端
			constructor: BlankMessageServiceConstructor,
		},
	},

	// 地图参数
	map: {
		/** 地图初始化 */
		initMaps: (): IMap[] => {
			const maps: IMap[] = []

			// 构造参数 // !【2023-11-05 17:05:01】现在通过「额外参数」引入
			const SIZES = new iPoint().copyFromArgs(...extraConfig.map_sizes)

			// 存储结构 //
			const storage = new MapStorageSparse(SIZES.length)
			// * 大体结构：#__C__#
			// 填充边框
			traverseNDSquareFrame(
				new iPoint().copyFrom(SIZES).fill(0),
				new iPoint().copyFrom(SIZES).addFromSingle(-1),
				(p: iPoint): void => {
					storage.setBlock(p, WALL.softCopy())
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
			// 构造函数：不需要啥太特殊的
			constructor: NARSPlayerAgent.DEFAULT_CONSTRUCTOR,
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
					normal: {
						// *【2023-11-24 23:54:35】现在是纯白色
						lineColor: 0x808080,
						fillColor: 0xffffff,
					},
					// *【2023-11-25 01:58:20】同图表线条
					babble: {
						lineColor: 0x7f6633,
						fillColor: 0xffcc66,
					},
					// *【2023-11-25 01:58:20】同图表线条
					active: {
						lineColor: 0x337f66,
						fillColor: 0x66ffcc,
					},
				},
			},

			// 网络连接
			connections: {
				NARS: {
					host: '127.0.0.1',
					port: 8765,
					constructor: BlankMessageServiceConstructor,
				},
				dataShow: {
					host: '127.0.0.1',
					port: 3030,
					constructor: BlankMessageServiceConstructor,
				},
				controlKey: 'Alpha',
			},

			// 数据显示
			dataShow: {
				// * 无⇒保持原样
				dataNameMap: {},
				operationHistory: {
					/**
					 * @implements `[['^left', '{SELF}', 'x'], true]` => `left_{SELF}_x-S`
					 */
					visualizeOperationRecord: (
						record: NARSOperationRecord
					): string =>
						// 操作符&操作参数（截去前缀`^`）
						record[0].join('_').slice(1) +
						(record[1] === undefined
							? '' // 无果⇒没有「进一步连接」
							: '-' + // 「操作-状态」分隔符
							  // 是否成功：成功Success，失败Failed
							  (record[1] ? 'S' : 'F')),
					/**
					 * @implements `[['^left', '{SELF}', 'x'], true, true]` => `left_{SELF}_x-@S`
					 */
					visualizeOperationRecordFull: (
						record: NARSOperationRecordFull
					): string =>
						// 操作符&操作参数（截去前缀`^`）
						record[0].join('_').slice(1) +
						// 「操作-状态」分隔符
						'-' +
						// 是否自主：自主`@`「机器开眼」，无意识`#`「机械行动」
						(record[1] ? '@' : '#') +
						// 是否成功：成功Success，失败Failed
						(record[2] === undefined ? '?' : record[2] ? 'S' : 'F'),
					spontaneousPrefixName: '自主操作',
					unconsciousPrefixName: '教学操作',
				},
			},

			// 计时参数
			timing: {
				/** 单位执行速度:感知 */
				unitAITickSpeed: 1,
				/** 目标提醒相对倍率 */
				goalRemindRate: 3, // 因子「教学目标」 3 5 10 0x100000000

				/** 教学时间（实验开始NARS操作「不阻塞Babble」的时间） */
				teachingTime: 30,

				/** Babble相对倍率 */
				babbleRate: 1,
				/** 「长时间无操作⇒babble」的阈值 */
				babbleThreshold: 1,
			},

			// 词项常量池 & 词法模板

			// 词项常量池 & 词法模板
			NAL: {
				SELF: '{SELF}',
				/** @implements 表示「正向目标」的词项组 */
				POSITIVE_GOALS: [SAFE],
				/** @implements 暂时没有「负向目标」 */
				NEGATIVE_GOALS: [],
				positiveTruth: generateCommonNarsese_TruthValue(1.0, 0.9),
				negativeTruth: generateCommonNarsese_TruthValue(0.0, 0.9),
				/** @implements 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
				op_output: (op: NARSOperation): string =>
					`${op[0]}([${op.slice(1).join(', ')}])`,
				/** @implements 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
				op_input: (op: NARSOperation): string =>
					`<(*, ${op.slice(1).join(', ')}) --> ${op[0]}>`,
				/** @implements 直接复用常量 */
				generateNarseseToCIN: (narsese: string): string =>
					simpleNAVMCmd(NAIRCmdTypes.NSE, narsese),
				/** @implements 直接复用常量 */
				generateOperatorRegToCIN: (operator_name: string): string =>
					simpleNAVMCmd(NAIRCmdTypes.REG, operator_name),
				/** @implements 直接复用常量 */
				generateCommonNarseseBinary: (
					subject: string,
					copula: string,
					prejudice: string,
					punctuation: string = '.',
					tense: string = '',
					truth: string = ''
				): string =>
					generateCommonNarsese_Binary(
						subject,
						copula,
						prejudice,
						punctuation,
						tense,
						truth
					),
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
					send2NARS: (message: string) => void,
					registerOperation: (
						op: NARSOperation,
						tellToNARS: boolean
					) => void
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
							registerOperation(
								[
									// * 样例：['^left', '{SELF}', 'x']
									'^' + name, // 朝负/正方向 // ! 不要忘记尖号
									selfConfig.NAL.SELF,
									nameOfAxis_M(i),
								],
								true // ! 默认是「告知NARS『我有这个操作』的」
							)
						}
					}
				},
				/** @implements 实现：位置感知 */
				AITick: (
					env: NARSEnv,
					event: PlayerEvent,
					agent: NARSPlayerAgent,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					posPointer: iPoint,
					send2NARS: (message: string) => void
				): void => {
					// 指针归位
					posPointer.copyFrom(agent.player.position)
					for (let i = 0; i < host.map.storage.numDimension; ++i) {
						// 负半轴
						posPointer[i]--
						if (!agent.player.testCanGoTo(host, posPointer)) {
							send2NARS(
								// 例句：`<{SELF} --> [x_l_blocked]>. :|: %1.0;0.9%`
								GCNToCIN_SPIJ(
									selfConfig,
									`[${nameOfAxis_M(i)}_l_blocked]`, // 谓词
									selfConfig.NAL.positiveTruth // 真值
								)
							)
						}
						// 从负到正
						posPointer[i] += 2
						if (!agent.player.testCanGoTo(host, posPointer)) {
							send2NARS(
								// 例句：`<{SELF} --> [x_l_blocked]>. :|: %1.0;0.9%`
								GCNToCIN_SPIJ(
									selfConfig,
									`[${nameOfAxis_M(i)}_r_blocked]`, // 谓词
									selfConfig.NAL.positiveTruth // 真值
								)
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
					selfConfig: NARSPlayerConfig,
					host: IMatrix
				): NARSOperation => agent.randomRegisteredOperation(),
				/**
				 * @implements 根据操作移动
				 * * 索引即方向
				 */
				operate: (
					env: NARSEnv,
					agent: NARSPlayerAgent,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					op: NARSOperation,
					operateI: uint | -1,
					send2NARS: (message: string) => void
				): NARSOperationResult => {
					// 有操作⇒行动&反馈
					if (operateI >= 0) {
						// 缓存点
						const oldP = new iPoint().copyFrom(
							agent.player.position
						)
						agent.player.moveToward(host, operateI)
						// 位置相同⇒移动失败⇒「撞墙」⇒负反馈
						if (oldP.isEqual(agent.player.position)) {
							send2NARS(
								// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
								GCNToCIN_SPIJ(
									selfConfig,
									SAFE, // 谓词
									selfConfig.NAL.negativeTruth // 真值
								)
							)
							return false
						}

						// 否则⇒移动成功⇒「没撞墙」⇒「安全」⇒正反馈
						else {
							send2NARS(
								// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
								GCNToCIN_SPIJ(
									selfConfig,
									SAFE // 谓词
									// selfConfig.NAL.positiveTruth // ! 目标没有真值
								)
							)
							return true
						}
					} else
						console.warn(
							`未知的操作「${selfConfig.NAL.op_output(op)}」`
						)
					// 没执行⇒没结果
					return undefined
				},
				fallFeedback: (
					env: NARSEnv,
					event: string,
					agent: NARSPlayerAgent,
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
							// 例句：`<{SELF} --> [respawn]>. :|:`
							send2NARS(
								// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
								GCNToCIN_SPIJ(
									selfConfig,
									`[${event}]` // 谓词
									// selfConfig.NAL.negativeTruth // 真值
								)
							)
							break
					}
				},
				/**
				 * @implements 映射「前进」操作
				 */
				actionReplacementMap(
					env: NARSEnv,
					event: PlayerEvent,
					agent: NARSPlayerAgent,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					action: PlayerAction
				): NARSOperation | undefined | null {
					// * 前进行为⇒执行操作
					if (isActionMoveForward(action))
						return agent.registeredOperations[
							// * 直接翻译成「任意维整数角」⇒索引得到操作
							toRotFromActionMoveForward(action)
						]
					// * 其它⇒放行
					return undefined
				},
			},
		},
	],
})

export default configConstructor
