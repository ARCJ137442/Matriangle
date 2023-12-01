import { iPoint, iPointVal } from 'matriangle-common/geometricTools'
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
	NARSOperationResult,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { NAIRCmdTypes } from 'matriangle-mod-nar-framework/NAIRCmdTypes.type'
import {
	NativePlayerEvent,
	PlayerEvent,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import Entity from 'matriangle-api/server/entity/Entity'
import { NativeBlockPrototypes } from 'matriangle-mod-native/registry/BlockRegistry_Native'
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
	commonDataShow_operationHistory,
} from '../common/nal-lib'

/** 信息 */
export const info = (config: NARSEnvConfig): string => `
[[实验：NARS通信语言]]

[实验内容]
1. 主体：AI「对话者」
	- 感知：外界输入的「序列信号」
	- 运动：对外输出「语言符号」
2. 地图：无
	- 实质上只是个抽象的「聊天室」
	- 亦或着——不涉及一个「可被『空间化』描述」的母体
3. 目标：根据外部**变化的奖励标准**进行「任务式对话」
	- 环境向「对话者」发送「语音信息」信号
	- 这个「语言信息」分「固定长」（使用一个乘积表示）和「不定长」（使用多段Narsese表示）
	- 「对话者」的主要目标
		- 直接目标：内置词项'<{SELF} --> [satisfied]>'
		- 实验目标：
			1. 在「当前语言信号」中识别出一个「信号模式」
				- 本质上是一种「我输入『信号是什么』，你说出『模式是什么』」的「模式识别」工作
			2. 并通过操作「^utter/^echo」输出「这段信号中有什么模式」
				- 实际使用中映射到^left/^right（受限于OpenNARS的「原子操作注册有限」问题）
				- 这里「源自操作的输出」并不代表「智能体实际的输出」
					- 即便作为一个「瞬时动作」

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
// ! 实验与「小车碰撞」「能量包收集」完全独立
// ! 实验并不（在物理上地）需要一个「空间环境」
`

// 实验环境 //

/** 空白的构造器 */
const BlankMessageServiceConstructor = (): IMessageService => {
	throw new Error('未被替换的「消息服务构造器」！')
}

// 专用NAL模板

/**
 * 谓词「已接收」
 * * 类型：内涵集
 * * 🎯用于表征「外界信号已被自身接收」
 */
export const NAL_RECEIVED = '[received]'

// 开始配置 //

/** 记录玩家「运动系统」的模式 */
export enum PlayerMotorMode {
	/**
	 * 被动模式
	 * * 取一段时间内最后一次「操作/应答」（or频次最高、or信度最高）
	 * * 一段时间后「无应答」仍「无声作有声」视作「发出『null』信号」
	 */
	PASSIVE,
	/**
	 * 主动模式
	 * * 只有「主动进行操作/回答」才视作
	 */
	INITIATIVE,
}

/** 额外配置 */
export type ExtraLCExperimentConfig = {
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
	 * 感知系统
	 * * 所有涉及「外部信息→内部Narsese输入」的相关配置
	 */
	senseSys: {
		// TODO: 待补充
	}
	/**
	 * 运动系统
	 * * 所有涉及「操作-行为-运动」的「EXE→玩家行为」相关配置
	 */
	motorSys: {
		// TODO: 待补充
		mode: PlayerMotorMode
	}
	/**
	 * 动机系统
	 * * 🎯管理「环境如何向系统输入目标，以及『什么时候输入什么反馈』」
	 * * 所有涉及「目标-反馈」的「动机/驱动/激励」相关配置
	 */
	motivationSys: {
		// TODO: 后续改进
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
		 */
		highOrderGoal: string
		/**
		 * 达到「高阶目标」（healthy）的条件
		 * @param timePassedLastPunish 距离「最后一次『负面惩罚』」的时间颗粒数
		 */
		highOrderPraiseCriterion: (timePassedLastPunish: uint) => boolean
		/**
		 * 负触发目标
		 * * 为`true`时启动类似「长久不吃饭就会饿」的「负触发目标系统」
		 * * 新词「negatrigger = negative + trigger」
		 */
		negatriggerGoals: boolean
		/**
		 * 达到「负触发目标」（-satisfied）的条件
		 * @param timePassedLastPunish 距离「最后一次『正面奖励』」的时间颗粒数
		 */
		negatriggerCriterion: (timePassedLastPraise: uint) => boolean
		/**
		 * 达到「负触发条件」后，给「负触发目标」输入的真值
		 * @default 默认情况：常量`[0.0,1.0]`
		 * @param timePassedLastPunish 距离「最后一次『正面奖励』」的时间颗粒数
		 */
		negatriggerTruthF: (timePassedLastPraise: uint) => [number, number]
	}
}

/**
 * 玩家配置：AgentLinly
 * * 📌这里的「Linly」取自「Linguistic-ly」
 *   * 复数形式：Linlies
 *   * 有「语言学」含义，或寓意「语言地行事」
 *
 * @param extraConfig 额外配置
 * @param num 数字编号（不建议大于三位数）
 */
