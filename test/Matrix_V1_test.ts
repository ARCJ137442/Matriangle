import { int, uint } from "../src/batr/legacy/AS3Legacy";
import IPlayer from "../src/batr/server/mods/native/entities/player/IPlayer";
import Player from "../src/batr/server/mods/native/entities/player/Player";
import AIControllerGenerator from "../src/batr/server/mods/native/entities/player/controller/ai/AIControllerGenerator";
import { NativeAIPrograms } from "../src/batr/server/mods/native/entities/player/controller/ai/NativeAIPrograms";
import MapStorageSparse from "../src/batr/server/mods/native/maps/MapStorageSparse";
import { NativeMaps } from "../src/batr/server/mods/native/registry/MapRegistry";
import { NATIVE_TOOL_USAGE_MAP, addBonusBoxInRandomTypeByRule, getRandomTeam, loadAsBackgroundRule, randomToolEnable, respawnPlayer } from "../src/batr/server/mods/native/mechanics/NativeMatrixMechanics";
import Registry_V1 from "../src/batr/server/mods/native/registry/Registry_V1";
import { NativeTools } from "../src/batr/server/mods/native/registry/ToolRegistry";
import MatrixRule_V1 from "../src/batr/server/mods/native/rule/MatrixRule_V1";
import Matrix_V1 from "../src/batr/server/main/Matrix_V1";
import { 列举实体, 母体可视化 } from "../src/batr/server/mods/visualization/visualizations";
import { TICK_TIME_MS, TPS } from "../src/batr/server/main/GlobalWorldVariables";
import { mergeMaps } from "../src/batr/common/utils";
import { NativeBonusTypes } from "../src/batr/server/mods/native/registry/BonusRegistry";
import { iPoint } from "../src/batr/common/geometricTools";
import MatrixVisualizer from "../src/batr/server/mods/visualization/web/MatrixVisualizer";
import WSController from "../src/batr/server/mods/webIO/controller/WSController";
import BlockRandomTickDispatcher from "../src/batr/server/mods/native/mechanics/programs/BlockRandomTickDispatcher";
import { NATIVE_BLOCK_EVENT_MAP } from './../src/batr/server/mods/native/mechanics/NativeMatrixMechanics';
import BlockEventRegistry from "../src/batr/server/api/block/BlockEventRegistry";

// 规则 //
const rule = new MatrixRule_V1();
loadAsBackgroundRule(rule);

// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
for (const map of NativeMaps.ALL_NATIVE_MAPS)
	rule.mapRandomPotentials.set(map, 1)
// 设置等权重的随机奖励类型 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
for (const bt of NativeBonusTypes._ALL_AVAILABLE_TYPE)
	rule.bonusTypePotentials.set(bt, 1)

// 设置所有工具 // ! 目前限定为子弹系列
rule.enabledTools = NativeTools.WEAPONS_BULLET

// 注册表 //
const registry = new Registry_V1(
	new Map(),
	new BlockEventRegistry(NATIVE_BLOCK_EVENT_MAP), // *【2023-10-08 17:51:25】使用原生的「方块事件列表」
);
mergeMaps(
	registry.toolUsageMap,
	NATIVE_TOOL_USAGE_MAP
)

// 母体 //
const matrix = new Matrix_V1(
	rule,
	registry
)
// console.log(matrix);
matrix.initByRule();

// 玩家
let p: IPlayer = new Player(
	matrix.map.storage.randomPoint,
	0, true,
	getRandomTeam(matrix),
	randomToolEnable(matrix.rule)
);
let p2: IPlayer = new Player(
	new iPoint(1, 1),
	0, true,
	getRandomTeam(matrix),
	randomToolEnable(matrix.rule)
);
// 控制器
let ctl: AIControllerGenerator = new AIControllerGenerator(
	'first',
	NativeAIPrograms.AIProgram_Dummy, // 传入函数而非其执行值
);
// let ctlWeb: HTTPController = new HTTPController();
let ctlWeb: WSController = new WSController();
ctlWeb.launchServer('127.0.0.1', 3002) // 启动服务器
// 可视化信号
let visualizer: MatrixVisualizer = new MatrixVisualizer(matrix);
visualizer.launchWebSocketServer('127.0.0.1', 8080);
// 方块随机刻分派者
let blockRTickDispatcher: BlockRandomTickDispatcher = new BlockRandomTickDispatcher();
// * 添加实体
matrix.addEntities(
	blockRTickDispatcher,
	p, p2,
	ctl, ctlWeb,
	visualizer
)
// 添加奖励箱
addBonusBoxInRandomTypeByRule(matrix, new iPoint(1, 2))
// 名字
p.customName = 'Player初号机'
p2.customName = 'Player二号机'
// 生命数不减少
p.lifeNotDecay = p2.lifeNotDecay = true;
// 武器
p.tool = NativeTools.WEAPON_BULLET_BASIC.copy();
p2.tool = NativeTools.WEAPON_BULLET_TRACKING.copy();
// 初号机の控制器
ctl.AIRunSpeed = 4; // 一秒四次行动
p.connectController(ctl);
respawnPlayer(matrix, p);
// 二号机の控制器
ctlWeb.addConnection(p2, 'p2');
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
matrix.map = NativeMaps.MAP_G;

// 第一次测试
((): void => {
	console.log(
		母体可视化(
			matrix.map.storage as MapStorageSparse,
			matrix.entities
		)
	);

	// 尝试运作
	for (let i: uint = 0; i < 0xff; i++) {
		matrix.tick();
	}

	console.log(
		母体可视化(
			matrix.map.storage as MapStorageSparse,
			matrix.entities
		)
	);

	列举实体(matrix.entities)
});

// 持续测试
function sleep(ms: number): Promise<void> {
	return new Promise((resolve): void => {
		setTimeout(resolve, ms);
	});
}

// 预先测试：避免「异步报错无法溯源」的问题
// for (let i: uint = 0; i < TPS * 10000; i++) matrix.tick();

function 迭代(num: uint, visualize: boolean = true): void {
	// TPS次迭代
	for (let i: uint = 0; i < num; i++) {
		matrix.tick();
	}
	if (visualize) {
		// 可视化
		console.log(
			母体可视化(
				matrix.map.storage as MapStorageSparse,
				matrix.entities,
				6
			),
		);
		列举实体(matrix.entities, 5); // !【2023-10-05 17:51:21】实体一多就麻烦
	}
}

async function 持续测试(i: int = 0, tick_time_ms: uint = 1000) {
	/** 迭代次数，是一个常量 */
	let numIter: uint = TPS * tick_time_ms / 1000;
	for (let t = i; t !== 0; t--) {
		迭代(numIter, false/* 现在不再需要可视化 */);
		// 延时
		await sleep(tick_time_ms);
	}
};

持续测试(-1, TICK_TIME_MS);

console.log('It is done.');
