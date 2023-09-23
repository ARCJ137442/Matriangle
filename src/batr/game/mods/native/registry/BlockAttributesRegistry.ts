import BlockAttributes from "../../../api/block/BlockAttributes";

/**
 * ! 【20230910 9:33:30】独立成单个注册表，避免循环导入问题
 * * 避免在未生成NativeBlockAttributes时注册「方块类型」时引用各自方块类，而类中又引入NativeBlockAttributes的问题
 */

/**
 * Define all attributes that instanceof used for classes of blocks
 * 
 * ! The link between BlockType and block instanceof the property `attributes` of instances of a BlockType
 * * So that it's unnecessarily to make a list to contain all of the attributes
 * 
 */
export module NativeBlockAttributes {

	export const VOID: BlockAttributes = new BlockAttributes(0xffffff, 0x0).asGas;
	export const WALL: BlockAttributes = new BlockAttributes(0xBBBBBB).asSolid;
	export const WATER: BlockAttributes = new BlockAttributes(0x2222FF, 0x40000000).asLiquid.asArenaBlock;
	export const GLASS: BlockAttributes = new BlockAttributes(0x000000, 0x80000000).asTransparent.asArenaBlock;
	export const BEDROCK: BlockAttributes = new BlockAttributes(0x888888).asSolid.asUnbreakable;

	export const X_TRAP_HURT: BlockAttributes = new BlockAttributes(0xffff00, 0xc0000000).asGas.asHurtZone.asArenaBlock;
	export const X_TRAP_KILL: BlockAttributes = new BlockAttributes(0xff0000, 0xc0000000).asGas.asKillZone.asArenaBlock;
	export const X_TRAP_ROTATE: BlockAttributes = new BlockAttributes(0x0000ff, 0xc0000000).asGas.asRotateZone.asArenaBlock;

	export const COLORED_BLOCK: BlockAttributes = new BlockAttributes(0x000000).asSolid;
	export const COLOR_SPAWNER: BlockAttributes = new BlockAttributes(0x444444).asSolid.asArenaBlock;

	export const LASER_TRAP: BlockAttributes = new BlockAttributes(0x444444).asSolid.asArenaBlock;
	export const METAL: BlockAttributes = new BlockAttributes(0x666666).asSolid.asMetal.asArenaBlock;
	export const SPAWN_POINT_MARK: BlockAttributes = new BlockAttributes(0x6666ff).asBase;

	export const SUPPLY_POINT: BlockAttributes = new BlockAttributes(0x66ff66).asBase.asSupplyPoint;
	export const GATE_OPEN: BlockAttributes = new BlockAttributes(0x888888, 0x50000000).asGate;

	export const GATE_CLOSE: BlockAttributes = new BlockAttributes(0x888888).asGateClose;

	export const MOVEABLE_WALL: BlockAttributes = new BlockAttributes(0xBBFFBB).asSolid.asArenaBlock;

}
