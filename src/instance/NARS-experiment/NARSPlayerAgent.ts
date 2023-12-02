import IMatrix from 'matriangle-api/server/main/IMatrix'
import {
	DictionaryLikeObject,
	normalShannonEntropy,
	randomIn,
	countIn,
	mapObjectKey,
	iPoint,
	randomBoolean2,
} from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import { BATR_DEFAULT_PLAYER_CONTROL_CONFIGS } from 'matriangle-mod-bats'
import { IMessageRouter, getAddress } from 'matriangle-mod-message-io-api'
import {
	NARSOperationRecordFull,
	NARSOperationResult,
	NARSOperationRecord,
	isOperationFullSpontaneous,
	NARSOperation,
	WebNARSOutputJSON,
	WebNARSOutput,
	NARSOutputType,
	isNARSOperation,
	NarseseCopulas,
	NarsesePunctuation,
	NarseseTenses,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import FeedbackController from 'matriangle-mod-nar-framework/program/FeedbackController'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { AIPlayerEvent } from 'matriangle-mod-native/entities/player/controller/AIController'
import {
	NativePlayerEvent,
	PlayerEvent,
	NativePlayerEventOptions,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import KeyboardControlCenter, {
	generateBehaviorFromPlayerConfig,
} from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import WebController from 'matriangle-mod-web-io/controller/WebController'
import { NARSEnv } from './NARSEnv'
import { NARSPlayerConfig } from './config/API'

/** NARS智能体的统计数据 */
export interface NARSAgentStats {
	// 统计数据 //
	/** 总时间：实验全程总时长（秒） */
	总时间: uint
	/** 总次数：实验全程小车的成功次数与失败次数之和 */
	总次数: uint // * 即「总操作次数」
	自主操作次数: uint // * 激活率 = 自主操作次数 / 总操作次数
	自主成功次数: uint // 自主操作 && 成功
	/** 总成功次数：实验全程小车遇到障碍物未发生碰撞的总次数 */
	总成功次数: uint // * 成功率 = 总成功次数 / 总操作次数
	/** 总失败次数：实验全程小车遇到障碍物发生碰撞的总次数 */
	//  总失败次数: uint = 0 // * 总失败次数 = 总操作次数 - 总成功次数
	/** 成功率：实验全程小车的成功次数与总次数之比 */
	/** 激活率：实验全程 OpenNARS 持续运动的频率 */
	/**
	 * 🆕用于显示「最后一次自主操作」的发生时刻
	 * * 🎯便于统计「首次激活时间」
	 * * 📌具有累积性
	 */
	最后一次自主操作时刻: uint
	/**
	 * 🆕用于显示「最后一次教学操作」的发生时刻
	 * * 🎯便于统计「末次教学时间」
	 * * 📌具有累积性
	 */
	最后一次教学操作时刻: uint
}

/**
 * 用于管理「NARS玩家」的「NARS玩家代理」
 *
 * !【2023-10-30 22:23:01】注意：不是也不会是「玩家」
 *
 * TODO: 是否需要「继承玩家」然后「让所有配置都实现一遍『NARS智能体』」才罢休？
 * TODO: 💭现在有了图形化显示端，或许可以尝试真的「继承玩家」然后做一些「特色显示」？
 */
export class NARSPlayerAgent {
	// NARS相关
	/**
	 * 已注册的操作
	 * * 元素格式：`[^left, {SELF}, x]`，代表
	 *   * OpenNARS输出`^left([{SELF}, x])`
	 *   * 语句`<(*, {SELF}, x) --> ^left>` / `(^left, {SELF}, x)`
	 */ //
	public readonly registeredOperations: [string, ...string[]][] = []
	/** 存储形如「^left([{SELF}, x])」的字串以便快速识别 */
	public readonly registeredOperation_outputs: string[] = []
	// 两个计时器变量
	protected _goalRemindRate: uint = 0
	protected _babbleRate: uint = 0
	/** 存储「上一个操作是否自发」 */
	protected _lastOperationSpontaneous: boolean = false
	/** 数据只读 */
	public get lastOperationSpontaneous(): boolean {
		return this._lastOperationSpontaneous
	}
	/**
	 * 操作历史
	 *
	 * @type 元素类型：`[所做操作, 是否自主, 是否成功]`
	 * * 所做操作：同{@link NARSOperation}
	 * * 是否自主：`true`代表自主操作，`false`代表被动操作
	 * * 是否成功：`true`代表成功，`false`代表失败
	 */
	protected _operationHistory: NARSOperationRecordFull[] = []

	// 自定义数据 //
	/**
	 * 存储「自定义数据」
	 * * 🎯存储因具体实验而异，但的确需要「分智能体存储」的数据
	 *   * 特别适合「需要在智能体上存储临时变量，但又不想给智能体加属性（修改这个文件）」的情况
	 * * 例如：
	 *   * 「能量包收集」实验中需要的「前进频率」时钟变量
	 *   * 「能量包收集」实验中需要的「上一次奖励后所过时间颗粒数」时钟变量
	 *
	 * ! 其中各属性的「存在性」「类型」都需要自己去检查
	 */
	public customDatas: DictionaryLikeObject = {}

	// 统计数据 //
	/** 有关「NARS运行状态」「智能体表现状态」的统计数据 */
	protected readonly stats: NARSAgentStats = {
		/** 总时间：实验全程总时长（AI刻） */
		总时间: 0,
		/** 总次数：实验全程小车的成功次数与失败次数之和 */
		总次数: 0, // * 即「总操作次数」
		自主操作次数: 0, // * 激活率 = 自主操作次数 / 总操作次数
		自主成功次数: 0, // 自主操作 && 成功
		/** 总成功次数：实验全程小车遇到障碍物未发生碰撞的总次数 */
		总成功次数: 0, // * 成功率 = 总成功次数 / 总操作次数
		/** 总失败次数：实验全程小车遇到障碍物发生碰撞的总次数 */
		//  总失败次数:0, // * 总失败次数 = 总操作次数 - 总成功次数
		/** 成功率：实验全程小车的成功次数与总次数之比 */
		/** 激活率：实验全程 OpenNARS 持续运动的频率 */
		最后一次自主操作时刻: 0,
		最后一次教学操作时刻: 0,
	}

	/**
	 * 记录一条统计数据：试验结果
	 */
	public recordStat(result: NARSOperationResult, spontaneous: boolean): void {
		// * 算入「上一次执行时间」无需「操作有结果」
		if (spontaneous)
			// 记录时刻
			this.stats.最后一次自主操作时刻 = this.stats.总时间
		// 记录时刻
		else this.stats.最后一次教学操作时刻 = this.stats.总时间
		// ! 计入「操作次数」必须是「操作有结果」的时候
		if (result === undefined) return
		// 总次数递增
		this.stats.总次数++
		if (result === true)
			// 总成功次数递增
			this.stats.总成功次数++
		if (spontaneous) {
			// 自主操作次数递增
			this.stats.自主操作次数++ // ?【2023-11-07 01:33:29】这里所谓「自主操作」可能不再纯粹是「自己做出了操作」，有可能指「得到能量包的行为是自己做出的」而非「真实反应NARS的`EXE`数目」
			if (result === true) {
				// 自主成功次数递增
				this.stats.自主成功次数++
			}
		}
	}

	/**
	 * 可视化操作历史（整体版）
	 * * 不管其「是否自主」，均会将「操作历史」直接以线性方式展开
	 *
	 * @example left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> right_{SELF}_y-#F -> left_{SELF}_y-@F -> left_{SELF}_z-#S -> left_{SELF}_y-@S -> left_{SELF}_y-@F -> right_{SELF}_x-#S -> left_{SELF}_z-@S -> left_{SELF}_y-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_z-@S -> left_{SELF}_x-#S -> left_{SELF}_y-@S -> left_{SELF}_x-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_z-#S -> left_{SELF}_y-@S -> left_{SELF}_y-@F -> right_{SELF}_x-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> right_{SELF}_z-@S -> left_{SELF}_z-#S -> right_{SELF}_z-@S -> right_{SELF}_z-#F -> right_{SELF}_x-@F -> left_{SELF}_z-#S
	 */
	public visualizeOperationHistoryFull(separator: string = ' -> '): string {
		return this._operationHistory
			.map(
				// map方法保留数组各元素之间的顺序，参见：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map
				record =>
					this.config.dataShow.operationHistory.visualizeOperationRecordFull(
						record
					)
			)
			.join(separator)
	}

	/**
	 * 可视化操作历史（分自主版）
	 * * 以「自主」和「非自主」将输出分成两行
	 *   * 第一行为「自主」
	 *   * 第二行为「非自主」
	 *
	 * @example
	 * 自主操作：
	 * right_{SELF}(580) -> left_{SELF} -> right_{SELF}(41) -> left_{SELF} -> right_{SELF}(205) -> left_{SELF} -> right_{SELF}
	 * 教学操作：
	 * right_{SELF}(4) -> left_{SELF} -> right_{SELF}(3) -> left_{SELF} -> right_{SELF} -> left_{SELF}(3) -> right_{SELF}(4) -> left_{SELF} -> right_{SELF} -> left_{SELF}(3) -> right_{SELF} -> left_{SELF} -> right_{SELF}(2) -> left_{SELF}
	 */
	public visualizeOperationHistorySeparated(
		spontaneousPrefix: string = '',
		unconsciousPrefix: string = '',
		spontaneousSeparator: string = ' -> ',
		unconsciousSeparator: string = ' -> '
		// ! 后续「合并相同历史の输出」的功能是硬编码进去的——同时这还破坏了「增量性」」
	): string {
		// let result_str_s: string = spontaneousPrefix
		// let result_str_u: string = unconsciousPrefix
		// ?【2023-11-07 03:22:47】为何不采用「预生成数组」的方式呢
		const records_s: [string, uint][] = []
		const records_u: [string, uint][] = []
		const current_record: NARSOperationRecord = [[''], undefined]
		let currentRecord_str: string
		for (const recordFull of this._operationHistory) {
			// 剥去「自主/非自主」属性
			current_record[0] = recordFull[0]
			current_record[1] = recordFull[1] // ! 索引[1]对应「操作结果」
			// 预先处理记录
			currentRecord_str =
				this.config.dataShow.operationHistory.visualizeOperationRecord(
					current_record
				)
			// ! 索引[2]对应「是否自主」 //
			// * 自主
			if (recordFull[2]) {
				// 与记录（若有）的最后一个相同⇒相应地方计数器+1
				if (
					records_s.length > 0 &&
					currentRecord_str === records_s[records_s.length - 1][0]
				)
					records_s[records_s.length - 1][1]++
				// 若异⇒新增
				else {
					/* // 分隔符
					if (records_s.length > 0) {
						result_str_s += spontaneousSeparator
						// 字串更新
						result_str_s +=
							records_s[records_s.length - 1][0] +
							`(${records_s[records_s.length - 1][1]})`
					} */
					// 数据更新
					records_s.push([currentRecord_str, 1])
				}
			} else {
				// 与记录（若有）的最后一个相同⇒相应地方计数器+1
				if (
					records_u.length > 0 &&
					currentRecord_str === records_u[records_u.length - 1][0]
				)
					records_u[records_u.length - 1][1]++
				// 若异⇒更新&新增
				else {
					/* // 分隔符
					if (records_u.length > 0) {
						result_str_u += unconsciousSeparator
						// 字串更新
						result_str_u +=
							records_u[records_u.length - 1][0] +
							`(${records_u[records_u.length - 1][1]})`
					} */
					// 数据更新
					records_u.push([currentRecord_str, 1])
				}
			}
		}
		// 最后加上换行符
		return (
			spontaneousPrefix +
			records_s
				.map(this._temp_visualizeOperationHistorySeparated_mapF)
				.join(spontaneousSeparator) +
			'\n' +
			unconsciousPrefix +
			records_u
				.map(this._temp_visualizeOperationHistorySeparated_mapF)
				.join(unconsciousSeparator)
		)
	}
	protected readonly _temp_visualizeOperationHistorySeparated_mapF = (
		item: [string, uint]
	): string => item[0] + (item[1] > 1 ? `(${item[1]})` : '')

	/**
	 * 计算「操作历史」的「自主/教学操作多样性」
	 * * 取值范围：0~1
	 * * 核心算法：归一化香农熵
	 */
	public calculateOperationHistoryDiversity(spontaneous: boolean): number {
		return this._operationHistory.length > 0
			? normalShannonEntropy(
					this._operationHistory
						.filter(
							(record: NARSOperationRecordFull): boolean =>
								record[2] === spontaneous
						)
						.map((record: NARSOperationRecordFull): string =>
							record[0].join('')
						)
			  )
			: 0
	}

	/**
	 * 判断「已注册操作」中是否有指定的操作符
	 * @param operator 操作符 // ! 带尖号「^0」
	 */
	public hasRegisteredOperator(operator: string): boolean {
		// 遍历所有已注册操作
		for (const registeredOperation of this.registeredOperations) {
			// 若操作符相同
			if (registeredOperation[0] === operator) return true
		}
		// 找不到
		return false
	}
	/** 等概率获取随机已注册操作 */
	public randomRegisteredOperation(): [string, ...string[]] {
		return randomIn(this.registeredOperations)
	}

	/**
	 * 构造函数
	 * *【2023-10-30 21:32:26】目前大多数参数都是从旧「NARSEnv」的全局变量引入的
	 */
	public constructor(
		/** 所处在的NARS环境 */
		public env: NARSEnv,
		host: IMatrix,
		/** 所控制的玩家 */
		public player: IPlayer,
		/** 所持有的「玩家配置」 */
		public config: NARSPlayerConfig,
		/** 所连接的「消息路由器」 */
		public router: IMessageRouter,
		ctlWeb: WebController,
		kcc: KeyboardControlCenter
	) {
		// 读秒时钟（用于统一「激活率」指标，并统一图表）

		console.warn('config =', config)
		// 网络控制器：增加连接
		ctlWeb.addConnection(
			player,
			// 用于「Web控制器」
			config.connections.controlKey
		)

		// 按键绑定
		kcc.addKeyBehaviors(
			generateBehaviorFromPlayerConfig(
				player,
				BATR_DEFAULT_PLAYER_CONTROL_CONFIGS[1]
			)
		)

		// 连接：键控中心 - 消息路由器
		router.registerService(
			env.config.connections.controlService.constructor(
				env.config.connections.controlService.host,
				env.config.connections.controlService.port,
				// * 消息格式：`|+【按键代码】`（按下⇒前导空格）/`|【按键代码】`（释放⇒原样）
				// ! 使用「前导`|`」区分「控制指定玩家」和「输送至键控中心」
				(message: string): undefined =>
					this.dealKeyboardCenterMessage(kcc, message)
			),
			(): void => {
				console.log('键控中心连接成功！')
			}
		)

		// 连接：数据显示服务
		router.registerService(
			config.connections.dataShow.constructor(
				config.connections.dataShow.host,
				config.connections.dataShow.port,
				/**
				 * 消息回调=初始化：回传「配置信息」
				 * * 初始配置：
				 *   * 消息格式：`JSON.stringify(NARSPlotData)`
				 */
				(message: string): string =>
					this.dealDataShowMessage(env, message)
			)
		)

		// NARS参数 //
		// 原类内初始化
		this._lastNARSOperated = this.config.timing.babbleThreshold // * 默认一开始就进行babble
		this.teachingTimeLasting = this.config.timing.teachingTime
		/** 对接的是NARS的逻辑 */
		const ctlFeedback: FeedbackController = new FeedbackController('NARS')
		/** AI执行速度 = 单位执行速度 */
		ctlFeedback.AIRunSpeed = config.timing.unitAITickSpeed

		// 消息接收
		router.registerService(
			config.connections.NARS.constructor(
				config.connections.NARS.host,
				config.connections.NARS.port,
				// * 从NARS接收信息 * //
				(message: string): undefined =>
					this.onNARSMessage(host, player, message)
			),
			(): void =>
				console.log(
					`${getAddress(
						config.connections.NARS.host,
						config.connections.NARS.port
					)}：NARS连接成功！`
				)
		)

		// 消息发送
		this.send2NARS = (message: string): void => {
			// ! 这里实际上是「以客户端为主体，借客户端发送消息」
			this.router.sendMessageTo(
				this.config.connections.NARS.host,
				this.config.connections.NARS.port,
				message
			)
			// * 向NARS发送Narsese * //
			console.log(`Message sent: ${message}`)
		}

		// 反馈控制器⇒消息路由 // * 事件反馈
		// AI 初始化
		ctlFeedback.on(AIPlayerEvent.INIT, this.onAIEvent_Init.bind(this))
		// AI 运作周期
		ctlFeedback.on(AIPlayerEvent.AI_TICK, this.onAIEvent_Tick.bind(this))
		// 响应动作执行 //
		ctlFeedback.on(
			NativePlayerEvent.PRE_ACTION,
			this.onAIEvent_PreAction.bind(this)
		)
		// 默认事件处理
		ctlFeedback.on(null, this.onAIEvent_Fallback.bind(this))

		// 连接到控制器
		player.connectController(ctlFeedback)
	}

	/**
	 * 现实读秒
	 */
	protected tickSecond(router: IMessageRouter): void {
		// 生成实验数据
		const experimentData = {
			x: this.stats.总时间,
			成功率: this.stats.总成功次数 / this.stats.总次数,
			教学成功率:
				(this.stats.总成功次数 - this.stats.自主成功次数) /
				(this.stats.总次数 - this.stats.自主操作次数),
			自主成功率: this.stats.自主成功次数 / this.stats.自主操作次数,
			激活率:
				countIn(isOperationFullSpontaneous, this._operationHistory) /
				this.stats.总时间,
			自主操作多样性: this.calculateOperationHistoryDiversity(true),
			教学操作多样性: this.calculateOperationHistoryDiversity(false),
		}
		// 发送到「图表服务」
		router.sendMessageTo(
			this.config.connections.dataShow.host,
			this.config.connections.dataShow.port,
			JSON.stringify(
				mapObjectKey(experimentData, this.config.dataShow.dataNameMap)
			)
		)
		// 发送「文字信息」
		router.sendMessageTo(
			this.config.connections.dataShow.host,
			this.config.connections.dataShow.port,
			'|' +
				`<${this.player.customName}>:\n` +
				this.visualizeOperationHistorySeparated(
					this.config.dataShow.operationHistory
						.spontaneousPrefixName +
						` (t_last = ${this.stats.最后一次自主操作时刻}):\n`,
					this.config.dataShow.operationHistory
						.unconsciousPrefixName +
						` (t_last = ${this.stats.最后一次教学操作时刻}):\n`
				)
		)
		// 时间推进 //
		this.stats.总时间++
	}
	/**
	 * 读秒时钟在接收setInterval时的ID
	 * * 🎯让数据记录在「NARS连接成功」后方开始记录
	 *
	 * ! 这里ID「在浏览器端和在Node端类型不确定」是老问题了
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected _tickSecond_ID: any = undefined
	/** 开始「读秒时钟」 */
	public startTickSecond(): void {
		// * 已启动就不会再启动一次
		if (!this._tickSecond_ID)
			this._tickSecond_ID = setInterval(
				(): void => this.tickSecond(this.router),
				1000
			)
	}
	/** 停止「读秒时钟」 */
	public stopTickSecond(): void {
		// * 已停止就不会再停止一次
		if (this._tickSecond_ID)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			this._tickSecond_ID = clearInterval(this._tickSecond_ID)
	}

	/**
	 * 处理键控中心消息
	 * @param kcc 所连接的键控中心
	 * @param message 从消息路由器处收到的消息
	 */
	protected dealKeyboardCenterMessage(
		kcc: KeyboardControlCenter,
		message: string
	): undefined {
		if (message[0] !== '|') return
		// * 有加号⇒按下
		if (message[1] === '+') kcc.onPress(message.slice(2))
		// * 无加号⇒释放
		else kcc.onRelease(message.slice(1))
	}

	/**
	 * 处理「数据显示服务」消息
	 */
	protected dealDataShowMessage(env: NARSEnv, message: string): string {
		// 具体「消息源」参考`src/instance/VueUI-V1/src/ui/DataPanel.vue#L247`
		switch (message) {
			// 'request-config' => 图表配置
			case 'request-config':
				return JSON.stringify(env.config.plot.initialOption)
			// 'request-info' => 基本信息
			case 'request-info':
				// ! `i`为前缀 // 可参考`src/instance/VueUI-V1/src/ui/DataPanel.vue#175`
				return 'i' + env.config.info(env.config)
			// 否则 => 空信息 + 并控制台报错
			default:
				console.error(`数据显示服务：无效的消息「${message}」`)
				return ''
		}
	}

	// 对接NARS操作 //
	/**
	 * 对接配置中的操作
	 *
	 * @param self 当前玩家
	 * @param host 世界母体
	 * @param operation NARS操作
	 * @param spontaneous 是否为「自主操作」
	 */
	protected operateEnv(
		self: IPlayer,
		host: IMatrix,
		operation: NARSOperation,
		spontaneous: boolean
	): NARSOperationResult {
		// !【2023-11-07 01:00:20】（新）设置一个「背景状态」：把「该操作（作为『上一个操作』）是否自主」存到「NARS智能体」中
		this._lastOperationSpontaneous = spontaneous
		// * 显示反映：自发⇒绿色，非自发⇒原色
		self.setColor(
			spontaneous
				? this.config.attributes.appearance.active.lineColor
				: this.config.attributes.appearance.babble.lineColor,
			spontaneous
				? this.config.attributes.appearance.active.fillColor
				: this.config.attributes.appearance.babble.fillColor
		)
		// 执行操作，返回结果
		this._temp_lastOperationResult = this.config.behavior.operate(
			this.env,
			this,
			this.config,
			host,
			operation,
			// 自动获取操作索引
			this.registeredOperation_outputs.indexOf(
				this.config.NAL.op_output(operation)
			),
			this.send2NARS
		)
		// * 计入「操作历史」
		this._operationHistory.push([
			operation,
			this._temp_lastOperationResult,
			spontaneous,
		])
		// * 统计，只有在「有结果」的时候算入「总次数」或者「总触发次数」（必须只有「成功/失败」）
		this.recordStat(this._temp_lastOperationResult, spontaneous)
		return this._temp_lastOperationResult
	}
	/** 上一次操作的结果 */
	private _temp_lastOperationResult: NARSOperationResult

	// 接收消息 //
	/**
	 * 从NARS接收信息
	 * * 🚩处理NARS服务器（BabelNAR）回传的消息
	 */
	protected onNARSMessage(
		host: IMatrix,
		player: IPlayer,
		message: string
	): undefined {
		// 解析JSON，格式：[{"interface_name": XXX, "output_type": XXX, "content": XXX}, ...]
		const output_datas: WebNARSOutputJSON = JSON.parse(
			message
		) as WebNARSOutputJSON // !【2023-10-20 23:30:16】现在是一个数组的形式
		// 处理
		for (
			let i: uint = 0, output_data: WebNARSOutput;
			i < output_datas.length;
			i++
		) {
			output_data = output_datas[i]
			// console.log(
			// 	`received> ${output_data?.interface_name}: [${output_data?.output_type}] ${output_data?.content}`,
			// 	output_data
			// )
			if (typeof output_data.output_type === 'string')
				switch (output_data.output_type) {
					case NARSOutputType.IN:
						break
					case NARSOutputType.OUT:
						break
					case NARSOutputType.ERROR:
						break
					case NARSOutputType.ANSWER:
						break
					case NARSOutputType.ACHIEVED:
						break
					case NARSOutputType.EXE:
						if (isNARSOperation(output_data?.output_operation))
							this.exeHandler(
								player,
								host,
								output_data.output_operation
							)
						break
					// 跳过
					case NARSOutputType.INFO:
					case NARSOutputType.COMMENT:
						break
				}
		}
	}

	// NARS参数 //
	// !【2023-12-02 23:17:32】现在因为「浏览器端兼容」问题，不建议在类内初始化与`this`有关的值（错误如`TypeError: Cannot read properties of undefined (reading 'timing')`）
	protected _lastNARSOperated: uint
	/** 距离「上一次NARS发送操作」所过的单位时间 */
	public get lastNARSOperated(): uint {
		return this._lastNARSOperated
	}
	/** 当前教学「所剩时间」（Babble「不被NARS操作所抑制」的阶段） */
	protected teachingTimeLasting: uint

	/**
	 * 处理NARS传来的「操作」
	 * *【2023-11-05 01:23:02】目前直接使用自BabelNAR包装好的「NARS操作」类型
	 */
	protected exeHandler(
		self: IPlayer,
		host: IMatrix,
		operation: NARSOperation
	): void {
		// 现在直接有NARSOperation对象
		console.info(
			`操作「${this.config.NAL.op_output(operation)}」已被接收！`
		)
		// 执行
		switch (this.operateEnv(self, host, operation, true)) {
			// 成功
			case true:
				console.info(
					`自主操作「${this.config.NAL.op_output(
						operation
					)}」执行成功！`
				)
				break
			// 失败
			case false:
				console.info(
					`自主操作「${this.config.NAL.op_output(
						operation
					)}」执行失败！`
				)
				break
			// 无结果：无需处理
			default:
				break
		}
		// 清空计时
		this._lastNARSOperated = 0
		/* // 数据收集统计 // !【2023-11-07 01:34:45】不再忠实反映「NARS的`EXE`数」
			this.stats.自主操作次数++ */
	}
	/** 辅助初始化工具：坐标指针 */
	protected posPointer: iPoint = new iPoint()

	/** 发送消息 */
	protected send2NARS: (message: string) => void

	/** 处理控制器事件：AI初始化 */
	protected onAIEvent_Init(
		event: PlayerEvent,
		self: IPlayer,
		host: IMatrix
	): void {
		// 消息列表 //
		const messages: string[] = []
		// 消息生成

		/**
		 * 生成一个回调函数，在配置中被调用，以实现「插入循环」的效果
		 *
		 * @param op 操作符
		 * @param tellToNARS 是否告诉NARS「我有这个操作」
		 */
		const registerOperation = (
			op: NARSOperation,
			tellToNARS: boolean
		): void => {
			// 注册操作符
			if (!this.hasRegisteredOperator(op[0]))
				messages.push(
					// !【2023-11-05 02:29:18】现在开始接入NAVM的「REG」指令
					this.config.NAL.generateOperatorRegToCIN(
						op[0].slice(1) /* 去掉开头的尖号 */
					)
				) // 负/正 方向移动
			// 注册内部状态
			this.registeredOperations.push(op)
			this.registeredOperation_outputs.push(this.config.NAL.op_output(op))
			// * （当「需要告知NARS」时）将操作符与自身联系起来
			if (tellToNARS)
				messages.push(
					this.config.NAL.generateNarseseToCIN(
						// * 样例：`<{SELF} --> (^left, {SELF}, x)>.` | `<{SELF} --> <(*, {SELF}, x) --> ^left>>.`
						this.config.NAL.generateCommonNarseseBinary(
							this.config.NAL.SELF,
							NarseseCopulas.Inheritance,
							this.config.NAL.op_input(op),
							NarsesePunctuation.Judgement,
							NarseseTenses.Eternal,
							this.config.NAL.positiveTruth
						)
					)
				)
		}
		// 调用配置
		this.config.behavior.init(
			this.env,
			event,
			self,
			this.config,
			host,
			(message: string): void => void messages.push(message),
			registerOperation
		)
		// 消息发送
		for (let i = 0; i < messages.length; ++i) this.send2NARS(messages[i])
		// 清空消息
		messages.length = 0
	}

	/** 处理控制器事件：AI刻 */
	protected onAIEvent_Tick(
		event: PlayerEvent,
		self: IPlayer,
		host: IMatrix
	): void {
		// 可配置的AI刻逻辑 //
		this.config.behavior.AITick(
			this.env,
			event,
			this,
			this.config,
			host,
			this.posPointer,
			this.send2NARS
		)
		// 提醒目标 //
		if (this._goalRemindRate-- === 0) {
			this._goalRemindRate = this.config.timing.goalRemindRate
			// 先提醒正向目标
			for (const goal of this.config.NAL.POSITIVE_GOALS)
				this.send2NARS(
					this.config.NAL.generateNarseseToCIN(
						this.config.NAL.generateCommonNarseseBinary(
							this.config.NAL.SELF,
							NarseseCopulas.Inheritance,
							goal,
							NarsesePunctuation.Goal,
							NarseseTenses.Present,
							this.config.NAL.positiveTruth
						)
					)
				)
			// `<${config.NAL.SELF} --> ${goal}>! :|: ${config.NAL.positiveTruth}`
			// 再提醒负向目标 // ? 到底是「真值の负向」还是「否定の负向」
			for (const goal of this.config.NAL.NEGATIVE_GOALS)
				this.send2NARS(
					this.config.NAL.generateNarseseToCIN(
						this.config.NAL.generateCommonNarseseBinary(
							this.config.NAL.SELF,
							NarseseCopulas.Inheritance,
							goal,
							NarsesePunctuation.Goal,
							NarseseTenses.Present,
							this.config.NAL.negativeTruth
						)
					)
				)
			// ?【2023-10-30 21:51:57】是否要把目标的配置再细化一些，比如「不同目标不同周期/正负性」之类的
		}
		// Babble机制 //
		if (
			// 教学时间
			this.teachingTimeLasting > 0 ||
			// 无事babble
			this._lastNARSOperated > this.config.timing.babbleThreshold
		)
			if (this._babbleRate-- === 0) {
				// 重置rate
				this._babbleRate = this.config.timing.babbleRate
				// 概率触发
				if (
					this.config.timing.babbleProbability === undefined ||
					// 非空则按概率触发
					randomBoolean2(this.config.timing.babbleProbability)
				) {
					// 从函数（教法）中选一个操作⇒进行「无意识操作」
					const babbleOp: NARSOperation = this.config.behavior.babble(
						this.env,
						this,
						this.config,
						host
					)
					// 让系统知道「自己做了操作」 // *形式：<(*, 【其它参数】) --> 【带尖号操作符】>. :|: 【正向真值】
					this.send2NARS(
						this.config.NAL.generateNarseseToCIN(
							this.config.NAL.generateCommonNarseseBinary(
								`(*, ${babbleOp.slice(1).join(', ')})`,
								NarseseCopulas.Inheritance,
								babbleOp[0],
								NarsesePunctuation.Judgement,
								NarseseTenses.Present,
								this.config.NAL.positiveTruth
							)
						)
					)
					// 执行操作
					this.operateEnv(self, host, babbleOp, false)
				}
			}
		// 操作计数 //
		this._lastNARSOperated++
		// 教学时间流逝：减少到零就停止 //
		if (this.teachingTimeLasting > 0) this.teachingTimeLasting--
		// !【2023-11-25 20:39:05】现在变成按「绝对时间」读秒
	}

	/**
	 * 处理控制器事件：响应AI执行前事件
	 * * 【2023-11-10 19:24:19】最初被用于「键盘按键⇒无意识操作」的转换
	 */
	protected onAIEvent_PreAction(
		event: PlayerEvent,
		self: IPlayer,
		host: IMatrix,
		otherInf: NativePlayerEventOptions[NativePlayerEvent.PRE_ACTION]
	): void {
		/**
		 * 获取「行为映射」的回应
		 * * `undefined`⇒「放行」，这时不会`operate`也不会触发其它行为
		 * * `null`⇒「阻断」，这时不会执行「将执行的『玩家行为』」
		 * * `NARSOperation`⇒「映射并（等同于）操作」，这时不执行「将执行的『玩家行为』」并用`operate(对应操作)`替代
		 */
		const reply: NARSOperation | null | undefined =
			this.config.behavior.actionReplacementMap(
				this.env,
				event,
				this,
				this.config,
				host,
				otherInf.action
			)
		// * undefined⇒放行
		if (reply === undefined) return
		// * null⇒阻断
		if (reply === null) {
			// 修改「阻断」配置
			otherInf.prevent = true
			//返回
			return
		}
		// * 否则即「玩家操作」⇒执行操作并阻断默认执行
		else {
			// 修改「阻断」配置
			otherInf.prevent = true
			// 阻断自然babble
			this._babbleRate = this.config.timing.babbleThreshold
			// 执行返回的操作
			this.operateEnv(
				self,
				host,
				reply,
				false // ! 非自主操作
			)
		}
	}

	/**
	 * 处理控制器事件：响应其它AI事件
	 * * 【2023-11-10 19:24:19】最初被用于「键盘按键⇒无意识操作」的转换
	 */
	protected onAIEvent_Fallback(
		event: PlayerEvent,
		self: IPlayer,
		host: IMatrix
	): void {
		return this.config.behavior.fallFeedback(
			this.env,
			event,
			this,
			this.config,
			host,
			this.send2NARS
		)
	}
}
