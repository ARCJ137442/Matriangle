package batr.menu.objects.selector {

	import batr.common.*;
	import batr.general.*;

	import batr.game.block.*;
	import batr.game.map.*;
	import batr.game.main.*;
	import batr.game.model.*;

	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.objects.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.translations.*;

	import flash.text.*;
	import flash.display.*;
	import flash.events.MouseEvent;

	public class BatrSelector extends BatrMenuGUI implements IBatrMenuElement {
		//============Static Variables============//
		protected static const ARROW_OFFSET: Number = GlobalGameVariables.DEFAULT_SIZE / 10;

		//============Static Functions============//

		/**
		 * set a relative link between these selector.
		 * @param	selector1	the first selector carries content.
		 * @param	selector2	the second selector that will lost its content.
		 */
		public static function setRelativeLink(selector1: BatrSelector, selector2: BatrSelector): void {
			selector1.setLinkTarget(selector2, false);
			selector2.setLinkTarget(selector1, false);
		}

		//============Instance Variables============//
		protected var _leftArrow: BatrSelectorArrow;
		protected var _rightArrow: BatrSelectorArrow;
		protected var _textField: BatrTextField;
		protected var _minTextWidth: Number;

		protected var _Content: BatrSelectorContent;

		/**
		 * A reference to other selector,and constantly copy content from its link target
		 * When its value update,the target's value also update
		 */
		protected var _linkTarget: BatrSelector = null;

		//============Constructor Function============//
		public function BatrSelector(content: BatrSelectorContent,
			minTextWidth: Number = 2 * GlobalGameVariables.DEFAULT_SIZE): void {
			super();
			this._Content = content;
			this._minTextWidth = minTextWidth;
			// Left
			this._leftArrow = new BatrSelectorArrow();
			this._leftArrow.scaleX = -1;
			// Right
			this._rightArrow = new BatrSelectorArrow();
			// Text
			this._textField = BatrTextField.fromKey(null, null);
			// AddEventListener
			this._leftArrow.clickFunction = this.onClickLeft;
			this._rightArrow.clickFunction = this.onClickRight;
			// Init
			this.initDisplay();
		}

		//============Destructor Function============//
		public override function deleteSelf(): void {
			this._leftArrow.deleteSelf();
			this._rightArrow.deleteSelf();
			this._textField.deleteSelf();
			this._Content.deleteSelf();
			super.deleteSelf();
		}

		//============Instance Getter And Setter============//
		public function get content(): BatrSelectorContent {
			return this._Content;
		}

		// Int:value,Enum:index
		public function get currentValue(): int {
			return this._Content.currentValue;
		}

		public function get linkTarget(): BatrSelector {
			return this._linkTarget;
		}

		public function set linkTarget(value: BatrSelector): void {
			{ // if(isValidTarget(value))
				this._linkTarget = value;
				this.copyContentTo(this._linkTarget);
			}
		}

		//============Instance Functions============//
		public function setPos(x: Number, y: Number): BatrSelector {
			super.protected:: sP(x, y);
			return this;
		}

		public function setBlockPos(x: Number, y: Number): BatrSelector {
			super.protected:: sBP(x, y);
			return this;
		}

		protected function isValidTarget(other: BatrSelector): Boolean {
			while (other != null) {
				if (other.linkTarget == this)
					return false;
				other = other.linkTarget;
			}
			return true;
		}

		protected function setLinkTarget(other: BatrSelector, callee: Boolean = true): BatrSelector {
			this._linkTarget = other;
			this.copyContentTo(this._linkTarget, callee);
			return this;
		}

		/**
		 * Let the other selector copy content from this
		 * @param	num	the other selector
		 * @param	callee	the boolean determines to callee
		 */
		protected function copyContentTo(other: BatrSelector, callee: Boolean = true): void {
			if (other == null)
				return;
			if (this._Content != null)
				other.setContent(this._Content);
			if (!callee)
				return;
			while (other != null && other._linkTarget != null) {
				if (other._linkTarget == this)
					break;
				other._linkTarget._Content = other._Content;
				other._linkTarget.updateTextByContent();
				other._linkTarget.copyContentTo(other, false);
				other = other._linkTarget;
			}
		}

		protected function initDisplay(): void {
			this.updateTextByContent();
			this._textField.initFormatAsMenu();
			// Add Children
			this.addChild(this._leftArrow);
			this.addChild(this._rightArrow);
			this.addChild(this._textField);
		}

		protected function updateText(): void {
			this._textField.setTextFormat(Menu.TEXT_FORMAT);
			this._textField.width = this._textField.textWidth + GlobalGameVariables.DEFAULT_SIZE / 10;
			this._textField.height = this._textField.textHeight + GlobalGameVariables.DEFAULT_SIZE / 20;
			this._textField.x = -this._textField.width / 2;
			this._textField.y = -this._textField.height / 2;
			this._leftArrow.x = -Math.max(this._textField.textWidth + this._leftArrow.displayWidth, this._minTextWidth) / 2 - ARROW_OFFSET;
			this._rightArrow.x = Math.max(this._textField.textWidth + this._rightArrow.displayWidth, this._minTextWidth) / 2 + ARROW_OFFSET;
			this._leftArrow.y = this._rightArrow.y = 0;
		}

		public function updateTextByContent(): BatrSelector {
			if (this._Content == null)
				return this;
			this._textField.setText(this._Content.currentText);
			this.updateText();
			return this;
		}

		protected override function drawShape(): void {

		}

		public function setLinkTo(target: BatrSelector): BatrSelector {
			this.linkTarget = target;
			return this;
		}

		public function setContent(content: BatrSelectorContent): void {
			this._Content = content;
			this.updateTextByContent();
		}

		// Event
		protected function onClickLeft(E: MouseEvent): void {
			this.turnSelectLeft();
		}

		protected function onClickRight(E: MouseEvent): void {
			this.turnSelectRight();
		}

		public function onTranslationChange(E: TranslationsChangeEvent): void {
			/* trace(this.name,this._textField.text,this._Content);
			 * The Player selector in Game Result Menu dosn't has content when INITIAL LOAD! */
			if (this._Content == null)
				return;
			this._Content.alignTranslationsFrom(E.nowTranslations);
			this.updateTextByContent();
		}

		// Select
		public function turnSelectTo(index: int): BatrSelector {
			this._Content.currentValue = index;
			return this;
		}

		public function turnSelectLeft(): void {
			// Check
			if (this._Content == null)
				return;
			// Select
			this._Content.currentValue--;
			// Update
			this.updateTextByContent();
			this.copyContentTo(this._linkTarget);
			// Event
			this.dispatchEvent(new BatrGUIEvent(BatrGUIEvent.CLICK_LEFT, this));
		}

		public function turnSelectRight(): void {
			// Check
			if (this._Content == null)
				return;
			// Select
			this._Content.currentValue++;
			// Update
			this.updateTextByContent();
			this.copyContentTo(this._linkTarget);
			// Event
			this.dispatchEvent(new BatrGUIEvent(BatrGUIEvent.CLICK_RIGHT, this));
		}
	}
}