import Block from '../../../api/block/Block'
import { typeID } from '../../../api/registry/IWorldRegistry'
import BSColored from '../block/BSColored'
import { NativeBlockAttributes } from './BlockAttributesRegistry'
import BSBiColored from '../block/BSBiColored'
import BSGate from '../block/BSGate'
import { MapFromGeneratorKV } from '../../../../common/utils'
import { BlockConstructorMap } from '../../../api/map/IMapStorage'

/**
 * 方块原型列表
 * * 存储所有类型方块的「原型对象」
 *
 * !【2023-10-09 20:19:48】现在存储的是所有在AS3「游戏」版本中「用于游戏的方块」
 *
 * !【2023-10-07 17:09:30】⚠️这里的所有对象，在被外部用于赋值时，都应该先进行深拷贝
 * * 不深拷贝则会影响到后续创建的稳定性
 */
export module BatrBlockPrototypes {
	export const WALL: Block<BSBiColored> = new Block(
		'Wall',
		NativeBlockAttributes.WALL,
		new BSBiColored(0xaaaaaa, 0xbbbbbb)
	) // 灰色的墙
	export const WATER: Block<BSColored> = new Block('Water', NativeBlockAttributes.WATER, new BSColored(0x2222ff)) // 蓝色的水
	export const GLASS: Block<BSBiColored> = new Block('Glass', NativeBlockAttributes.GLASS, new BSBiColored(0xddffff)) // 青色的玻璃
	export const BEDROCK: Block<BSBiColored> = new Block(
		'Bedrock',
		NativeBlockAttributes.BEDROCK,
		new BSBiColored(0x999999, 0xaaaaaa)
	) // 颜色更深的墙
	export const METAL: Block<BSBiColored> = new Block(
		'Metal',
		NativeBlockAttributes.METAL,
		new BSBiColored(0x444444, 0xdddddd)
	) // 白里透黑的金属
	export const MOVEABLE_WALL: Block<BSBiColored> = new Block(
		'MoveableWall',
		NativeBlockAttributes.MOVEABLE_WALL,
		new BSBiColored(0x889988, 0xbbccbb)
	) // 绿色的墙

	export const X_TRAP_HURT: Block<null> = new Block('XTrapHurt', NativeBlockAttributes.X_TRAP_HURT, null)
	export const X_TRAP_KILL: Block<null> = new Block('XTrapKill', NativeBlockAttributes.X_TRAP_KILL, null)
	export const X_TRAP_ROTATE: Block<null> = new Block('XTrapRotate', NativeBlockAttributes.X_TRAP_ROTATE, null)

	export const COLOR_SPAWNER: Block<null> = new Block('ColorSpawner', NativeBlockAttributes.COLOR_SPAWNER, null)
	export const LASER_TRAP: Block<null> = new Block('LaserTrap', NativeBlockAttributes.LASER_TRAP, null)
	export const SPAWN_POINT_MARK: Block<null> = new Block(
		'SpawnPointMark',
		NativeBlockAttributes.SPAWN_POINT_MARK,
		null
	)
	export const SUPPLY_POINT: Block<null> = new Block('SupplyPoint', NativeBlockAttributes.SUPPLY_POINT, null)
	export const GATE_OPEN: Block<BSGate> = new Block('Gate', NativeBlockAttributes.GATE_CLOSE, new BSGate(false)) // 打开的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的
	export const GATE_CLOSE: Block<BSGate> = new Block('Gate', NativeBlockAttributes.GATE_CLOSE, new BSGate(false)) // 关闭的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的
}

/**
 * AS3「游戏用方块」ID
 * ? 💭这里的「ID管理」似乎有些混乱
 * * 暂且就使用类名
 *
 * TODO: 梳理「方块注册」「实体注册」逻辑
 */
export module BatrBlockIDs {
	export const WALL: typeID = BatrBlockPrototypes.WALL.id
	export const WATER: typeID = BatrBlockPrototypes.WATER.id
	export const GLASS: typeID = BatrBlockPrototypes.GLASS.id
	export const BEDROCK: typeID = BatrBlockPrototypes.BEDROCK.id
	export const METAL: typeID = BatrBlockPrototypes.METAL.id
	export const MOVEABLE_WALL: typeID = BatrBlockPrototypes.MOVEABLE_WALL.id

	export const X_TRAP_HURT: typeID = BatrBlockPrototypes.X_TRAP_HURT.id
	export const X_TRAP_KILL: typeID = BatrBlockPrototypes.X_TRAP_KILL.id
	export const X_TRAP_ROTATE: typeID = BatrBlockPrototypes.X_TRAP_ROTATE.id

	export const COLOR_SPAWNER: typeID = BatrBlockPrototypes.COLOR_SPAWNER.id
	export const LASER_TRAP: typeID = BatrBlockPrototypes.LASER_TRAP.id
	export const SPAWN_POINT_MARK: typeID = BatrBlockPrototypes.SPAWN_POINT_MARK.id
	export const SUPPLY_POINT: typeID = BatrBlockPrototypes.SUPPLY_POINT.id
	export const GATE: typeID = BatrBlockPrototypes.GATE_OPEN.id
}

export const ALL_BATR_BLOCKS: Block[] = [
	BatrBlockPrototypes.WALL,
	BatrBlockPrototypes.WATER,
	BatrBlockPrototypes.GLASS,
	BatrBlockPrototypes.BEDROCK,
	BatrBlockPrototypes.X_TRAP_HURT,
	BatrBlockPrototypes.X_TRAP_KILL,
	BatrBlockPrototypes.X_TRAP_ROTATE,
	BatrBlockPrototypes.COLOR_SPAWNER,
	BatrBlockPrototypes.LASER_TRAP,
	BatrBlockPrototypes.METAL,
	BatrBlockPrototypes.SPAWN_POINT_MARK,
	BatrBlockPrototypes.SUPPLY_POINT,
	BatrBlockPrototypes.GATE_CLOSE, // !【2023-10-07 21:54:39】默认这个门是关闭的
	BatrBlockPrototypes.MOVEABLE_WALL,
]

/**
 * 用于「ID⇒零参构造函数」的映射表
 * * 应用：「ID⇒白板对象⇒JS反对象化」
 */
export const BATR_BLOCK_CONSTRUCTOR_MAP: BlockConstructorMap = MapFromGeneratorKV(
	ALL_BATR_BLOCKS,
	(block: Block): typeID => block.id,
	(block: Block): (() => Block) =>
		(): Block =>
			block.copy()
)
