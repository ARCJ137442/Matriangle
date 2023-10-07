import Block from "../../../api/block/Block";
import { typeID } from "../../../api/registry/IWorldRegistry";
import BSColored from "../blocks/BSColored";
import { NativeBlockAttributes } from "./BlockAttributesRegistry";
import BSBiColored from "../blocks/BSBiColored";
import BSGate from "../blocks/BSGate";
import { MapFromGeneratorKV } from "../../../../common/utils";

/**
 * 方块原型列表
 * * 存储所有类型方块的「原型对象」
 * 
 * !【2023-10-07 17:09:30】⚠️这里的所有对象，在被外部用于赋值时，都应该先进行深拷贝
 * * 不深拷贝则会影响到后续创建的稳定性
 */
export module NativeBlockPrototypes {

	export const VOID: Block<null> = new Block('Void', NativeBlockAttributes.VOID, null)

	export const COLORED: Block<BSColored> = new Block('Colored', NativeBlockAttributes.COLORED_BLOCK, new BSColored(0x000000)) // 默认的黑色方块
	export const WALL: Block<BSBiColored> = new Block('Wall', NativeBlockAttributes.WALL, new BSBiColored(0xaaaaaa, 0xbbbbbb)) // 灰色的墙
	export const WATER: Block<BSColored> = new Block('Water', NativeBlockAttributes.WATER, new BSColored(0x2222FF)) // 蓝色的水
	export const GLASS: Block<BSBiColored> = new Block('Glass', NativeBlockAttributes.GLASS, new BSBiColored(0xddffff)) // 青色的玻璃
	export const BEDROCK: Block<BSBiColored> = new Block('Bedrock', NativeBlockAttributes.BEDROCK, new BSBiColored(0x999999, 0xaaaaaa)) // 颜色更深的墙
	export const METAL: Block<BSBiColored> = new Block('Metal', NativeBlockAttributes.METAL, new BSBiColored(0x444444, 0xdddddd)) // 白里透黑的金属
	export const MOVEABLE_WALL: Block<BSBiColored> = new Block('MoveableWall', NativeBlockAttributes.MOVEABLE_WALL, new BSBiColored(0x889988, 0xbbccbb)) // 绿色的墙

	export const X_TRAP_HURT: Block<null> = new Block('XTrapHurt', NativeBlockAttributes.X_TRAP_HURT, null)
	export const X_TRAP_KILL: Block<null> = new Block('XTrapKill', NativeBlockAttributes.X_TRAP_KILL, null)
	export const X_TRAP_ROTATE: Block<null> = new Block('XTrapRotate', NativeBlockAttributes.X_TRAP_ROTATE, null)

	export const COLOR_SPAWNER: Block<null> = new Block('ColorSpawner', NativeBlockAttributes.COLOR_SPAWNER, null)
	export const LASER_TRAP: Block<null> = new Block('LaserTrap', NativeBlockAttributes.LASER_TRAP, null)
	export const SPAWN_POINT_MARK: Block<null> = new Block('SpawnPointMark', NativeBlockAttributes.SPAWN_POINT_MARK, null)
	export const SUPPLY_POINT: Block<null> = new Block('SupplyPoint', NativeBlockAttributes.SUPPLY_POINT, null)
	export const GATE_OPEN: Block<BSGate> = new Block('Gate', NativeBlockAttributes.GATE_CLOSE, new BSGate(false)) // 打开的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的
	export const GATE_CLOSE: Block<BSGate> = new Block('Gate', NativeBlockAttributes.GATE_CLOSE, new BSGate(false)) // 关闭的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的

}

/**
 * 原生方块ID
 * ? 💭这里的「ID管理」似乎有些混乱
 * * 暂且就使用类名
 * 
 * TODO: 梳理「方块注册」「实体注册」逻辑
 */
export module NativeBlockIDs {

	export const VOID: typeID = NativeBlockPrototypes.VOID.id

	export const COLORED: typeID = NativeBlockPrototypes.COLORED.id
	export const WALL: typeID = NativeBlockPrototypes.WALL.id
	export const WATER: typeID = NativeBlockPrototypes.WATER.id
	export const GLASS: typeID = NativeBlockPrototypes.GLASS.id
	export const BEDROCK: typeID = NativeBlockPrototypes.BEDROCK.id
	export const METAL: typeID = NativeBlockPrototypes.METAL.id
	export const MOVEABLE_WALL: typeID = NativeBlockPrototypes.MOVEABLE_WALL.id

	export const X_TRAP_HURT: typeID = NativeBlockPrototypes.X_TRAP_HURT.id
	export const X_TRAP_KILL: typeID = NativeBlockPrototypes.X_TRAP_KILL.id
	export const X_TRAP_ROTATE: typeID = NativeBlockPrototypes.X_TRAP_ROTATE.id

	export const COLOR_SPAWNER: typeID = NativeBlockPrototypes.COLOR_SPAWNER.id
	export const LASER_TRAP: typeID = NativeBlockPrototypes.LASER_TRAP.id
	export const SPAWN_POINT_MARK: typeID = NativeBlockPrototypes.SPAWN_POINT_MARK.id
	export const SUPPLY_POINT: typeID = NativeBlockPrototypes.SUPPLY_POINT.id
	export const GATE: typeID = NativeBlockPrototypes.GATE_OPEN.id

}

export const ALL_NATIVE_BLOCKS: Block[] = [
	NativeBlockPrototypes.VOID,
	NativeBlockPrototypes.WALL,
	NativeBlockPrototypes.WATER,
	NativeBlockPrototypes.GLASS,
	NativeBlockPrototypes.BEDROCK,
	NativeBlockPrototypes.X_TRAP_HURT,
	NativeBlockPrototypes.X_TRAP_KILL,
	NativeBlockPrototypes.X_TRAP_ROTATE,
	NativeBlockPrototypes.COLORED,
	NativeBlockPrototypes.COLOR_SPAWNER,
	NativeBlockPrototypes.LASER_TRAP,
	NativeBlockPrototypes.METAL,
	NativeBlockPrototypes.SPAWN_POINT_MARK,
	NativeBlockPrototypes.SUPPLY_POINT,
	NativeBlockPrototypes.GATE_CLOSE, // !【2023-10-07 21:54:39】默认这个门是关闭的
	NativeBlockPrototypes.MOVEABLE_WALL,
]

/**
 * 用于「ID⇒零参构造函数」的映射表
 * * 应用：「ID⇒白板对象⇒JS反对象化」
 */
export const NativeBlockConstructorMap: Map<typeID, () => Block> = MapFromGeneratorKV(
	ALL_NATIVE_BLOCKS,
	(block: Block): typeID => block.id,
	(block: Block): (() => Block) => ((): Block => block.copy()),
)
