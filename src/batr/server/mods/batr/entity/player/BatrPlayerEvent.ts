import { NativePlayerEventOptions } from '../../../native/entities/player/controller/PlayerEvent'
import BonusBox from '../item/BonusBox'

/**
 * 原先用于AS3游戏版本的、相对「原生机制」独有的「玩家事件」
 */
export enum BatrPlayerEvent {
	/** 在「拾起奖励箱」时响应 */
	PICKUP_BONUS_BOX = 'PickupBonusBox',

	/** 在「地图变换」时响应（这时候地图应已变换完成） */
	MAP_TRANSFORM = 'MapTransform',
}

export interface BatrPlayerEventOptions extends NativePlayerEventOptions {
	[BatrPlayerEvent.MAP_TRANSFORM]: undefined
	[BatrPlayerEvent.PICKUP_BONUS_BOX]: {
		/** 拾取到的奖励箱（在） */
		box: BonusBox
	}
}
