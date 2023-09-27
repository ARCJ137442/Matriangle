import { fPoint } from "../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../../../legacy/AS3Legacy";
import EntityType from "../../../../api/entity/EntityType";
import { TPS } from "../../../../main/GlobalGameVariables";
import { NativeEntityTypes } from "../../registry/EntityRegistry";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";
import EffectPlayerLike from "./EffectPlayerLike";

/**
 * 玩家死亡淡出
 * * 呈现一个线性淡出的纯色三角形
 * * 用于提示「先前有玩家死亡过」
 */
export default class EffectPlayerDeathFadeout extends EffectPlayerLike {

	override get type(): EntityType { return NativeEntityTypes.EFFECT_PLAYER_DEATH_FADEOUT }

	//============Static Variables============//
	public static readonly ALPHA: number = 0.8;
	public static readonly MAX_LIFE: uint = TPS;

	//============Static Functions============//
	public static fromPlayer(position: fPoint, player: Player, reverse: boolean = false): EffectPlayerDeathFadeout {
		return new EffectPlayerDeathFadeout(
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
		super(position, rot, color, AILabel, reverse, life);
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		// 先绘制形状
		shape.graphics.beginFill(this._color, EffectPlayerDeathFadeout.ALPHA);
		EffectPlayerLike.moveToPlayerShape(shape.graphics); // 尺寸用默认值
		// 然后绘制玩家标记
		if (this._decorationLabel != null)
			Player.drawShapeDecoration(shape.graphics, this._decorationLabel);
		// 这时才停止
		shape.graphics.endFill();
	}

}