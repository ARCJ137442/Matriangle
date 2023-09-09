

import { int } from "../../legacy/AS3Legacy";
import BlockCommon from "../../game/block/BlockCommon";
import IMapStorage from "../../game/block/system/IMapStorage";

/**
 * 用来定义有关地图的显示
 */
/**
 * 用来显示地图的显示对象模型
 * * 作为一个对象容器，装载方块实例
 * * 配合「地图存储结构」使用
 * * 将用于调用其中每一个方块的
 * 
 * TODO: 各类具体显示上的实现
 */

export default interface IMapDisplayer {
	get storage(): IMapStorage;
	hasBlock(x: int, y: int): Boolean;
	getBlock(x: int, y: int): BlockCommon;
	removeBlock(x: int, y: int): void;
	removeAllBlock(): void;
	setBlock(x: int, y: int, block: BlockCommon, overwrite?: Boolean/* = true*/): void;
}