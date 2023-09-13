
// import batr.common.*;
// import batr.general.*;

import { uint } from "../../../../../legacy/AS3Legacy";
import AIPlayer from "../player/AIPlayer";
import Player from "../player/Player";
import Game from "../../main/Game.1";
import EffectType from "../../registry/EffectRegistry";
import EffectPlayerDeathLight from "./EffectPlayerDeathLight";

// import batr.game.entity.entity.player.*;
// import batr.game.effect.*;
// import batr.game.main.*;

export default class EffectPlayerDeathFadeout extends EffectPlayerDeathLight {
	//============Static Variables============//
	public static readonly ALPHA: number = 0.8;
	public static readonly MAX_LIFE: uint = GlobalGameVariables.TPS;

	//============Static Functions============//
	public static fromPlayer(host: IBatrGame, x: number, y: number, player: Player, reverse: boolean = false): EffectPlayerDeathFadeout {
		return new EffectPlayerDeathFadeout(host, x, y, player.rot, player.fillColor, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
	}

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, rot: uint = 0, color: uint = 0xffffff, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerDeathFadeout.MAX_LIFE) {
		super(host, x, y, rot, color, AILabel, reverse, life);
	}

	//============Destructor Function============//

	//============Instance Getter And Setter============//
	override get type(): EffectType {
		return EffectType.PLAYER_DEATH_FADEOUT;
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
		graphics.beginFill(this._color, ALPHA);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		if (this._AILabel != null)
			AIPlayer.drawAIDecoration(graphics, this._AILabel);
		graphics.endFill();
	}
}