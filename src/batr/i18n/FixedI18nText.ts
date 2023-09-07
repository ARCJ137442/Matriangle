package batr.translations {

	/**
	 * ...
	 * @author ARCJ137442
	 */
	export default class FixedI18nText extends I18nText {
		//============Instance Variables============//
		protected _prefix: String;
		protected _suffix: String;

		//============Constructor Function============//
		public function FixedI18nText(translations: I18ns, key: String = null, prefix: String = '', suffix: String = '') {
			super(translations, key);
			this._prefix = prefix;
			this._suffix = suffix;
		}

		override public function clone(): I18nText {
			return new FixedI18nText(this._translations, this._key, this._prefix, this._suffix);
		}

		//============Destructor Function============//
		override public function destructor(): void {
			this._prefix = this._suffix = null;
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public function get prefix(): String {
			return this._prefix;
		}

		public function set prefix(value: String): void {
			this._prefix = value;
		}

		public function get suffix(): String {
			return this._suffix;
		}

		public function set suffix(value: String): void {
			this._suffix = value;
		}

		public override function get currentText(): String {
			return this._prefix + super.currentText + this._suffix;
		}
	}
}