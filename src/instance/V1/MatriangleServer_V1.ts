import { int, uint } from 'matriangle-legacy/AS3Legacy'
import PlayerBatr from 'matriangle-mod-bats/entity/player/PlayerBatr'
import AIControllerGenerator from 'matriangle-mod-bats/entity/player/ai/AIControllerGenerator'
import { NativeAIPrograms } from 'matriangle-mod-bats/entity/player/ai/NativeAIPrograms'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import {
	BATR_DEFAULT_PLAYER_CONTROL_CONFIGS,
	BATR_TOOL_USAGE_MAP,
	addBonusBoxInRandomTypeByRule,
	getRandomMap,
	getRandomTeam,
	loadAsBackgroundRule,
	randomToolEnable,
	toolCreateExplode,
} from 'matriangle-mod-bats/mechanics/BatrMatrixMechanics'
import { projectEntities } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { respawnAllPlayer } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import WorldRegistry_V1 from 'matriangle-mod-bats/registry/Registry_Batr'
import { BatrTools } from 'matriangle-mod-bats/registry/ToolRegistry'
import Matrix_V1 from 'matriangle-mod-native/main/Matrix_V1'
import {
	listE列举实体,
	matrixV母体可视化,
} from '../../mods/visualization/logic/textVisualizations'
import {
	TICK_TIME_MS,
	TPS,
} from 'matriangle-api/server/main/GlobalWorldVariables'
import {
	mergeMaps,
	mergeMultiMaps,
	randomBoolean,
	randomIn,
} from 'matriangle-common/utils'
import {
	NativeBonusTypes as BatrBonusTypes,
	BonusType,
} from 'matriangle-mod-bats/registry/BonusRegistry'
import { iPoint } from 'matriangle-common/geometricTools'
import MatrixVisualizerText from '../../mods/visualization/visualizer/MatrixVisualizerText'
import BlockRandomTickDispatcher from 'matriangle-mod-bats/mechanics/programs/BlockRandomTickDispatcher'
import { BATR_BLOCK_EVENT_MAP } from 'matriangle-mod-bats/mechanics/BatrMatrixMechanics'
import BlockEventRegistry from 'matriangle-api/server/block/BlockEventRegistry'
import MapSwitcherRandom from 'matriangle-mod-bats/mechanics/programs/MapSwitcherRandom'
import IPlayerBatr from 'matriangle-mod-bats/entity/player/IPlayerBatr'
import { NATIVE_BLOCK_CONSTRUCTOR_MAP } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import { BATR_BLOCK_CONSTRUCTOR_MAP } from 'matriangle-mod-bats/registry/BlockRegistry_Batr'
import BonusBoxGenerator from 'matriangle-mod-bats/mechanics/programs/BonusBoxGenerator'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import IWorldRegistry from 'matriangle-api/server/registry/IWorldRegistry'
import { BatrDefaultMaps } from 'matriangle-mod-bats/registry/MapRegistry'
import IMap from 'matriangle-api/server/map/IMap'
import { stackMaps } from './stackedMaps'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import { ProgramMessageRouter } from 'matriangle-mod-message-io-api/MessageRouter'
import WebController from '../../mods/webIO/controller/WebController'
import KeyboardControlCenter, {
	generateBehaviorFromPlayerConfig,
} from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import ProgramAgent from '../../mods/TMatrix/program/Agent'
import Entity from 'matriangle-api/server/entity/Entity'
import { i_hasPosition } from 'matriangle-api/server/entity/EntityInterfaces'
import ProgramMerovingian from '../../mods/TMatrix/program/Merovingian'
import { isPlayer } from 'matriangle-mod-native/entities/player/IPlayer'
import { MatrixProgram } from 'matriangle-api/server/control/MatrixProgram'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import MatrixRule_V1 from 'matriangle-mod-native/rule/MatrixRule_V1'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import { MatrixRules_Batr } from 'matriangle-mod-bats/rule/MatrixRules_Batr'
import { WebSocketServiceServer } from 'matriangle-mod-message-io-node/services'
import { MessageCallback } from 'matriangle-mod-message-io-api/MessageInterfaces'

// 超参数/常量 //
const CONTROL_SERVICE_HOST = '127.0.0.1'
const CONTROL_SERVICE_PORT = 3002
const DISPLAY_SERVICE_HOST = '127.0.0.1'
const DISPLAY_SERVICE_PORT = 8080

