package batr.game.effect.effects {

	import batr.common.*;
	import batr.general.*;

	import batr.game.effect.*;
	import batr.game.main.*;

	export default class EffectExplode extends EffectCommon {
		//============Static Variables============//
		public static const DEFAULT_COLOR: uint = 0xffdd00;
		public static const LINE_ALPHA: uint = 5 * (uint$MAX_VALUE >> 3); // 5/8
		public static const FILL_ALPHA: uint = (uint$MAX_VALUE / 5) << 1; // 2/5
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 25;

		//============Instance Variables============//
		protected _radius: number = 1; // Entity Pos
		protected _color: uint;

		//============Constructor Function============//
		public EffectExplode(host: Game, x: number, y: number, radius: number = 1,
			color: uint = DEFAULT_COLOR): void {
			super(host, x, y, GlobalGameVariables.TPS * 0.25);
			this._color = color;
			this._radius = radius;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this._radius = 0;
			this._color = 0;
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EffectType {
			return EffectType.EXPLODE;
		}

		public get radius(): number {
			return this._radius;
		}

		public set radius(value: number): void {
			this._radius = value;
			this.drawShape();
		}

		//============Instance Functions============//
		public override function onEffectTick(): void {
			this.alpha = life / LIFE;
			dealLife();
		}

		public override function drawShape(): void {
			this.graphics.clear();
			this.graphics.lineStyle(LINE_SIZE, this._color, Utils.uintToPercent(LINE_ALPHA));
			this.graphics.beginFill(this._color, Utils.uintToPercent(FILL_ALPHA));
			this.graphics.drawCircle(0, 0, PosTransform.localPosToRealPos(this._radius));
			this.graphics.endFill();
		}
	}
}