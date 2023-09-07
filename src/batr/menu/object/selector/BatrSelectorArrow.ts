package batr.menu.object.selector {

	import batr.common.*;
	import batr.general.*;

	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;

	import flash.text.*;
	import flash.display.*;
	import flash.events.MouseEvent;

	class BatrSelectorArrow extends BatrMenuGUI implements IBatrMenuElement {
		//============Static Variables============//
		public static const LINE_COLOR: uint = 0x888888;
		public static const FILL_COLOR: uint = 0xcccccc;
		public static const FILL_ALPHA: Number = 0.4;
		public static const LINE_SIZE: Number = GlobalGameVariables.DEFAULT_SIZE / 16;
		public static const HOLD_ALPHA: Number = 1;
		public static const OVER_ALPHA: Number = 0.8;
		public static const RELEASE_ALPHA: Number = 0.6;

		//============Instance Variables============//
		protected _displayWidth: Number;
		protected _displayHeight: Number;
		protected _lineColor: uint;
		protected _fillColor: uint;
		protected _lineSize: Number;
		protected _clickFunc: Function = null;

		//============Constructor Function============//
		public function BatrSelectorArrow(width: Number = GlobalGameVariables.DEFAULT_SIZE * 0.6,
			height: Number = GlobalGameVariables.DEFAULT_SIZE * 0.6,
			lineColor: uint = LINE_COLOR,
			fillColor: uint = FILL_COLOR,
			lineSize: Number = LINE_SIZE): void {
			super();
			this._lineColor = lineColor;
			this._fillColor = fillColor;
			this._lineSize = lineSize;
			this._displayWidth = width;
			this._displayHeight = height;
			this.initDisplay();
			this.buttonMode = true;
			this.tabEnabled = true;
			this.onMouseRollOut(null);
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this.graphics.clear();
			this._clickFunc = null;
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public function set clickFunction(value: Function): void {
			this._clickFunc = value;
		}

		public function get displayWidth(): Number {
			return this._displayWidth;
		}

		public function get displayHeight(): Number {
			return this._displayHeight;
		}

		//============Instance Functions============//
		protected function initDisplay(): void {
			this.drawShape();
		}

		protected override function drawShape(): void {
			super.drawShape();
			// Draw
			this.graphics.lineStyle(this._lineSize, this._lineColor);
			this.graphics.beginFill(this._fillColor, FILL_ALPHA);
			this.graphics.moveTo(-this._displayWidth / 2, -this._displayHeight / 2);
			this.graphics.lineTo(this._displayWidth / 2, 0);
			this.graphics.lineTo(-this._displayWidth / 2, this._displayHeight / 2);
			this.graphics.lineTo(-this._displayWidth / 2, -this._displayHeight / 2);
			this.graphics.endFill();
		}

		protected override function onMouseRollOver(event: MouseEvent): void {
			super.onMouseRollOver(event);
			this.alpha = OVER_ALPHA;
		}

		protected override function onMouseRollOut(event: MouseEvent): void {
			super.onMouseRollOut(event);
			this.alpha = RELEASE_ALPHA;
		}

		protected override function onMouseHold(event: MouseEvent): void {
			super.onMouseHold(event);
			this.alpha = HOLD_ALPHA;
		}

		protected override function onMouseRelease(event: MouseEvent): void {
			super.onMouseRelease(event);
			this.alpha = RELEASE_ALPHA;
		}

		protected override function onClick(event: MouseEvent): void {
			super.onClick(event);
			if (this._clickFunc != null)
				this._clickFunc(event);
		}
	}
}