// 规则 //
function initMatrixRule(): IMatrixRule {
	const rule = new MatrixRule_V1()
	loadAsBackgroundRule(rule)

	// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
	// const MAPS = [...MULTI_DIM_TEST_MAPS, ...BatrDefaultMaps._ALL_MAPS]; // 【2023-10-09 21:12:37】目前是「多维度地图」测试
	const MAPS = [
		new Map_V1(
			'stacked',
			stackMaps(
				BatrDefaultMaps._ALL_MAPS.map(
					(map: IMap): MapStorageSparse =>
						map.storage as MapStorageSparse
				)
			)
		),
	] // 【2023-10-12 13:01:50】目前是「堆叠地图」测试
	rule.setRule<Map<IMap, number>>(
		MatrixRules_Native.key_mapRandomPotentials,
		new Map()
	)
	for (const map of MAPS)
		rule.safeGetRule<Map<IMap, number>>(
			MatrixRules_Native.key_mapRandomPotentials
		).set(map, 1)
	// 设置等权重的随机奖励类型 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
	rule.setRule<Map<IMap, number>>(
		MatrixRules_Batr.key_bonusTypePotentials,
		new Map()
	)
	for (const bt of BatrBonusTypes._ALL_AVAILABLE_TYPE)
		rule.safeGetRule<Map<BonusType, number>>(
			MatrixRules_Batr.key_bonusTypePotentials
		).set(bt, 1)

	// 设置所有工具 // * 现在开放激光系列
	rule.safeSetRule(MatrixRules_Batr.key_enabledTools, [
		...BatrTools.WEAPONS_BULLET,
		...BatrTools.WEAPONS_LASER,
	])

	return rule
}

// 注册表 //
function initWorldRegistry(): IWorldRegistry {
	const registry = new WorldRegistry_V1(
		// * 生成最终「方块构造器映射表」：多个mod的映射表合并
		mergeMultiMaps(
			new Map(),
			NATIVE_BLOCK_CONSTRUCTOR_MAP,
			BATR_BLOCK_CONSTRUCTOR_MAP
		) as BlockConstructorMap,
		new BlockEventRegistry(BATR_BLOCK_EVENT_MAP) // *【2023-10-08 17:51:25】使用原生的「方块事件列表」
	)
	mergeMaps(registry.toolUsageMap, BATR_TOOL_USAGE_MAP)
	return registry
}

/** 消息路由器 */
const router: ProgramMessageRouter = new ProgramMessageRouter()

