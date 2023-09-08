
// import batr.game.entity.entity.player.Player;
// import batr.game.stat.PlayerStats;

/**
 * ...
 * @author ARCJ137442
 */
export default class ForcedI18nText extends I18nText {
	//============Static Getter And Setter============//
	public static getTextsByPlayerNames(players: PlayerStats[]): I18nText[] {
		var result: I18nText[] = new I18nText[];
		for (var i: uint = 0; i < players.length; i++) {
			result.push(
				new ForcedI18nText(
					null, null, players[i].profile.customName
				)
			);
		}
		return result;
	}

	//============Instance Variables============//
	protected _forcedText: string;

	//============Constructor & Destructor============//
	public constructor(translations: I18ns, key: string = null, forcedText: string = null) {
		super(translations, key);
		this._forcedText = forcedText;
	}

	override public clone(): I18nText {
		return new ForcedI18nText(this._translations, this._key, this._forcedText);
	}

	//============Destructor Function============//
	override public destructor(): void {
		this._forcedText = null;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public get forcedText(): string {
		return this._forcedText;
	}

	public set forcedText(value: string) {
		this._forcedText = value;
	}

	override get currentText(): string {
		if (this._forcedText != null)
			return this._forcedText;
		return super.currentText;
	}

	public removeForce(): I18nText {
		this._forcedText = null;
		return this;
	}

	public setForce(value: string): I18nText {
		this._forcedText = null;
		return this;
	}
}