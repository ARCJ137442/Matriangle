import { fPoint } from 'matriangle-common/geometricTools'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { typeID } from 'matriangle-api'

// /**
//  * 「2方块容器特效」的「动画模式」枚举
//  */
// export enum Effect2BlockAnimationMode {
// 	spawn = 'spawn',
// 	teleport = 'teleport',
// }
// !【2023-11-22 22:26:00】↑暂时废弃这样的表征——为何不用「新实体类型」去扩展呢？

/** 「2方块容器特效」的显示状态接口 */
export interface IDisplayDataStateEffect2BlockContainer
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
 * 双方块容器
 * * 由「特效/重生」「特效/传送」抽象出来
 *
 * TODO: 【2023-11-15 17:10:20】现在拟将「生命周期百分比」作为「实体数据」传递，以便终结「单独图形还是多图形容器」——全部由「显示端」自行决定
 */
export default abstract class Effect2BlockContainer<
	StateT extends
		IDisplayDataStateEffect2BlockContainer = IDisplayDataStateEffect2BlockContainer,
> extends Effect<StateT> {
	//============Constructor & Destructor============//
	public constructor(
		id: typeID,
		position: fPoint,
		LIFE: uint,
		// scale: number = Effect2BlockContainer.SCALE // ! 这个移动到显示端去
		// public readonly animationMode: Effect2BlockAnimationMode // ! 这个废弃
		public readonly color: uint
	) {
		super(id, position, LIFE)
		// this.maxScale = scale
		// * 显示数据
		this._proxy.storeState('color', color)
		// this._proxy.storeState('animationMode', animationMode)
	}

	override destructor(): void {
		// this.maxScale = NaN; // ! 基础类型无需特别销毁
		// this._block1 = null // * 释放引用
		// this._block2 = null // * 释放引用
		super.destructor()
	}

	//============Display Implements============//
	public static readonly SIZE: uint = DEFAULT_SIZE * 2
	public static readonly SCALE: number = 1

	// /** 指示特效在显示大小最大时的尺寸（倍数） */
	// protected maxScale: number // ! 有待迁移到显示端
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// /** 子元素：方块1（横），保留引用以便快速更新 */
	// protected _block1: IShape | null = null
	// /** 子元素：方块2（纵），保留引用以便快速更新 */
	// protected _block2: IShape | null = null

	// /** 实现：要求两个「普通图形」对象作为其子元素 */
	// public displayInit(
	// 	shape: IShapeContainer,
	// 	block1: IShape,
	// 	block2: IShape
	// ): void {
	// 	// this.drawBlocks(Effect2BlockContainer.DEFAULT_COLOR, Effect2BlockContainer.SIZE);
	// 	this._block1 = block1
	// 	this._block2 = block2
	// 	this.addChildren(shape)
	// }

	// /** 抽象 */
	// public abstract shapeRefresh(shape: IShapeContainer): void

	// /**	实现：移除子图形 */
	// public displayDestruct(shape: IShapeContainer): void {
	// 	// 尺寸同步
	// 	shape.scaleX = shape.scaleY = 0 // 尺寸清零
	// 	// block1
	// 	if (this._block1 !== null) {
	// 		shape.removeChild(this._block1)
	// 		this._block1.graphics.clear()
	// 	}
	// 	// block2
	// 	if (this._block2 !== null) {
	// 		shape.removeChild(this._block2)
	// 		this._block2.graphics.clear()
	// 	}
	// }

	// protected addChildren(shapeContainer: IShapeContainer): void {
	// 	if (this._block1 !== null) shapeContainer.addChild(this._block1)
	// 	if (this._block2 !== null) shapeContainer.addChild(this._block2)
	// }

	// protected drawBlocks(
	// 	color: uint,
	// 	size: uint,
	// 	lineSize: number,
	// 	lineAlpha: number,
	// 	fillAlpha: number
	// ): void {
	// 	if (this._block1 !== null)
	// 		this.drawBlock(
	// 			this._block1.graphics,
	// 			color,
	// 			size,
	// 			lineSize,
	// 			lineAlpha,
	// 			fillAlpha
	// 		)
	// 	if (this._block2 !== null) {
	// 		this.drawBlock(
	// 			this._block2.graphics,
	// 			color,
	// 			size,
	// 			lineSize,
	// 			lineAlpha,
	// 			fillAlpha
	// 		)
	// 		// 给第二个方块旋转一定角度
	// 		this._block2.rot = 45
	// 	}
	// }

	// /** 绘制单个方形 */
	// protected drawBlock(
	// 	graphics: IGraphicContext,
	// 	color: uint,
	// 	size: uint,
	// 	lineSize: number,
	// 	lineAlpha: number,
	// 	fillAlpha: number
	// ): void {
	// 	graphics.clear()
	// 	graphics.lineStyle(lineSize, color, lineAlpha)
	// 	graphics.beginFill(color, fillAlpha)
	// 	graphics.drawRect(-size / 2, -size / 2, size, size)
	// 	graphics.endFill()
	// }
}
