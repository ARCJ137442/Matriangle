import Block from 'matriangle-api/server/block/Block'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import BSColored from 'matriangle-mod-native/block/BSColored'
import BSBiColored from '../block/BSBiColored'
import BSGate from '../block/BSGate'
import { MapFromGeneratorKV } from 'matriangle-common/utils'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'

/**
 * Define all attributes that instanceof used for classes of blocks
 * ! The link between BlockType and block instanceof the property `attributes` of instances of a BlockType
 * * So that it's unnecessarily to make a list to contain all of the attributes
 *
 * ! 【20230910 9:33:30】独立成单个注册表，避免循环导入问题
 * * 避免在未生成NativeBlockAttributes时注册「方块类型」时引用各自方块类，而类中又引入NativeBlockAttributes的问题
 */
export module BlockAttributes_Batr {
	export const WALL: BlockAttributes = new BlockAttributes(12303291).asSolid
	export const WATER: BlockAttributes = new BlockAttributes(
		2237183,
		1073741824
	).asLiquid.asArenaBlock
	export const GLASS: BlockAttributes = new BlockAttributes(0, 2147483648)
		.asTransparentSolid.asArenaBlock
	export const BEDROCK: BlockAttributes = new BlockAttributes(8947848).asSolid
		.asUnbreakable

	export const X_TRAP_HURT: BlockAttributes = new BlockAttributes(
		16776960,
		3221225472
	).asGas.asHurtZone.asArenaBlock
	export const X_TRAP_KILL: BlockAttributes = new BlockAttributes(
		16711680,
		3221225472
	).asGas.asKillZone.asArenaBlock
	export const X_TRAP_ROTATE: BlockAttributes = new BlockAttributes(
		255,
		3221225472
	).asGas.asRotateZone.asArenaBlock

	export const COLOR_SPAWNER: BlockAttributes = new BlockAttributes(4473924)
		.asSolid.asArenaBlock

	export const LASER_TRAP: BlockAttributes = new BlockAttributes(4473924)
		.asSolid.asArenaBlock
	export const METAL: BlockAttributes = new BlockAttributes(6710886).asSolid
		.asMetal.asArenaBlock
	export const SPAWN_POINT_MARK: BlockAttributes = new BlockAttributes(
		6711039
	).asBase

	export const SUPPLY_POINT: BlockAttributes = new BlockAttributes(6750054)
		.asBase.asSupplyPoint

	// export const GATE_OPEN: BlockAttributes = new BlockAttributes(0x888888, 0x50000000).asGateOpen; // !【2023-10-08 00:15:59】暂时不使用，因为已经在Gate状态中「动态缓存」了
	export const GATE_CLOSE: BlockAttributes = new BlockAttributes(8947848)
		.asGateClose

	export const MOVEABLE_WALL: BlockAttributes = new BlockAttributes(12320699)
		.asSolid.asArenaBlock
}

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
		BlockAttributes_Batr.WALL,
		new BSBiColored(0xaaaaaa, 0xbbbbbb)
	) // 灰色的墙
	export const WATER: Block<BSColored> = new Block(
		'Water',
		BlockAttributes_Batr.WATER,
		new BSColored(0x2222ff)
	) // 蓝色的水
	export const GLASS: Block<BSBiColored> = new Block(
		'Glass',
		BlockAttributes_Batr.GLASS,
		new BSBiColored(0xddffff)
	) // 青色的玻璃
	export const BEDROCK: Block<BSBiColored> = new Block(
		'Bedrock',
		BlockAttributes_Batr.BEDROCK,
		new BSBiColored(0x999999, 0xaaaaaa)
	) // 颜色更深的墙
	export const METAL: Block<BSBiColored> = new Block(
		'Metal',
		BlockAttributes_Batr.METAL,
		new BSBiColored(0x444444, 0xdddddd)
	) // 白里透黑的金属
	export const MOVEABLE_WALL: Block<BSBiColored> = new Block(
		'MoveableWall',
		BlockAttributes_Batr.MOVEABLE_WALL,
		new BSBiColored(0x889988, 0xbbccbb)
	) // 绿色的墙

	export const X_TRAP_HURT: Block<null> = new Block(
		'XTrapHurt',
		BlockAttributes_Batr.X_TRAP_HURT,
		null
	)
	export const X_TRAP_KILL: Block<null> = new Block(
		'XTrapKill',
		BlockAttributes_Batr.X_TRAP_KILL,
		null
	)
	export const X_TRAP_ROTATE: Block<null> = new Block(
		'XTrapRotate',
		BlockAttributes_Batr.X_TRAP_ROTATE,
		null
	)

	export const COLOR_SPAWNER: Block<null> = new Block(
		'ColorSpawner',
		BlockAttributes_Batr.COLOR_SPAWNER,
		null
	)
	export const LASER_TRAP: Block<null> = new Block(
		'LaserTrap',
		BlockAttributes_Batr.LASER_TRAP,
		null
	)
	export const SPAWN_POINT_MARK: Block<null> = new Block(
		'SpawnPointMark',
		BlockAttributes_Batr.SPAWN_POINT_MARK,
		null
	)
	export const SUPPLY_POINT: Block<null> = new Block(
		'SupplyPoint',
		BlockAttributes_Batr.SUPPLY_POINT,
		null
	)
	export const GATE_OPEN: Block<BSGate> = new Block(
		'Gate',
		BlockAttributes_Batr.GATE_CLOSE,
		new BSGate(false)
	) // 打开的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的
	export const GATE_CLOSE: Block<BSGate> = new Block(
		'Gate',
		BlockAttributes_Batr.GATE_CLOSE,
		new BSGate(false)
	) // 关闭的门 // !【2023-10-07 21:53:46】只是状态不同，id还是相同的
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
	export const SPAWN_POINT_MARK: typeID =
		BatrBlockPrototypes.SPAWN_POINT_MARK.id
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
export const BATR_BLOCK_CONSTRUCTOR_MAP: BlockConstructorMap =
	MapFromGeneratorKV(
		ALL_BATR_BLOCKS,
		(block: Block): typeID => block.id,
		(block: Block): (() => Block) =>
			(): Block =>
				block.copy()
	)
