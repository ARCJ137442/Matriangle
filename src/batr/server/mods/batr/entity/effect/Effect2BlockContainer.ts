import { fPoint } from '../../../../../common/geometricTools'
import { IGraphicContext, IShape, IShapeContainer } from '../../../../../display/api/DisplayInterfaces'
import { DEFAULT_SIZE } from '../../../../../display/api/GlobalDisplayVariables'
import { uint } from '../../../../../legacy/AS3Legacy'
import Effect from '../../../../api/entity/Effect'
import { IEntityDisplayableContainer } from '../../../../api/entity/EntityInterfaces'

/**
 * 双方块容器
 * * 由「特效/重生」「特效/传送」抽象出来
 */
export default abstract class Effect2BlockContainer extends Effect implements IEntityDisplayableContainer {
	//============Constructor & Destructor============//
	public constructor(position: fPoint, LIFE: uint, scale: number = Effect2BlockContainer.SCALE) {
		super(position, LIFE)
		this.maxScale = scale
	}

	override destructor(): void {
		// this.maxScale = NaN; // ! 基础类型无需特别销毁
		this._block1 = null // * 释放引用
		this._block2 = null // * 释放引用
		super.destructor()
	}

	//============Display Implements============//
	public static readonly SIZE: uint = DEFAULT_SIZE * 2
	public static readonly SCALE: number = 1

	/** 指示特效在显示大小最大时的尺寸（倍数） */
	protected maxScale: number
	/** 子元素：方块1（横），保留引用以便快速更新 */
	protected _block1: IShape | null = null
	/** 子元素：方块2（纵），保留引用以便快速更新 */
	protected _block2: IShape | null = null
	/** 标明这个对象需要一个「图形容器」 */
	public readonly i_displayableContainer = true as const

	/** 实现：要求两个「普通图形」对象作为其子元素 */
	public shapeInit(shape: IShapeContainer, block1: IShape, block2: IShape): void {
		// this.drawBlocks(Effect2BlockContainer.DEFAULT_COLOR, Effect2BlockContainer.SIZE);
		this._block1 = block1
		this._block2 = block2
		this.addChildren(shape)
	}

	/** 抽象 */
	public abstract shapeRefresh(shape: IShapeContainer): void

	/**	实现：移除子图形 */
	public shapeDestruct(shape: IShapeContainer): void {
		// 尺寸同步
		shape.scaleX = shape.scaleY = 0 // 尺寸清零
		// block1
		if (this._block1 !== null) {
			shape.removeChild(this._block1)
			this._block1.graphics.clear()
		}
		// block2
		if (this._block2 !== null) {
			shape.removeChild(this._block2)
			this._block2.graphics.clear()
		}
	}

	protected addChildren(shapeContainer: IShapeContainer): void {
		if (this._block1 !== null) shapeContainer.addChild(this._block1)
		if (this._block2 !== null) shapeContainer.addChild(this._block2)
	}

	protected drawBlocks(color: uint, size: uint, lineSize: number, lineAlpha: number, fillAlpha: number): void {
		if (this._block1 !== null) this.drawBlock(this._block1.graphics, color, size, lineSize, lineAlpha, fillAlpha)
		if (this._block2 !== null) {
			this.drawBlock(this._block2.graphics, color, size, lineSize, lineAlpha, fillAlpha)
			// 给第二个方块旋转一定角度
			this._block2.rot = 45
		}
	}

	/** 绘制单个方形 */
	protected drawBlock(
		graphics: IGraphicContext,
		color: uint,
		size: uint,
		lineSize: number,
		lineAlpha: number,
		fillAlpha: number
	): void {
		graphics.clear()
		graphics.lineStyle(lineSize, color, lineAlpha)
		graphics.beginFill(color, fillAlpha)
		graphics.drawRect(-size / 2, -size / 2, size, size)
		graphics.endFill()
	}
}
