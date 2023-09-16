import { fPoint } from "../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../legacy/AS3Legacy";
import Entity from "../../../../api/entity/Entity";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import EffectTeleport from "./EffectTeleport";

/**
 * 重生
 * * 呈现一个从无放大到有，交替旋转，并线性缩小消失的蓝色八角形
 * * 用于提示玩家的重生
 */
export default class EffectSpawn extends EffectTeleport {
	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0x6666ff;
	public static readonly LINE_ALPHA: number = 0.6;
	public static readonly FILL_ALPHA: number = 0.5;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly SIZE: uint = DEFAULT_SIZE * 1.6;
	public static readonly MAX_LIFE: uint = FIXED_TPS * 0.5;
	public static readonly SCALE: number = 1;
	public static readonly STAGE_1_START_TIME: uint = EffectSpawn.MAX_LIFE * 3 / 4;
	public static readonly STAGE_2_START_TIME: uint = EffectSpawn.MAX_LIFE / 4;
	public static readonly ROTATE_ANGLE: uint = 45;

	//============Instance Variables============//
	protected _animationStage: uint;

	protected _tempLife: uint;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, scale: number = EffectSpawn.SCALE) {
		super(position, scale);
		this._animationStage = 0;
	}

	override initScale(scale: number): void {
		this.scale = 0;
	}

	//============Destructor Function============//
	override destructor(): void {
		this._animationStage = 0;
		this._tempLife = 0;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.SPAWN;
	}

	//============Instance Functions============//
	override shapeInit(shape: IBatrShape): void {
		this.drawBlocks(EffectSpawn.DEFAULT_COLOR, EffectSpawn.SIZE);
	}

	override onTick(remove: (entity: Entity) => void): void {
		if (this._life <= EffectSpawn.STAGE_2_START_TIME) {
			this._animationStage = 2;
		}
		else if (this._life <= EffectSpawn.STAGE_1_START_TIME) {
			this._animationStage = 1;
		}
		else {
			this._animationStage = 0;
		}
		if (this._animationStage == 0) {
			this._tempLife = LIFE - this._life;
			this.scale = (this._tempLife / (LIFE - EffectSpawn.STAGE_1_START_TIME)) * this.maxScale;
		}
		else if (this._animationStage == 1) {
			this._tempLife = LIFE - this._life - EffectSpawn.STAGE_2_START_TIME;
			this.block1.rotation = -(this._tempLife / (EffectSpawn.STAGE_1_START_TIME - EffectSpawn.STAGE_2_START_TIME)) * EffectSpawn.ROTATE_ANGLE;
			this.block2.rotation = 45 + (this._tempLife / (EffectSpawn.STAGE_1_START_TIME - EffectSpawn.STAGE_2_START_TIME)) * EffectSpawn.ROTATE_ANGLE;
		}
		else if (this._animationStage == 2) {
			this._tempLife = life;
			this.scale = this._tempLife / EffectSpawn.STAGE_2_START_TIME * this.maxScale;
		}
		super.onTick(remove);
	}
}