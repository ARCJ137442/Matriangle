import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

// /**
//  * 「2方块容器特效」的「动画模式」枚举
//  */
// export enum Effect2BlockAnimationMode {
// 	spawn = 'spawn',
// 	teleport = 'teleport',
// }
// !【2023-11-22 22:26:00】↑暂时废弃这样的表征——为何不用「新实体类型」去扩展呢？

/** 「2方块容器特效」的显示状态接口 */
export interface IDisplayDataStateEffect2Blocks
	extends IDisplayDataStateEffect {
	/**
	 * 颜色（十六进制整数）
	 */
	color: uint
	/**
	 * 动画模式
	 * * 目前是个枚举
	 *   * 'spawn'：特效「重生」
	 *   * 'teleport'：特效「传送」
	 *   * 💭后续还可能添加其它类型的特效动画
	 */
	// animationMode: Effect2BlockAnimationMode
}

/**
 * 双方块特效
 * * 由「特效/重生」「特效/传送」抽象出来
 * * 现在似乎已经不太有必要存在了
 */
export default abstract class Effect2Blocks<
	StateT extends
		IDisplayDataStateEffect2Blocks = IDisplayDataStateEffect2Blocks,
> extends Effect<StateT> {
	//============Constructor & Destructor============//
	public constructor(
		id: typeID,
		position: fPoint,
		LIFE: uint,
		// public readonly animationMode: Effect2BlockAnimationMode // ! 这个废弃
		public readonly color: uint
	) {
		super(id, position, LIFE)
		// this.maxScale = scale
		// * 显示数据
		this._proxy.storeState('color', color)
		// this._proxy.storeState('animationMode', animationMode)
	}
}
