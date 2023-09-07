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

	public class BatrTextField extends TextField implements IBatrMenuElement {
		//============Static Constructor============//
		public static function fromKey(translations: I18ns, translationKey: String = null, autoSize: String = TextFieldAutoSize.LEFT): BatrTextField {
			return new BatrTextField(new I18nText(
				translations == null ? I18ns.getI18nByLanguage() : translations,
				translationKey
			), autoSize);
		}

		//============Static Variables============//

		//============Instance Variables============//
		protected var _translationalText: I18nText;

		//============Constructor============//
		public function BatrTextField(translationalText: I18nText, autoSize: String = TextFieldAutoSize.LEFT): void {
			super();
			// text
			this._translationalText = translationalText;
			this.updateByI18n();
			// form
			this.defaultTextFormat = Menu.TEXT_FORMAT;
			this.setTextFormat(Menu.TEXT_FORMAT);
			this.autoSize = autoSize;
		}

		//============Destructor Function============//
		public function deleteSelf(): void {
			this._translationalText = null;
		}

		//============Instance Getter And Setter============//
		public function get translationalText(): I18nText {
			return this._translationalText;
		}

		public function set translationalText(value: I18nText): void {
			this._translationalText = value;
			this.updateByI18n();
		}

		public function get translations(): I18ns {
			return this._translationalText.translations;
		}

		public function get translationKey(): String {
			return this._translationalText.key;
		}

		public function get textInI18n(): String {
			return this._translationalText.currentText;
		}

		//============Instance Functions============//
		public function turnI18nsTo(translations: I18ns): void {
			this._translationalText.translations = translations;
			this.updateByI18n();
		}

		public function updateByI18n(): void {
			this.text = this.textInI18n;
		}

		public function setText(value: String): void {
			this.text = value;
		}

		public function setPos(x: Number, y: Number): BatrTextField {
			this.x = x;
			this.y = y;
			return this;
		}

		public function setBlockPos(x: Number, y: Number): BatrTextField {
			this.x = PosTransform.localPosToRealPos(x);
			this.y = PosTransform.localPosToRealPos(y);
			return this;
		}

		public function setSize(w: Number, h: Number): BatrTextField {
			this.width = w;
			this.height = h;
			return this;
		}

		public function setBlockSize(w: Number, h: Number): BatrTextField {
			this.width = PosTransform.localPosToRealPos(w);
			this.height = PosTransform.localPosToRealPos(h);
			return this;
		}

		public function initFormatAsMenu(): BatrTextField {
			this.selectable = false;
			return this;
		}

		public function setFormat(formet: TextFormat, lock: Boolean = false): BatrTextField {
			this.defaultTextFormat = formet;
			this.setTextFormat(formet);
			return this;
		}

		//============Deal With Event============//
		public function onI18nChange(E: I18nsChangeEvent): void {
			this.turnI18nsTo(E.nowI18ns);
		}
	}
}