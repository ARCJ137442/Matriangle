import { int, uint } from "../src/batr/legacy/AS3Legacy";
import IPlayer from "../src/batr/game/mods/native/entities/player/IPlayer";
import Player from "../src/batr/game/mods/native/entities/player/Player";
import AIControllerGenerator from "../src/batr/game/mods/native/entities/player/controller/ai/AIControllerGenerator";
import { NativeAIPrograms } from "../src/batr/game/mods/native/entities/player/controller/ai/NativeAIPrograms";
import MapStorageSparse from "../src/batr/game/mods/native/maps/MapStorageSparse";
import { NativeMaps } from "../src/batr/game/mods/native/registry/MapRegistry";
import { NativeToolUsageMap, addBonusBoxInRandomTypeByRule, getRandomTeam, loadAsBackgroundRule, randomToolEnable, respawnPlayer } from "../src/batr/game/mods/native/registry/NativeMatrixMechanics";
import Registry_V1 from "../src/batr/game/mods/native/registry/Registry_V1";
import { NativeTools } from "../src/batr/game/mods/native/registry/ToolRegistry";
import MatrixRule_V1 from "../src/batr/game/mods/native/rule/MatrixRule_V1";
import Matrix_V1 from "../src/batr/game/main/Matrix_V1";
import { 列举实体, 母体可视化 } from "./可视化_test";
import { TPS } from "../src/batr/game/main/GlobalGameVariables";
import { mergeMaps } from "../src/batr/common/utils";
import { NativeBonusTypes } from "../src/batr/game/mods/native/registry/BonusRegistry";
import { iPoint } from "../src/batr/common/geometricTools";
import HTTPController from "../src/batr/game/mods/native/entities/player/controller/HTTPController";

const rule = new MatrixRule_V1();
loadAsBackgroundRule(rule);

// 设置等权重的随机地图 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
for (const map of NativeMaps.ALL_NATIVE_MAPS)
	rule.mapRandomPotentials.set(map, 1)
// 设置等权重的随机奖励类型 // !【2023-10-05 19:45:58】不设置会「随机空数组」出错！
for (const bt of NativeBonusTypes._ALL_AVAILABLE_TYPE)
	rule.bonusTypePotentials.set(bt, 1)

// 设置所有工具
rule.enabledTools = NativeTools.TOOLS_AVAILABLE

const registry = new Registry_V1();
mergeMaps(
	registry.toolUsageMap,
	NativeToolUsageMap
)

const matrix = new Matrix_V1(
	rule,
	registry
)
console.log(matrix);

matrix.initByRule();

// 创建玩家
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
let ctlHTTP: HTTPController = new HTTPController();
ctlHTTP.launchServer('127.0.0.1', 3002) // 启动服务器
// 添加实体
matrix.addEntities(
	p, p2,
	ctl
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
p2.tool = NativeTools.WEAPON_BULLET_BASIC.copy();
// 初号机の控制器
ctl.AIRunSpeed = 4; // 一秒四次行动
p.connectController(ctl);
respawnPlayer(matrix, p);
// 二号机の控制器
ctlHTTP.addConnection(p2, 'p2');
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

// 第一次测试
(() => {
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

function 迭代(display_delay_ms: uint = 1000): void {
	// TPS次迭代
	for (let i: uint = 0; i < TPS * display_delay_ms / 1000; i++) {
		matrix.tick();
	}
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

async function 持续测试(i: int = 0, display_delay_ms: uint = 1000) {
	for (let t = i; t !== 0; t--) {
		迭代(display_delay_ms);
		// 延时
		await sleep(display_delay_ms);
	}
};

持续测试(-1, 200);

console.log('It is done.');
