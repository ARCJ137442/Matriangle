
// import batr.i18n.*;
// import batr.game.stat.PlayerStats;

import PlayerStats from "../../../game/stat/PlayerStats";
import ForcedI18nText from "../../../i18n/ForcedI18nText";
import I18nKey from "../../../i18n/I18nKey";
import I18nText from "../../../i18n/I18nText";
import I18ns from "../../../i18n/I18ns";
import { int, int$MAX_VALUE, int$MIN_VALUE } from "../../../legacy/AS3Legacy";

export default class BatrSelectorContent {
	//============Static Variables============//

	//============Static Functions============//
	public static createPositiveIntegerContent(initValue: int): BatrSelectorContent {
		return new BatrSelectorContent().initAsInt(int$MAX_VALUE, 1, initValue).autoInitLoopSelect();
	}

	public static createUnsignedIntegerContent(initValue: int): BatrSelectorContent {
		return new BatrSelectorContent().initAsInt(int$MAX_VALUE, 0, initValue).autoInitLoopSelect();
	}

	public static createPositiveIntegerAndOneSpecialContent(initValue: int, tText: I18nText): BatrSelectorContent {
		return new BatrSelectorContent().initAsEnum(
			[
				tText
			], 0, 0
		).initAsInt(
			int$MAX_VALUE, 0, initValue
		).autoInitLoopSelect();
	}

	public static createUnsignedIntegerAndOneSpecialContent(initValue: int, tText: I18nText): BatrSelectorContent {
		return new BatrSelectorContent().initAsEnum(
			[
				tText
			], 0, 1
		).initAsInt(
			int$MAX_VALUE, -1, initValue
		).autoInitLoopSelect();
	}

	public static createBinaryChoiceContent(initValue: int, translations: I18ns, tKey0: string, tKey1: string): BatrSelectorContent {
		return new BatrSelectorContent().initAsEnum(new Array<I18nText>(BatrSelectorContent.quickI18nTextBuild(tKey0, translations), BatrSelectorContent.quickI18nTextBuild(tKey1, translations)), 0, 0).initAsInt(1, 0, initValue).autoInitLoopSelect();
	}

	public static createYorNContent(initValue: int, translations: I18ns): BatrSelectorContent {
		return createBinaryChoiceContent(initValue, translations, I18nKey.BOOLEAN_NO, I18nKey.BOOLEAN_YES);
	}

	public static createBooleanContent(initValue: int, translations: I18ns): BatrSelectorContent {
		return createBinaryChoiceContent(initValue, translations, I18nKey.FALSE, I18nKey.TRUE);
	}

	public static createLanguageContent(initValue: int): BatrSelectorContent {
		return new BatrSelectorContent().initAsEnum(
			I18nText.getTextsByLanguages(), 0, 0
		).initAsInt(
			I18ns.numI18ns - 1, 0, initValue
		).autoInitLoopSelect();
	}

	public static createPlayerNamesContent(playerStats: PlayerStats[]): BatrSelectorContent {
		let names: I18nText[] = ForcedI18nText.getTextsByPlayerNames(playerStats);
		return new BatrSelectorContent().initAsEnum(
			names, 0, 0
		).initAsInt(
			names.length - 1, 0, 0
		).autoInitLoopSelect();
	}

	protected static quickI18nTextBuild(key: string, translations: I18ns): I18nText {
		return new I18nText(translations, key);
	}

	//============Instance Variables============//
	//====Total====//

	/**The _value is the '_intValue'&'_enumIndex'
	 * The enumText is force the intText
	 */
	protected _value: int = 0;
	protected _enableLoopLeft: boolean = false;
	protected _enableLoopRight: boolean = false;

	//====Int====//
	protected _intMax: int = int$MAX_VALUE;
	protected _intMin: int = int$MIN_VALUE;

	//====Enum====//
	protected _enumTexts: I18nText[];
	protected _enumIndexOffset: int = 0; // Let The Enum affects the negative value

	//============Constructor & Destructor============//
	public constructor() {
		this._enumTexts = new Array<I18nText>();
	}

	public copyFrom(other: BatrSelectorContent): void {
		// Total
		this._value = other._value;
		this._enableLoopLeft = other._enableLoopLeft;
		this._enableLoopRight = other._enableLoopRight;
		// Int
		this._intMax = other._intMax;
		this._intMin = other._intMin;
		// Enum
		this._enumTexts = other._enumTexts;
		this._enumIndexOffset = other._enumIndexOffset;
	}

