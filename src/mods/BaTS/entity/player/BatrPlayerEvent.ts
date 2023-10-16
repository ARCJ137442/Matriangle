import { NativePlayerEventOptions } from '../../../native/entities/player/controller/PlayerEvent'
import BonusBox from '../item/BonusBox'

/**
 * 原先用于AS3游戏版本的、相对「原生机制」独有的「玩家事件」
 */
export enum BatrPlayerEvent {
	/** 在「拾起奖励箱」时响应（获得奖励后、删除奖励箱前） */
	PICKUP_BONUS_BOX = 'PickupBonusBox',

	/** 在「地图变换」时响应（此时地图应已变换完成） */
	MAP_TRANSFORM = 'MapTransform',

	/** 在「经验升级」时响应（此时已经完成升级） */
	LEVELUP = 'Levelup',
}

export interface BatrPlayerEventOptions extends NativePlayerEventOptions {
	[BatrPlayerEvent.MAP_TRANSFORM]: undefined
	[BatrPlayerEvent.PICKUP_BONUS_BOX]: {
		/** 拾取到的奖励箱 */
		box: BonusBox
	}
	[BatrPlayerEvent.LEVELUP]: undefined
}
