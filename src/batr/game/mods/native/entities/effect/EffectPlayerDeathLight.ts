import { uint } from "../../../../../legacy/AS3Legacy";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";
import EntityType from "../../../../api/entity/EntityType";
import { NativeEntityTypes } from "../../registry/EntityRegistry";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { fPoint } from "../../../../../common/geometricTools";
import EffectPlayerLike from "./EffectPlayerLike";

/**
 * 玩家死亡光效
 * * 呈现一个与玩家方向相同的、迅速变大并淡出的空心三角型框架
 * * 用于提示玩家的死亡
 */
export default class EffectPlayerDeathLight extends EffectPlayerLike {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_PLAYER_DEATH_LIGHT; }

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
	public static fromPlayer(position: fPoint, player: Player, reverse: boolean = false): EffectPlayerDeathLight {
		return new EffectPlayerDeathLight(
			position, 0, //player.direction, // TODO: 等待玩家方迁移
			player.fillColor,
			"TODO: 等待玩家方迁移", // player instanceof AIPlayer ? (player as AIPlayer).AILabel : null,
			reverse
		);
	}

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint, rot: uint = 0,
		color: uint = 0xffffff, AILabel: string = "TODO: 等待玩家方迁移",
		reverse: boolean = false, life: uint = EffectPlayerLike.MAX_LIFE
	) {
		super(
			position, rot,
			color, AILabel,
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
		if (this._decorationLabel != null)
			Player.drawShapeDecoration(shape.graphics, this._decorationLabel);
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
