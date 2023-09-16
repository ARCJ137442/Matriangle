import { uint, uint$MAX_VALUE } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Block from "../../../../api/block/Block";
import Effect from "../../../../api/entity/Effect";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { uintToPercent } from "../../../../../common/utils";
import EntityType from "../../../../api/entity/EntityType";
import { fPoint } from "../../../../../common/geometricTools";
import { TPS } from "../../../../main/GlobalGameVariables";
import { NativeEntityTypes } from "../../registry/EntityRegistry";

/**
 * 方块光效
 * * 呈现一个快速淡出/淡入的正方形光圈
 * * 用于提示方块的变化
 */
export default class EffectBlockLight extends Effect {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_BLOCK_LIGHT; }

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

	//============Static Functions============//
	/**
	 * 快捷方式：根据方块构造特效
	 * @param position 位置
	 * @param block 来源的方块
	 * @param reverse 是否倒放
	 * @returns 一个新实例
	 */
	public static fromBlock(position: fPoint, block: Block, reverse: boolean = false): EffectBlockLight {
		return new EffectBlockLight(position, block.pixelColor, block.pixelAlpha, reverse);
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
