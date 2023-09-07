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
		public static const DEFAULT_DISTANCE_H: Number = GlobalGameVariables.DEFAULT_SIZE * 8;
		public static const DEFAULT_DISTANCE_V: Number = GlobalGameVariables.DEFAULT_SIZE;

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
		public function BatrSelectorList(horizontalDistance: Number = BatrSelectorList.DEFAULT_DISTANCE_H, verticalDistance: Number = BatrSelectorList.DEFAULT_DISTANCE_V): void {
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
		public function get selectors(): BatrSelector[] {
			return this._selectors;
		}

		public function get selectorCount(): int {
			return this._selectors.length;
		}

		// Text
		public function get selectTextFields(): BatrTextField[] {
			return this._selectTextFields;
		}

		public function get selectTextFieldCount(): int {
			return this._selectTextFields.length;
		}

		// verticalDistance
		public function get horizontalDistance(): Number {
			return this._horizontalDistance;
		}

		public function set horizontalDistance(value: Number): void {
			this._horizontalDistance = value;
			this.refreshDisplay();
		}

		// verticalDistance
		public function get verticalDistance(): Number {
			return this._verticalDistance;
		}

		public function set verticalDistance(value: Number): void {
			this._verticalDistance = value;
			this.refreshDisplay();
		}

		//============Instance Functions============//
		public function setPos(x: Number, y: Number): BatrSelectorList {
			super.protected:: sP(x, y);
			return this;
		}

		public function setBlockPos(x: Number, y: Number): BatrSelectorList {
			super.protected:: sBP(x, y);
			return this;
		}

		protected function initDisplay(): void {
			var dy: Number, i: int;
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

		public function refreshDisplay(): BatrSelectorList {
			this.initDisplay();
			return this;
		}

		public function setPosAndRefresh(x: Number, y: Number): BatrSelectorList {
			this.x = x;
			this.y = y;
			this.refreshDisplay();
			return this;
		}

		public function setDistance(H: Number, V: Number): BatrSelectorList {
			this._horizontalDistance = H;
			this._verticalDistance = V;
			this.initDisplay();
			return this;
		}

		//========By IBatrMenuElementContainer========//

		/**
		 * Unfinished.
		 */
		public function appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public function appendDirectElements(...elements): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public function addChildPerDirectElements(): void {
			this.initDisplay();
		}

		/**
		 * Unfinished.
		 */
		public function getElementAt(index: int): IBatrMenuElement {
			functionNotFound();
			return null;
		}

		/**
		 * Unfinished.
		 */
		public function getElementByName(name: String): BatrMenuGUI {
			functionNotFound();
			return null;
		}

		private function functionNotFound(): void {
			throw new Error('Function Not Found!');
		}

		//========True Functions About selectors========//
		public function appendSelectorAndText(host: BatrSubject, selector: BatrSelector, tKey: String, shiftEmptyLine: Boolean = false): BatrSelectorList {
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

		protected function AddNewEmptyLine(): void {
			this._selectors.push(null);
			this._selectTextFields.push(null);
		}

		public function getSelectorByName(name: String): BatrSelector {
			for (var selector of this._selectors) {
				if (selector != null && selector.name == name)
					return selector;
			}
			return null;
		}

		public function quickAppendSelector(menu: Menu, content: BatrSelectorContent, keyName: String, shiftEmptyLine: Boolean = false, clickListener: Function = null, minTextBlockWidth: Number = 0.5): BatrSelectorList {
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