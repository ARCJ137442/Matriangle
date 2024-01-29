import { uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { IEntityWithDirection } from 'matriangle-api/server/entity/EntityInterfaces'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import { fPoint } from 'matriangle-common/geometricTools'
import { alignToGridCenter_P } from 'matriangle-api/server/general/PosTransform'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { TriangleAgentDecorationLabel } from 'matriangle-api/display/implements/triangleAgent/DecorationLabels'

/** 专用的显示状态数据 */
export interface IDisplayDataStateEffectPlayerShape
	extends IDisplayDataStateEffect {
	/** 特效颜色 */
	color: uint

	/** （用于曾经「AI玩家」的）装饰图案名 */
	decorationLabel: TriangleAgentDecorationLabel

	/**
	 * 是否反转播放
	 * ?【2023-11-22 22:08:42】似乎这一点其实可以不用，因为「反转」的特效可以通过「反向传输『生命周期百分比』」实现（从而节省一个变量）
	 * * 但……这样就破坏了「生命周期百分比」的统一性——不推荐使用
	 */
	reverse: boolean
}

/**
 * （抽象）玩家形特效
 * * 呈现与玩家相关的形状（一般是三角形）
 * * 构造时拥有「倒放」属性，可控制特效是「淡出」还是「淡入」
 *
 * 【2023-09-16 23:35:30】下属：
 * * 玩家受伤害
 * * 玩家死亡光效
 * * 玩家死亡淡出
 */
export default abstract class EffectPlayerShape<
		StateT extends
			IDisplayDataStateEffectPlayerShape = IDisplayDataStateEffectPlayerShape,
	>
	extends Effect<StateT>
	implements IEntityWithDirection
{
	//============Static Variables============//
	/** 默认尺寸：与玩家相同的一格大小 */
	public static readonly SIZE: number = DEFAULT_SIZE
	/** 默认线宽：1/16 */
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 16
	/** 默认生命周期长度：半秒 */
	public static readonly MAX_LIFE: uint = TPS / 2

	/**
	 * 把自身位置从玩家位置对齐到网格中央
	 * * 【2023-10-06 20:18:52】目前只在「特效从玩家坐标处创建创建」时使用
	 */
	public static alignToCenter(e: EffectPlayerShape): EffectPlayerShape {
		alignToGridCenter_P(e._position, e._position)
		return e
	}

	//============Instance Variables============//

	// /** 以RGB格式存储的颜色 */
	// protected _color: uint
	// /** 只读：反映的玩家颜色 */
	// public get color(): uint {
	// 	return this._color
	// }

	// /** 用于仿制（AI）玩家的标识 */ // TODO: 等待玩家方迁移
	// protected _decorationLabel: TriangleAgentDecorationLabel
	// protected _alphaFunction: (effect: EffectPlayerLike) => number

	//============Constructor & Destructor============//
	public constructor(
		id: typeID,
		position: fPoint,
		public readonly direction: mRot = 0,
		public readonly color: uint = 0xffffff,
		public readonly decorationLabel: TriangleAgentDecorationLabel = TriangleAgentDecorationLabel.EMPTY,
		public readonly reverse: boolean = false,
		life: uint = EffectPlayerShape.MAX_LIFE
	) {
		super(id, position, life)
		// this._color = color
		// this._direction = direction
		// this._decorationLabel = decorationLabel
		// this._alphaFunction = reverse
		// 	? EffectPlayerLike.reversedAlpha.bind(this)
		// 	: EffectPlayerLike.defaultAlpha.bind(this)
		// * 存储状态
		this._proxy.storeState('direction', direction)
		this._proxy.storeState('reverse', reverse)
		this._proxy.storeState('color', color)
		this._proxy.storeState('decorationLabel', decorationLabel)
	}

	// // 有方向 //
	// protected _direction: mRot
	// public get direction(): mRot {
	// 	return this._direction
	// }
	// public set direction(value: mRot) {
	// 	this._direction = value
	// 	// TODO: 可能的显示更新
	// }

	//============Display Implements============//
	// /** （静态函数指针）控制特效透明度（淡出） */
	// public static defaultAlpha(effect: EffectPlayerLike): number {
	// 	return effect.lifePercent
	// }

	// /** （静态函数指针）控制特效透明度（淡入） */
	// public static reversedAlpha(effect: EffectPlayerLike): number {
	// 	return 1 - effect.lifePercent
	// }

	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// /**
	//  * 静态工具方法：绘制一个玩家形状
	//  *
	//  * ! 只有笔触指令，无线条、填充
	//  *
	//  * ! 无`endFill`
	//  *
	//  * @param graphics 绘图上下文
	//  * @param color 颜色
	//  * @param alpha 不透明度
	//  * @param size 尺寸（绘图的长宽）
	//  */
	// public static moveToPlayerShape(
	// 	graphics: IGraphicContext,
	// 	sizeX: number = EffectPlayerLike.SIZE,
	// 	sizeY: number = EffectPlayerLike.SIZE
	// ): void {
	// 	const realRadiusX: number = sizeX / 2
	// 	const realRadiusY: number = sizeY / 2
	// 	graphics.moveTo(-realRadiusX, -realRadiusY)
	// 	graphics.lineTo(realRadiusX, 0)
	// 	graphics.lineTo(-realRadiusX, realRadiusY)
	// 	graphics.lineTo(-realRadiusX, -realRadiusY)
	// 	// graphics.endFill();
	// }

	// protected drawDecoration(shape: IShape): void {
	// 	if (this._decorationLabel !== null)
	// 		drawShapeDecoration(shape.graphics, this._decorationLabel)
	// }

	// /** 实现接口：更新不透明度 */
	// public shapeRefresh(shape: IShape): void {
	// 	shape.alpha = this._alphaFunction(this)
	// }
}
