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

	export default class BatrTextField extends TextField implements IBatrMenuElement {
		//============Static Constructor============//
		public static fromKey(translations: I18ns, translationKey: string = null, autoSize: string = TextFieldAutoSize.LEFT): BatrTextField {
			return new BatrTextField(new I18nText(
				translations == null ? I18ns.getI18nByLanguage() : translations,
				translationKey
			), autoSize);
		}

		//============Static Variables============//

		//============Instance Variables============//
		protected _translationalText: I18nText;

		//============Constructor============//
		public constructor(translationalText: I18nText, autoSize: string = TextFieldAutoSize.LEFT) {
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
		public destructor(): void {
			this._translationalText = null;
		}

		//============Instance Getter And Setter============//
		public get translationalText(): I18nText {
			return this._translationalText;
		}

		public set translationalText(value: I18nText) {
			this._translationalText = value;
			this.updateByI18n();
		}

		public get translations(): I18ns {
			return this._translationalText.translations;
		}

		public get translationKey(): string {
			return this._translationalText.key;
		}

		public get textInI18n(): string {
			return this._translationalText.currentText;
		}

		//============Instance Functions============//
		public turnI18nsTo(translations: I18ns): void {
			this._translationalText.translations = translations;
			this.updateByI18n();
		}

		public updateByI18n(): void {
			this.text = this.textInI18n;
		}

		public setText(value: string): void {
			this.text = value;
		}

		public setPos(x: number, y: number): BatrTextField {
			this.x = x;
			this.y = y;
			return this;
		}

		public setBlockPos(x: number, y: number): BatrTextField {
			this.x = PosTransform.localPosToRealPos(x);
			this.y = PosTransform.localPosToRealPos(y);
			return this;
		}

		public setSize(w: number, h: number): BatrTextField {
			this.width = w;
			this.height = h;
			return this;
		}

		public setBlockSize(w: number, h: number): BatrTextField {
			this.width = PosTransform.localPosToRealPos(w);
			this.height = PosTransform.localPosToRealPos(h);
			return this;
		}

		public initFormatAsMenu(): BatrTextField {
			this.selectable = false;
			return this;
		}

		public setFormat(formet: TextFormat, lock: boolean = false): BatrTextField {
			this.defaultTextFormat = formet;
			this.setTextFormat(formet);
			return this;
		}

		//============Deal With Event============//
		public onI18nChange(E: I18nsChangeEvent): void {
			this.turnI18nsTo(E.nowI18ns);
		}
	}
}