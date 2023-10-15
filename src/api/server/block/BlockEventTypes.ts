import { iPoint } from '../../../common/geometricTools'
import IMatrix from '../main/IMatrix'
import { typeID } from '../registry/IWorldRegistry'

//==== 取自「事件分派」系统，旨在「兼顾通用性」时避免循环导入 ====//

/**
 * *【2023-10-08 16:03:09】最新的「事件分派系统」：方块类型⇒事件类型⇒事件处理函数
 */
export type BlockEventType = string | symbol

/**
 * 总的「方块ID⇒事件类型⇒事件处理函数」映射表
 */
export type BlockEventMap = {
	[blockID: typeID]: BlockTypeEventMap
}

/**
 * 「『方块ID⇒事件处理函数』映射表」
 * * 单个「方块ID」对应的「事件映射表」
 */
export interface BlockTypeEventMap {
	/**
	 * 事件的通用键值对写法
	 * @param host 所在的「世界母体」
	 */
	[eventType: BlockEventType]: undefined | BlockEventHandler
}

/** 事件处理函数的通用类型 */
export type BlockEventHandler = (
	host: IMatrix,
	position: iPoint,
	...args: any[]
) => void // !【2023-10-09 15:35:11】不能使用unknown，不然无法支持「自定义附加参数」
