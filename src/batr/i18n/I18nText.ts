package batr.translations {

	import batr.game.block.BlockType;
	import batr.game.effect.EffectType;
	import batr.game.entity.EntityType;
	import batr.game.model.BonusType;
	import batr.game.model.ToolType;
	import batr.game.model.GameModeType;
	import batr.game.main.Game;
	import batr.game.main.GameRule;

	export default class I18nText {
		//============Static Variables============//

		//============Static Getter And Setter============//
		public static getTextsByAllBlocks(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of BlockType._NORMAL_BLOCKS) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByAllEntities(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of EntityType._ALL_ENTITY) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByAllEffects(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of EffectType._ALL_EFFECT) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByAllAvaliableTools(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of ToolType._ALL_AVALIABLE_TOOL) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByAllBonus(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of BonusType._ALL_TYPE) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByAllGameModes(translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var type of GameModeType._ALL_TYPE) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
			}
			return result;
		}

		public static getTextsByI18ns(translations: I18ns): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var t of I18ns.translationsList) {
				result.push(new I18nText(translations, I18nKey.LANGUAGE));
			}
			return result;
		}

		public static getTextsByRuleTools(rule: GameRule, translations: I18ns, isDescription: boolean): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < rule.enableToolCount; i++) {
				result.push(new I18nText(translations, I18nKey.getTypeKey(rule.enableTools[i], isDescription)));
			}
			return result;
		}

		public static getTextsByLanguages(): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < I18ns.numI18ns; i++) {
				result.push(new I18nText(I18ns.translationsList[i], I18nKey.LANGUAGE_SELF));
			}
			return result;
		}

		public static getTextsByMapNames(): I18nText[] {
			var result: I18nText[] = new I18nText[]();
			for (var i: uint = 0; i < Game.VALID_MAP_COUNT; i++) {
				result.push(new ForcedI18nText(null, null, Game.ALL_MAPS[i].name));
			}
			return result;
		}

		//============Static Functions============//
		public static fromString(value: string): I18nText {
			return new I18nText(null, null);
		}

		//============Instance Variables============//
		protected _key: string;
		protected _translations: I18ns;

		//============Constructor & Destructor============//
		public constructor(translations: I18ns, key: string = null) {
			this._translations = translations;
			this._key = key;
		}

		public clone(): I18nText {
			return new I18nText(this._translations, this._key);
		}

		//============Destructor Function============//
		public destructor(): void {
			this._key = null;
		}

		//============Instance Getter And Setter============//
		public get key(): string {
			return this._key;
		}

		public set key(value: string) {
			this._key = value;
		}

		public get translations(): I18ns {
			return this._translations;
		}

		public set translations(value: I18ns) {
			this._translations = value;
		}

		public get currentText(): string {
			if (this._translations == null)
				return null;
			return this._translations.getI18n(this._key);
		}

		//============Instance Functions============//
		public toString(): string {
			return this.currentText;
		}
	}
}