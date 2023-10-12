import { fPoint } from "../../../../../common/geometricTools";
import { IShape, IShapeContainer } from "../../../../../display/api/DisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../legacy/AS3Legacy";
import Entity from "../../../../api/entity/Entity";
import { FIXED_TPS } from "../../../../main/GlobalWorldVariables";
import Effect2BlockContainer from "./Effect2BlockContainer";

/**
 * 重生
 * * 呈现一个从无放大到有，交替旋转，并线性缩小消失的蓝色八角形
 * * 用于提示玩家的重生
 */
export default class EffectSpawn extends Effect2BlockContainer {	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0x6666ff;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly SIZE: uint = uint(DEFAULT_SIZE * 1.6);
	public static readonly MAX_LIFE: uint = uint(FIXED_TPS);
	public static readonly SCALE: number = 1;
	public static readonly STAGE_1_START_TIME: uint = uint(EffectSpawn.MAX_LIFE * 3 / 4);
	public static readonly STAGE_2_START_TIME: uint = uint(EffectSpawn.MAX_LIFE / 4);
	public static readonly ROTATE_ANGLE: uint = 45;

	//============Instance Variables============//
	protected _animationStage: uint;

	protected _tempLife: uint;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, scale: number = EffectSpawn.SCALE) {
		super(position, EffectSpawn.MAX_LIFE, scale);
		this._animationStage = 0;
		this._tempLife = this.LIFE - this.life;
	}

	// override destructor(): void {
	// this._animationStage = 0; // ! 基础类型不用析构
	// this._tempLife = 0; // ! 基础类型不用析构
	// super.destructor();
	// }

	//============Instance Functions============//
	override shapeInit(shape: IShapeContainer, block1: IShape, block2: IShape): void {
		super.shapeInit(shape, block1, block2);
		this.drawBlocks(
			EffectSpawn.DEFAULT_COLOR, EffectSpawn.SIZE,
			EffectSpawn.LINE_SIZE, EffectSpawn.LINE_ALPHA, EffectSpawn.FILL_ALPHA
		);
	}

	/**
	 * 覆盖：生命周期正常进行，但会根据其值大小进入不同阶段
	 */
	override onTick(remove: (entity: Entity) => void): void {
		if (this.life <= EffectSpawn.STAGE_2_START_TIME) {
			this._animationStage = 2;
		}
		else if (this.life <= EffectSpawn.STAGE_1_START_TIME) {
			this._animationStage = 1;
		}
		else {
			this._animationStage = 0;
		}
		// 根据阶段更新
		switch (this._animationStage) {
			case 0:
				this._tempLife = this.LIFE - this.life;
				break;
			case 1:
				this._tempLife = this.LIFE - this.life - EffectSpawn.STAGE_2_START_TIME;
				break;
			case 2:
				this._tempLife = this.life;
		}
		super.onTick(remove);
	}

	/** 实现：根据「动画阶段」更新状态 */
	public shapeRefresh(shape: IShapeContainer): void {
		switch (this._animationStage) {
			// 第一阶段：逐渐变大
			case 0:
				shape.scaleX = shape.scaleY = (this._tempLife / (this.LIFE - EffectSpawn.STAGE_1_START_TIME)) * this.maxScale;
				break;
			// 第二阶段：两方块交错旋转90°
			case 1:
				(this._block1 as IShape).rot = -(this._tempLife / (EffectSpawn.STAGE_1_START_TIME - EffectSpawn.STAGE_2_START_TIME)) * EffectSpawn.ROTATE_ANGLE;
				(this._block2 as IShape).rot = 45 + (this._tempLife / (EffectSpawn.STAGE_1_START_TIME - EffectSpawn.STAGE_2_START_TIME)) * EffectSpawn.ROTATE_ANGLE;
				break;
			// 第三阶段：缩小消失
			case 2:
				shape.scaleX = shape.scaleY = this._tempLife / EffectSpawn.STAGE_2_START_TIME * this.maxScale;
				break;
		}
	}
}
