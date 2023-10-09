import { uint } from "../../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../../display/api/DisplayInterfaces";
import { fPoint, iPoint, xPoint } from "../../../../../common/geometricTools";
import EffectPlayerLike from "./EffectPlayerLike";
import { NativeDecorationLabel } from "../../../../../display/mods/native/entity/player/NativeDecorationLabels";
import IPlayer from "../../../native/entities/player/IPlayer";

/**
 * 玩家死亡光效
 * * 呈现一个与玩家方向相同的、迅速变大并淡出的空心三角型框架
 * * 用于提示玩家的死亡
 */
export default class EffectPlayerDeathLight extends EffectPlayerLike {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Static Variables============//
	/** 尺寸过渡的最大值 */
	public static readonly MAX_SCALE: number = 2;
	/** 尺寸过渡的最小值 */
	public static readonly MIN_SCALE: number = 1;

	//============Static Functions============//
	/**
	 * 根据玩家返回新特效
	 * @param position 所属位置
	 * @param player 所参照的玩家
	 * @param reverse 是否倒放
	 * @returns 一个新特效
	 */
	public static fromPlayer(position: fPoint | iPoint, player: IPlayer, reverse: boolean = false): EffectPlayerDeathLight {
		return EffectPlayerLike.alignToCenter(
			new EffectPlayerDeathLight(
				position, player.direction, // 
				player.fillColor,
				player.decorationLabel, // player instanceof AIPlayer ? (player as AIPlayer).decorationLabel : null,
				reverse
			));
	}

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint, direction: uint = 0,
		color: uint = 0xffffff,
		decorationLabel: NativeDecorationLabel = NativeDecorationLabel.EMPTY,
		reverse: boolean = false, life: uint = EffectPlayerLike.MAX_LIFE
	) {
		super(
			position, direction,
			color, decorationLabel,
			reverse, life
		);
	}

	//============Instance Functions============//
	/** 实现：绘制玩家轮廓 */
	public shapeInit(shape: IBatrShape): void {
		// 先绘制形状
		shape.graphics.lineStyle(EffectPlayerLike.LINE_SIZE, this._color);
		EffectPlayerLike.moveToPlayerShape(shape.graphics); // 尺寸用默认值
		// 然后绘制玩家标记
		this.drawDecoration(shape);
		// 这时才停止
		shape.graphics.endFill();
	}

	/** 覆盖：尺寸放大/缩小 */
	override shapeRefresh(shape: IBatrShape): void {
		super.shapeRefresh(shape);
		// ! ↓因为前面已经通过「是否倒放」设置了`shape.alpha`，而这里直接使用该值，以避免再次判断「是否倒放」
		shape.scaleX = shape.scaleY = (
			EffectPlayerDeathLight.MIN_SCALE + (
				EffectPlayerDeathLight.MAX_SCALE - EffectPlayerDeathLight.MIN_SCALE
			) * (1 - shape.alpha)
		);
	}
}