export const AgentLinly = (
	extraConfig: ExtraLCExperimentConfig,
	num: uint
): NARSPlayerConfig => ({
	// 属性参数（对接母体逻辑）
	attributes: {
		// * 自动生成「名字+编号」，如`AgentLinly`, `AgentLinly001`, ...
		name: 'AgentLinly' + (num > 0 ? String(num).padStart(3, '0') : ''),
		health: {
			// ! 这些属性与实际「语言机制」无关
			initialHP: 100,
			initialMaxHP: 100,
			initialHeal: 0,
			initialLives: 0,
			lifeNotDecay: true,
		},
		// * 这里所谓「外观」并不重要……
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
		// TODO: 后续或许可以联合BabelNAR，让玩家数量随着「BabelNAR客户端连接」而动态改变
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
		controlKey: 'Alpha' + (num === 1 ? String(num) : ''), // *【2023-12-02 00:22:06】目前还是直接使用「Alpha」作为「控制键」，但不过默认对应「1号玩家」
	},

	// 数据显示
	dataShow: {
		// * 无⇒保持原样
		dataNameMap: {},
		operationHistory: commonDataShow_operationHistory,
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
		babbleRate: 10,
		/** 「长时间无操作⇒babble」的阈值 */
		babbleThreshold: 10,
		// babble概率（移植自SimNAR）
		babbleProbability: 0.5, // *【2023-11-28 20:34:15】📌若为「全主动模式」可能就要调高点
	},

	// 词项常量池 & 词法模板
	NAL: AgentLinly_NAL(extraConfig),

	// 行为参数
	behavior: AgentLinly_behavior(extraConfig),
})

/**
 * 玩家配置： AgentLinly/NAL模板
 * * 这里更多是一些通用的东西，常量池之类不经常（因实验而改变）的配置
 */
export const AgentLinly_NAL = (
	extraConfig: ExtraLCExperimentConfig
): NARSPlayerConfig['NAL'] => ({
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
	generateCommonNarseseBinary: generateCommonNarsese_Binary,
})

/**
 * 玩家配置：AgentLinly/说话(or 发信号)
 * * 配置「初始化」「AI刻」「NARS操作」「外部控制」等行为
 */
export const AgentLinly_behavior = (
	extraConfig: ExtraLCExperimentConfig
): NARSPlayerConfig['behavior'] => ({
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
		AgentLinly_registerOperations(
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
		// *【2023-12-01 23:59:29】理想的所谓「通信语言」环境中并没有「环境主动刺激感知」的情况
		// * 持续性满足/持续性饥饿 机制 * //
		// * ✨高阶目标
		if (extraConfig.motivationSys.highOrderGoals) {
			// 满足一定程度开始奖励
			if (
				extraConfig.motivationSys.highOrderPraiseCriterion(
					Number(agent.customDatas?.timePassedLastBad ?? 0)
				)
			) {
				send2NARS(
					// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
					GCNToCIN_SPIJ(
						agent.config,
						// 高阶目标
						(env.config.extraConfig as ExtraLCExperimentConfig)
							.motivationSys.highOrderGoal, // 谓词
						agent.config.NAL.positiveTruth
					)
				)
			}
		}
		// * ✨负触发基础目标
		if (extraConfig.motivationSys.negatriggerGoals) {
			// 满足一定程度开始惩罚
			if (
				extraConfig.motivationSys.negatriggerCriterion(
					Number(agent.customDatas?.timePassedLastGood ?? 0)
				)
			) {
				send2NARS(
					// 例句：`<{SELF} --> [safe]>. :|: %1.0;0.9%`
					GCNToCIN_SPIJ(
						agent.config,
						// 基础目标
						(env.config.extraConfig as ExtraLCExperimentConfig)
							.motivationSys.goalBasic, // 谓词
						// 真值
						generateCommonNarsese_TruthValue(
							...extraConfig.motivationSys.negatriggerTruthF(
								Number(
									agent.customDatas?.timePassedLastGood ?? 0
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
	 * @implements 根据操作「言语」
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
		/*
		 *💡或许可以不那么「固定死」：符号动态链接技术
		 * * 按「先前送来的『操作顺序』」动态维护一张「语言符号对应表」然后由此动态地链接符号
		 * * 只不过，这可能会导致「需要另外在『文本数据』中记录这种『动态映射』」
		 ? 问题来了：这个「玩家数据」存储在哪里呢
		 */
		// TODO: 动态链接——重索引
		// 有操作⇒行动&反馈
		if (operateI >= 0)
			// * 分模式处理
			switch (extraConfig.motorSys.mode) {
				// * 被动模式：存储在「当前回答」的变量
				case PlayerMotorMode.PASSIVE:
					// TODO: 继续完善
					return undefined
				// * 主动模式：
				case PlayerMotorMode.INITIATIVE:
					// TODO: 继续完善
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
})

/**
 * 玩家配置：AgentLinly/说话(or 发信号)
 * * 对外发送（所谓）「语言信息」
 */
export function AgentLinly_utter(
	env: NARSEnv,
	agent: NARSPlayerAgent,
	selfConfig: NARSPlayerConfig,
	host: IMatrix,
	send2NARS: (message: string) => void
): void {
	// * 直接向环境中输出
}

/**
 * 玩家配置：AgentLinly/操作注册
 * * 主要思路：「发信息」
 *   * 承载的「操作映射」——可能「单操作不同参数」也可「不同操作」
 *     * 后者可作为「受控变量」进行实验（用以弄清NARS对「操作执行」的处理机制）
 *
 * TODO: 后续完善注册逻辑
 */
export const AgentLinly_registerOperations = (
	extraConfig: ExtraLCExperimentConfig,
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

/** 总配置 */
const configConstructor = (
	// 额外参数 //
	extraConfig: ExtraLCExperimentConfig
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

			// 构造参数 // * 现在默认就3×3，只是为了容纳玩家而已（玩家并不行动，只是「站那儿说话」）
			const SIZES: iPointVal = new iPoint(3, 3)

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
			// 注册 //
			maps.push(new Map_V1('model', storage))

			return maps
		},
		// 实体初始化：读取配置本身
		initExtraEntities(config, host): Entity[] {
			const entities: Entity[] = []
			// TODO: 待明晰
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
		// 第一个玩家AgentLinly
		AgentLinly(extraConfig, 1),
	],
})

export default configConstructor
