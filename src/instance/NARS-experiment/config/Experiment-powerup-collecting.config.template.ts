import { iPoint, iPointRef, iPointVal } from 'matriangle-common/geometricTools'
import { NARSEnvConfig, NARSPlayerConfig } from './API'
import plotOption from './PlotData-NARS.config'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer, {
	isPlayer,
} from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv, NARSPlayerAgent } from '../NARSEnv'
import {
	mRot,
	mRot2axis,
	mRot2increment,
	nameOfAxis_M,
	rotateInPlane_M,
} from 'matriangle-api/server/general/GlobalRot'
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
import { IEntityInGrid } from 'matriangle-api/server/entity/EntityInterfaces'
import { DisplayLevel, typeID } from 'matriangle-api'
import { hitTestEntity_between_Grid } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { NativeBlockPrototypes } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import {
	PlayerAction,
	isActionMoveForward,
	toRotFromActionMoveForward,
} from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import { IDisplayDataEntityState } from 'matriangle-api/display/RemoteDisplayAPI'
import EntityDisplayable from 'matriangle-api/server/entity/EntityDisplayable'
import { sgn } from 'matriangle-common'
import {
	simpleNAVMCmd,
	generateCommonNarsese_Binary,
	generateCommonNarsese_TruthValue,
	GCNToCIN_SPIJ,
} from '../common/nal-lib'

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
	- 这个连接主要用于向NARS实现（如OpenNARS、ONA、PyNARS）输入感知运动信息

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
	'AI_Wall', // * 现在使用特殊的名称进行索引（已经在zim_client_block.ts中加入支持）
	new BlockAttributes(0).loadAsSolid(),
	null // 固定方块状态（取自并共用BaTS的数据结构）
)

/** 奖励包的状态 */
export interface IDisplayDataEntityStatePowerup
	extends IDisplayDataEntityState {
	good: boolean
}

/**
 * 实验所用的「能量包」
 */
