import { uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Effect from "../../../../api/entity/Effect";
import { IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import { TPS } from "../../../../main/GlobalGameVariables";
import { IBatrGraphicContext, IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { mRot } from "../../../../general/GlobalRot";
import { fPoint } from "../../../../../common/geometricTools";
import { NativeDecorationLabel as NativeDecorationLabel } from "../../../../../display/mods/native/entity/player/NativeDecorationLabels";
import { drawShapeDecoration } from "../../../../../display/mods/native/NativeDisplayImplements";
import { alignToGridCenter_P } from "../../../../general/PosTransform";

/**
 * （抽象）类玩家特效
 * * 呈现与玩家相关的形状（一般是三角形）
 * * 构造时拥有「倒放」属性，可控制特效是「淡出」还是「淡入」
 * 
 * 【2023-09-16 23:35:30】下属：
 * * 玩家受伤害
 * * 玩家死亡光效
 * * 玩家死亡淡出
 */
export default abstract class EffectPlayerLike extends Effect implements IEntityWithDirection {

	//============Static Variables============//
	/** 默认尺寸：与玩家相同的一格大小 */
	public static readonly SIZE: number = DEFAULT_SIZE;
	/** 默认线宽：1/16 */
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 16;
	/** 默认生命周期长度：半秒 */
	public static readonly MAX_LIFE: uint = TPS / 2;

	/**
	 * 把自身位置从玩家位置对齐到网格中央
	 * * 【2023-10-06 20:18:52】目前只在「特效从玩家坐标处创建创建」时使用
	 */
	public static alignToCenter(e: EffectPlayerLike): EffectPlayerLike {
		alignToGridCenter_P(e._position, e._position)
		return e;
	}

	//============Instance Variables============//

	/** 以RGB格式存储的颜色 */
	protected _color: uint;
	/** 只读：反映的玩家颜色 */
	public get color(): uint { return this._color; }

	/** 用于仿制（AI）玩家的标识 */ // TODO: 等待玩家方迁移
	protected _decorationLabel: NativeDecorationLabel;
	protected _alphaFunction: (effect: EffectPlayerLike) => number;

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint, rot: uint = 0,
		color: uint = 0xffffff, decorationLabel: NativeDecorationLabel = NativeDecorationLabel.EMPTY,
		reverse: boolean = false, life: uint = EffectPlayerLike.MAX_LIFE
	) {
		super(position, life);
		this._color = color;
		this._direction = rot;
		this._decorationLabel = decorationLabel;
		this._alphaFunction = (
			reverse ?
				EffectPlayerLike.reversedAlpha :
				EffectPlayerLike.defaultAlpha
		);
	}

	// 有方向 //
	public readonly i_hasDirection: true = true;

	protected _direction: mRot
	public get direction(): mRot { return this._direction; }
	public set direction(value: mRot) {
		this._direction = value;
		// TODO: 可能的显示更新
	}

	//============Display Implements============//
	/** （静态函数指针）控制特效透明度（淡出） */
	public static defaultAlpha(effect: EffectPlayerLike): number {
		return effect.lifePercent
	}

	/** （静态函数指针）控制特效透明度（淡入） */
	public static reversedAlpha(effect: EffectPlayerLike): number {
		return 1 - effect.lifePercent;
	}

	/**
	 * 静态工具方法：绘制一个玩家形状
	 * 
	 * ! 只有笔触指令，无线条、填充
	 * 
	 * ! 无`endFill`
	 * 
	 * @param graphics 绘图上下文
	 * @param color 颜色
	 * @param alpha 不透明度
	 * @param size 尺寸（绘图的长宽）
	 */
	public static moveToPlayerShape(
		graphics: IBatrGraphicContext,
		sizeX: number = EffectPlayerLike.SIZE,
		sizeY: number = EffectPlayerLike.SIZE,
	): void {
		let realRadiusX: number = sizeX / 2;
		let realRadiusY: number = sizeY / 2;
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		// graphics.endFill();
	}

	protected drawDecoration(shape: IBatrShape): void {
		if (this._decorationLabel !== null)
			drawShapeDecoration(shape.graphics, this._decorationLabel);
	}

	/** 实现接口：更新不透明度 */
	public shapeRefresh(shape: IBatrShape): void {
		shape.alpha = this._alphaFunction(this);
	}
}
