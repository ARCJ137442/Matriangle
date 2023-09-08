import I18nText from "./I18nText";
import I18ns from "./I18ns";

/**
 * ...
 * @author ARCJ137442
 */
export default class FixedI18nText extends I18nText {
	//============Instance Variables============//
	protected _prefix: string;
	protected _suffix: string;

	//============Constructor & Destructor============//
	public constructor(translations: I18ns, key: string = null, prefix: string = '', suffix: string = '') {
		super(translations, key);
		this._prefix = prefix;
		this._suffix = suffix;
	}

	override public clone(): I18nText {
		return new FixedI18nText(this._translations, this._key, this._prefix, this._suffix);
	}

	//============Destructor Function============//
	override public destructor(): void {
		this._prefix = this._suffix = null;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public get prefix(): string {
		return this._prefix;
	}

	public set prefix(value: string) {
		this._prefix = value;
	}

	public get suffix(): string {
		return this._suffix;
	}

	public set suffix(value: string) {
		this._suffix = value;
	}

	override get currentText(): string {
		return this._prefix + super.currentText + this._suffix;
	}
}