	public clone(): BatrSelectorContent {
		let copy: BatrSelectorContent = new BatrSelectorContent();
		copy.copyFrom(this);
		return copy;
	}

	//============Destructor Function============//
	public destructor(): void {
		this._enumTexts = null;
		this._value = this._intMax = this._intMin = 0;
	}

	//============Instance Getter And Setter============//
	//====Total====//
	public get enumIndexOffset(): int {
		return this._enumIndexOffset;
	}

	public set enumIndexOffset(value: int) {
		this._enumIndexOffset = value;
	}

	public get currentValue(): int {
		return this._value;
	}

	public set currentValue(value: int) {
		if (this._value > int$MIN_VALUE && this._value < int$MAX_VALUE) {
			if (value > this._intMax)
				value = this._enableLoopRight ? this._intMin : this._intMax;
			else if (value < this._intMin)
				value = this._enableLoopLeft ? this._intMax : this._intMin;
		}
		this._value = value;
	}

	public get currentText(): string {
		let t = this.enumText;
		return (t == null) ? String(this.currentValue) : t;
	}

	public get enableLoopSelectLeft(): boolean {
		return this._enableLoopLeft;
	}

	public set enableLoopSelectLeft(value: boolean) {
		this._enableLoopLeft = value;
	}

	public get enableLoopSelectRight(): boolean {
		return this._enableLoopRight;
	}

	public set enableLoopSelectRight(value: boolean) {
		this._enableLoopRight = value;
	}

	public get enableLoopSelect(): boolean {
		return this._enableLoopLeft || this._enableLoopRight;
	}

	public set enableLoopSelect(value: boolean) {
		this._enableLoopLeft = this._enableLoopRight = value;
	}

	//====Int====//
	public get intMax(): int {
		return this._intMax;
	}

	public get intMin(): int {
		return this._intMin;
	}

	public set intMax(value: int) {
		if (this._intMax > value) {
			this._intMax = value;
			this.updateValue();
			return;
		}
		this._intMax = value;
	}

	public set intMin(value: int) {
		if (this._intMin < value) {
			this._intMin = value;
			this.updateValue();
			return;
		}
		this._intMin = value;
	}

	//====Enum====//
	public get enumIndex(): int {
		return this._value + this._enumIndexOffset;
	}

	public get enumText(): string {
		return this.getEnumTextAt(this.enumIndex);
	}

	public get enumTexts(): I18nText[] {
		return this._enumTexts;
	}

	public set enumTexts(value: I18nText[]) {
		this._enumTexts = value;
	}

	public get hasEnum(): boolean {
		return this.hasEnumTextAt(this.enumIndex);
	}

	//============Instance Functions============//
	//====Total====//
	// Limit between 'min<value<max'
	public updateValue(): BatrSelectorContent {
		this._value = Math.min(Math.max(this._value, this._intMin), this._intMax);
		return this;
	}

	public initLoopSelect(left: boolean, right: boolean): BatrSelectorContent {
		this._enableLoopLeft = left;
		this._enableLoopRight = right;
		return this;
	}

	public autoInitLoopSelect(): BatrSelectorContent {
		this._enableLoopLeft = this._intMax < int$MAX_VALUE;
		this._enableLoopRight = this._intMin > int$MIN_VALUE;
		return this;
	}

	//====Int====//
	public initAsInt(max: int, min: int, value: int = 0): BatrSelectorContent {
		this._intMax = max;
		this._intMin = min;
		this._value = value;
		return this;
	}

	//====Enum====//
	public initAsEnum(texts: I18nText[], index: int = 0, offset: int = 0): BatrSelectorContent {
		this._enumTexts = texts;
		this._value = index;
		this._enumIndexOffset = offset;
		return this;
	}

	public hasEnumTextAt(index: int): boolean {
		return !(this._enumTexts == null ||
			index < 0 || index >= this._enumTexts.length ||
			this._enumTexts[index] == null);
	}

	public getEnumTextAt(index: int): string {
		if (!this.hasEnumTextAt(index))
			return null;
		return this._enumTexts[index].currentText;
	}

	public alignI18nsFrom(translations: I18ns): BatrSelectorContent {
		if (this._enumTexts != null) {
			for (let tText of this._enumTexts) {
				tText.translations = translations;
			}
		}
		return this;
	}

	//====Debug====//
	public toString(): string {
		return 'BatrSelectorContent[' + this._value + ']{' + this._intMin + '~' + this._intMax + ',' + this._enumTexts + '/' + this._enumIndexOffset + '}';
	}
}