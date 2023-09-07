package batr.translations {

	import batr.game.block.BlockType;
	import batr.game.effect.EffectType;
	import batr.game.entity.EntityType;
	import batr.game.model.BonusType;
	import batr.game.model.WeaponType;
	import batr.game.model.GameModeType;
	import batr.game.main.Game;
	import batr.game.main.GameRule;

	export default class I18nText {
		//============Static Variables============//

		//============Static Getter And Setter============//
		public static function getTextsByAllBlocks(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of BlockType._NORMAL_BLOCKS) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByAllEntities(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of EntityType._ALL_ENTITY) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByAllEffects(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of EffectType._ALL_EFFECT) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByAllAvaliableWeapons(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of WeaponType._ALL_AVALIABLE_WEAPON) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByAllBonus(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of BonusType._ALL_TYPE) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByAllGameModes(translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of GameModeType._ALL_TYPE) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static function getTextsByI18ns(translations: I18ns): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var t of I18ns.translationsList) {
				result.push(new I18nText(translations, I18nKey.LANGUAGE));
			}
			return result;
		}

		public static function getTextsByRuleWeapons(rule: GameRule, translations: I18ns, isDescription: Boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < rule.enableWeaponCount; i++) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(rule.enableWeapons[i], isDescription)));
			}
			return result;
		}

		public static function getTextsByLanguages(): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < I18ns.numI18ns; i++) {
				result.push(new I18nText(I18ns.translationsList[i], I18nKey.LANGUAGE_SELF));
			}
			return result;
		}

		public static function getTextsByMapNames(): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < Game.VALID_MAP_COUNT; i++) {
				result.push(new ForcedI18nText(null, null, Game.ALL_MAPS[i].name));
			}
			return result;
		}

		//============Static Functions============//
		public static function fromString(value: String): I18nText {
			return new I18nText(null, null);
		}

		//============Instance Variables============//
		protected _key: String;
		protected _translations: I18ns;

		//============Constructor Function============//
		public function I18nText(translations: I18ns, key: String = null): void {
			this._translations = translations;
			this._key = key;
		}

		public function clone(): I18nText {
			return new I18nText(this._translations, this._key);
		}

		//============Destructor Function============//
		public function destructor(): void {
			this._key = null;
		}

		//============Instance Getter And Setter============//
		public function get key(): String {
			return this._key;
		}

		public function set key(value: String): void {
			this._key = value;
		}

		public function get translations(): I18ns {
			return this._translations;
		}

		public function set translations(value: I18ns): void {
			this._translations = value;
		}

		public function get currentText(): String {
			if (this._translations == null)
				return null;
			return this._translations.getI18n(this._key);
		}

		//============Instance Functions============//
		public function toString(): String {
			return this.currentText;
		}
	}
}