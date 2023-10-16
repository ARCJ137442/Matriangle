import { BlockTypeEventMap } from 'matriangle-api/server/block/BlockEventTypes'
import { iPoint } from 'matriangle-common/geometricTools'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import Block from 'matriangle-api/server/block/Block'

/**
 * 原生的「方块事件类型」
 * * 只有真正用到时才取消注释
 */
export enum BlockEventType_Batr {
	// TICK = "tick",
	RANDOM_TICK = 'randomTick', // * 随机刻
}
/**
 * 原生的「方块事件映射」
 */

export interface BlockTypeEventMap_Batr extends BlockTypeEventMap {
	/**
	 * 处理「方块随机刻」
	 * * 一般由「方块随机刻分派者」分派
	 * s
	 * @param host 所在母体
	 * @param position 触发事件的方块位置（一般与玩家位置相同）
	 * @param block 被触发随机刻的方块对象（在「方块随机刻分派者」中复用）
	 */
	[BlockEventType_Batr.RANDOM_TICK]?: (
		host: IMatrix,
		position: iPoint,
		block: Block
	) => void
}
