import { fPoint } from 'matriangle-common/geometricTools'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import Effect2BlockContainer from './Effect2BlockContainer'
import { typeID } from 'matriangle-api'

/**
 * 传送
 * * 呈现一个快速旋转并缩小到最小尺寸的绿色八角形
 * * 用于提示玩家被传送
 */
export default class EffectTeleport extends Effect2BlockContainer {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectTeleport'

	public static readonly LIFE: uint = FIXED_TPS

	//============Constructor & Destructor============//
	public constructor(position: fPoint, scale: number = EffectTeleport.SCALE) {
		super(EffectTeleport.ID, position, EffectTeleport.LIFE, scale)
		this.maxScale = scale
	}

	//============Display Implements============//
	public static readonly DEFAULT_COLOR: uint = 0x44ff44
	public static readonly LINE_ALPHA: number = 0.6
	public static readonly FILL_ALPHA: number = 0.5
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25

	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// /** 覆盖：要求两个「普通图形」对象作为其子元素 */
	// override displayInit(
	// 	shape: IShapeContainer,
	// 	block1: IShape,
	// 	block2: IShape
	// ): void {
	// 	super.displayInit(shape, block1, block2) // 调用超类方法实现元素管理
	// 	this.drawBlocks(
	// 		EffectTeleport.DEFAULT_COLOR,
	// 		EffectTeleport.SIZE,
	// 		EffectTeleport.LINE_SIZE,
	// 		EffectTeleport.LINE_ALPHA,
	// 		EffectTeleport.FILL_ALPHA
	// 	)
	// }

	// /** 实现：旋转缩小 */
	// public shapeRefresh(shape: IShapeContainer): void {
	// 	shape.scaleX = shape.scaleY =
	// 		(this.life / EffectTeleport.LIFE) * this.maxScale
	// 	shape.rot =
	// 		((EffectTeleport.LIFE - this.life) / EffectTeleport.LIFE) * 360
	// }
}
