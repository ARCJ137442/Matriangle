import { uint, uint$MAX_VALUE } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Block from "../../../../api/block/Block";
import Effect from "../../../../api/entity/Effect";
import { IBatrShape } from "../../../../../display/api/DisplayInterfaces";
import { uintToPercent } from "../../../../../common/utils";
import { fPoint, iPoint } from "../../../../../common/geometricTools";
import { TPS } from "../../../../main/GlobalWorldVariables";
import { alignToGridCenter_P } from "../../../../general/PosTransform";

/**
 * 方块光效
 * * 呈现一个快速淡出/淡入的正方形光圈
 * * 用于提示方块的变化
 */
export default class EffectBlockLight extends Effect {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Static Variables============//
	public static readonly SIZE: number = DEFAULT_SIZE;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25;
	public static readonly MAX_LIFE: uint = TPS * 0.4;
	public static readonly MAX_SCALE: number = 2;
	public static readonly MIN_SCALE: number = 1;

	public static defaultAlpha(effect: EffectBlockLight): number {
		return effect.lifePercent
	}

	public static reversedAlpha(effect: EffectBlockLight): number {
		return 1 - effect.lifePercent;
	}

	/**
	 * 快捷方式：根据方块构造特效
	 * @param position 位置（格点）
	 * @param block 来源的方块
	 * @param reverse 是否倒放
	 * @returns 一个新实例
	 */
	public static fromBlock(position: iPoint, block: Block, reverse: boolean = false): EffectBlockLight {
		return new EffectBlockLight(
			position,
			block.pixelColor, block.pixelAlpha,
			reverse
		).alignGridCenter(position);
	}

	/** 快捷方式：在从整数坐标（格点）复制数据后，对齐网格中心 */
	public alignGridCenter(position: iPoint): this {
		alignToGridCenter_P(position, this._position)
		return this;
	}

	//============Instance Variables============//
	/** 方块的显示颜色 */
	protected _color: uint = 0x000000;
	/** 外部只读的「方块颜色」 */
	public get color(): uint { return this._color; }

	/** 方块不透明度「正整数值」 */ // ? 或许日后需要摒弃这种方法，因为这样「在需要时转换」造成「转换时间的性能损失」
	protected _alpha: uint;
	protected _alphaFunction: (effect: EffectBlockLight) => number;

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * 
	 * * 利用函数式编程，直接指定函数指针，而无需在运行时判断，从而提升性能
	 * 
	 * @param position 引用位置（无需值）
	 * @param color 特效的主色
	 * @param alpha 特效的不透明度
	 * @param reverse 是否反向播放
	 * @param LIFE 生命周期时长
	 */
	public constructor(
		position: fPoint,
		color: uint = 0xffffff, alpha: uint = uint$MAX_VALUE,
		reverse: boolean = false,
		LIFE: uint = EffectBlockLight.MAX_LIFE
	) {
		super(position, LIFE);
		this._color = color;
		this._alpha = alpha;
		this._alphaFunction = (
			reverse ?
				EffectBlockLight.reversedAlpha :
				EffectBlockLight.defaultAlpha
		);
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		let realRadiusX: number = EffectBlockLight.SIZE / 2;
		let realRadiusY: number = EffectBlockLight.SIZE / 2;
		shape.graphics.beginFill(this._color, uintToPercent(this._alpha));
		shape.graphics.drawRect(
			-realRadiusX, -realRadiusY,
			EffectBlockLight.SIZE, EffectBlockLight.SIZE
		);
		shape.graphics.drawRect(
			EffectBlockLight.LINE_SIZE - realRadiusX,
			EffectBlockLight.LINE_SIZE - realRadiusY,
			EffectBlockLight.SIZE - EffectBlockLight.LINE_SIZE * 2,
			EffectBlockLight.SIZE - EffectBlockLight.LINE_SIZE * 2
		);
		shape.graphics.endFill();
	}

	public shapeRefresh(shape: IBatrShape): void {
		shape.alpha = this._alphaFunction(this);
		shape.scaleX = shape.scaleY = EffectBlockLight.MIN_SCALE + (EffectBlockLight.MAX_SCALE - EffectBlockLight.MIN_SCALE) * (1 - shape.alpha);
	}

}
