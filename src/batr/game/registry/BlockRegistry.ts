import BlockAttributes from "../block/BlockAttributes";
import { BlockType } from "../block/BlockCommon";

//================Reexport Types================//
import Bedrock from "../block/blocks/Bedrock";
export { default as Bedrock } from "../block/blocks/Bedrock";

import ColorSpawner from "../block/blocks/ColorSpawner";
export { default as ColorSpawner } from "../block/blocks/ColorSpawner";

import Gate from "../block/blocks/Gate";
export { default as Gate } from "../block/blocks/Gate";

import Glass from "../block/blocks/Glass";
export { default as Glass } from "../block/blocks/Glass";

import LaserTrap from "../block/blocks/LaserTrap";
export { default as LaserTrap } from "../block/blocks/LaserTrap";

import Metal from "../block/blocks/Metal";
export { default as Metal } from "../block/blocks/Metal";

import MoveableWall from "../block/blocks/MoveableWall";
export { default as MoveableWall } from "../block/blocks/MoveableWall";

import SpawnPointMark from "../block/blocks/SpawnPointMark";
export { default as SpawnPointMark } from "../block/blocks/SpawnPointMark";

import SupplyPoint from "../block/blocks/SupplyPoint";
export { default as SupplyPoint } from "../block/blocks/SupplyPoint";

import Wall from "../block/blocks/Wall";
export { default as Wall } from "../block/blocks/Wall";

import Water from "../block/blocks/Water";
export { default as Water } from "../block/blocks/Water";

import Void from "../block/blocks/Void";
export { default as Void } from "../block/blocks/Void";

import Colored from "../block/blocks/Colored";
export { default as Colored } from "../block/blocks/Colored";

import XTrapHurt from "../block/blocks/XTrapHurt";
export { default as XTrapHurt } from "../block/blocks/XTrapHurt";

import XTrapKill from "../block/blocks/XTrapKill";
export { default as XTrapKill } from "../block/blocks/XTrapKill";

import XTrapRotate from "../block/blocks/XTrapRotate";
export { default as XTrapRotate } from "../block/blocks/XTrapRotate";




/**
 * Define all attributes that is used for classes of blocks
 * 
 * ! The link between BlockType and block is the property `attributes` of instances of a BlockType
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

/**
 * Define all `BlockType` of the native block types in the game
 * 
 * ! The link between BlockType and block is the property `attributes` of instances of a BlockType
 * * 
 * 
 */
export module NativeBlockTypes {

	export const VOID: BlockType = Void
	export const WALL: BlockType = Wall
	export const WATER: BlockType = Water
	export const GLASS: BlockType = Glass
	export const BEDROCK: BlockType = Bedrock
	export const X_TRAP_HURT: BlockType = XTrapHurt
	export const X_TRAP_KILL: BlockType = XTrapKill
	export const X_TRAP_ROTATE: BlockType = XTrapRotate
	export const COLORED: BlockType = Colored
	export const COLOR_SPAWNER: BlockType = ColorSpawner
	export const LASER_TRAP: BlockType = LaserTrap
	export const METAL: BlockType = Metal
	export const SPAWN_POINT_MARK: BlockType = SpawnPointMark
	export const SUPPLY_POINT: BlockType = SupplyPoint
	export const GATE_OPEN: BlockType = Gate
	export const GATE_CLOSE: BlockType = Gate
	export const MOVEABLE_WALL: BlockType = MoveableWall

	export const ALL_NATIVE_BLOCKS: BlockType[] = [
		VOID,
		WALL,
		WATER,
		GLASS,
		BEDROCK,
		X_TRAP_HURT,
		X_TRAP_KILL,
		X_TRAP_ROTATE,
		COLORED,
		COLOR_SPAWNER,
		LASER_TRAP,
		METAL,
		SPAWN_POINT_MARK,
		SUPPLY_POINT,
		GATE_OPEN,
		GATE_CLOSE,
		MOVEABLE_WALL,
	]

}