package batr.menu.objects {

	import batr.general.*;

	import flash.text.*;
	import flash.display.*;
	import flash.events.MouseEvent;
	import flash.display.Sprite;

	export default class BatrButtonList extends BatrMenuGUI implements IBatrMenuElementContainer {
		//============Static Variables============//
		public static const DEFAULT_DISTANCE: number = GlobalGameVariables.DEFAULT_SIZE;

		//============Instance Variables============//
		protected _buttons: BatrButton[] = new BatrButton[]();
		protected _verticalDistance = DEFAULT_DISTANCE;

		//============Constructor Function============//
		public BatrButtonList(verticalDistance: number = BatrButtonList.DEFAULT_DISTANCE): void {
			super(false);
			this.verticalDistance = verticalDistance;
			this.initDisplay();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			for (var button of this._buttons) {
				button.destructor();
			}
			this._buttons = null;
		}

		//============Instance Getter And Setter============//
		// Button
		public get buttons(): BatrButton[] {
			return this._buttons;
		}

		public get buttonCount(): int {
			return this._buttons.length;
		}

		// verticalDistance
		public get verticalDistance(): number {
			return this._verticalDistance;
		}

		public set verticalDistance(value: number): void {
			this._verticalDistance = value;
		}

		//============Instance Functions============//
		public setPos(x: number, y: number): BatrButtonList {
			super.protected:: sP(x, y);
			return this;
		}

		public setBlockPos(x: number, y: number): BatrButtonList {
			super.protected:: sBP(x, y);
			return this;
		}

		protected initDisplay(): void {
			if (this.buttonCount < 1)
				return;
			var dy: number = 0;
			for (var i: int = 0; i < this._buttons.length; i++) {
				var button: BatrButton = this._buttons[i];
				button.x = 0;
				button.y = dy;
				dy += this.verticalDistance + button.displayHeight;
				this.addChild(button);
			}
		}

		public refreshDisplay(): void {
			this.initDisplay();
		}

		//========By IBatrMenuElementContainer========//
		public appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
			if (element is BatrButton)
			this._buttons.push(element as BatrButton);
			return this;
		}

		public appendDirectElements(...elements): IBatrMenuElement {
			var button: BatrButton;
			for (var i: int = 0; i < elements.length; i++) {
				button = elements[i] as BatrButton;
				if (button != null)
					this._buttons.push(button);
			}
			return this;
		}

		public addChildPerDirectElements(): void {
			this.initDisplay();
		}

		public getElementAt(index: int): IBatrMenuElement {
			return (index < 1 || index >= this.buttonCount) ? null : (this._buttons[index] as IBatrMenuElement);
		}

		public getElementByName(name: string): BatrMenuGUI {
			for (var button of this._buttons) {
				if (button != null && button.name == name)
					return (button as BatrMenuGUI);
			}
			return null;
		}
	}
}