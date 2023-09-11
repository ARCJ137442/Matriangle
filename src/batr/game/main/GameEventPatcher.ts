import { iPoint } from "../../common/geometricTools";
import BlockCommon, { BlockType } from "../block/BlockCommon";
import IBatrGame from "./IBatrGame";

export type handlerF = (host: IBatrGame, ...args: any[]) => void;

export type randomTickEventF = (host: IBatrGame, block: BlockCommon, position: iPoint) => void;

/**
 * 游戏事件派发器
 * * 使用**函数式编程**，集中管理与游戏方块、游戏实体等相关的游戏事件
 * ! 最初是为了解决「事件处理函数定义在方块类内，导致『方块 import 实体 import 游戏主体 import 地图 import 方块』循环导入」的问题
 */
export default class GameEventPatcher {
	/**
	 * 通过「方块类型」进行事件分派的字典
	 */
	public _blockPatchMap: Map<BlockType, handlerF> = new Map<BlockType, handlerF>();

	/**
	 * 构造函数
	 */
	public constructor() { }

	/**
	 * （示例）
	 * 事件注册@随机刻
	 */
	public registerRandomTickEvent(blockType: BlockType, handler: randomTickEventF): void {
		this._blockPatchMap.set(blockType, handler);
	}
}

