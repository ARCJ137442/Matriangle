import { BlockType } from "../block/BlockCommon";

/**
 * 【20230910 9:39:23】
 * ! 注意：不能与`NativeBlockAttributes`的注册表合并
 * * 因为此处是默认`NativeBlockAttributes`与「各方块类」都定义的，而import语句在TS只能前置
 * * 不这样做会产生「循环依赖」问题
 */

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
import { PatchIndexType } from "../../general/GlobalGameVariables";
export { default as XTrapRotate } from "../block/blocks/XTrapRotate";

/**
 * Define all `BlockType` of the native block types in the game
 * 定义所有游戏内置的方块类型
 * 
 * ! The link between BlockType and block is the property `attributes` of instances of a BlockType
 * ! 方块类型和其属性的连接之间的连接，是方块实例的属性“attributes”
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

/**
 * 散列化一个「方块类型」，使之能用于「事件派发」机制中
 * @param blockType 用于事件派发的方块类型
 * @returns 用于事件派发的索引
 */
export function hashBlockType(blockType: BlockType): PatchIndexType {
	return blockType.name
}