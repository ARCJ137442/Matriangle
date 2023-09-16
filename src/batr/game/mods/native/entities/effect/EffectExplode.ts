import { fPoint } from "../../../../../common/geometricTools";
import { uintToPercent } from "../../../../../common/utils";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { logical2Real } from "../../../../../display/api/PosTransform";
import { uint, uint$MAX_VALUE } from "../../../../../legacy/AS3Legacy";
import Effect from "../../../../api/entity/Effect";
import EntityType from "../../../../api/entity/EntityType";
import { TPS } from "../../../../main/GlobalGameVariables";
import { NativeEntityTypes } from "../../registry/EntityRegistry";

/**
 * 爆炸效果
 * * 呈现一个简单的线性淡出圆形
 * * 用于表现（子弹）的爆炸
 */
export default class EffectExplode extends Effect {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_EXPLODE; }

	//============Static Variables============//
	public static readonly DEFAULT_COLOR: uint = 0xffdd00;
	public static readonly LINE_ALPHA: uint = 5 * (uint$MAX_VALUE >> 3); // 5/8
	public static readonly FILL_ALPHA: uint = (uint$MAX_VALUE / 5) << 1; // 2/5
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		radius: number = 1,
		color: uint = EffectExplode.DEFAULT_COLOR
	) {
		super(position, TPS * 0.25);
		this._color = color;
		this._radius = radius;
	}

	//============Destructor Function============//
	override destructor(): void {
		this._radius = 0;
		this._color = 0;
		super.destructor();
	}

	//============Display Implements============//

	protected _color: uint;

	protected _radius: number = 1; // 逻辑端尺寸
	/** 只读的特效半径 */
	public get radius(): number { return this._radius; }

	public set radius(value: number) {
		this._radius = value;
		// TODO: 或许需要回调更新
	}

	public shapeInit(shape: IBatrShape): void {
		shape.graphics.clear();
		shape.graphics.lineStyle(EffectExplode.LINE_SIZE, this._color, uintToPercent(EffectExplode.LINE_ALPHA));
		shape.graphics.beginFill(this._color, uintToPercent(EffectExplode.FILL_ALPHA));
		shape.graphics.drawCircle(0, 0, logical2Real(this._radius));
		shape.graphics.endFill();
	}

	/** 实现：透明度跟随生命周期百分比 */
	public shapeRefresh(shape: IBatrShape): void {
		shape.alpha = this.lifePercent
	}

}