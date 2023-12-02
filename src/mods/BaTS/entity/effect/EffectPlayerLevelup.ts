import { uint } from 'matriangle-legacy/AS3Legacy'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { fPoint } from 'matriangle-common/geometricTools'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/** 专用的显示状态数据 */
interface IDisplayDataStateEffectPlayerLevelup extends IDisplayDataStateEffect {
	/**
	 * 爆炸的颜色（十六进制整数值）
	 */
	color: uint
}
/**
 * 玩家升级
 * * 呈现一个特定颜色的、加速上升并迅速淡出的（向上）箭头
 * * 用于提示玩家属性（Buff）的提升
 */
export default class EffectPlayerLevelup extends Effect<IDisplayDataStateEffectPlayerLevelup> {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectPlayerLevelup'

	public static readonly LIFE: number = TPS

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		/** 只读的「自身颜色」 */
		protected readonly color: uint // LIFE: uint = EffectPlayerLevelup.LIFE
	) {
		super(EffectPlayerLevelup.ID, position, EffectPlayerLevelup.LIFE)
		this._proxy.storeState('color', color)
	}
}
