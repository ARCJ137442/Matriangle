

import BonusType from "../game/registry/BonusRegistry";
import EntityType from "../game/registry/EntityRegistry";
import Tool from "../game/registry/Tool";
import GameModeType from "../../../game/rule/GameModeType";
import MatrixRule_V1 from "../../../game/mods/native/rule/MatrixRule_V1";
import { uint } from "../../../legacy/AS3Legacy";
import ForcedI18nText from "./ForcedI18nText";
import I18nKey from "./I18nKey";
import I18ns from "./I18ns";

export default class I18nText {
	//============Static Variables============//

	//============Static Getter And Setter============//
	public static getTextsByAllBlocks(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of BlockType._NORMAL_BLOCKS) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByAllEntities(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of EntityType._ALL_ENTITY) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByAllEffects(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of EffectType._ALL_EFFECT) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByAllAvailableTools(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of Tool._ALL_AVAILABLE_TOOL) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByAllBonus(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of BonusType._ALL_TYPE) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByAllGameModes(translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let type of GameModeType._ALL_TYPE) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(type, isDescription)));
		}
		return result;
	}

	public static getTextsByI18ns(translations: I18ns): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let t of I18ns.translationsList) {
			result.push(new I18nText(translations, I18nKey.LANGUAGE));
		}
		return result;
	}

	public static getTextsByRuleTools(rule: MatrixRule_V1, translations: I18ns, isDescription: boolean): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let i: uint = 0; i < rule.enabledToolCount; i++) {
			result.push(new I18nText(translations, I18nKey.getTypeKey(rule.enabledTools[i], isDescription)));
		}
		return result;
	}

	public static getTextsByLanguages(): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let i: uint = 0; i < I18ns.numI18ns; i++) {
			result.push(new I18nText(I18ns.translationsList[i], I18nKey.LANGUAGE_SELF));
		}
		return result;
	}

	public static getTextsByMapNames(): I18nText[] {
		let result: I18nText[] = new Array<I18nText>();
		for (let i: uint = 0; i < Game.VALID_MAP_COUNT; i++) {
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
		if (this._translations === null)
			return null;
		return this._translations.getI18n(this._key);
	}

	//============Instance Functions============//
	public toString(): string {
		return this.currentText;
	}
}