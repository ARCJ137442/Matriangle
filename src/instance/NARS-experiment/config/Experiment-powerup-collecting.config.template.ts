import { iPoint, iPointRef, iPointVal } from 'matriangle-common/geometricTools'
import { NARSEnvConfig, NARSPlayerConfig } from './API'
import plotOption from './PlotData-NARS.config'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv, NARSPlayerAgent } from '../NARSEnv'
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
	NarseseCopulas,
	NarsesePunctuation,
	NarseseTenses,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import { NAIRCmdTypes } from 'matriangle-mod-nar-framework/NAIRCmdTypes.type'
import {
	NativePlayerEvent,
	PlayerEvent,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import Block from 'matriangle-api/server/block/Block'
import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'
import Entity from 'matriangle-api/server/entity/Entity'
import {
	IEntityDisplayable,
	IEntityInGrid,
} from 'matriangle-api/server/entity/EntityInterfaces'
import { IShape, DisplayLayers } from 'matriangle-api'
import {
	getPlayers,
	hitTestEntity_between_Grid,
} from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'

// 需复用的常量 //
/** 目标：「安全」 */
export const SAFE: string = '[safe]'
/** 目标：充能 */
export const POWERED: string = '[powered]'

/** 信息 */
export const info = (config: NARSEnvConfig): string => `
[[实验：NARS能量收集]]

[实验内容]
1. 主体：AI收集者：具有
	- 感知：对「能量包」的类型、距离感知
	- 运动：向所有的「任意维整数角」方向移动（一维2，二维4，三维6……）
2. 地图：有限无界的地图
	- 能量包：随机分布在地图中不是「墙」的部分
3. 目标：做出「安全」的碰撞——小车不往墙壁方向移动

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

[其它注解]
// ! 实验与「小车碰撞」完全独立，二者间除了「可复用的代码」外没有任何关联
`

// 新世界机制 //

/**
 * 简单的实验方块「墙」（原型对象）
 * * 无「附加方块状态」
 * * 只起「阻挡」作用
 */
export const WALL: Block<null> = new Block(
	'Wall',
	new BlockAttributes(0).asSolid,
	null // 无特殊方块状态
)

/**
 * 实验所用的「能量包」
 */
export class Powerup
	extends Entity
	implements IEntityInGrid, IEntityDisplayable
{
	/**
	 * 构造函数
	 * @param position 所处的位置
	 * @param good 奖励类型：正向|负向
	 */
	public constructor(
		position: iPointRef,
		/**
		 * 决定这个「能量包」的奖励类型：正向|负向
		 * * true：正向
		 * * false：负向
		 */
		public good: boolean
	) {
		super()
		this.position.copyFrom(position)
	}

	// 接口实现 //

	public position: iPointVal = new iPoint()
	/** 方块更新：自身位置被阻挡⇒重定位 */
	onPositedBlockUpdate(host: IMatrix, ...args: unknown[]): void {
		// 位置不适合⇒重定位
		if (!this.isSuitablePosition(host)) this.relocate(host)
	}

	/** 判断自身当前位置是否「适合放置」 */
	protected isSuitablePosition(host: IMatrix): boolean {
		return Powerup.isSuitablePosition(host, this.position)
	}

	/** （静态）判断自身位置 */
	protected static isSuitablePosition(
		host: IMatrix,
		position: iPointRef
	): boolean {
		return host.map.testCanPass_I(
			position,
			// 作为「玩家」
			true,
			false,
			false,
			// 不会「避免伤害」（BaTr遗留产物）
			false,
			// 避免玩家
			true,
			getPlayers(host)
		)
	}

	/**
	 * 私用「文本可视化方法」
	 */
	public visualize_text(): string {
		return `Powerup@${this.position.join(',')}[${this.good ? '正' : '负'}]`
	}

	/**
	 * 重定位到一个「适合」的位置
	 * @param host 所属母体
	 * @returns 是否「重定位成功」
	 */
	public relocate(host: IMatrix): boolean {
		/** 点の指针 */
		const position_pointer = new iPoint()
		/** 最多尝试256次 */
		let max_i: int = 0x100
		while (max_i-- > 0) {
			// 随机取点
			position_pointer.copyFrom(host.map.storage.randomPoint)
			// 适合放置⇒移动&返回
			if (Powerup.isSuitablePosition(host, position_pointer)) {
				// ! 直接拷贝坐标
				this.position.copyFrom(position_pointer)
				// 返回
				return true
			}
		}
		let is_found: boolean = false
		// 若还是没找到⇒地毯式搜索
		host.map.storage.forEachValidPositions((position: iPointRef): void => {
			if (is_found) return // ! 这里的`return`并非「整个函数返回」而只是代表「这个匿名函数返回」
			if (Powerup.isSuitablePosition(host, position)) {
				//! 直接拷贝坐标
				this.position.copyFrom(position)
				// 标记已找到
				is_found = true
			}
		})
		return is_found
	}

	// 可显示
	i_displayableContainer = true as const
	shapeInit(shape: IShape): void {
		// !【2023-11-06 16:10:28】暂不实现
	}
	shapeRefresh(shape: IShape): void {
		// !【2023-11-06 16:10:28】暂不实现
	}
	shapeDestruct(shape: IShape): void {
		// !【2023-11-06 16:10:28】暂不实现
	}
	i_displayable = true as const
	/** @implements 显示层级 = 奖励箱 */
	zIndex: int = DisplayLayers.BONUS_BOX
}

/**
 * 检测「（移动后的）玩家与能量包的碰撞」
 * * 检测碰撞后，自动触发「玩家收集能量包」事件
 *
 * ! 只会检测一个
 */
function testPowerupCollision(
	env: NARSEnv,
	host: IMatrix,
	agent: NARSPlayerAgent,
	playerConfig: NARSPlayerConfig,
	send2NARS: (message: string) => void
): boolean {
	for (const entity of host.entities) {
		// 若其为「能量包」
		if (entity instanceof Powerup) {
			if (hitTestEntity_between_Grid(agent.player, entity))
				onPowerupCollected(
					env,
					host,
					entity,
					agent,
					playerConfig,
					send2NARS
				)
		}
	}
	return false
}

/**
 * 当玩家拾取到「能量包」
 */
function onPowerupCollected(
	env: NARSEnv,
	host: IMatrix,
	powerup: Powerup,
	agent: NARSPlayerAgent,
	playerConfig: NARSPlayerConfig,
	send2NARS: (message: string) => void
): void {
	// 重定位
	powerup.relocate(host)
	// 玩家作为「NARS智能体」：奖励/惩罚
	// 发送给NARS
	send2NARS(
		// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
		generateCommonNarseseBinaryToCIN(
			playerConfig.NAL.SELF, // 主词
			NarseseCopulas.Inheritance, // 系词
			POWERED, // 谓词
			NarsesePunctuation.Judgement, // 标点
			NarseseTenses.Present, // 时态
			powerup.good // 真值
				? // 正向
				  playerConfig.NAL.positiveTruth
				: // 负向
				  playerConfig.NAL.negativeTruth
		)
	)
	// * 记录进统计数据
	agent.recordStat(powerup.good, agent.lastOperationSpontaneous)
}

// 实验环境 //

/** 空白的构造器 */
const BlankMessageServiceConstructor = (): IMessageService => {
	throw new Error('未被替换的「消息服务构造器」！')
}

/** 简易NAVM指令构建 */
export const simpleNAVMCmd = (cmd_type: string, content: string): string =>
	`${cmd_type} ${content}`

/**
 * 复用CommonNarsese模板：基础二元结构
 * * 核心结构：`<S --> P>` + 标点
 *
 * @param subject 主词
 * @param copula 系词
 * @param prejudice 谓词 '-->'继承，'<->'相似，'==>'蕴含，'<=>'等价
 * @param punctuation 标点（默认为'.'判断 '!'目标，'?'问题，'@'请求）
 * @param tense 语句时态（默认为''永恒 ':/:'将来，':|:'现在，':\:'过去）
 * @param truth 真值（默认为''，格式为'%频率;信度%'）
 * @returns Narsese语句
 *
 * @example generateCommonNarseseInheritance('{SELF}', '[safe]', '.', ':|:', '%1.0;0.9%')
 * => `<{SELF} --> [safe]>. :|: %1.0;0.9%`
 */
export const generateCommonNarseseBinary = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string = '.',
	tense: string = '',
	truth: string = ''
): string =>
	`<${subject} ${copula} ${prejudice}>${punctuation} ${tense} ${truth}`.trimEnd()

