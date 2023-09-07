package batr.game.effect.effects {

	import batr.common.*;
	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.effect.*;
	import batr.game.main.*;

	export default class EffectPlayerDeathLight extends EffectCommon {
		//============Static Variables============//
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE;
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 16;
		public static const MAX_LIFE: uint = GlobalGameVariables.TPS / 2;
		public static const MAX_SCALE: number = 2;
		public static const MIN_SCALE: number = 1;

		//============Static Functions============//
		public static function fromPlayer(host: Game, x: number, y: number, player: Player, reverse: boolean = false): EffectPlayerDeathLight {
			return new EffectPlayerDeathLight(host, x, y, player.rot, player.fillColor, player is AIPlayer ? (player as AIPlayer).AILabel : null, reverse);
		}

		//============Instance Variables============//
		protected _color: uint = 0x000000;
		protected _AILabel: string;
		public reverse: boolean = false;

		//============Constructor Function============//
		public EffectPlayerDeathLight(host: Game, x: number, y: number, rot: uint = 0, color: uint = 0xffffff, AILabel: string = null, reverse: boolean = false, life: uint = EffectPlayerDeathLight.MAX_LIFE): void {
			super(host, x, y, life);
			this._color = color;
			this.rot = rot;
			this.reverse = reverse;
			this._AILabel = AILabel;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EffectType {
			return EffectType.PLAYER_DEATH_LIGHT;

		}

		public get color(): uint {
			return this._color;
		}

		public set color(value: uint): void {
			this._color = value;
			this.drawShape();

		}

		//============Instance Functions============//
		public override function onEffectTick(): void {
			this.alpha = this.reverse ? (1 - life / LIFE) : (life / LIFE);
			this.scaleX = this.scaleY = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * (1 - this.alpha);
			dealLife();

		}

		public override function drawShape(): void {
			var realRadiusX: number = SIZE / 2;
			var realRadiusY: number = SIZE / 2;
			graphics.clear();
			graphics.lineStyle(LINE_SIZE, this._color);
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