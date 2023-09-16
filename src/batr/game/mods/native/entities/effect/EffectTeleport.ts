import { fPoint } from "../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape, IBatrShapeContainer } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../legacy/AS3Legacy";
import Effect from "../../../../api/entity/Effect";
import EntityType from "../../../../api/entity/EntityType";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import { NativeEntityTypes } from "../../registry/EntityRegistry";

/**
 * 传送
 * * 呈现一个快速旋转并缩小到最小尺寸的绿色八角形
 * * 用于提示玩家被传送
 */
export default class EffectTeleport extends Effect {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_TELEPORT }

	public static shapeNotContainer(shape: IBatrShape): boolean {
		return (shape as IBatrShapeContainer)?.addChild === undefined;
	}

	//============Static Variables============//
	public static readonly LIFE: uint = FIXED_TPS;

	//============Instance Variables============//
	protected maxScale: number;
	// TODO: 
	protected block1: IBatrShape | null = null;
	protected block2: IBatrShape | null = null;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, scale: number = EffectTeleport.SCALE) {
		super(position, EffectTeleport.LIFE);
		this.maxScale = scale;
	}

	//============Destructor Function============//
	override destructor(): void {
		this.maxScale = NaN;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public static readonly DEFAULT_COLOR: uint = 0x44ff44;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly SIZE: uint = DEFAULT_SIZE * 2;
	public static readonly SCALE: number = 1;

	//============Instance Functions============//
	public shapeInit(shape: IBatrShape): void {
		this.drawBlocks(EffectTeleport.DEFAULT_COLOR, EffectTeleport.SIZE);
		if (!EffectTeleport.shapeNotContainer(shape))
			this.addChildren(shape as IBatrShapeContainer);
	}

	/** 实现：旋转缩小 */
	public shapeRefresh(shape: IBatrShape): void {
		shape.scaleX = shape.scaleY = (this.life / EffectTeleport.LIFE) * this.maxScale;
		shape.rot = ((EffectTeleport.LIFE - this.life) / EffectTeleport.LIFE) * 360;
	}

	/**	实现：移除子图形 */
	public shapeDestruct(shape: IBatrShape): void {
		/**
		 * TODO: 对于shape「不是一个普通图形，而需要是『矢量图形容器』」的情况，需要特殊处理了
		 * * 一个方案是：把这里的效果也矢量化，即（对「重生」效果）找到一个「绘制不同旋转夹角矩形」的方式
		 * * 另一个方案：让shape参数兼容IBatrShapeContainer类型
		 * 💭【2023-09-17 0:46:59】暂时认为第一个方案最优（最省重构时间，毕竟这只是个「逻辑无关」的特效）
		 */
		// 尺寸同步
		shape.scaleX = shape.scaleY = this.maxScale;
		if (EffectTeleport.shapeNotContainer(shape)) return;
		// block1
		if (this.block1 !== null) {
			(shape as IBatrShapeContainer).removeChild(this.block1);
			this.block1.graphics.clear();
		}
		// block2
		if (this.block2 !== null) {
			(shape as IBatrShapeContainer).removeChild(this.block2);
			this.block2.graphics.clear();
		}
	}

	protected addChildren(shapeContainer: IBatrShapeContainer): void {
		if (this.block1 !== null) shapeContainer.addChild(this.block1);
		if (this.block2 !== null) shapeContainer.addChild(this.block2);
	}

	protected drawBlocks(color: uint, size: uint): void {
		if (this.block1 !== null) this.drawBlock(this.block1.graphics, color, size);
		if (this.block2 !== null) {
			this.drawBlock(this.block2.graphics, color, size);
			// 给第二个方块旋转一定角度
			this.block2.rot = 45;
		}
	}

	protected drawBlock(graphics: IBatrGraphicContext, color: uint, size: uint): void {
		graphics.clear();
		graphics.lineStyle(EffectTeleport.LINE_SIZE, color, EffectTeleport.LINE_ALPHA);
		graphics.beginFill(color, EffectTeleport.FILL_ALPHA);
		graphics.drawRect(-size / 2, -size / 2, size, size);
		graphics.endFill();
	}
}