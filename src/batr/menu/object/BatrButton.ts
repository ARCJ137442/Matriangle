package batr.menu.objects {

	import batr.common.*;
	import batr.general.*;

	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.i18n.*;

	import flash.text.*;
	import flash.display.*;
	import flash.events.MouseEvent;

	export default class BatrButton extends BatrMenuGUI implements IBatrMenuElement {
		//============Static Variables============//
		public static const LINE_COLOR: uint = 0x888888;
		public static const FILL_COLOR: uint = 0xcccccc;
		public static const FILL_ALPHA: number = 0.375;
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 16;
		public static const HOLD_ALPHA: number = 1;
		public static const OVER_ALPHA: number = 0.75;
		public static const RELEASE_ALPHA: number = 0.5;

		//============Instance Variables============//
		protected _displayWidth: number;

		protected _displayHeight: number;

		protected _lineColor: uint;

		protected _fillColor: uint;

		protected _lineSize: number;

		protected _smoothLine: boolean;

		protected _translations: I18ns;

		protected _text: BatrTextField;

		/**
		 * The Linkage(String) to sheet
		 */
		public sheetLinkage: string;

		//============Constructor Function============//
		public BatrButton(width: number, height: number,
			translations: I18ns,
			translationKey: string = '',
			smoothLine: boolean = true,
			color: uint = LINE_COLOR,
			lineSize: number = LINE_SIZE): void {
			super();
			this._displayWidth = width;
			this._displayHeight = height;
			this._lineColor = Color.turnBrightnessTo(color, 0.5);
			this._fillColor = color;
			this._lineSize = lineSize;
			this._smoothLine = smoothLine;
			this._translations = translations;
			this._text = BatrTextField.fromKey(this._translations, translationKey, TextFieldAutoSize.CENTER);
			this.initDisplay();
			this.drawShape();
			this.onMouseRollOut(null);
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this.graphics.clear();
			this._text.destructor();
			this._text = null;
			this.sheetLinkage = null;
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public get displayWidth(): number {
			return this._displayWidth;
		}

		public set displayWidth(value: number): void {
			if (this._displayWidth == value)
				return;
			this._displayWidth = value;
			this.drawShape();
		}

		public get displayHeight(): number {
			return this._displayHeight;
		}

		public set displayHeight(value: number): void {
			if (this._displayHeight == value)
				return;
			this._displayHeight = value;
			this.drawShape();
		}

		public get lineColor(): uint {
			return this._lineColor;
		}

		public set lineColor(value: uint): void {
			if (this._lineColor == value)
				return;
			this._lineColor = value;
			this.drawShape();
		}

		public get fillColor(): uint {
			return this._fillColor;
		}

		public set fillColor(value: uint): void {
			if (this._fillColor == value)
				return;
			this._fillColor = value;
			this.drawShape();
		}

		public get lineSize(): number {
			return this._fillColor;
		}

		public set lineSize(value: number): void {
			if (this.lineSize == value)
				return;
			this._lineSize = value;
			this.drawShape();
		}

		public get smoothLine(): boolean {
			return this._smoothLine;
		}

		public set smoothLine(value: boolean): void {
			if (this._smoothLine == value)
				return;
			this._smoothLine = value;
			this.drawShape();
		}

		//============Instance Functions============//
		public setPos(x: number, y: number): BatrButton {
			super.protected:: sP(x, y);
			return this;
		}

		public setBlockPos(x: number, y: number): BatrButton {
			super.protected:: sBP(x, y);
			return this;
		}

		public setLinkage(lSheet: string): BatrButton {
			this.sheetLinkage = lSheet;
			return this;
		}

		protected initDisplay(): void {
			this.buttonMode = true;
			this.tabEnabled = true;
			this._text.x = this._text.y = 0;
			this._text.width = this._displayWidth;
			this._text.height = this._displayHeight;
			this._text.selectable = false;
			this._text.setTextFormat(Menu.TEXT_FORMAT);
			this._text.textColor = this.lineColor;
			this.addChild(this._text);
		}

		protected override function drawShape(): void {
			super.drawShape();
			// Draw
			if (this._smoothLine) {
				this.graphics.lineStyle(this._lineSize, this._lineColor);
				this.graphics.beginFill(this._fillColor, FILL_ALPHA);
				this.graphics.drawRect(0, 0, this._displayWidth, this._displayHeight);
			}
			else {
				this.graphics.beginFill(this._lineColor);
				this.graphics.drawRect(0, 0, this._displayWidth, this._displayHeight);
				this.graphics.endFill();
				this.graphics.beginFill(this._fillColor, FILL_ALPHA);
				this.graphics.drawRect(this._lineSize, this._lineSize, this._displayWidth - this._lineSize * 2, this._displayHeight - this._lineSize * 2);
			}
			this.graphics.endFill();
		}

		// Event Functions
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

		public onI18nsChange(E: I18nsChangeEvent): void {
			this.turnI18nsTo(E.nowI18ns);
		}

		protected turnI18nsTo(translations: I18ns): void {
			this._translations = translations;
			this._text.turnI18nsTo(translations);
			/*this._text.width=this._displayWidth;
			this._text.height=this._displayHeight;*/
		}
	}
}