/** {@link generateCommonNarseseBinary}和{@link generateNarseseToCIN}的复合函数 */
export const generateCommonNarseseBinaryToCIN = (
	subject: string,
	copula: string,
	prejudice: string,
	punctuation: string = '.',
	tense: string = '',
	truth: string = ''
): string =>
	simpleNAVMCmd(
		NAIRCmdTypes.NSE,
		generateCommonNarseseBinary(
			subject,
			copula,
			prejudice,
			punctuation,
			tense,
			truth
		)
	)

// 开始配置 //

// 临时变量

/** 额外配置 */
export type ExtraPCExperimentConfig = {
	/** 地图尺寸 */
	map_sizes: uint[]
	/** 能量包配置 */
	powerup: {
		/** 正向能量包数目 */
		numGood: uint
		/** 负向能量包数目 */
		numBad: uint
	}
}

/** 配置 */
const configConstructor = (
	// 额外参数 //
	extraConfig: ExtraPCExperimentConfig
): NARSEnvConfig => ({
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
		initMaps(): IMap[] {
			const maps: IMap[] = []

			// 构造参数 // !【2023-11-05 17:05:01】现在通过「额外参数」引入
			const SIZES: iPointVal = new iPoint().copyFromArgs(
				...extraConfig.map_sizes
			)

			// 存储结构 //
			const storage = new MapStorageSparse(SIZES.length)
			// * 大体结构：#__C__#
			// 填充两个角落
			storage.setBlock(
				new iPoint().copyFrom(SIZES).fill(0),
				WALL.softCopy()
			)
			storage.setBlock(
				new iPoint().copyFrom(SIZES).addFromSingle(-1),
				WALL.softCopy()
			)
			/* // 填充边框
			! 新的模式没有边框
			traverseNDSquareFrame(
				new iPoint().copyFrom(SIZES).fill(0),
				new iPoint().copyFrom(SIZES).addFromSingle(-1),
				(p: iPoint): void => {
					storage.setBlock(p, WALL.softCopy())
				}
			) */

			// 注册 //
			maps.push(new Map_V1('model', storage))

			return maps
		},
		// 实体初始化：读取配置本身
		initExtraEntities(config, host): Entity[] {
			const entities: Entity[] = []
			let i: uint, powerup: Powerup
			// 正向能量包
			for (i = 0; i < extraConfig.powerup.numGood; i++) {
				powerup = new Powerup(host.map.storage.randomPoint, true)
				powerup.relocate(host)
				entities.push(powerup)
			}
			// 负向能量包
			for (i = 0; i < extraConfig.powerup.numBad; i++) {
				powerup = new Powerup(host.map.storage.randomPoint, false)
				powerup.relocate(host)
				entities.push(powerup)
			}
			// 返回实体列表
			return entities
		},
	},

	// 绘图参数：直接引用外部配置
	plot: {
		initialOption: plotOption,
	},

	// 玩家参数
	players: [
		// 第一个玩家AgentHai
		{
			// 属性参数（对接母体逻辑）
			attributes: {
				name: 'AgentHai',
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
				controlKey: 'AgentHai',
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
					spontaneousPrefix: '自主操作：\n',
					unconsciousPrefix: '教学操作：\n',
				},
			},

			// 计时参数
			timing: {
				/** 单位执行速度:感知 */
				unitAITickSpeed: 2,
				/** 目标提醒相对倍率 */
				goalRemindRate: 3, // 因子「教学目标」 3 5 10 0x100000000

				/** Babble相对倍率 */
				babbleRate: 1,
				/** 「长时间无操作⇒babble」的阈值 */
				babbleThreshold: 3,
			},

			// 词项常量池 & 词法模板

			// 词项常量池 & 词法模板
			NAL: {
				SELF: '{SELF}',
				/** @implements 表示「正向目标」的词项组 */
				POSITIVE_GOALS: [/* SAFE,  */ POWERED], // !【2023-11-07 00:41:59】现在主要目标变成了「要充能」 // TODO: 可能多目标还会「分心干扰」一些
				/** @implements 暂时没有「负向目标」 */
				NEGATIVE_GOALS: [],
				positiveTruth: '%1.0;0.9%',
				negativeTruth: '%0.0;0.9%',
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
					generateCommonNarseseBinary(
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
					agent: NARSPlayerAgent,
					selfConfig: NARSPlayerConfig,
					host: IMatrix,
					posPointer: iPoint,
					send2NARS: (message: string) => void
				): void => {
					// 指针归位
					posPointer.copyFrom(agent.player.position)
					// * 感知：能量包视野（单点无距离） * //
					for (const entity of host.entities) {
						// 若为能量包
						if (entity instanceof Powerup) {
							let i = 0
							// 逐个维度对比
							for (
								i = 0;
								i < host.map.storage.numDimension;
								++i
							) {
								// ! 核心「视野」逻辑：只要有一个坐标相等，就算是「（在这个维度上）看见」
								// * 直接对每个维度进行判断，然后返回各自的「是否看见」
								if (
									entity.position[i] ===
									agent.player.position[i]
								)
									// !【2023-11-07 00:28:05】目前还是「看到的才返回」稳妥
									send2NARS(
										// 例句：`<{SELF} --> [x_powerup_seen]>. :|: %1.0;0.9%`
										generateCommonNarseseBinaryToCIN(
											selfConfig.NAL.SELF, // 主词
											NarseseCopulas.Inheritance, // 系词
											`[${nameOfAxis_M(i)}_powerup_${
												entity.good ? 'good' : 'bad'
											}_seen]`, // 谓词
											NarsesePunctuation.Judgement, // 标点
											NarseseTenses.Present, // 时态
											// 真值
											/* entity.position[i] === self.position[i]
											? selfConfig.NAL.positiveTruth
											: selfConfig.NAL.negativeTruth */
											selfConfig.NAL.positiveTruth
										)
									)
							}
						}
					}
					// * 感知：墙壁碰撞 * //
					for (let i = 0; i < host.map.storage.numDimension; ++i) {
						// 负半轴
						posPointer[i]--
						if (!agent.player.testCanGoTo(host, posPointer)) {
							send2NARS(
								// 例句：`<{SELF} --> [x_l_blocked]>. :|: %1.0;0.9%`
								generateCommonNarseseBinaryToCIN(
									selfConfig.NAL.SELF, // 主词
									NarseseCopulas.Inheritance, // 系词
									`[${nameOfAxis_M(i)}_l_blocked]`, // 谓词
									NarsesePunctuation.Judgement, // 标点
									NarseseTenses.Present, // 时态
									selfConfig.NAL.positiveTruth // 真值
								)
							)
						}
						// 从负到正
						posPointer[i] += 2
						if (!agent.player.testCanGoTo(host, posPointer)) {
							send2NARS(
								// 例句：`<{SELF} --> [x_l_blocked]>. :|: %1.0;0.9%`
								generateCommonNarseseBinaryToCIN(
									selfConfig.NAL.SELF, // 主词
									NarseseCopulas.Inheritance, // 系词
									`[${nameOfAxis_M(i)}_r_blocked]`, // 谓词
									NarsesePunctuation.Judgement, // 标点
									NarseseTenses.Present, // 时态
									selfConfig.NAL.positiveTruth // 真值
								)
							)
						}
						// 归位⇒下一座标轴
						posPointer[i]--
					}
					// * 运动：前进 * //
					// 缓存点
					const oldP = new iPoint().copyFrom(agent.player.position)
					// 前进
					agent.player.moveForward(host)
					// * 反馈式感知 * // TODO: 是否需要使用这里面的反馈
					// * 测试「能量包」碰撞：检测碰撞，发送反馈，更新统计数据（现在的「成功率」变成了「拾取的『正向能量包』数/总拾取能量包数」）
					testPowerupCollision(
						env,
						host,
						agent,
						selfConfig,
						send2NARS
					)
					// 位置相同⇒移动失败⇒「撞墙」⇒负反馈
					if (oldP.isEqual(agent.player.position)) {
						send2NARS(
							// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
							generateCommonNarseseBinaryToCIN(
								selfConfig.NAL.SELF, // 主词
								NarseseCopulas.Inheritance, // 系词
								SAFE, // 谓词
								NarsesePunctuation.Judgement, // 标点
								NarseseTenses.Present, // 时态
								selfConfig.NAL.negativeTruth // 真值
							)
						)
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
						// 玩家转向 // !【2023-11-07 00:32:16】行动「前进」在AITick中
						agent.player.turnTo(host, operateI)
						/** 否则⇒没撞墙⇒没有负反馈 */ // ! 目前不需要这个「边界检测」
						return undefined
						/* // 否则⇒移动成功⇒「没撞墙」⇒「安全」⇒正反馈
						else {
							send2NARS(
								// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
								generateCommonNarseseBinaryToCIN(
									selfConfig.NAL.SELF, // 主词
									NarseseCopulas.Inheritance, // 系词
									SAFE, // 谓词
									NarsesePunctuation.Judgement, // 标点
									NarseseTenses.Present // 时态
									// selfConfig.NAL.positiveTruth // ! 目标没有真值
								)
							)
							return true
						} */
					} else
						console.warn(
							`未知的操作「${selfConfig.NAL.op_output(op)}」`
						)
					// 没执行⇒没成功
					return false
				},
				feedback: (
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
								generateCommonNarseseBinaryToCIN(
									selfConfig.NAL.SELF, // 主词
									NarseseCopulas.Inheritance, // 系词
									`[${event}]`, // 谓词
									NarsesePunctuation.Judgement, // 标点
									NarseseTenses.Present // 时态
									// selfConfig.NAL.negativeTruth // 真值
								)
							)
							break
					}
				},
			},
		},
	],
})

export default configConstructor