package batr.game.entity.objects {

	import batr.general.*;

	import batr.game.entity.entity.player.*;

	import flash.display.Shape;

	export default class PlayerEffectOverlay extends Shape {
		//============Static Variables============//
		public static const COLOR: uint = 0xff0000;
		public static const LIFE: uint = GlobalGameVariables.FIXED_TPS * 0.25;

		//============Instance Variables============//
		protected _life: int = -1;
		protected _lifeMax: uint = 0;

		protected _color: uint = COLOR;

		//============Constructor Function============//
		public PlayerEffectOverlay(owner: Player, color: uint = PlayerEffectOverlay.COLOR): void {
			super();
			this.drawShape(owner is AIPlayer ? (owner as AIPlayer).AILabel : null);
			this.dealLife();
		}

		//============Instance Getter And Setter============//
		public get life(): uint {
			return this._life;
		}

		//============Instance Functions============//
		protected drawShape(AILabel: string = null): void {
			var realRadiusX: number = Player.SIZE / 2; // -LINE_SIZE
			var realRadiusY: number = Player.SIZE / 2;
			this.graphics.clear();
			// graphics.lineStyle(LINE_SIZE,this._lineColor);
			this.graphics.beginFill(this._color);
			this.graphics.moveTo(-realRadiusX, -realRadiusY);
			this.graphics.lineTo(realRadiusX, 0);
			this.graphics.lineTo(-realRadiusX, realRadiusY);
			this.graphics.lineTo(-realRadiusX, -realRadiusY);
			if (AILabel != null)
				AIPlayer.drawAIDecoration(this.graphics, AILabel);
			this.graphics.endFill();
		}

		public playAnimation(life: uint = LIFE, color: uint = uint$MAX_VALUE): void {
			color = color == uint$MAX_VALUE ? this._color : color;
			if (this._color != color) {
				this._color = color;
				this.drawShape();
			}
			if (life > _lifeMax) {
				this._lifeMax = life;
			}
			this._life = life;
		}

		public dealLife(): void {
			if (_life > 0)
				this._life--;
			else {
				this._life = -1;
				this._lifeMax = 0;
				this.alpha = 0;
				return;
			}
			this.alpha = _life / _lifeMax;
		}

		public destructor(): void {
			this.graphics.clear();
			this._life = -1;
			this._lifeMax = 0;
		}
	}
}