import { int, uint } from 'matriangle-legacy/AS3Legacy'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import {
	BATR_DEFAULT_PLAYER_CONTROL_CONFIGS,
	BATR_TOOL_USAGE_MAP as BATR_TOOL_USAGE_MAP,
	getRandomMap,
} from 'matriangle-mod-bats/mechanics/BatrMatrixMechanics'
import { projectEntities } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { respawnAllPlayer } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import WorldRegistry_V1 from 'matriangle-mod-bats/registry/Registry_Batr'
import Matrix_V1 from 'matriangle-mod-native/main/Matrix_V1'
import {
	listE列举实体,
	matrixV母体可视化,
} from 'matriangle-mod-visualization/textVisualizations'
import {
	TICK_TIME_MS,
	TPS,
} from 'matriangle-api/server/main/GlobalWorldVariables'
import {
	mapObjectKey,
	mergeMaps,
	mergeMultiMaps,
	randomIn,
} from 'matriangle-common/utils'
import { iPoint } from 'matriangle-common/geometricTools'
import MatrixVisualizer from 'matriangle-mod-visualization/web/MatrixVisualizer'
import BlockEventRegistry from 'matriangle-api/server/block/BlockEventRegistry'
import { NATIVE_BLOCK_CONSTRUCTOR_MAP } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import IWorldRegistry from 'matriangle-api/server/registry/IWorldRegistry'
import IMap from 'matriangle-api/server/map/IMap'
import { ProgramMessageRouter } from 'matriangle-mod-message-io-api/MessageRouter'
import WebController from 'matriangle-mod-web-io/controller/WebController'
import KeyboardControlCenter, {
	generateBehaviorFromPlayerConfig,
} from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import MatrixRule_V1 from 'matriangle-mod-native/rule/MatrixRule_V1'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import Player_V1 from 'matriangle-mod-native/entities/player/Player_V1'
import FeedbackController from 'matriangle-mod-nar-framework/program/FeedbackController'
import { AIPlayerEvent, PlayerEvent } from 'matriangle-mod-native'
import { NARSOperation, PyNARSOutputType } from 'matriangle-mod-nar-framework'
import {
	IMessageRouter,
	IMessageService,
	MessageCallback,
	getAddress,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import {
	NARSEnvConfig,
	NARSPlayerConfig,
	NARSPlayerConfigs,
	ServiceConfig,
} from './config/API'

// 网络通信
/** 解包格式 */
type WebNARSOutput = {
	interface_name?: string
	output_type?: string
	content?: string
}
/** NARS通过Web(Socket)传回的消息中会有的格式 */
type WebNARSOutputJSON = WebNARSOutput[]

/**
 * !【2023-10-30 14:53:21】现在使用一个类封装这些「内部状态」，让整个服务端变得更为「可配置化」
 */
export class NARSEnv {
	// 描述 //
	printInitDescription(): void {
		console.info(this.config.info(this.config).trim())
	}
	// 实验超参数 //

	/**
	 * 构造函数
	 * @param config 载入的环境配置
	 */
	constructor(public readonly config: NARSEnvConfig) {}

	// 规则 //
	initMatrixRule(): IMatrixRule {
		const rule = new MatrixRule_V1()
		rule.loadFromDefaultValueMap(MatrixRules_Native.DEFAULT_VALUE_MAP)

		// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
		// readonly MAPS = [...MULTI_DIM_TEST_MAPS, ...BatrDefaultMaps._ALL_MAPS]; // 【2023-10-09 21:12:37】目前是「多维度地图」测试
		const MAPS = this.config.map.initMaps()
		rule.setRule<Map<IMap, number>>(
			MatrixRules_Native.key_mapRandomPotentials,
			new Map()
		)
		for (const map of MAPS)
			rule.safeGetRule<Map<IMap, number>>(
				MatrixRules_Native.key_mapRandomPotentials
			).set(map, 1)
		// ! 不使用「奖励箱」、工具等机制

		return rule
	}

	// 注册表 //
	initWorldRegistry(): IWorldRegistry {
		const registry = new WorldRegistry_V1(
			// * 只需要原生的映射表
			mergeMultiMaps(
				new Map(),
				NATIVE_BLOCK_CONSTRUCTOR_MAP
			) as BlockConstructorMap,
			new BlockEventRegistry() // *【2023-10-08 17:51:25】使用原生的「方块事件列表」
		)
		mergeMaps(registry.toolUsageMap, BATR_TOOL_USAGE_MAP)
		return registry
	}

	/** 消息路由器 */
	readonly router: ProgramMessageRouter = new ProgramMessageRouter()

	/** 配置玩家 */
	setupPlayers(host: IMatrix, configs: NARSPlayerConfigs): void {
		// 配置统一的控制器、键控中心

		// Web控制器
		const ctlWeb: WebController = new WebController()
		ctlWeb.linkToRouterLazy(
			this.router,
			this.config.connections.controlService.host,
			this.config.connections.controlService.port,
			(messageCallback: MessageCallback): IMessageService =>
				this.config.connections.controlService.constructor(
					this.config.connections.controlService.host,
					this.config.connections.controlService.port,
					messageCallback
				)
		) // 连接到消息路由器
		const kcc: KeyboardControlCenter = new KeyboardControlCenter()
		// 增加实体
		host.addEntities(ctlWeb, kcc)

		// 配置所有NARS玩家
		// 在配置的时候添加玩家
		for (const config of configs)
			this.setupNARSPlayer(host, config, ctlWeb, kcc)
		// 让所有玩家「重生」
		respawnAllPlayer(host)
	}

	/** 配置玩家过程中出现的NARS连接 */
	readonly NARSMessageServices: ServiceConfig[] = []

	/** 配置NARS玩家 */
	setupNARSPlayer(
		host: IMatrix,
		config: NARSPlayerConfig,
		ctlWeb: WebController,
		kcc: KeyboardControlCenter
	): void {
		// 玩家
		const p: IPlayer = new Player_V1(
			this.matrix.map.storage.randomPoint,
			0,
			true,
			config.attributes.appearance.fillColor,
			config.attributes.appearance.lineColor
		)
		// 名字
		p.customName = config.attributes.name

		// 生命相关属性
		p.HP = config.attributes.health.initialHP
		p.maxHP = config.attributes.health.initialMaxHP
		p.heal = config.attributes.health.initialHeal
		p.lives = config.attributes.health.initialLives
		p.lifeNotDecay = config.attributes.health.lifeNotDecay

		// 注入智能体 // * 初始化控制器、路由器、连接和行为
		const agent: NARSPlayerAgent = new NARSPlayerAgent(
			this,
			host,
			p,
			config,
			this.router,
			ctlWeb,
			kcc
		)
		agent

		// *添加实体
		host.addEntities(p, this.router, ctlWeb, kcc)
	}

	/** 配置可视化 */
	setupVisualization(host: IMatrix): void {
		// 可视化信号
		const visualizer: MatrixVisualizer = new MatrixVisualizer(this.matrix)
		// 连接
		visualizer.linkToRouter(
			this.router,
			this.config.connections.displayService.host,
			this.config.connections.displayService.port,
			(messageCallback: MessageCallback): IMessageService =>
				this.config.connections.displayService.constructor(
					this.config.connections.displayService.host,
					this.config.connections.displayService.port,
					messageCallback
				)
		)

		// *添加实体
		host.addEntities(visualizer)
	}
	/** （总领）配置实体 */
	setupEntities(host: IMatrix): void {
		// 消息路由器
		host.addEntity(this.router)
		// 可视化
		this.setupVisualization(host)
		// 玩家
		this.setupPlayers(host, this.config.players)
	}

	// 母体 //
	readonly rule = this.initMatrixRule()
	readonly matrix = new Matrix_V1(
		this.rule,
		this.initWorldRegistry(),
		// ! 获取随机地图：只在「核心逻辑」之外干这件事
		getRandomMap(this.rule).copy(true)
	)

	/*
	 * 地址：http://127.0.0.1:3001
	 * 示例@前进：http://127.0.0.1:3001/?key=p2&action=moveForward
	 * 示例@开始使用工具：http://127.0.0.1:3001/?key=p2&action=startUsing
	 * 示例@停止使用工具：http://127.0.0.1:3001/?key=p2&action=stopUsing
	 * 示例@转向x+：http://127.0.0.1:3001/?key=p2&action=0
	 * 示例@转向前进x+：http://127.0.0.1:3001/?key=p2&action=-1
	 */

	// 预先测试：避免「异步报错无法溯源」的问题
	// for (let i: uint = 0; i < TPS * 1000; i++) matrix.tick();
	// 全速测试
	// while (true) matrix.tick();

	/** 一次迭代 */
	迭代(num: uint, visualize: boolean = true): void {
		// TPS次迭代
		for (let i: uint = 0; i < num; i++) {
			this.matrix.tick()
		}
		if (visualize) {
			// 可视化
			console.log(
				matrixV母体可视化(
					this.matrix.map.storage as MapStorageSparse,
					this.matrix.entities,
					6
				)
			)
			listE列举实体(this.matrix.entities, 5) // !【2023-10-05 17:51:21】实体一多就麻烦
		}
	}

	持续测试(i: int = 0, tick_time_ms: uint = 1000): void {
		/** 迭代次数，是一个常量 */
		const numIter: uint = (TPS * tick_time_ms) / 1000
		let t = i
		const id = setInterval((): void => {
			this.迭代(numIter, false /* 现在不再需要可视化 */)
			if (t === 0) clearInterval(id)
			t--
		}, tick_time_ms)
	}

	/** 返回一个「睡眠指定时长」的Promise */
	sleep(ms: uint): Promise<void> {
		return new Promise(
			(resolve: () => void): void => void setTimeout(resolve, ms)
		)
	}

	/**
	 * 等待（一个）服务连接
	 * * 使用异步等待，调用后立即执行并返回一个Promise
	 */
	async waitConnection(
		detectPeriodMS: uint,
		host: string,
		port: uint,
		messageNonactive: string = '连接未建立，尝试重连。',
		messageServiceNotFound: string = '消息服务未建立',
		messageSuccess: string = '连接建立成功！'
	): Promise<void> {
		const addressPrefix: string = `${getAddress(host, port)}:`
		// eslint-disable-next-line no-constant-condition
		while (true) {
			// 检测连接
			if (this.router.getServiceAt(host, port) !== undefined)
				if (this.router.getServiceAt(host, port)?.isActive) break
				else {
					console.warn(addressPrefix, messageNonactive)
					// 重连
					this.router.getServiceAt(host, port)?.stop()
					this.router.getServiceAt(host, port)?.launch()
				}
			else console.warn(addressPrefix, messageServiceNotFound)
			// 等待
			await this.sleep(detectPeriodMS)
		}
		console.info(addressPrefix, messageSuccess)
	}

	/**
	 * 测试启动入口
	 */
	async launch(): Promise<void> {
		// 打印描述 //
		this.printInitDescription()

		// 初始化母体 //
		console.groupCollapsed('初始化母体')
		// console.log(matrix);
		this.matrix.initByRule()
		// 加载实体
		this.setupEntities(this.matrix)
		// ! 必要的坐标投影
		projectEntities(this.matrix.map, this.matrix.entities)
		console.groupEnd()

		// 等待所有NARS连接 //
		console.groupCollapsed('等待所有NARS连接。。。')
		await Promise.allSettled(
			this.config.players.map(
				(p: NARSPlayerConfig): Promise<void> =>
					// 这时候已经开始立即执行了，但会返回一个Promise
					this.waitConnection(
						1000,
						p.connections.NARS.host,
						p.connections.NARS.port,
						'NARS连接未建立！',
						'NARS消息服务未建立！',
						'NARS连接建立成功!'
					)
			)
		)
		console.groupEnd()

		// 二次打印描述（避免错过） //
		this.printInitDescription()

		// 异步开始持续测试 //
		this.持续测试(-1, TICK_TIME_MS)

		// 结束 //
		// console.log('It is done.')
	}
}

/**
 * 用于管理「NARS玩家」的「NARS玩家代理」
 *
 * !【2023-10-30 22:23:01】注意：不是也不会是「玩家」
 *
 * TODO: 是否需要「继承玩家」然后「让所有配置都实现一遍『NARS智能体』」才罢休？
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
		env: NARSEnv,
		host: IMatrix,
		p: IPlayer,
		config: NARSPlayerConfig,
		router: IMessageRouter,
		ctlWeb: WebController,
		kcc: KeyboardControlCenter
	) {
		ctlWeb.addConnection(
			p,
			// 用于「Web控制器」
			config.connections.controlKey
		)

		// 按键绑定
		kcc.addKeyBehaviors(
			generateBehaviorFromPlayerConfig(
				p,
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
				(message: string): undefined => {
					if (message[0] !== '|') return
					// * 有加号⇒按下
					if (message[1] === '+') kcc.onPress(message.slice(2))
					// * 无加号⇒释放
					else kcc.onRelease(message.slice(1))
				}
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
				 * 消息回调=初始化：传入的任何消息都视作「初始数据获取请求」
				 * * 消息格式：`JSON.stringify(NARSPlotData)`
				 */
				(message: string): string =>
					JSON.stringify(env.config.plot.initialOption)
			)
		)

		// NARS参数 //
		/** 对接的是NARS的逻辑 */
		const ctlFeedback: FeedbackController = new FeedbackController('NARS')
		/** AI执行速度 = 单位执行速度 */
		ctlFeedback.AIRunSpeed = config.timing.unitAITickSpeed
		/** 距离「上一次NARS发送操作」所过的单位时间 */
		let lastNARSOperated: uint = config.timing.babbleThreshold // * 默认一开始就进行babble

		// 统计数据 //
		/** 总时间：实验全程总时长 */
		let 总时间: uint = 0
		/** 总次数：实验全程小车的成功次数与失败次数之和 */
		let 总次数: uint = 0 // * 即「总操作次数」
		let 自主操作次数: uint = 0 // * 激活率 = 自主操作次数 / 总操作次数
		let 自主成功次数: uint = 0 // 自主操作 && 成功
		/** 总成功次数：实验全程小车遇到障碍物未发生碰撞的总次数 */
		let 总成功次数: uint = 0 // * 成功率 = 总成功次数 / 总操作次数
		/** 总失败次数：实验全程小车遇到障碍物发生碰撞的总次数 */
		// let 总失败次数: uint = 0 // * 总失败次数 = 总操作次数 - 总成功次数
		/** 成功率：实验全程小车的成功次数与总次数之比 */
		/** 激活率：实验全程 OpenNARS 持续运动的频率 */

		// 对接NARS操作 //
		/**
		 * 对接配置中的操作
		 *
		 * @param self 当前玩家
		 * @param host 世界母体
		 * @param operation NARS操作
		 * @param spontaneous 是否为「自主操作」
		 */
		const operateEnv = (
			self: IPlayer,
			selfConfig: NARSPlayerConfig,
			host: IMatrix,
			operation: NARSOperation,
			spontaneous: boolean
		): boolean => {
			// 统计
			总次数++
			// 成功
			if (
				config.behavior.operate(
					env,
					self,
					selfConfig,
					host,
					operation,
					// 自动获取操作索引
					this.registeredOperation_outputs.indexOf(
						config.NAL.op_output(operation)
					),
					send2NARS
				)
			) {
				// 统计
				总成功次数++
				if (spontaneous) 自主成功次数++
				// 返回
				return true
			}
			return false
		}
		// 接收消息 //
		/** 处理NARS传来的「操作」 */
		const exeHandler = (
			self: IPlayer,
			host: IMatrix,
			output_content: string
		): void => {
			// 使用「^名称」从content提取操作符⇒执行
			/**
			 * * 目标样例：`EXE $0.25;0.12;0.83$ ^left([{SELF}, x轴方向])=null`
			 * @example
			 * 匹配结果：[
			 *     '^left([{SELF}, x轴方向])',
			 *     '^left',
			 *     '{SELF}, x轴方向',
			 *     index: 21,
			 *     input: 'EXE $0.25;0.12;0.83$ ^left([{SELF}, x轴方向])=null',
			 *     groups: undefined
			 * ]
			 */
			const match = output_content.match(/(\^\w+)\(\[(.+)\]\)/) // 带尖号，带参数
			if (match !== null && match.length > 2) {
				const operation: NARSOperation = [
					match[1],
					...match[2].split(', '),
				]
				// 索引2对应使用括号提取出来的对象
				console.info(
					`操作「${config.NAL.op_output(operation)}」已被接收！`
				)
				// 执行
				if (operateEnv(self, config, host, operation, true)) {
					console.info(
						`自主操作「${config.NAL.op_output(
							operation
						)}」执行成功！`
					)
				} else {
					console.info(
						`自主操作「${config.NAL.op_output(
							operation
						)}」执行失败！`
					)
				}
				// 清空计时
				lastNARSOperated = 0
				// 数据收集统计
				自主操作次数++
			}
		}
		// 消息接收
		router.registerService(
			config.connections.NARS.constructor(
				config.connections.NARS.host,
				config.connections.NARS.port,
				// * 从NARS接收信息 * //
				(message: string): undefined => {
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
								case PyNARSOutputType.IN:
									break
								case PyNARSOutputType.OUT:
									break
								case PyNARSOutputType.ERROR:
									break
								case PyNARSOutputType.ANSWER:
									break
								case PyNARSOutputType.ACHIEVED:
									break
								case PyNARSOutputType.EXE:
									if (output_data?.content)
										exeHandler(
											p, // TODO: 从「单智能体」过渡到「多智能体」
											host,
											output_data.content
										)
									break
								// 跳过
								case PyNARSOutputType.INFO:
								case PyNARSOutputType.COMMENT:
									break
							}
					}
				}
			),
			(): void =>
				console.log(
					`${getAddress(
						config.connections.NARS.host,
						config.connections.NARS.port
					)}：NARS连接成功！`
				)
		)

		// 反馈控制器⇒消息路由 // * 事件反馈
		// 辅助初始化工具
		const posPointer: iPoint = new iPoint()
		let experimentData
		/** 发送消息 */
		const send2NARS = (message: string): void => {
			// ! 这里实际上是「以客户端为主体，借客户端发送消息」
			router.sendMessageTo(
				config.connections.NARS.host,
				config.connections.NARS.port,
				message
			)
			// * 向NARS发送Narsese * //
			console.log(`Message sent: ${message}`)
		}
		// AI 初始化
		ctlFeedback.on(
			AIPlayerEvent.INIT,
			(event: PlayerEvent, self: IPlayer, host: IMatrix): void => {
				// 消息列表 //
				const messages: string[] = []
				// 消息生成

				/** 生成一个回调函数，在配置中被调用，以实现「插入循环」的效果 */
				const registerOperation = (op: [string, ...string[]]): void => {
					// 注册操作符
					if (!this.hasRegisteredOperator(op[0]))
						messages.push(
							`/reg ${op[0].slice(1) /* 去掉开头的尖号 */}` // !【2023-10-30 20:25:28】现在开始无需额外的`eval`
						) // 负/正 方向移动
					// 注册内部状态
					this.registeredOperations.push(op)
					this.registeredOperation_outputs.push(
						config.NAL.op_output(op)
					)
					// 将操作符与自身联系起来
					messages.push(
						// * 样例：`<{SELF} --> (^left, {SELF}, x)>.` | `<{SELF} --> <(*, {SELF}, x) --> ^left>>.`
						`<${config.NAL.SELF} --> ${config.NAL.op_input(op)}>. ${
							config.NAL.positiveTruth
						}`
					)
				}
				// 调用配置
				config.behavior.init(
					env,
					event,
					self,
					config,
					host,
					registerOperation
				)
				// 消息发送
				for (let i = 0; i < messages.length; ++i) send2NARS(messages[i])
				// 清空消息
				messages.length = 0
			}
		)
		// AI 运作周期
		let adaptationPassed: boolean = false
		ctlFeedback.on(
			AIPlayerEvent.AI_TICK,
			(event: PlayerEvent, self: IPlayer, host: IMatrix): void => {
				// 可配置的AI刻逻辑 //
				config.behavior.AITick(
					env,
					event,
					self,
					config,
					host,
					posPointer,
					send2NARS
				)
				// 提醒目标 //
				if (this._goalRemindRate-- === 0) {
					this._goalRemindRate = config.timing.goalRemindRate
					// 先提醒正向目标
					for (const goal of config.NAL.POSITIVE_GOALS)
						send2NARS(
							`<${config.NAL.SELF} --> ${goal}>! :|: ${config.NAL.positiveTruth}`
						)
					// 再提醒负向目标
					for (const goal of config.NAL.NEGATIVE_GOALS)
						send2NARS(
							`<${config.NAL.SELF} --> ${goal}>! :|: ${config.NAL.negativeTruth}`
						)
					// ?【2023-10-30 21:51:57】是否要把目标的配置再细化一些，比如「不同目标不同周期/正负性」之类的
				}
				// 无事babble //
				if (lastNARSOperated > config.timing.babbleThreshold)
					if (this._babbleRate-- === 0) {
						this._babbleRate = config.timing.babbleRate
						// 从函数（教法）中选一个操作⇒进行「无意识操作」
						const babbleOp: NARSOperation = config.behavior.babble(
							env,
							this,
							self,
							config,
							host
						)
						// 让系统知道「自己做了操作」 // *形式：<(*, 【其它参数】) --> 【带尖号操作符】>. :|: 【正向真值】
						send2NARS(
							`<(*, ${babbleOp.slice(1).join(', ')}) --> ${
								babbleOp[0]
							}>. :|: ${config.NAL.positiveTruth}`
						)
						// 执行操作
						operateEnv(self, config, host, babbleOp, false)
					}
				// 操作计数 //
				lastNARSOperated++
				// 图表数据绘制 //
				// 生成
				experimentData = {
					x: 总时间,
					成功率: 总成功次数 / 总次数,
					教学成功率:
						(总成功次数 - 自主成功次数) / (总次数 - 自主操作次数),
					自主成功率: 自主成功次数 / 自主操作次数,
					激活率: 自主操作次数 / 总次数,
				}
				// 发送到「图表服务」
				router.sendMessageTo(
					config.connections.dataShow.host,
					config.connections.dataShow.port,
					JSON.stringify(
						mapObjectKey(
							experimentData,
							config.dataShow.dataNameMap
						)
					)
				)
				// 检测
				if (
					experimentData.自主成功率 > experimentData.教学成功率 &&
					!adaptationPassed
				) {
					adaptationPassed = true
					console.info(
						'AI自主成功率超越教学成功率，自主学习能力测试通过！',
						experimentData
					)
				}
				// 时间推进 //
				总时间++
			}
		)
		// 默认事件处理
		ctlFeedback.on(
			null,
			// 对接的是PyNARS的逻辑
			(event: PlayerEvent, self: IPlayer, host: IMatrix): void =>
				config.behavior.feedback(
					env,
					event,
					self,
					config,
					host,
					send2NARS
				)
		)

		// 连接到控制器
		p.connectController(ctlFeedback)
	}
}
