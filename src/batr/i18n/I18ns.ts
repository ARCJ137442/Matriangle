package batr.translations {

	import flash.system.Capabilities;

	public class I18ns {
		//============Static Variables============//
		// I18ns
		protected static var EN_US: I18ns;
		protected static var ZH_CN: I18ns;
		protected static var _translationsList: Vector.<I18ns>;

		// Class Init
		protected static var isInited: Boolean = false;

		//============Static Getter And Setter============//
		public static function get translationsList(): Vector.<I18ns> {
			return I18ns._translationsList;
		}

		public static function get numI18ns(): int {
			return I18ns._translationsList.length;
		}

		//============Static Functions============//
		public static function getI18nByLanguage(): I18ns {
			if (!isInited)
				cInit();
			switch (Capabilities.language) {
				case 'en':
					return EN_US;

				case 'zh-CN':
					return ZH_CN;

				default:
					return null;

			}
		}

		// 'index:text,index2:text2,index3:text3...'
		public static function fromString(str: String): I18ns {
			return I18ns.fromStringArr(str.split(','));
		}

		// ['index:text','index2:text2','index3:text3'...]
		public static function fromStringArr(str: Array): I18ns {
			if (!isInited)
				cInit();

			var returnT: I18ns = new I18ns();

			if (str.length < 1 || str == null)
				return returnT;
			var str1: Array, k: String, v: String;
			for each(var value in str) {
				str1 = String(value).split(':');

				k = str1[0];

				v = str1[1];

				returnT.setI18n(k, v);

			}
			return returnT;

		}

		public static function getI18n(translation: I18ns, key: String): String {
			return translation == null ? null : translation.getI18n(key);
		}

		// 'index:text','index2:text2','index3:text3','...'
		public static function fromStringArr2(...str): I18ns {
			return I18ns.fromStringArr(str);

		}

		public static function getIDFromI18n(translations: I18ns): int {
			return I18ns._translationsList.indexOf(translations);
		}

		public static function getI18nFromID(index: int): I18ns {
			return I18ns._translationsList[index];
		}

		//====Init I18ns====//
		protected static function cInit(): Boolean {
			isInited = true;
			EN_US = DefaultNativeI18ns.EN_US;
			ZH_CN = DefaultNativeI18ns.ZH_CN;
			// trace(ZH_CN.translationKeys.toString()+'\n'+ZH_CN.translationValues.toString())
			_translationsList = new < I18ns > [I18ns.EN_US, I18ns.ZH_CN];
			return true;
		}

		//============Instance Variables============//
		protected var _dictionary: Object = new Object();

		protected var _enabledToWrite: Boolean = true;

		protected var _getFunction: Function;

		protected var _setFunction: Function;

		//============Constructor Function============//
		// 'index','text','index2','text2','index3','text3','...'
		public function I18ns(...translations): void {
			if (!isInited)
				cInit();
			this._getFunction = this.defaultGet;
			this._setFunction = this.defaultSet;
			for (var i: uint = 0; i + 1 < translations.length; i += 2) {
				this.setI18n(translations[i], translations[i + 1]);
			}
		}

		//============Instance Getter And Setter============//
		public function get enableToWrite(): Boolean {
			return this._enabledToWrite;

		}

		public function get translationKeys(): Vector.<String> {
			var rV: Vector.<String> = new Vector.<String>();

			for (var index in this._dictionary) {
				rV.push(String(index));

			}
			return rV;

		}

		public function get translationValues(): Vector.<String> {
			var rV: Vector.<String> = new Vector.<String>();

			for each(var value in this._dictionary) {
				rV.push(String(value));

			}
			return rV;

		}

		//============Instance Functions============//
		public function getI18n(key: String): String {
			return this._getFunction(key);
		}

		public function setI18n(key: String, value: String): void {
			this._setFunction(key, value);
		}

		protected function defaultGet(key: String): String {
			var value: String = String(this._dictionary[key]);
			if (value == 'undefined' || value == 'null' || value == '')
				return DefaultNativeI18ns.getDefaultI18n(key);
			return value;
		}

		protected function defaultSet(key: String, value: String): void {
			if (this._enabledToWrite)
				this._dictionary[key] = value;
		}

		public function lock(): void {
			this._enabledToWrite = false;
		}

		public function clear(): void {
			if (this._enabledToWrite)
				this._dictionary = new Object();
		}

		public function toString(): String {
			var rS: String = '';

			for (var index in this._dictionary) {
				rS += String(index) + ':' + String(this._dictionary[index]) + ';';
			}
			return rS;

		}
	}
}
