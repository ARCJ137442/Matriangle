package batr.game.effect.effects {

	import batr.common.*;
	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.effect.*;
	import batr.game.main.*;

	export default class EffectPlayerHurt extends EffectPlayerDeathLight {
		//============Static Variables============//
		public static const FILL_COLOR: number = 0xff0000;
		public static const LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.25;

		//============Static Functions============//
		public static function fromPlayer(host: Game, player: Player, reverse: boolean = false): EffectPlayerHurt {
			return new EffectPlayerHurt(host, player.entityX, player.entityY, player.rot, FILL_COLOR, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
		}

		//============Instance Variables============//

		//============Constructor Function============//
		public EffectPlayerHurt(host: Game, x: number, y: number, rot: uint = 0, color: uint = EffectPlayerHurt.FILL_COLOR, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerHurt.LIFE): void {
			super(host, x, y, rot, color, AILabel, reverse, life);
		}

		//============Destructor Function============//
		public override function destructor(): void {
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EffectType {
			return EffectType.PLAYER_HURT;
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
}