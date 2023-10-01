import { fPoint } from "../../../../../common/geometricTools";
import { IBatrShape, IBatrShapeContainer } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../legacy/AS3Legacy";
import EntityType from "../../../../api/entity/EntityType";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import Effect2BlockContainer from "./Effect2BlockContainer";

/**
 * 传送
 * * 呈现一个快速旋转并缩小到最小尺寸的绿色八角形
 * * 用于提示玩家被传送
 */
export default class EffectTeleport extends Effect2BlockContainer {	//============Static Variables============//
	public static readonly LIFE: uint = FIXED_TPS;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, scale: number = EffectTeleport.SCALE) {
		super(position, EffectTeleport.LIFE, scale);
		this.maxScale = scale;
	}

	//============Display Implements============//
	public static readonly DEFAULT_COLOR: uint = 0x44ff44;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;

	/** 覆盖：要求两个「普通图形」对象作为其子元素 */
	override shapeInit(shape: IBatrShapeContainer, block1: IBatrShape, block2: IBatrShape): void {
		super.shapeInit(shape, block1, block2); // 调用超类方法实现元素管理
		this.drawBlocks(
			EffectTeleport.DEFAULT_COLOR, EffectTeleport.SIZE,
			EffectTeleport.LINE_SIZE, EffectTeleport.LINE_ALPHA, EffectTeleport.FILL_ALPHA
		);
	}

	/** 实现：旋转缩小 */
	public shapeRefresh(shape: IBatrShapeContainer): void {
		shape.scaleX = shape.scaleY = (this.life / EffectTeleport.LIFE) * this.maxScale;
		shape.rot = ((EffectTeleport.LIFE - this.life) / EffectTeleport.LIFE) * 360;
	}
}
