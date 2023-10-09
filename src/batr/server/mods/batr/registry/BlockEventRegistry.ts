import { BlockTypeEventMap } from "../../../api/block/BlockEventTypes";
import { iPoint } from "../../../../common/geometricTools";
import IMatrix from "../../../main/IMatrix";
import IPlayer from "../../native/entities/player/IPlayer";
import Block from "../../../api/block/Block";

/**
 * 原生的「方块事件类型」
 * * 只有真正用到时才取消注释
 */
export enum NativeBlockEventType {
	// TICK = "tick",
	RANDOM_TICK = "randomTick",// * 随机刻

	// DESTROY = "destroy",
	// CREATE = "create",
	// UPDATE = "update"
	PLAYER_MOVED_IN = "playerMovedIn",
	PLAYER_MOVE_OUT = "playerMoveOut"
}
/**
 * 原生的「方块事件映射」
 */

export interface NativeBlockTypeEventMap extends BlockTypeEventMap {
	/**
	 * 处理「玩家移入方块」
	 * * 此时玩家已经移入方块，故名为「Moved」
	 *
	 * @param host 所在母体
	 * @param position 触发事件的方块位置（一般与玩家位置相同）
	 * @param p 移入方块的玩家
	 */
	[NativeBlockEventType.PLAYER_MOVED_IN]?: (host: IMatrix, position: iPoint, p: IPlayer) => void;

	/**
	 * 处理「玩家移出方块」
	 * * 此时玩家尚未移出方块，故名为「Move」
	 *
	 * @param host 所在母体
	 * @param position 触发事件的方块位置（一般与玩家位置相同）
	 * @param p 将移出方块的玩家
	 */
	[NativeBlockEventType.PLAYER_MOVE_OUT]?: (host: IMatrix, position: iPoint, p: IPlayer) => void;

	/**
	 * 处理「方块随机刻」
	 * * 一般由「方块随机刻分派者」分派
	 * s
	 * @param host 所在母体
	 * @param position 触发事件的方块位置（一般与玩家位置相同）
	 * @param block 被触发随机刻的方块对象（在「方块随机刻分派者」中复用）
	 */
	[NativeBlockEventType.RANDOM_TICK]?: (host: IMatrix, position: iPoint, block: Block) => void;

}
