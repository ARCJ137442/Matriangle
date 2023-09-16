

import { uint } from "../../../../../legacy/AS3Legacy";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";
import EffectType from "../../registry/EffectRegistry";
import EffectPlayerDeathLight from "./EffectPlayerDeathLight";

/**
 * 玩家受伤害
 * * 呈现一个覆盖在玩家之上、方向一致但位置滞留的、快速淡出的红色三角形
 * * 用于提示玩家受到伤害
 */
export default class EffectPlayerHurt extends EffectPlayerDeathLight {
	//============Static Variables============//
	public static readonly FILL_COLOR: number = 0xff0000;
	public static readonly LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.25;

	//============Static Functions============//
	public static fromPlayer(host: IBatrGame, player: Player, reverse: boolean = false): EffectPlayerHurt {
		return new EffectPlayerHurt(host, player.entityX, player.entityY, player.rot, FILL_COLOR, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
	}

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, rot: uint = 0, color: uint = EffectPlayerHurt.FILL_COLOR, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerHurt.LIFE) {
		super(host, x, y, rot, color, AILabel, reverse, life);
	}

	//============Destructor Function============//

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.PLAYER_HURT;
	}

	//============Instance Functions============//
	override onEffectTick(): void {
		this.alpha = this.reverse ? 1 - life / LIFE : life / LIFE;
		this.dealLife();
	}

	override drawShape(): void {
		let realRadiusX: number = SIZE / 2;
		let realRadiusY: number = SIZE / 2;
		graphics.clear();
		graphics.beginFill(this._color);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		if (this._AILabel != null)
			AIPlayer.drawAIDecoration(graphics, this._AILabel);
		graphics.endFill();
	}
}