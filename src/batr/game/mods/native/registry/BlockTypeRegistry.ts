

import { BlockType } from "../../../api/block/Block";

/**
 * 【20230910 9:39:23】
 * ! 注意：不能与`NativeBlockAttributes`的注册表合并
 * * 因为此处是默认`NativeBlockAttributes`与「各方块类」都定义的，而import语句在TS只能前置
 * * 不这样做会产生「循环依赖」问题
 */

//================Reexport Types================//
import Bedrock from "../blocks/Bedrock";
export { default as Bedrock } from "../blocks/Bedrock";

import ColorSpawner from "../blocks/ColorSpawner";
export { default as ColorSpawner } from "../blocks/ColorSpawner";

import Gate from "../blocks/Gate";
export { default as Gate } from "../blocks/Gate";

import Glass from "../blocks/Glass";
export { default as Glass } from "../blocks/Glass";

import LaserTrap from "../blocks/LaserTrap";
export { default as LaserTrap } from "../blocks/LaserTrap";

import Metal from "../blocks/Metal";
export { default as Metal } from "../blocks/Metal";

import MoveableWall from "../blocks/MoveableWall";
export { default as MoveableWall } from "../blocks/MoveableWall";

import SpawnPointMark from "../blocks/SpawnPointMark";
export { default as SpawnPointMark } from "../blocks/SpawnPointMark";

import SupplyPoint from "../blocks/SupplyPoint";
export { default as SupplyPoint } from "../blocks/SupplyPoint";

import Wall from "../blocks/Wall";
export { default as Wall } from "../blocks/Wall";

import Water from "../blocks/Water";
export { default as Water } from "../blocks/Water";

import Void from "../blocks/Void";
export { default as Void } from "../blocks/Void";

import Colored from "../blocks/Colored";
export { default as Colored } from "../blocks/Colored";

import XTrapHurt from "../blocks/XTrapHurt";
export { default as XTrapHurt } from "../blocks/XTrapHurt";

import XTrapKill from "../blocks/XTrapKill";
export { default as XTrapKill } from "../blocks/XTrapKill";

import XTrapRotate from "../blocks/XTrapRotate";
export { default as XTrapRotate } from "../blocks/XTrapRotate";

import { PatchIndexType } from "../../../main/GlobalGameVariables";
import { key } from "../../../../common/utils";

/**
 * Define all `BlockType` of the native block types in the game
 * 定义所有游戏内置的方块类型
 * 
 * ! The link between BlockType and block instanceof the property `attributes` of instances of a BlockType
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

}

export const ALL_NATIVE_BLOCKS: BlockType[] = [
	NativeBlockTypes.VOID,
	NativeBlockTypes.WALL,
	NativeBlockTypes.WATER,
	NativeBlockTypes.GLASS,
	NativeBlockTypes.BEDROCK,
	NativeBlockTypes.X_TRAP_HURT,
	NativeBlockTypes.X_TRAP_KILL,
	NativeBlockTypes.X_TRAP_ROTATE,
	NativeBlockTypes.COLORED,
	NativeBlockTypes.COLOR_SPAWNER,
	NativeBlockTypes.LASER_TRAP,
	NativeBlockTypes.METAL,
	NativeBlockTypes.SPAWN_POINT_MARK,
	NativeBlockTypes.SUPPLY_POINT,
	NativeBlockTypes.GATE_OPEN,
	NativeBlockTypes.GATE_CLOSE,
	NativeBlockTypes.MOVEABLE_WALL,
]

/**
 * 散列化一个「方块类型」，使之能用于「事件派发」机制中
 * @param blockType 用于事件派发的方块类型
 * @returns 用于事件派发的索引
 */
export function hashBlockType(blockType: BlockType): PatchIndexType {
	return blockType.name
}

/**
 * 🔬一个简单的「ID（类名）——类」映射表
 * 
 * TODO: 未来是否要走Minecraft的机制，不好说
 */
export const NativeBlockTypeMap: Map<key, BlockType> = new Map()
for (const bType of ALL_NATIVE_BLOCKS) {
	NativeBlockTypeMap.set(bType.name, bType)
}

// console.log(
// 	NativeBlockTypeMap,
// 	(NativeBlockTypeMap.get('BlockWall') as any)?.getBlank()
// )
