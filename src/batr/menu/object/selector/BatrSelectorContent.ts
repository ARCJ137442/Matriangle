package batr.menu.object.selector {

	import batr.i18n.*;
	import batr.game.stat.PlayerStats;

	export default class BatrSelectorContent {
		//============Static Variables============//

		//============Static Functions============//
		public static function createPositiveIntegerContent(initValue: int): BatrSelectorContent {
			return new BatrSelectorContent().initAsInt(int.MAX_VALUE, 1, initValue).autoInitLoopSelect();
		}

		public static function createUnsignedIntegerContent(initValue: int): BatrSelectorContent {
			return new BatrSelectorContent().initAsInt(int.MAX_VALUE, 0, initValue).autoInitLoopSelect();
		}

		public static function createPositiveIntegerAndOneSpecialContent(initValue: int, tText: I18nText): BatrSelectorContent {
			return new BatrSelectorContent().initAsEnum(
				new < I18nText > [
					tText
				], 0, 0
			).initAsInt(
				int.MAX_VALUE, 0, initValue
			).autoInitLoopSelect();
		}

		public static function createUnsignedIntegerAndOneSpecialContent(initValue: int, tText: I18nText): BatrSelectorContent {
			return new BatrSelectorContent().initAsEnum(
				new < I18nText > [
					tText
				], 0, 1
			).initAsInt(
				int.MAX_VALUE, -1, initValue
			).autoInitLoopSelect();
		}

		public static function createBinaryChoiceContent(initValue: int, translations: I18ns, tKey0: String, tKey1: String): BatrSelectorContent {
			return new BatrSelectorContent().initAsEnum(new < I18nText > [BatrSelectorContent.quickI18nTextBuild(tKey0, translations), BatrSelectorContent.quickI18nTextBuild(tKey1, translations)], 0, 0).initAsInt(1, 0, initValue).autoInitLoopSelect();
		}

		public static function createYorNContent(initValue: int, translations: I18ns): BatrSelectorContent {
			return createBinaryChoiceContent(initValue, translations, I18nKey.BOOLEAN_NO, I18nKey.BOOLEAN_YES);
		}

		public static function createBooleanContent(initValue: int, translations: I18ns): BatrSelectorContent {
			return createBinaryChoiceContent(initValue, translations, I18nKey.FALSE, I18nKey.TRUE);
		}

		public static function createLanguageContent(initValue: int): BatrSelectorContent {
			return new BatrSelectorContent().initAsEnum(
				I18nText.getTextsByLanguages(), 0, 0
			).initAsInt(
				I18ns.numI18ns - 1, 0, initValue
			).autoInitLoopSelect();
		}

		public static function createPlayerNamesContent(playerStats: PlayerStats[]): BatrSelectorContent {
			var names: I18nText[] = ForcedI18nText.getTextsByPlayerNames(playerStats);
			return new BatrSelectorContent().initAsEnum(
				names, 0, 0
			).initAsInt(
				names.length - 1, 0, 0
			).autoInitLoopSelect();
		}

		protected static function quickI18nTextBuild(key: String, translations: I18ns): I18nText {
			return new I18nText(translations, key);
		}

		//============Instance Variables============//
		//====Total====//

		/**The _value is the '_intValue'&'_enumIndex'
		 * The enumText is force the intText
		 */
		protected _value: int = 0;
		protected _enableLoopLeft: Boolean = false;
		protected _enableLoopRight: Boolean = false;

		//====Int====//
		protected _intMax: int = int.MAX_VALUE;
		protected _intMin: int = int.MIN_VALUE;

		//====Enum====//
		protected _enumTexts: I18nText[];
		protected _enumIndexOffect: int = 0; // Let The Enum affects the negative value

		//============Constructor Function============//
		public function BatrSelectorContent(): void {
			this._enumTexts = new I18nText[]();
		}

		public function copyFrom(other: BatrSelectorContent): void {
			// Total
			this._value = other._value;
			this._enableLoopLeft = other._enableLoopLeft;
			this._enableLoopRight = other._enableLoopRight;
			// Int
			this._intMax = other._intMax;
			this._intMin = other._intMin;
			// Enum
			this._enumTexts = other._enumTexts;
			this._enumIndexOffect = other._enumIndexOffect;
		}

		public function clone(): BatrSelectorContent {
			var copy: BatrSelectorContent = new BatrSelectorContent();
			copy.copyFrom(this);
			return copy;
		}

		//============Destructor Function============//
		public function destructor(): void {
			this._enumTexts = null;
			this._value = this._intMax = this._intMin = 0;
		}

		//============Instance Getter And Setter============//
		//====Total====//
		public function get enumIndexOffect(): int {
			return this._enumIndexOffect;
		}

		public function set enumIndexOffect(value: int): void {
			this._enumIndexOffect = value;
		}

		public function get currentValue(): int {
			return this._value;
		}

		public function set currentValue(value: int): void {
			if (this._value > int.MIN_VALUE && this._value < int.MAX_VALUE) {
				if (value > this._intMax)
					value = this._enableLoopRight ? this._intMin : this._intMax;
				else if (value < this._intMin)
					value = this._enableLoopLeft ? this._intMax : this._intMin;
			}
			this._value = value;
		}

		public function get currentText(): String {
			var t = this.enumText;
			return (t == null) ? String(this.currentValue) : t;
		}

		public function get enableLoopSelectLeft(): Boolean {
			return this._enableLoopLeft;
		}

		public function set enableLoopSelectLeft(value: Boolean): void {
			this._enableLoopLeft = value;
		}

		public function get enableLoopSelectRight(): Boolean {
			return this._enableLoopRight;
		}

		public function set enableLoopSelectRight(value: Boolean): void {
			this._enableLoopRight = value;
		}

		public function get enableLoopSelect(): Boolean {
			return this._enableLoopLeft || this._enableLoopRight;
		}

		public function set enableLoopSelect(value: Boolean): void {
			this._enableLoopLeft = this._enableLoopRight = value;
		}

		//====Int====//
		public function get intMax(): int {
			return this._intMax;
		}

		public function get intMin(): int {
			return this._intMin;
		}

		public function set intMax(value: int): void {
			if (this._intMax > value) {
				this._intMax = value;
				this.updateValue();
				return;
			}
			this._intMax = value;
		}

		public function set intMin(value: int): void {
			if (this._intMin < value) {
				this._intMin = value;
				this.updateValue();
				return;
			}
			this._intMin = value;
		}

		//====Enum====//
		public function get enumIndex(): int {
			return this._value + this._enumIndexOffect;
		}

		public function get enumText(): String {
			return this.getEnumTextAt(this.enumIndex);
		}

		public function get enumTexts(): I18nText[] {
			return this._enumTexts;
		}

		public function set enumTexts(value: I18nText[]): void {
			this._enumTexts = value;
		}

		public function get hasEnum(): Boolean {
			return this.hasEnumTextAt(this.enumIndex);
		}

		//============Instance Functions============//
		//====Total====//
		// Limit between 'min<value<max'
		public function updateValue(): BatrSelectorContent {
			this._value = Math.min(Math.max(this._value, this._intMin), this._intMax);
			return this;
		}

		public function initLoopSelect(left: Boolean, right: Boolean): BatrSelectorContent {
			this._enableLoopLeft = left;
			this._enableLoopRight = right;
			return this;
		}

		public function autoInitLoopSelect(): BatrSelectorContent {
			this._enableLoopLeft = this._intMax < int.MAX_VALUE;
			this._enableLoopRight = this._intMin > int.MIN_VALUE;
			return this;
		}

		//====Int====//
		public function initAsInt(max: int, min: int, value: int = 0): BatrSelectorContent {
			this._intMax = max;
			this._intMin = min;
			this._value = value;
			return this;
		}

		//====Enum====//
		public function initAsEnum(texts: I18nText[], index: int = 0, offset: int = 0): BatrSelectorContent {
			this._enumTexts = texts;
			this._value = index;
			this._enumIndexOffect = offset;
			return this;
		}

		public function hasEnumTextAt(index: int): Boolean {
			return !(this._enumTexts == null ||
				index < 0 || index >= this._enumTexts.length ||
				this._enumTexts[index] == null);
		}

		public function getEnumTextAt(index: int): String {
			if (!this.hasEnumTextAt(index))
				return null;
			return this._enumTexts[index].currentText;
		}

		public function alignI18nsFrom(translations: I18ns): BatrSelectorContent {
			if (this._enumTexts != null) {
				for (var tText of this._enumTexts) {
					tText.translations = translations;
				}
			}
			return this;
		}

		//====Debug====//
		public function toString(): String {
			return 'BatrSelectorContent[' + this._value + ']{' + this._intMin + '~' + this._intMax + ',' + this._enumTexts + '/' + this._enumIndexOffect + '}';
		}
	}
}