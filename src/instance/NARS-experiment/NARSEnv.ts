import { int, uint } from 'matriangle-legacy/AS3Legacy'
import {
	BATR_DEFAULT_PLAYER_CONTROL_CONFIGS,
	BATR_TOOL_USAGE_MAP as BATR_TOOL_USAGE_MAP,
	getRandomMap,
} from 'matriangle-mod-bats/mechanics/BatrMatrixMechanics'
import { projectEntities } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { respawnAllPlayer } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import WorldRegistry_V1 from 'matriangle-mod-bats/registry/Registry_Batr'
import Matrix_V1 from 'matriangle-mod-native/main/Matrix_V1'
import { TPS as TPS_Matriangle } from 'matriangle-api/server/main/GlobalWorldVariables'
import {
	countIn,
	mapObjectKey,
	mergeMaps,
	mergeMultiMaps,
	randomBoolean2,
	randomIn,
} from 'matriangle-common/utils'
import { iPoint } from 'matriangle-common/geometricTools'
import MatrixVisualizerCanvas from 'matriangle-mod-visualization/visualizer/MatrixVisualizerCanvas'
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
import {
	NativePlayerEvent,
	NativePlayerEventOptions,
	PlayerEvent,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent' // ! 📌不能信赖「直接的一股脑导入」
import { AIPlayerEvent } from 'matriangle-mod-native/entities/player/controller/AIController'
import {
	NARSOperation,
	NarseseCopulas,
	NarsesePunctuation,
	NarseseTenses,
	NARSOutputType,
	WebNARSOutput,
	WebNARSOutputJSON,
	isNARSOperation,
	NARSOperationRecordFull,
	NARSOperationRecord,
	NARSOperationResult,
	isOperationFullSpontaneous,
} from 'matriangle-mod-nar-framework/NARSTypes.type'
import {
	IMessageRouter,
	IMessageService,
	MessageCallback,
	getAddress,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { NARSEnvConfig, NARSPlayerConfig } from './config/API'
import { MessageServiceConfig } from 'matriangle-mod-message-io-api/MessageInterfaces'
import Entity from 'matriangle-api/server/entity/Entity'
import { normalShannonEntropy } from 'matriangle-common'
import ProgramMatrixConsole from 'matriangle-mod-native/entities/control/MatrixConsole'
import MatrixVisualizer from 'matriangle-mod-visualization/visualizer/MatrixVisualizer'

/**
 * !【2023-10-30 14:53:21】现在使用一个类封装这些「内部状态」，让整个服务端变得更为「可配置化」
 */
export class NARSEnv {
	// 描述 //
	printInitDescription(): void {
		console.info(this.config.info(this.config).trim())
	}

	// 母体 //
	readonly rule: IMatrixRule
	readonly matrix: IMatrix

	// 实验超参数（全在构造函数里） //
	/**
	 * 构造函数
	 * @param config 载入的环境配置
	 */
	constructor(public readonly config: NARSEnvConfig) {
		// ! 不建议在变量定义时初始化（并且初始化为函数返回值！），容易导致「函数未定义就加载」的兼容问题
		this.rule = this.initMatrixRule()
		this.matrix = new Matrix_V1(
			this.rule,
			this.initWorldRegistry(),
			// ! 获取随机地图：只在「核心逻辑」之外干这件事
			getRandomMap(this.rule).copy(true)
		)
		this.router = new ProgramMessageRouter()
	}

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
	readonly router: ProgramMessageRouter

	/** 配置玩家 */
	setupPlayers(host: IMatrix, configs: NARSPlayerConfig[]): void {
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
	readonly NARSMessageServices: MessageServiceConfig[] = []

	/** 配置NARS玩家 */
	setupNARSPlayer(
		host: IMatrix,
		config: NARSPlayerConfig,
		ctlWeb: WebController,
		kcc: KeyboardControlCenter
	): void {
		// 玩家
		const p: IPlayer = new Player_V1({
			position: this.matrix.map.storage.randomPoint,
			isActive: true,
			fillColor: config.attributes.appearance.normal.fillColor,
			lineColor: config.attributes.appearance.normal.lineColor,
		})
		// 名字
		p.customName = config.attributes.name

		// 生命相关属性
		p.HP = config.attributes.health.initialHP
		p.maxHP = config.attributes.health.initialMaxHP
		p.heal = config.attributes.health.initialHeal
		p.lives = config.attributes.health.initialLives
		p.lifeNotDecay = config.attributes.health.lifeNotDecay

		// 注入智能体 // * 初始化控制器、路由器、连接和行为
		this.agents.push(
			new NARSPlayerAgent(this, host, p, config, this.router, ctlWeb, kcc)
		)

		// *添加实体
		host.addEntities(p, this.router, ctlWeb, kcc)
	}
	/** 存储所有创建了的NARS智能体 */
	protected agents: NARSPlayerAgent[] = []

	/** 配置可视化 */
	setupVisualization(host: IMatrix): void {
		// 可视化信号 // !【2023-11-18 10:39:56】现在使用Canvas
		const visualizer: MatrixVisualizer = new MatrixVisualizerCanvas(
			this.matrix
		)
		// 连接
		visualizer.linkToRouter(
			this.router,
			this.config.connections.displayService
		)

		// *添加实体
		host.addEntities(visualizer)
	}

	/** 配置控制台 */
	setupConsole(host: IMatrix): void {
		/** 新建实体 */
		const matrixConsole: ProgramMatrixConsole = new ProgramMatrixConsole(
			host
		)
		/** 连接 */
		const service: IMessageService =
			// * 通过「控制服务」建立连接
			this.config.connections.controlService.constructor(
				this.config.connections.controlService.host,
				this.config.connections.controlService.port,
				// !【2023-11-10 22:32:43】直接执行指令，拆分等任务交给客户端
				(message: string): string | undefined => {
					// 空消息⇒不受理
					if (message.length === 0) return undefined
					// 按开头字符区分
					switch (message[0]) {
						// * 以`/`开头⇒运行指令并返回输出
						case '/': {
							const result = matrixConsole.executeCmd(
								message.slice(1)
							)
							return (
								// * 以`/`开头，以便被识别为「指令输出」
								'/' +
								// 不显示「undefined」
								(result === undefined ? '' : String(result))
								// 截掉开头的`/`
							)
						}
						default:
							return undefined
					}
				}
			)
		this.router.registerService(service, (): void => {
			console.log(
				`NARSEnv@setupConsole: 与路由器成功在 ${service.addressFull} 建立连接！`
			)
		})
		/** 注入 */
		host.addEntity(matrixConsole)
	}

	/** （总领）配置实体 */
	setupEntities(host: IMatrix): void {
		// 消息路由器
		host.addEntity(this.router)
		// 可视化
		this.setupVisualization(host)
		// 控制台
		this.setupConsole(host)
		// 玩家
		this.setupPlayers(host, this.config.players)
		// 其他实体
		const entities: Entity[] | undefined =
			this.config.map.initExtraEntities?.(this.config, host)
		if (entities !== undefined)
			// 有实体⇒添加所有「其它实体」
			for (const entity of entities) host.addEntity(entity)
	}

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

	/**
	 * 持续迭代
	 * @param i 总刷新批次次数
	 * @param TPS 世界刻每秒迭代次数
	 * @param RPS 世界每秒刷新次数
	 */
	持续测试(i: int = 0, TPS: uint, RPS: uint): void {
		/** 每刷新一次所间隔的毫秒数 */
		// const tick_time_ms: uint = 1000 / TPS
		const refresh_time_ms = 1000 / RPS
		/** 每一次迭代次数，是一个常量 */
		const numIter: uint = TPS / RPS
		// 信息
		/** 倒计时 */
		let t = i
		// 开始循环
		const id = setInterval((): void => {
			// console.debug('持续测试：迭代!')
			// 迭代
			for (let i: uint = 0; i < numIter; i++) {
				this.matrix.tick()
			}
			/* if (visualize) {
				// 可视化
				console.log(
					matrixV母体可视化(
						this.matrix.map.storage as MapStorageSparse,
						this.matrix.entities,
						6
					)
				)
				listE列举实体(this.matrix.entities, 5) // !【2023-10-05 17:51:21】实体一多就麻烦
			} */
			// 计时
			if (t === 0) clearInterval(id)
			t--
		}, refresh_time_ms)
		console.info(
			`持续测试在id=${String(
				id
			)}开始！，RPS=${RPS}，TPS=${TPS}，刷新间隔=${refresh_time_ms}ms，将在${
				i > 0 ? i : '无限'
			}批迭代后结束！`
		)
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
	 * @param TPS 「Tick Per Second」决定世界迭代的速度
	 * @param RPS 「Refresh Per Second」世界每秒刷新次数
	 */
	async launch(TPS: uint = TPS_Matriangle, RPS: uint = 10): Promise<void> {
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
		console.groupCollapsed('等待所有NARS连接。。。') // !【2023-10-31 17:07:29】目前只等待NARS连接，尝试「等待数据显示」但无法正确等待
		await Promise.allSettled(
			this.config.players.map(
				// 这时候已经开始立即执行了，但会返回一个Promise
				(p: NARSPlayerConfig): Promise<void> =>
					// 等待NARS连接
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

		// 连接完成后启动所有「NARS智能体」的「读秒时钟」 //
		this.agents.forEach((agent: NARSPlayerAgent): void =>
			agent.startTickSecond()
		)

		// 二次打印描述（避免错过） //
		this.printInitDescription()

		// 异步开始持续测试 //
		this.持续测试(
			-1, // * 永久运行
			TPS, // * 世界刻每秒迭代次数
			RPS // * 世界每秒刷新次数
		)

		// 结束 //
		// console.log('It is done.')
	}
}

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
	}

	/**
	 * 记录一条统计数据：试验结果
	 */
	public recordStat(result: NARSOperationResult, spontaneous: boolean): void {
		// ! 必须是「操作有结果」的时候
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
	 * @example left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> right_{SELF}_y-#F -> left_{SELF}_y-@F -> left_{SELF}_z-#S -> left_{SELF}_y-@S -> left_{SELF}_y-@F -> right_{SELF}_x-#S -> left_{SELF}_z-@S -> left_{SELF}_y-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_z-@S -> left_{SELF}_x-#S -> left_{SELF}_y-@S -> left_{SELF}_x-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> left_{SELF}_z-#S -> left_{SELF}_y-@S -> left_{SELF}_y-@F -> right_{SELF}_x-#S -> left_{SELF}_y-@F -> left_{SELF}_y-@F -> right_{SELF}_z-@S -> left_{SELF}_z-#S -> right_{SELF}_z-@S -> right_{SELF}_z-#F -> right_{SELF}_x-@F -> left_{SELF}_z-#S
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
		ctlFeedback.on(null)

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
		router.sendMessageTo(
			this.config.connections.dataShow.host,
			this.config.connections.dataShow.port,
			'|' +
				this.visualizeOperationHistorySeparated(
					this.config.dataShow.operationHistory.spontaneousPrefix,
					this.config.dataShow.operationHistory.unconsciousPrefix
				)
		)
		// 检测
		let testPassed: boolean = false
		if (
			experimentData.自主成功率 > experimentData.教学成功率 &&
			!testPassed
		) {
			testPassed = true
			console.info(
				'AI自主成功率超越教学成功率，自主学习能力测试通过！',
				experimentData
			)
		}
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
	// ! 📝时刻注意：类内的初始化表达式比构造函数内初始化表达式早
	protected _lastNARSOperated: uint = this.config.timing.babbleThreshold // * 默认一开始就进行babble
	/** 距离「上一次NARS发送操作」所过的单位时间 */
	public get lastNARSOperated(): uint {
		return this._lastNARSOperated
	}
	/** 当前教学「所剩时间」（Babble「不被NARS操作所抑制」的阶段） */
	protected teachingTimeLasting: uint = this.config.timing.teachingTime

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

		/** 生成一个回调函数，在配置中被调用，以实现「插入循环」的效果 */
		const registerOperation = (op: [string, ...string[]]): void => {
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
			// 将操作符与自身联系起来
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
			// 再提醒负向目标
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
