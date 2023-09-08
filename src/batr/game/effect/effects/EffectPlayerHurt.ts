
// import batr.common.*;
// import batr.general.*;

import { uint } from "../../../legacy/AS3Legacy";
import AIPlayer from "../../entity/entities/player/AIPlayer";
import Player from "../../entity/entities/player/Player";
import Game from "../../main/Game.1";
import EffectType from "../../registry/EffectRegistry";
import EffectPlayerDeathLight from "./EffectPlayerDeathLight";

// import batr.game.entity.entity.player.*;
// import batr.game.effect.*;
// import batr.game.main.*;

export default class EffectPlayerHurt extends EffectPlayerDeathLight {
	//============Static Variables============//
	public static readonly FILL_COLOR: number = 0xff0000;
	public static readonly LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.25;

	//============Static Functions============//
	public static fromPlayer(host: Game, player: Player, reverse: boolean = false): EffectPlayerHurt {
		return new EffectPlayerHurt(host, player.entityX, player.entityY, player.rot, FILL_COLOR, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
	}

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, rot: uint = 0, color: uint = EffectPlayerHurt.FILL_COLOR, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerHurt.LIFE) {
		super(host, x, y, rot, color, AILabel, reverse, life);
	}

	//============Destructor Function============//
	override destructor(): void {
		super.destructor();
	}

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
		var realRadiusX: number = SIZE / 2;
		var realRadiusY: number = SIZE / 2;
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