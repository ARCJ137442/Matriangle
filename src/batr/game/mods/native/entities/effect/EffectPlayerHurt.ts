import { fPoint } from "../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../../../legacy/AS3Legacy";
import EntityType from "../../../../api/entity/EntityType";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../main/IBatrGame";
import { NativeEntityTypes } from "../../registry/EntityRegistry";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";
import EffectPlayerLike from "./EffectPlayerLike";

/**
 * 玩家受伤害
 * * 呈现一个覆盖在玩家之上、方向一致但位置滞留的、快速淡出的红色三角形
 * * 用于提示玩家受到伤害
 */
export default class EffectPlayerHurt extends EffectPlayerLike {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_PLAYER_HURT; }

	//============Static Variables============//
	/** 颜色：固定红色 */
	public static readonly FILL_COLOR: number = 0xff0000;
	/** 生命周期时长：0.25秒 */
	public static readonly LIFE: uint = FIXED_TPS * 0.25;

	//============Static Functions============//
	public static fromPlayer(host: IBatrGame, player: Player, reverse: boolean = false): EffectPlayerHurt {
		return new EffectPlayerHurt(
			player.position, 0, //player.direction, // TODO: 等待玩家方迁移
			player.fillColor,
			"TODO: 等待玩家方迁移", // player instanceof AIPlayer ? (player as AIPlayer).AILabel : null,
			reverse
		);
	}

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint, rot: uint = 0,
		color: uint = EffectPlayerHurt.FILL_COLOR, AILabel: string = "TODO: 等待玩家方迁移",
		reverse: boolean = false, life: uint = EffectPlayerHurt.LIFE
	) {
		super(position, rot, color, AILabel, reverse, life);
	}

	public shapeInit(shape: IBatrShape): void {
		// 先绘制形状
		shape.graphics.beginFill(this._color);
		EffectPlayerLike.moveToPlayerShape(shape.graphics)
		// 然后绘制标记
		if (this._AILabel != null)
			AIPlayer.drawAIDecoration(shape.graphics, this._AILabel);
		// 停止绘制
		shape.graphics.endFill();
	}
}
