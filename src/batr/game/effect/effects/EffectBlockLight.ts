package batr.game.effect.effects {

	import batr.common.*;
	import batr.general.*;

	import batr.game.block.*;
	import batr.game.effect.*;
	import batr.game.main.*;

	export default class EffectBlockLight extends EffectCommon {
		//============Static Variables============//
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE;
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 25;
		public static const MAX_LIFE: uint = GlobalGameVariables.TPS * 0.4;
		public static const MAX_SCALE: number = 2;
		public static const MIN_SCALE: number = 1;

		//============Static Functions============//
		public static function fromBlock(host: Game, x: number, y: number, block: BlockCommon, reverse: boolean = false): EffectBlockLight {
			return new EffectBlockLight(host, x, y, block.pixelColor, block.pixelAlpha, reverse);
		}

		//============Instance Variables============//
		protected _color: uint = 0x000000;

		/**
		 * The uint percent.
		 */
		protected _alpha: uint;
		public reverse: boolean = false;

		//============Constructor Function============//
		public EffectBlockLight(host: Game, x: number, y: number, color: uint = 0xffffff, alpha: uint = uint$MAX_VALUE, reverse: boolean = false, life: uint = EffectBlockLight.MAX_LIFE): void {
			super(host, x, y, life);
			this._color = color;
			this._alpha = alpha;
			this.reverse = reverse;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EffectType {
			return EffectType.BLOCK_LIGHT;
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
			this.alpha = (this.reverse ? (1 - life / LIFE) : (life / LIFE));
			this.scaleX = this.scaleY = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * (1 - this.alpha);
			dealLife();
		}

		public override function drawShape(): void {
			var realRadiusX: number = SIZE / 2;
			var realRadiusY: number = SIZE / 2;
			graphics.clear();
			graphics.beginFill(this._color, Utils.uintToPercent(this._alpha));
			graphics.drawRect(-realRadiusX, -realRadiusY, SIZE, SIZE);
			graphics.drawRect(LINE_SIZE - realRadiusX, LINE_SIZE - realRadiusY, SIZE - LINE_SIZE * 2, SIZE - LINE_SIZE * 2);
			graphics.endFill();
		}
	}
}
