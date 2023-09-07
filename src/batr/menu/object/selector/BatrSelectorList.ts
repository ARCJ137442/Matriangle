package batr.menu.object.selector {

	import batr.common.*;
	import batr.general.*;
	import batr.main.*;
	import batr.fonts.*;
	import batr.menu.events.*;
	import batr.menu.main.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;
	import batr.i18n.*;

	import flash.text.*;
	import flash.display.*;
	import flash.events.MouseEvent;
	import flash.display.Sprite;

	export default class BatrSelectorList extends BatrMenuGUI implements IBatrMenuElementContainer {
		//============Static Variables============//
		public static const DEFAULT_DISTANCE_H: number = GlobalGameVariables.DEFAULT_SIZE * 8;
		public static const DEFAULT_DISTANCE_V: number = GlobalGameVariables.DEFAULT_SIZE;

		//============Instance Variables============//
		protected _selectors: BatrSelector[] = new BatrSelector[]();
		protected _selectTextFields: BatrTextField[] = new BatrTextField[]();

		/**
		 * Distance Between selector And selector.
		 */
		protected _verticalDistance = DEFAULT_DISTANCE_V;

		/**
		 * Distance Between Text And selector.
		 */
		protected _horizontalDistance = DEFAULT_DISTANCE_H;

		//============Constructor Function============//
		public BatrSelectorList(horizontalDistance: number = BatrSelectorList.DEFAULT_DISTANCE_H, verticalDistance: number = BatrSelectorList.DEFAULT_DISTANCE_V): void {
			super(false);
			this.setDistance(horizontalDistance, verticalDistance);
		}

		//============Destructor Function============//
		public override function destructor(): void {
			for (var selector of this._selectors) {
				selector.destructor();
			}
			this._selectors = null;
			for (var textField of this._selectTextFields) {
				textField.destructor();
			}
			this._selectTextFields = null;
		}

		//============Instance Getter And Setter============//
		// selector
		public get selectors(): BatrSelector[] {
			return this._selectors;
		}

		public get selectorCount(): int {
			return this._selectors.length;
		}

		// Text
		public get selectTextFields(): BatrTextField[] {
			return this._selectTextFields;
		}

		public get selectTextFieldCount(): int {
			return this._selectTextFields.length;
		}

		// verticalDistance
		public get horizontalDistance(): number {
			return this._horizontalDistance;
		}

		public set horizontalDistance(value: number): void {
			this._horizontalDistance = value;
			this.refreshDisplay();
		}

		// verticalDistance
		public get verticalDistance(): number {
			return this._verticalDistance;
		}

		public set verticalDistance(value: number): void {
			this._verticalDistance = value;
			this.refreshDisplay();
		}

		//============Instance Functions============//
		public setPos(x: number, y: number): BatrSelectorList {
			super.protected:: sP(x, y);
			return this;
		}

		public setBlockPos(x: number, y: number): BatrSelectorList {
			super.protected:: sBP(x, y);
			return this;
		}

		protected initDisplay(): void {
			var dy: number, i: int;
			if (this.selectTextFieldCount > 0) {
				var textField: BatrTextField;
				for (dy = i = 0; i < this.selectTextFieldCount; i++) {
					textField = this._selectTextFields[i];
					if (textField == null) {
						dy += this.verticalDistance;
						continue;
					}
					textField.x = 0;
					textField.y = dy;
					dy += this.verticalDistance;
					this.addChild(textField);
				}
			}
			if (this.selectorCount > 0) {
				var selector: BatrSelector;
				for (dy = i = 0; i < this.selectorCount; i++) {
					selector = this._selectors[i];
					if (selector == null) {
						dy += this.verticalDistance;
						continue;
					}
					selector.x = this.horizontalDistance;
					selector.y = dy + GlobalGameVariables.DEFAULT_SIZE / 2;
					dy += this.verticalDistance;
					this.addChild(selector);
				}
			}
		}

		public refreshDisplay(): BatrSelectorList {
			this.initDisplay();
			return this;
		}

		public setPosAndRefresh(x: number, y: number): BatrSelectorList {
			this.x = x;
			this.y = y;
			this.refreshDisplay();
			return this;
		}

		public setDistance(H: number, V: number): BatrSelectorList {
			this._horizontalDistance = H;
			this._verticalDistance = V;
			this.initDisplay();
			return this;
		}

		//========By IBatrMenuElementContainer========//

		/**
		 * Unfinished.
		 */
		public appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public appendDirectElements(...elements): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public addChildPerDirectElements(): void {
			this.initDisplay();
		}

		/**
		 * Unfinished.
		 */
		public getElementAt(index: int): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public getElementByName(name: string): BatrMenuGUI {
			functionNotFound();
			return null;
		}

		private functionNotFound(): void {
			throw new Error('Function Not Found!');
		}

		//========True Functions About selectors========//
		public appendSelectorAndText(host: BatrSubject, selector: BatrSelector, tKey: string, shiftEmptyLine: boolean = false): BatrSelectorList {
			// Empty Line
			if (shiftEmptyLine)
				this.AddNewEmptyLine();
			// selector
			this._selectors.push(selector);
			// Text
			var textField: BatrTextField = BatrTextField.fromKey(host.translations, tKey);
			textField.initFormatAsMenu();
			this._selectTextFields.push(textField);
			host.addEventListener(I18nsChangeEvent.TYPE, textField.onI18nChange);
			// Return
			return this;
		}

		protected AddNewEmptyLine(): void {
			this._selectors.push(null);
			this._selectTextFields.push(null);
		}

		public getSelectorByName(name: string): BatrSelector {
			for (var selector of this._selectors) {
				if (selector != null && selector.name == name)
					return selector;
			}
			return null;
		}

		public quickAppendSelector(menu: Menu, content: BatrSelectorContent, keyName: string, shiftEmptyLine: boolean = false, clickListener: Function = null, minTextBlockWidth: number = 0.5): BatrSelectorList {
			var selector: BatrSelector = new BatrSelector(content, PosTransform.localPosToRealPos(minTextBlockWidth));
			selector.setName(keyName);
			menu.subject.addEventListener(I18nsChangeEvent.TYPE, selector.onI18nChange);
			if (clickListener != null)
				selector.addEventListener(BatrGUIEvent.CLICK, clickListener);
			this.appendSelectorAndText(menu.subject, selector, keyName, shiftEmptyLine);
			return this;
		}
	}
}