export class Powerup
	extends EntityDisplayable<IDisplayDataEntityStatePowerup>
	// *【2023-11-18 10:43:14】现在直接继承，无需直接处理细节
	implements IEntityInGrid
{
	/** ID */
	public static readonly ID: typeID = 'AI_Powerup' // * 不要轻易改，这在zim_client.entity.ts中有用

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
		super(Powerup.ID)
		this.position.copyFrom(position)
		this.syncDisplayProxy()
	}
	/** @implements 显示数据 */
	protected syncDisplayProxy(): void {
		this._proxy.storeState('good', this.good)
		this._proxy.position = this.position
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

	/** （静态）判断自身位置是否适合 */
	protected static isSuitablePosition(
		host: IMatrix,
		position: iPointRef
	): boolean {
		// 手动避免玩家和其它能量包
		for (const entity of host.entities) {
			if (
				// 玩家 or 其它能量包
				(isPlayer(entity) || entity instanceof Powerup) &&
				// 坐标相等
				entity.position.isEqual(position)
			)
				// 不可放置
				return false
		}
		return host.map.testCanPass_I(
			position,
			// 作为「玩家」
			true,
			false,
			false,
			// 不会「避免伤害」（BaTr遗留产物）
			false
			// 不用在此避免什么
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
	i_displayable = true as const
	/** @implements 显示层级 = 奖励箱 */
	zIndex: int = DisplayLevel.BONUS_BOX
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
	// * 玩家作为「NARS智能体」：奖励/惩罚，发送「目标达成/未成」信息给NARS *
	// 基础目标
	send2NARS(
		// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
		GCNToCIN_SPIJ(
			agent.config,
			// 基础目标
			(env.config.extraConfig as ExtraPCExperimentConfig).motivationSys
				.goalBasic, // 谓词
			powerup.good // 真值
				? // 正向
				  playerConfig.NAL.positiveTruth
				: // 负向
				  playerConfig.NAL.negativeTruth
		)
	)

	// 自定义数据「上一次奖励/上一次惩罚」
	if (powerup.good)
		// 负面⇒清零「惩罚」数据
		agent.customDatas.timePassedLastBad = 0
	// 正面⇒清零「奖励」数据
	else agent.customDatas.timePassedLastGood = 0

	// * ✨高阶目标「POWERFUL」
	if (
		(env.config.extraConfig as ExtraPCExperimentConfig)?.motivationSys
			.highOrderGoals === true
	) {
		// 负面⇒立即惩罚
		if (!powerup.good) {
			// 立即惩罚
			send2NARS(
				// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
				GCNToCIN_SPIJ(
					agent.config,
					// 高阶目标
					(env.config.extraConfig as ExtraPCExperimentConfig)
						.motivationSys.highOrderGoal, // 谓词
					playerConfig.NAL.negativeTruth
				)
			)
		}
	}

	// * 记录进统计数据
	agent.recordStat(powerup.good, agent.lastOperationSpontaneous)
}

// 实验环境 //

/** 空白的构造器 */
const BlankMessageServiceConstructor = (): IMessageService => {
	throw new Error('未被替换的「消息服务构造器」！')
}

// 专用NAL模板

/**
 * 生成「能量包感知」对象
 * * 类型：外延集
 */
export const NAL_powerupSubject = (good: boolean, position: string): string =>
	`{powerup_${good ? 'good' : 'bad'}_${position}}`

/**
 * 谓词「看见」
 * * 类型：内涵集
 */
export const NAL_SEEN = '[seen]'

// 开始配置 //

/** 记录玩家「运动系统」的模式 */
export enum PlayerMotorMode {
	/**
	 * 被动模式
	 * * 「前进」操作以一定频率自动进行
	 * * 「转向」操作每个维度有两个
	 */
	PASSIVE,
	/**
	 * 主动模式
	 * * 「前进」作为一个显式的「操作」
	 *   * 如`^left`（这里的`^left`已经不是原先的意义了）
	 * * 「转向」每个维度只设置一个
	 *   * 如`^right(x)`（这里的`^right`同上）
	 */
	INITIATIVE,
}

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
	/**
	 * 先天知识
	 * * 所有涉及「先天内置语句」的「初始化⇒背景告知」相关配置
	 */
	intrinsicKnowledge: {
		/**
		 * 告知「自身有什么操作」
		 * * 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
		 */
		whatOperationItHas: boolean
		/**
		 * 先天内置固定的「具体知识」
		 * * 格式：CommonNarsese语句
		 * * 不保证其在「先天知识」中添加的顺序
		 */
		initialKnowledge: string[]
	}
	/**
	 * 运动系统
	 * * 所有涉及「操作-行为-运动」的「EXE→玩家行为」相关配置
	 */
	motorSys: {
		/**
		 * 是否「被动移动」
		 * * 参考{@link PlayerMotorMode}
		 */
		mode: PlayerMotorMode
		/**
		 * 步进判据
		 * * 时间单位：AI刻（时间颗粒）
		 * * 仅在「被动移动」时使用
		 */
		passiveStepCriterion: (stepTick: uint) => boolean
	}
	/**
	 * 动机系统
	 * * 🎯管理「环境如何向系统输入目标，以及『什么时候输入什么反馈』」
	 * * 所有涉及「目标-反馈」的「动机/驱动/激励」相关配置
	 */
	motivationSys: {
		/**
		 * 用于「基础目标」的词项
		 * * 设置为NARS的「内部心理词项」时，可能有不同的效果
		 *   * 🔬此亦即「Narsese指代」实验
		 */
		goalBasic: string
		/**
		 * 是否启用高阶目标
		 * * 为`true`时启动类似SimNAR中「satisfy-healthy」的「双层目标系统」
		 */
		highOrderGoals: boolean
		/**
		 * 高阶目标所对应的词项
		 * * 默认为内涵集`[powerful]`
		 *   * 对应SimNAR中的`[healthy]`
		 */
		highOrderGoal: string
		/**
		 * 达到「高阶目标」（POWERFUL）的条件
		 * @param timePassedLastBad 距离「最后一次『负能量包惩罚』」的奖励次数
		 */
		powerfulCriterion: (timePassedLastBad: uint) => boolean
		/**
		 * 负触发目标
		 * * 为`true`时启动类似「长久不吃饭就会饿」的「负触发目标系统」
		 * * 新词「negatrigger = negative + trigger」
		 */
		negatriggerGoals: boolean
		/**
		 * 达到「负触发目标」（-POWERED）的条件
		 * @param timePassedLastGood 距离「最后一次『正能量包奖励』」的奖励次数
		 */
		negatriggerCriterion: (timePassedLastGood: uint) => boolean
		/**
		 * 达到「负触发条件」后，给「负触发目标」输入的真值
		 * @default 默认情况：常量`[0.0,1.0]`
		 * @param timePassedLastGood 距离「最后一次『正能量包奖励』」的奖励次数
		 */
		negatriggerTruthF: (timePassedLastGood: uint) => [number, number]
	}
}

/**
 * 玩家配置：AgentHai/前进操作
 * * 🎯统一「实际玩家前进」「能量包碰撞检测」「步数清零」
 */
export function AgentHai_moveForward(
	env: NARSEnv,
	agent: NARSPlayerAgent,
	selfConfig: NARSPlayerConfig,
	host: IMatrix,
	send2NARS: (message: string) => void
): void {
	// 玩家实际前进
	agent.player.moveForward(host)
	// * 测试「能量包」碰撞：检测碰撞，发送反馈，更新统计数据（现在的「成功率」变成了「拾取的『正向能量包』数/总拾取能量包数」）
	testPowerupCollision(env, host, agent, selfConfig, send2NARS)
	// 自定义数据清零
	agent.customDatas._stepTick = 0
}

/** 玩家配置：AgentHai/操作注册 */
export const AgentHai_registerOperations = (
	extraConfig: ExtraPCExperimentConfig,
	env: NARSEnv,
	self: IPlayer,
	selfConfig: NARSPlayerConfig,
	host: IMatrix,
	send2NARS: (message: string) => void,
	registerOperation: (op: NARSOperation, tellToNARS: boolean) => void
): void => {
	// 「方向控制」消息 // * 操作：`移动(自身)` 即 `(*, 自身) --> ^移动`
	let name: string
	/**
	 * 内置的原子操作表
	 * *【2023-11-08 00:46:18】鉴于先前实验和与他人的讨论，`移动(自身, 方向)`和`向左移动(自身)`不完全等价。
	 * * 故在三维之前都使用`right|left|down|up`四个「原子操作」去（直接）让NARS执行
	 */
	const internalAtomicOperations: NARSOperation[] = [
		// !【2023-11-10 18:45:17】操作参数还是不能省略（虽然ONA支持「零参乘积」但OpenNARS不支持）
		['^right', selfConfig.NAL.SELF],
		['^left', selfConfig.NAL.SELF],
		// ['^down', selfConfig.NAL.SELF], // ! 似乎「up」「down」又不是OpenNARS所存储的原子操作了
		// ['^up', selfConfig.NAL.SELF], // ! 似乎「up」「down」又不是OpenNARS所存储的原子操作了
	]
	// * 优先注册「内部原始操作」
	for (const operation of internalAtomicOperations) {
		registerOperation(
			operation,
			extraConfig.intrinsicKnowledge.whatOperationItHas
		)
	}
	// * 基于先前与他人的交流，这里借用「left⇒负方向移动，right⇒正方向移动」「同操作符+不同参数≈不同操作」的思想，使用「^left({SELF}, x)」表达「向x轴负方向移动」（其它移动方式可类推）
	const rl = ['right', 'left'] // 先右后左，先正后负
	// 遍历各个维度，产生操作
	for (
		// !【2023-11-08 00:49:03】现在从「内置原始操作后的第一个维度」开始，若没有就作罢
		let i = (internalAtomicOperations.length >> 1) + 1;
		// *【2023-11-25 23:47:31】这里的「+1」现在是「内部操作」不够「n-1个维度维度」的情况下。。。因为原生的「left|right」已经够2d了
		i < host.map.storage.numDimension;
		++i
	) {
		for (name of rl) {
			// 负/正方向 //
			registerOperation(
				[
					// * 样例：['^left', '{SELF}', 'x']
					'^' + name, // 朝负/正方向 // ! 不要忘记尖号
					selfConfig.NAL.SELF,
					nameOfAxis_M(i),
				],
				extraConfig.intrinsicKnowledge.whatOperationItHas
			)
		}
	}
	// 其它「固定的内置知识」（从Narsese生成NAIR指令）
	for (const narsese of extraConfig.intrinsicKnowledge.initialKnowledge)
		simpleNAVMCmd(NAIRCmdTypes.NSE, narsese)
}

/** 玩家配置：AgentHai */
export const AgentHai = (
	extraConfig: ExtraPCExperimentConfig
): NARSPlayerConfig => ({
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
		controlKey: 'Alpha', // * 为了和碰撞实验相吻合
	},

	// 数据显示
	dataShow: {
		// * 无⇒保持原样
		dataNameMap: {},
		operationHistory: {
			/**
			 * @implements `[['^left', '{SELF}', 'x'], true]` => `left_{SELF}_x-S`
			 */
			visualizeOperationRecord: (record: NARSOperationRecord): string =>
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
		unitAITickSpeed: 5,
		/** 目标提醒相对倍率 */
		goalRemindRate: 3, // 因子「教学目标」 3 5 10 0x100000000

		/** 教学时间（实验开始NARS操作「不阻塞Babble」的时间） */
		teachingTime: 30,

		/** Babble相对倍率 */
		babbleRate: 1,
		/** 「长时间无操作⇒babble」的阈值 */
		babbleThreshold: 10,
		// babble概率（移植自SimNAR）
		babbleProbability: 0.5, // *【2023-11-28 20:34:15】📌若为「全主动模式」可能就要调高点
	},

	// 词项常量池 & 词法模板
	NAL: {
		SELF: '{SELF}',
		/** @implements 表示「正向目标」的词项组 */
		POSITIVE_GOALS: [
			// 基础目标
			extraConfig.motivationSys.goalBasic,
			// 存储是否附加「高阶目标」
			...(extraConfig.motivationSys.highOrderGoals
				? [
						// 高阶目标
						extraConfig.motivationSys.highOrderGoal,
				  ]
				: []),
		],
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
		init(
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			send2NARS: (message: string) => void,
			registerOperation: (op: NARSOperation, tellToNARS: boolean) => void
		): void {
			// 注册操作
			AgentHai_registerOperations(
				extraConfig,
				env,
				self,
				selfConfig,
				host,
				send2NARS,
				registerOperation
			)
		},
		/**
		 * @implements 实现：位置感知+随机前进
		 *
		 * !【2023-11-27 19:51:34】目前还是「先运动，后感知」——因为「先感知」可能会存在「运动后感知错位」的毛病
		 */
		AITick: (
			env: NARSEnv,
			event: PlayerEvent,
			agent: NARSPlayerAgent,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			posPointer: iPoint,
			send2NARS: (message: string) => void
		): void => {
			// * 运动：前进 * //
			// 自定义数据更新
			agent.customDatas._stepTick =
				Number(agent.customDatas?._stepTick ?? 0) + 1
			// 「被动模式」前进
			if (
				// * 仅在「被动模式」起效
				extraConfig.motorSys.mode === PlayerMotorMode.PASSIVE &&
				// * 现在只在「上一次没操作1时间颗粒」后前进（或许可以考虑解放出来「成为一个智能体操作」）
				agent.lastNARSOperated > 1 &&
				// ! 因为没法缓存局部变量，所以只能使用「概率」的方式进行步进
				extraConfig.motorSys.passiveStepCriterion(
					agent.customDatas._stepTick as number
				)
			)
				AgentHai_moveForward(env, agent, selfConfig, host, send2NARS)
			// * 感知：能量包视野 * //
			allEntity: for (const entity of host.entities) {
				if (!(entity instanceof Powerup)) continue
				// 若为能量包
				// * 正前方感知
				const lineIndex = agent.player.position.indexOfSameLine(
					entity.position
				)
				if (
					// 在一条直线上
					lineIndex === mRot2axis(agent.player.direction) &&
					// 并且是前方： 轴向相等 & ("实体坐标>玩家坐标"&正方向 | "实体坐标<玩家坐标"&负方向)
					sgn(
						entity.position[lineIndex] -
							agent.player.position[lineIndex]
					) === mRot2increment(agent.player.direction)
				) {
					agent.player.setColor(
						// * 依照能量包正负，分别安排绿色/红色
						entity.good ? 0x00ff00 : 0xff0000,
						// 填充颜色保持默认
						agent.player.fillColor
					)
					// !【2023-11-07 00:28:05】目前还是「看到的才返回」稳妥
					send2NARS(
						// 例句：`<{SELF} --> [x_powerup_good_seen]>. :|: %1.0;0.9%`
						agent.config.NAL.generateNarseseToCIN(
							agent.config.NAL.generateCommonNarseseBinary(
								/**
								 *  !【2023-11-25 20:17:06】现在学习SimNAR的做法，调整为`<{x_powerup_good} --> [seen]> :|: %1.0;0.9%`
								 */
								NAL_powerupSubject(entity.good, 'front'), // 主词
								NarseseCopulas.Inheritance, // 系词
								NAL_SEEN, // 谓词
								NarsesePunctuation.Judgement, // 标点
								NarseseTenses.Present, // 时态
								// 真值
								/* entity.position[i] === self.position[i]
							? selfConfig.NAL.positiveTruth
							: selfConfig.NAL.negativeTruth */
								selfConfig.NAL.positiveTruth
							)
						)
					)
					// 感知到就结束了
					break allEntity
				}
				// 逐个维度对比
				else
					for (let i = 0; i < host.map.storage.numDimension; ++i) {
						// ! 核心「视野」逻辑：只要有一个坐标相等，就算是「（在这个维度上）看见」
						// * 直接对每个维度进行判断，然后返回各自的「是否看见」
						if (entity.position[i] !== agent.player.position[i])
							continue
						// 特殊颜色显示
						agent.player.setColor(
							// * 依照能量包正负，分别安排深绿色/红色
							entity.good ? 0x007f00 : 0x7f0000,
							// 填充颜色保持默认
							agent.player.fillColor
						)
						// !【2023-11-07 00:28:05】目前还是「看到的才返回」稳妥
						send2NARS(
							// 例句：`<{SELF} --> [x_powerup_good_seen]>. :|: %1.0;0.9%`
							agent.config.NAL.generateNarseseToCIN(
								agent.config.NAL.generateCommonNarseseBinary(
									/**
									 *  !【2023-11-25 20:17:06】现在学习SimNAR的做法，调整为`<{x_powerup_good} --> [seen]> :|: %1.0;0.9%`
									 */
									NAL_powerupSubject(
										entity.good,
										nameOfAxis_M(i) // ! 现在把「坐标轴信息」放在末尾
									), // 主词
									NarseseCopulas.Inheritance, // 系词
									NAL_SEEN, // 谓词
									NarsesePunctuation.Judgement, // 标点
									NarseseTenses.Present, // 时态
									// 真值
									/* entity.position[i] === self.position[i]
									? selfConfig.NAL.positiveTruth
									: selfConfig.NAL.negativeTruth */
									selfConfig.NAL.positiveTruth
								)
							)
						)
						// 感知到就结束了
						break allEntity
					}
			}
			// !【2023-11-28 19:43:49】现在移除有关「墙壁碰撞」的代码（小车碰撞遗留）
			// !【2023-11-08 00:23:49】现在移除有关「安全」的目标机制，若需挪用请参考「小车碰撞实验」
			// * 持续性满足/持续性饥饿 机制 * //
			// * ✨高阶目标：POWERFUL
			if (extraConfig.motivationSys.highOrderGoals) {
				// 满足一定程度开始奖励
				if (
					extraConfig.motivationSys.powerfulCriterion(
						Number(agent.customDatas?.timePassedLastBad ?? 0)
					)
				) {
					// 高阶目标「POWERFUL」
					send2NARS(
						// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
						GCNToCIN_SPIJ(
							agent.config,
							// 高阶目标
							(env.config.extraConfig as ExtraPCExperimentConfig)
								.motivationSys.highOrderGoal, // 谓词
							agent.config.NAL.positiveTruth
						)
					)
				}
			}
			// * ✨负触发目标：POWERED
			if (extraConfig.motivationSys.negatriggerGoals) {
				// 满足一定程度开始惩罚
				if (
					extraConfig.motivationSys.negatriggerCriterion(
						Number(agent.customDatas?.timePassedLastGood ?? 0)
					)
				) {
					// 负触发目标「POWERED」
					send2NARS(
						// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
						GCNToCIN_SPIJ(
							agent.config,
							// 基础目标
							(env.config.extraConfig as ExtraPCExperimentConfig)
								.motivationSys.goalBasic, // 谓词
							// 真值
							generateCommonNarsese_TruthValue(
								...extraConfig.motivationSys.negatriggerTruthF(
									Number(
										agent.customDatas?.timePassedLastGood ??
											0
									)
								)
							)
						)
					)
				}
			}
			// 更新递增数据
			agent.customDatas.timePassedLastGood =
				Number(agent.customDatas?.timePassedLastGood ?? 0) + 1
			agent.customDatas.timePassedLastBad =
				Number(agent.customDatas?.timePassedLastBad ?? 0) + 1
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
		 * * 【2023-11-25 21:44:14】现在使用「0 => xy+, 1 => xy-, 2 => xOz+, ...」这样的旋转方式
		 *   * 既能兼容「任意维地图」
		 *   * 又能实现「一直同样操作≠状态一直不变」
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
			// 软处理@ONA：没有索引时，有「left」「right」也算
			if (operateI < 0)
				if (op[0].indexOf('left') >= 0) operateI = 0 // y+
				else if (op[0].indexOf('right') >= 0) operateI = 1 // y-
			// 有操作⇒行动&反馈
			if (operateI >= 0)
				// * 分模式处理
				switch (extraConfig.motorSys.mode) {
					// * 被动模式
					case PlayerMotorMode.PASSIVE: {
						// 玩家转向 // !【2023-11-07 00:32:16】行动「前进」在AITick中
						const newDirection: mRot = rotateInPlane_M(
							agent.player.direction,
							0, // x+
							operateI + 2, // 从y+开始
							1
						)
						agent.player.turnTo(host, newDirection)
						return undefined
					}
					// * 主动模式
					case PlayerMotorMode.INITIATIVE:
						// * 操作索引=0⇒前进
						if (operateI === 0)
							AgentHai_moveForward(
								env,
								agent,
								selfConfig,
								host,
								send2NARS
							)
						// * 操作索引>0⇒转向
						else {
							const newDirection: mRot = rotateInPlane_M(
								agent.player.direction,
								0, // x+
								operateI << 1, // 从y+开始，到z+、w+。。。足够遍历所有角度
								1
							)
							agent.player.turnTo(host, newDirection)
							return undefined
						}
						// 默认不返回任何东西
						return undefined
				}
			else console.warn(`未知的操作「${selfConfig.NAL.op_output(op)}」`)
			// 没执行⇒无结果
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
							agent.config,
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
})

/** 总配置 */
const configConstructor = (
	// 额外参数 //
	extraConfig: ExtraPCExperimentConfig
): NARSEnvConfig => ({
	// 额外参数
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
				NativeBlockPrototypes.VOID.softCopy()
			)
			storage.setBlock(
				new iPoint().copyFrom(SIZES).addFromSingle(-1),
				NativeBlockPrototypes.VOID.softCopy()
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
		AgentHai(extraConfig),
	],
})

export default configConstructor
