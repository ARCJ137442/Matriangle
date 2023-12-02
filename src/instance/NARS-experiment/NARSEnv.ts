import { int, uint } from 'matriangle-legacy/AS3Legacy'
import {
	BATR_TOOL_USAGE_MAP as BATR_TOOL_USAGE_MAP,
	getRandomMap,
} from 'matriangle-mod-bats/mechanics/BatrMatrixMechanics'
import { projectEntities } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { respawnAllPlayer } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import WorldRegistry_V1 from 'matriangle-mod-bats/registry/Registry_Batr'
import Matrix_V1 from 'matriangle-mod-native/main/Matrix_V1'
import { TPS as TPS_Matriangle } from 'matriangle-api/server/main/GlobalWorldVariables'
import { mergeMaps, mergeMultiMaps } from 'matriangle-common/utils'
import MatrixVisualizerCanvas from 'matriangle-mod-visualization/visualizer/MatrixVisualizerCanvas'
import BlockEventRegistry from 'matriangle-api/server/block/BlockEventRegistry'
import { NATIVE_BLOCK_CONSTRUCTOR_MAP } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import IWorldRegistry from 'matriangle-api/server/registry/IWorldRegistry'
import IMap from 'matriangle-api/server/map/IMap'
import { ProgramMessageRouter } from 'matriangle-mod-message-io-api/MessageRouter'
import WebController from 'matriangle-mod-web-io/controller/WebController'
import KeyboardControlCenter from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import MatrixRule_V1 from 'matriangle-mod-native/rule/MatrixRule_V1'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import Player_V1 from 'matriangle-mod-native/entities/player/Player_V1'
import {
	IMessageService,
	MessageCallback,
	getAddress,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { NARSEnvConfig, NARSPlayerConfig } from './config/API'
import { MessageServiceConfig } from 'matriangle-mod-message-io-api/MessageInterfaces'
import Entity from 'matriangle-api/server/entity/Entity'
import ProgramMatrixConsole from 'matriangle-mod-native/entities/control/MatrixConsole'
import MatrixVisualizer from 'matriangle-mod-visualization/visualizer/MatrixVisualizer'
import { NARSPlayerAgent } from './NARSPlayerAgent'

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
		console.warn('config =', config)
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
