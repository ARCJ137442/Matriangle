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
} from '../../mods/visualization/textVisualizations'
import {
	TICK_TIME_MS,
	TPS,
} from 'matriangle-api/server/main/GlobalWorldVariables'
import { mergeMaps, mergeMultiMaps, randomIn } from 'matriangle-common/utils'
import { iPoint, traverseNDSquareFrame } from 'matriangle-common/geometricTools'
import MatrixVisualizer from '../../mods/visualization/web/MatrixVisualizer'
import BlockEventRegistry from 'matriangle-api/server/block/BlockEventRegistry'
import {
	NATIVE_BLOCK_CONSTRUCTOR_MAP,
	NativeBlockPrototypes,
} from 'matriangle-mod-native/registry/BlockRegistry_Native'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import IWorldRegistry from 'matriangle-api/server/registry/IWorldRegistry'
import IMap from 'matriangle-api/server/map/IMap'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import { ProgramMessageRouter } from 'matriangle-mod-message-io-api/MessageRouter'
import WebController from '../../mods/webIO/controller/WebController'
import KeyboardControlCenter, {
	generateBehaviorFromPlayerConfig,
} from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import MatrixRule_V1 from 'matriangle-mod-native/rule/MatrixRule_V1'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import Player_V1 from 'matriangle-mod-native/entities/player/Player_V1'
import FeedbackController from '../../mods/NARFramework/program/FeedbackController'
import {
	AIPlayerEvent,
	NativePlayerEvent,
	PlayerEvent,
} from 'matriangle-mod-native'
import { PyNARSOutputType } from '../../mods/NARFramework'
import {
	WebSocketServiceClient,
	WebSocketServiceServer,
} from 'matriangle-mod-message-io-node/services'
import {
	MessageCallback,
	getAddress,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { NARSEnvConfig, NARSOperation } from './config/API'

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

	// 地图 //
	initMaps(): IMap[] {
		const maps: IMap[] = []

		// 存储结构 //
		const storage = new MapStorageSparse(this.config.map.SIZES.length)
		// * 大体结构：#__C__#
		// 填充边框
		traverseNDSquareFrame(
			new iPoint().copyFrom(this.config.map.SIZES).fill(0),
			new iPoint().copyFrom(this.config.map.SIZES).addFromSingle(-1),
			(p: iPoint): void => {
				storage.setBlock(p, NativeBlockPrototypes.COLORED.softCopy())
			}
		)

		// 注册 //
		maps.push(new Map_V1('model', storage))

		return maps
	}

	// 规则 //
	initMatrixRule(): IMatrixRule {
		const rule = new MatrixRule_V1()
		rule.loadFromDefaultValueMap(MatrixRules_Native.DEFAULT_VALUE_MAP)

		// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
		// readonly MAPS = [...MULTI_DIM_TEST_MAPS, ...BatrDefaultMaps._ALL_MAPS]; // 【2023-10-09 21:12:37】目前是「多维度地图」测试
		const MAPS = this.initMaps()
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
	setupPlayers(host: IMatrix): void {
		// 玩家
		const p: IPlayer = new Player_V1(
			this.matrix.map.storage.randomPoint,
			0,
			true,
			0,
			0
		)

		// 名字
		p.customName = 'Alpha'
		// 生命数不减少
		p.lifeNotDecay = true
		// Web控制器
		const ctlWeb: WebController = new WebController()
		ctlWeb.addConnection(p, 'p2' /* UI遗留 */)
		ctlWeb.linkToRouterLazy(
			this.router,
			this.config.connections.controlService.host,
			this.config.connections.controlService.port,
			(messageCallback: MessageCallback) =>
				new WebSocketServiceServer(
					this.config.connections.controlService.host,
					this.config.connections.controlService.port,
					messageCallback
				)
		) // 连接到消息路由器
		const kcc: KeyboardControlCenter = new KeyboardControlCenter()

		// 按键绑定
		kcc.addKeyBehaviors(
			generateBehaviorFromPlayerConfig(
				p,
				BATR_DEFAULT_PLAYER_CONTROL_CONFIGS[1]
			)
		)

		// 连接：键控中心 - 消息路由器
		this.router.registerService(
			new WebSocketServiceServer(
				this.config.connections.controlService.host,
				this.config.connections.controlService.port,
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
		this.router.registerService(
			new WebSocketServiceServer(
				this.config.connections.dataShowService.host,
				this.config.connections.dataShowService.port,
				/**
				 * 消息回调=初始化：传入的任何消息都视作「初始数据获取请求」
				 * * 消息格式：`JSON.stringify(NARSPlotData)`
				 */
				(message: string): string => JSON.stringify(this.config.plot)
			)
		)

		// NARS参数 //
		/** 对接的是NARS的逻辑 */
		const ctlFeedback: FeedbackController = new FeedbackController('NARS')
		/** AI执行速度 = 单位执行速度 */
		ctlFeedback.AIRunSpeed = this.config.timing.unitAITickSpeed
		/** 距离「上一次NARS发送操作」所过的单位时间 */
		let lastNARSOperated: uint = this.config.timing.babbleThreshold // * 默认一开始就进行babble

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

		// 接收消息 //
		/** 处理NARS传来的「操作」 */
		const exeHandler = (output_content: string): void => {
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
			if (match !== null) {
				const operation: NARSOperation = [
					match[1],
					...match[2].split(', '),
				]
				// 索引2对应使用括号提取出来的对象
				console.info(
					`操作「${this.config.NAL.op_output(operation)}」已被接收！`
				)
				// 执行
				if (operate(operation)) {
					自主成功次数++
					console.info(
						`自主操作「${this.config.NAL.op_output(
							operation
						)}」执行成功！`
					)
				} else {
					console.info(
						`自主操作「${this.config.NAL.op_output(
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
		this.router.registerService(
			new WebSocketServiceClient(
				this.config.connections.NARS.host,
				this.config.connections.NARS.port,
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
										exeHandler(output_data.content)
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
						this.config.connections.NARS.host,
						this.config.connections.NARS.port
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
			this.router.sendMessageTo(
				this.config.connections.NARS.host,
				this.config.connections.NARS.port,
				message
			)
			// * 向NARS发送Narsese * //
			console.log(`Message sent: ${message}`)
		}
		/** 响应操作 */
		let operateI: uint
		const oldP: iPoint = new iPoint()
		/** 操作返回值的类型，目前暂时是「是否成功」（移动是否发生碰撞） */
		type OperationResult = boolean
		let lastResult: OperationResult
		/** @param {NARSOperation} op [带尖号的操作符, 其它附加参数] */
		const operate = (op: NARSOperation): OperationResult => {
			// 返回值初始化 //
			lastResult = false
			// 获取索引 // * 索引即方向
			operateI = this.registeredOperation_outputs.indexOf(
				this.config.NAL.op_output(op)
			)
			/* operateI = -1 // ! 遍历法现不使用
		ops: for (let i: uint = 0; i < op.length; i++) {
			registeredOperation = registeredOperations[i]
			for (let j: uint = 0; j < op.length; j++) {
				if (registeredOperation[j] !== op[j]) continue ops
			}
			operateI = i
			break
		} */
			// 有操作⇒行动&反馈
			if (operateI >= 0) {
				// 缓存点
				oldP.copyFrom(p.position)
				p.moveToward(host, operateI)
				// 位置相同⇒移动失败⇒「撞墙」⇒负反馈
				if (oldP.isEqual(p.position)) {
					send2NARS(
						`<${this.config.NAL.SELF} --> ${this.config.NAL.SAFE}>. :|: ${this.config.NAL.negativeTruth}`
					)
				}
				// 否则⇒移动成功⇒「没撞墙」⇒「安全」⇒正反馈
				else {
					send2NARS(
						`<${this.config.NAL.SELF} --> ${this.config.NAL.SAFE}>. :|: ${this.config.NAL.positiveTruth}`
					)
					lastResult = true
					总成功次数++
				}
				// 统计
				总次数++
			} else
				console.error(
					`未知的操作「(${this.config.NAL.op_output(op)})」`
				)
			return lastResult
		}
		// AI 初始化（PyNARS指令）
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
							`/reg ${op[0].slice(1) /* 去掉开头的尖号 */} eval `
						) // 负/正 方向移动
					// 注册内部状态
					this.registeredOperations.push(op)
					this.registeredOperation_outputs.push(
						this.config.NAL.op_output(op)
					)
					// 将操作符与自身联系起来
					messages.push(
						// * 样例：`<{SELF} --> (^left, {SELF}, x)>.` | `<{SELF} --> <(*, {SELF}, x) --> ^left>>.`
						`<${
							this.config.NAL.SELF
						} --> ${this.config.NAL.op_input(op)}>. ${
							this.config.NAL.positiveTruth
						}`
					)
				}
				this.config.behavior.init(
					this,
					event,
					self,
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
				this.config.behavior.AITick(
					this,
					event,
					self,
					host,
					posPointer,
					send2NARS
				)
				// 提醒目标：自身安全 //
				if (this._goalRemindRate-- === 0) {
					this._goalRemindRate = this.config.timing.goalRemindRate
					send2NARS(
						`<${this.config.NAL.SELF} --> ${this.config.NAL.SAFE}>! :|: ${this.config.NAL.positiveTruth}`
					)
				}
				// 无事babble //
				if (lastNARSOperated > this.config.timing.babbleThreshold)
					if (this._babbleRate-- === 0) {
						this._babbleRate = this.config.timing.babbleRate
						// 从函数（教法）中选一个操作⇒进行「无意识操作」
						const babbleOp = this.config.behavior.babble(
							this,
							self,
							host
						)
						// 让系统知道「自己做了操作」 // *形式：<(*, 【其它参数】) --> 【带尖号操作符】>. :|: 【正向真值】
						send2NARS(
							`<(*, ${babbleOp.slice(1).join(',')}) --> ${
								babbleOp[0]
							}>. :|: ${this.config.NAL.positiveTruth}`
						)
						// 执行操作，收获后果
						operate(babbleOp)
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
				this.router.sendMessageTo(
					this.config.connections.dataShowService.host,
					this.config.connections.dataShowService.port,
					JSON.stringify(experimentData)
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
			(event: PlayerEvent, self: IPlayer, host: IMatrix): void => {
				// 预处理 //
				switch (event) {
					// 拒绝「世界刻」
					case NativePlayerEvent.TICK:
						return
					// 默认放行
					default:
						break
				}
				// * 向NARS发送Narsese * //
				const msg = `<{SELF} --> [${event}]>. :|:`
				console.log(`Message sent: ${msg}`)
				// ! 这里实际上是「以客户端为主体，借客户端发送消息」
				this.router.sendMessageTo(
					this.config.connections.NARS.host,
					this.config.connections.NARS.port,
					msg
				)
			}
		)

		// 连接到控制器
		p.connectController(ctlFeedback)

		// *添加实体
		host.addEntities(p, this.router, ctlWeb, kcc, ctlFeedback)
		// 让所有玩家「重生」
		respawnAllPlayer(this.matrix)
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
			(messageCallback: MessageCallback) =>
				new WebSocketServiceServer(
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
		this.setupVisualization(host)
		this.setupPlayers(host)
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
	 * 等待NARS连接
	 */
	async waitNARSConnection(detectPeriodMS: uint = 1000): Promise<void> {
		console.groupCollapsed('等待NARS连接')
		// eslint-disable-next-line no-constant-condition
		while (true) {
			// 检测连接
			if (
				this.router.getServiceAt(
					this.config.connections.NARS.host,
					this.config.connections.NARS.port
				) !== undefined
			)
				if (
					this.router.getServiceAt(
						this.config.connections.NARS.host,
						this.config.connections.NARS.port
					)?.isActive
				)
					break
				else {
					console.warn('NARS连接未建立，尝试重连。。。')
					// 重连
					this.router
						.getServiceAt(
							this.config.connections.NARS.host,
							this.config.connections.NARS.port
						)
						?.stop()
					this.router
						.getServiceAt(
							this.config.connections.NARS.host,
							this.config.connections.NARS.port
						)
						?.launch()
				}
			else console.warn('NARS消息服务未建立')
			// 等待
			await this.sleep(detectPeriodMS)
		}
		console.groupEnd()
		console.info(
			`NARS连接建立成功！地址：${getAddress(
				this.config.connections.NARS.host,
				this.config.connections.NARS.port
			)}`
		)
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

		// 等待NARS连接 //
		await this.waitNARSConnection()

		// 二次打印描述（避免错过） //
		this.printInitDescription()

		// 异步开始持续测试 //
		this.持续测试(-1, TICK_TIME_MS)

		// 结束 //
		// console.log('It is done.')
	}
}
