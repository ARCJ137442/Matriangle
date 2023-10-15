import PlayerStats from '../../../server/mods/batr/entity/player/stat/PlayerStats'
import { uint } from '../../../legacy/AS3Legacy'
import I18nText from './I18nText'
import I18ns from './I18ns'

/**
 * ...
 * @author ARCJ137442
 */
export default class ForcedI18nText extends I18nText {
	//============Static Getter And Setter============//
	public static getTextsByPlayerNames(players: PlayerStats[]): I18nText[] {
		let result: I18nText[] = []
		for (let i: uint = 0; i < players.length; i++) {
			result.push(
				new ForcedI18nText(null, null, players[i].profile.customName)
			)
		}
		return result
	}

	//============Instance Variables============//
	protected _forcedText: string

	//============Constructor & Destructor============//
	public constructor(
		translations: I18ns,
		key: string = null,
		forcedText: string = null
	) {
		super(translations, key)
		this._forcedText = forcedText
	}

	public override clone(): I18nText {
		return new ForcedI18nText(
			this._translations,
			this._key,
			this._forcedText
		)
	}

	//============Destructor Function============//
	public override destructor(): void {
		this._forcedText = null
		super.destructor()
	}

	//============Instance Getter And Setter============//
	public get forcedText(): string {
		return this._forcedText
	}

	public set forcedText(value: string) {
		this._forcedText = value
	}

	override get currentText(): string {
		if (this._forcedText !== null) return this._forcedText
		return super.currentText
	}

	public removeForce(): I18nText {
		this._forcedText = null
		return this
	}

	public setForce(value: string): I18nText {
		this._forcedText = null
		return this
	}
}
