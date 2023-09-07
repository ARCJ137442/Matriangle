package batr.game.effect.effects {

	import batr.common.*;
	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.effect.*;
	import batr.game.main.*;

	export default class EffectPlayerDeathFadeout extends EffectPlayerDeathLight {
		//============Static Variables============//
		public static const ALPHA: number = 0.8;
		public static const MAX_LIFE: uint = GlobalGameVariables.TPS;

		//============Static Functions============//
		public static function fromPlayer(host: Game, x: number, y: number, player: Player, reverse: boolean = false): EffectPlayerDeathFadeout {
			return new EffectPlayerDeathFadeout(host, x, y, player.rot, player.fillColor, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
		}

		//============Instance Variables============//

		//============Constructor Function============//
		public EffectPlayerDeathFadeout(host: Game, x: number, y: number, rot: uint = 0, color: uint = 0xffffff, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerDeathFadeout.MAX_LIFE): void {
			super(host, x, y, rot, color, AILabel, reverse, life);
		}

		//============Destructor Function============//
		public override function destructor(): void {
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EffectType {
			return EffectType.PLAYER_DEATH_FADEOUT;
		}

		//============Instance Functions============//
		public override function onEffectTick(): void {
			this.alpha = this.reverse ? 1 - life / LIFE : life / LIFE;
			this.dealLife();
		}

		public override function drawShape(): void {
			var realRadiusX: number = SIZE / 2;
			var realRadiusY: number = SIZE / 2;
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
}