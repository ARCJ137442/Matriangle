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
import {
	dictionaryLikeObject,
	mergeMaps,
	mergeMultiMaps,
} from 'matriangle-common/utils'
import { iPoint } from 'matriangle-common/geometricTools'
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
import WebMessageRouter from '../../mods/webIO/WebMessageRouter'
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

// 地图 //
function initMaps(): IMap[] {
	const maps: IMap[] = []

	// 存储结构 //
	const storage = new MapStorageSparse(1)
	// * 大体结构：#__C__#
	const N = 5 // 第几格
	storage.setBlock(
		new iPoint().copyFromArgs(0),
		NativeBlockPrototypes.COLORED.softCopy()
	)
	storage.setBlock(
		new iPoint().copyFromArgs(N - 1),
		NativeBlockPrototypes.COLORED.softCopy()
	)

	// 注册 //
	maps.push(new Map_V1('model', storage))

	return maps
}

// 规则 //
function initMatrixRule(): IMatrixRule {
	const rule = new MatrixRule_V1()
	rule.loadFromDefaultValueMap(MatrixRules_Native.DEFAULT_VALUE_MAP)

	// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
	// const MAPS = [...MULTI_DIM_TEST_MAPS, ...BatrDefaultMaps._ALL_MAPS]; // 【2023-10-09 21:12:37】目前是「多维度地图」测试
	const MAPS = initMaps()
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
function initWorldRegistry(): IWorldRegistry {
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
const router: WebMessageRouter = new WebMessageRouter()

/** 配置玩家 */
function setupPlayers(host: IMatrix): void {
	// 玩家
	const p: IPlayer = new Player_V1(
		matrix.map.storage.randomPoint,
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
	ctlWeb.addConnection(p, 'p2')
	ctlWeb.linkToRouter(router, 'ws', '127.0.0.1', 3002) // 连接到消息路由器
	const kcc: KeyboardControlCenter = new KeyboardControlCenter()

	// 按键绑定
	kcc.addKeyBehaviors(
		generateBehaviorFromPlayerConfig(
			p,
			BATR_DEFAULT_PLAYER_CONTROL_CONFIGS[1]
		)
	)

	// 连接：键控中心 - 消息路由器
	router.registerServiceWithType(
		'ws',
		'127.0.0.1',
		3002,
		// * 消息格式：`|+【按键代码】`（按下⇒前导空格）/`|【按键代码】`（释放⇒原样）
		// ! 使用「前导`|`」区分「控制指定玩家」和「输送至键控中心」
		(message: string): undefined => {
			if (message[0] !== '|') return
			// * 有加号⇒按下
			if (message[1] === '+') kcc.onPress(message.slice(2))
			// * 无加号⇒释放
			else kcc.onRelease(message.slice(1))
		},
		(): void => {
			console.log('键控中心连接成功！')
		}
	)

	// 建立服务
	const NARSServerHost: string = '127.0.0.1'
	const NARSServerPort: uint = 8765
	const NARSServerAddress: string = `ws://${NARSServerHost}:${NARSServerPort}`
	router.registerWebSocketServiceClient(
		NARSServerHost,
		NARSServerPort,
		// * 从NARS接收信息 * //
		(message: string): undefined => {
			// 解析JSON，格式：
			const output_data: dictionaryLikeObject<string> = JSON.parse(
				message
			) as dictionaryLikeObject<string>
			console.log(
				`received> ${output_data?.interface_name}: [${output_data?.output_type}] ${output_data?.content}`,
				output_data
			)
		},
		(): void => console.log(`${NARSServerAddress}：NARS连接成功！`)
	)

	// 反馈控制器⇒消息路由 // * 事件反馈
	const ctlFeedback: FeedbackController = new FeedbackController('NARS')
	ctlFeedback.AIRunSpeed = 5
	const xPointer: iPoint = new iPoint()
	ctlFeedback.on(
		null,
		(event: PlayerEvent, self: IPlayer, host: IMatrix): void => {
			// 预处理 //
			let msg
			switch (event) {
				// 拒绝「世界刻」
				case NativePlayerEvent.TICK:
					return
				// 左右感知
				case AIPlayerEvent.AI_TICK:
					// 左边
					xPointer.copyFrom(self.position)
					xPointer[0]--
					if (!self.testCanGoTo(host, xPointer)) {
						msg = `<{SELF} --> [left_blocked]>. :|:`
						break
					}
					// 右边
					xPointer.copyFrom(self.position)
					xPointer[0]++
					if (!self.testCanGoTo(host, xPointer)) {
						msg = `<{SELF} --> [right_blocked]>. :|:`
						break
					}
					break
				// 默认放行
				default:
					break
			}
			// * 向NARS发送Narsese * //
			msg ??= `<{SELF} --> [${event}]>. :|:` // 空值合并
			console.log(`Message sent: ${msg}`)
			// ! 这里实际上是「以客户端为主体，借客户端发送消息」
			router.sendMessageTo(NARSServerAddress, msg)
		}
	)
	p.connectController(ctlFeedback) // 连接到控制器

	// *添加实体
	host.addEntities(p, router, ctlWeb, kcc, ctlFeedback)
	// 让所有玩家「重生」
	respawnAllPlayer(matrix)
}

/** 配置可视化 */
function setupVisualization(host: IMatrix): void {
	// 可视化信号
	const visualizer: MatrixVisualizer = new MatrixVisualizer(matrix)
	// 连接
	visualizer.linkToRouter(router, 'ws', '127.0.0.1', 8080)

	// *添加实体
	host.addEntities(visualizer)
}
/** （总领）配置实体 */
function setupEntities(host: IMatrix): void {
	setupVisualization(host)
	setupPlayers(host)
}

// 母体 //
const rule = initMatrixRule()
const matrix = new Matrix_V1(
	rule,
	initWorldRegistry(),
	// ! 获取随机地图：只在「核心逻辑」之外干这件事
	getRandomMap(rule).copy(true)
)
// console.log(matrix);
matrix.initByRule()
// 加载实体
setupEntities(matrix)
// ! 必要的坐标投影
projectEntities(matrix.map, matrix.entities)
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
function 迭代(num: uint, visualize: boolean = true): void {
	// TPS次迭代
	for (let i: uint = 0; i < num; i++) {
		matrix.tick()
	}
	if (visualize) {
		// 可视化
		console.log(
			matrixV母体可视化(
				matrix.map.storage as MapStorageSparse,
				matrix.entities,
				6
			)
		)
		listE列举实体(matrix.entities, 5) // !【2023-10-05 17:51:21】实体一多就麻烦
	}
}

function 持续测试(i: int = 0, tick_time_ms: uint = 1000) {
	/** 迭代次数，是一个常量 */
	const numIter: uint = (TPS * tick_time_ms) / 1000
	let t = i
	const id = setInterval((): void => {
		迭代(numIter, false /* 现在不再需要可视化 */)
		if (t === 0) clearInterval(id)
		t--
	}, tick_time_ms)
}

const p = 持续测试(-1, TICK_TIME_MS)

console.log('It is done.', p)
