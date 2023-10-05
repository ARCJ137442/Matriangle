import { int, uint } from "../src/batr/legacy/AS3Legacy";
import IPlayer from "../src/batr/game/mods/native/entities/player/IPlayer";
import Player from "../src/batr/game/mods/native/entities/player/Player";
import AIControllerGenerator from "../src/batr/game/mods/native/entities/player/controller/ai/AIControllerGenerator";
import { NativeAIPrograms } from "../src/batr/game/mods/native/entities/player/controller/ai/NativeAIPrograms";
import MapStorageSparse from "../src/batr/game/mods/native/maps/MapStorageSparse";
import { NativeMaps } from "../src/batr/game/mods/native/registry/MapRegistry";
import { getRandomTeam, loadAsBackgroundRule, randomToolEnable, respawnPlayer } from "../src/batr/game/mods/native/registry/NativeMatrixMechanics";
import Registry_V1 from "../src/batr/game/mods/native/registry/Registry_V1";
import { NativeTools } from "../src/batr/game/mods/native/registry/ToolRegistry";
import MatrixRule_V1 from "../src/batr/game/mods/native/rule/MatrixRule_V1";
import Matrix_V1 from "../src/batr/game/main/Matrix_V1";
import { 列举实体, 地图可视化, 母体可视化 } from "./可视化_test";
import { TICK_TIME_MS, TPS } from "../src/batr/game/main/GlobalGameVariables";

const rule = new MatrixRule_V1();
loadAsBackgroundRule(rule);

// 设置等权重的随机地图
for (const map of NativeMaps.ALL_NATIVE_MAPS)
	rule.mapRandomPotentials.set(map, 1)

// 设置所有工具
rule.enabledTools = NativeTools.TOOLS_AVAILABLE

const registry = new Registry_V1();

const matrix = new Matrix_V1(
	rule,
	registry
)
console.log(matrix);

matrix.initByRule();

let p: IPlayer, ctl: AIControllerGenerator;
matrix.addEntities(
	p = new Player(
		matrix.map.storage.randomPoint,
		0, true,
		getRandomTeam(matrix),
		randomToolEnable(matrix.rule)
	),
	ctl = new AIControllerGenerator(
		'first',
		NativeAIPrograms.AIProgram_Dummy, // 传入函数而非其执行值
	)
)
p.customName = 'Player初号机'
ctl.AIRunSpeed = 4; // 一秒四次行动
p.connectController(ctl)
respawnPlayer(matrix, p);

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
matrix.map = NativeMaps.EMPTY
for (let i: uint = 0; i < TPS * 100; i++) matrix.tick();

async function 持续测试(i: int = 0, display_delay_ms: uint = 1000) {
	for (let t = i; t !== 0; t--) {
		// TPS次迭代
		for (let i: uint = 0; i < TPS * display_delay_ms / 1000; i++) {
			matrix.tick();
		}
		// 可视化
		console.log(
			母体可视化(
				matrix.map.storage as MapStorageSparse,
				matrix.entities,
				1
			),
		);
		列举实体(matrix.entities);
		// 延时
		await sleep(display_delay_ms);
	}
};

持续测试(-1, 200);

console.log('It is done.');