/** 配置玩家 */
function setupPlayers(host: IMatrix): void {
	// 玩家
	const p: IPlayerBatr = new PlayerBatr(
		matrix.map.storage.randomPoint,
		0,
		true,
		getRandomTeam(matrix),
		randomToolEnable(matrix.rule)
	)
	const p2: IPlayerBatr = new PlayerBatr(
		new iPoint(1, 1),
		0,
		true,
		getRandomTeam(matrix),
		randomToolEnable(matrix.rule)
	)
	const p3: IPlayerBatr = new PlayerBatr(
		new iPoint(1, 1),
		0,
		true,
		getRandomTeam(matrix),
		randomToolEnable(matrix.rule)
	)

	// 名字
	p.customName = 'Player初号机'
	p2.customName = 'Player二号机'
	p3.customName = '三号靶机'
	// 生命数不减少
	p.lifeNotDecay = p2.lifeNotDecay = p3.lifeNotDecay = true
	// 武器
	p.tool = randomIn(BatrTools.WEAPONS_BULLET).copy()
	p2.tool = randomIn(BatrTools.WEAPONS_LASER).copy()
	p3.tool = randomIn(BatrTools.WEAPONS_LASER).copy()
	// 初号机の控制器
	const ctl: AIControllerGenerator = new AIControllerGenerator(
		'first',
		NativeAIPrograms.AIProgram_Dummy // 传入函数而非其执行值
	)
	ctl.randomizeAIRunSpeed(4, 8) // 一秒四次行动
	p.connectController(ctl)
	// 二号机の控制器
	// let ctlWeb: HTTPController = new HTTPController();
	const ctlWeb: WebController = new WebController()
	ctlWeb.addConnection(p2, 'p2')
	ctlWeb.addConnection(p, 'p')
	ctlWeb.linkToRouterLazy(
		router,
		CONTROL_SERVICE_HOST,
		CONTROL_SERVICE_PORT,
		(messageCallback: MessageCallback) =>
			new WebSocketServiceServer(
				CONTROL_SERVICE_HOST,
				CONTROL_SERVICE_PORT,
				messageCallback
			)
	) // 连接到消息路由器
	const kcc: KeyboardControlCenter = new KeyboardControlCenter()
	// 三号机没有控制器
	// 添加p2的按键绑定
	kcc.addKeyBehaviors(
		generateBehaviorFromPlayerConfig(
			p2,
			BATR_DEFAULT_PLAYER_CONTROL_CONFIGS[1]
		)
	)
	kcc.addKeyBehaviors(
		generateBehaviorFromPlayerConfig(
			p3,
			BATR_DEFAULT_PLAYER_CONTROL_CONFIGS[2]
		)
	)
	// 连接：键控中心 - 消息路由器
	router.registerService(
		new WebSocketServiceServer(
			CONTROL_SERVICE_HOST,
			CONTROL_SERVICE_PORT,
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

	// *添加实体
	host.addEntities(p, p2, p3, ctl, ctlWeb, kcc)
	// 让所有玩家「重生」
	respawnAllPlayer(matrix)
}

/** 配置可视化 */
function setupVisualization(host: IMatrix): void {
	// 可视化信号
	const visualizer: MatrixVisualizerText = new MatrixVisualizerText(matrix)
	// 连接
	visualizer.linkToRouter(
		router,
		DISPLAY_SERVICE_HOST,
		DISPLAY_SERVICE_PORT,
		(messageCallback: MessageCallback) =>
			new WebSocketServiceServer(
				DISPLAY_SERVICE_HOST,
				DISPLAY_SERVICE_PORT,
				messageCallback
			)
	)

	// *添加实体
	host.addEntities(visualizer)
}
/** 配置「特殊程序」 */
function setupSpecialPrograms(host: IMatrix): void {
	const agent1: ProgramAgent = new ProgramAgent(
		// 监控「禁区」：实体的z坐标是否>15
		(host: IMatrix, e: Entity): boolean =>
			e !== agent1 &&
			e.isActive /* && i_hasPosition(e) && e.position.z >= 15 */ &&
			randomBoolean(1, 0xff),
		// 武器「删除」：将实体取消激活
		(host: IMatrix, e: Entity): void => {
			e.isActive = false
			host.removeEntity(e)
			if (i_hasPosition(e))
				toolCreateExplode(
					host,
					null,
					e.position,
					10,
					100,
					0,
					true,
					true,
					true,
					0
				)
			console.log('Solved an abnormal signal.')
		}
	)
	const merovingian: ProgramMerovingian = new ProgramMerovingian(
		[],
		// 条件：玩家/程序
		(host: IMatrix, e: Entity): boolean =>
			isPlayer(e) || e instanceof MatrixProgram,
		// 条件：自身私藏实体数 > 1
		(host: IMatrix, e: Entity): boolean =>
			merovingian.privatePossessions.length > 1
	)
	merovingian.hack(host)
	// 添加
	// !【2023-10-14 21:48:39】测试完成，暂且禁用封存
	// host.addEntities(agent1, merovingian)
}
/** 配置机制程序 */
function setupMechanicPrograms(host: IMatrix): void {
	// 方块随机刻分派者
	const blockRTickDispatcher: BlockRandomTickDispatcher =
		new BlockRandomTickDispatcher().syncRandomDensity(
			matrix.rule.safeGetRule<uint>(
				MatrixRules_Batr.key_blockRandomTickDensity
			)
		)
	// 奖励箱生成者
	const bonusBoxGenerator: BonusBoxGenerator = BonusBoxGenerator.fromBatrRule(
		matrix.rule
	).syncRandomDensity(
		matrix.rule.safeGetRule<uint>(
			MatrixRules_Batr.key_blockRandomTickDensity
		)
	)
	// 地图切换者
	const mapSwitcherRandom = new MapSwitcherRandom(TPS * 15) // 稳定期：十五秒切换一次
	// 其它特殊程序
	setupSpecialPrograms(host)

	// *添加实体
	host.addEntities(blockRTickDispatcher, bonusBoxGenerator, mapSwitcherRandom)
}
/** （总领）配置实体 */
function setupEntities(host: IMatrix): void {
	setupMechanicPrograms(host)
	setupVisualization(host)
	setupPlayers(host)
	// 添加奖励箱
	addBonusBoxInRandomTypeByRule(matrix, new iPoint(1, 2))
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
//  地图
// matrix.map = NativeMaps.EMPTY;
// matrix.map = NativeMaps.FRAME;
// matrix.map = NativeMaps.MAP_G;

// 第一次测试
;(): void => {
	console.log(
		matrixV母体可视化(
			matrix.map.storage as MapStorageSparse,
			matrix.entities
		)
	)

	// 尝试运作
	for (let i: uint = 0; i < 0xff; i++) {
		matrix.tick()
	}

	console.log(
		matrixV母体可视化(
			matrix.map.storage as MapStorageSparse,
			matrix.entities
		)
	)

	listE列举实体(matrix.entities)
}

// 持续测试
function sleep(ms: number): Promise<void> {
	return new Promise((resolve): void => {
		setTimeout(resolve, ms)
	})
}

// 预先测试：避免「异步报错无法溯源」的问题
// for (let i: uint = 0; i < TPS * 1000; i++) matrix.tick();
// 全速测试
// while (true) matrix.tick();

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

async function 持续测试(i: int = 0, tick_time_ms: uint = 1000) {
	/** 迭代次数，是一个常量 */
	const numIter: uint = (TPS * tick_time_ms) / 1000
	for (let t = i; t !== 0; t--) {
		迭代(numIter, false /* 现在不再需要可视化 */)
		// 延时
		await sleep(tick_time_ms)
	}
}

const p = 持续测试(-1, TICK_TIME_MS)

console.log('It is done.', p)
