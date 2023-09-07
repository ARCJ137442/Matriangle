package batr.translations {

	import batr.game.entity.entity.player.Player;
	import batr.game.stat.PlayerStats;

	/**
	 * ...
	 * @author ARCJ137442
	 */
	public class ForcedI18nText extends I18nText {
		//============Static Getter And Setter============//
		public static function getTextsByPlayerNames(players: Vector.<PlayerStats>): Vector.<I18nText> {
			var result: Vector.<I18nText> = new Vector.<I18nText>;
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
		protected var _forcedText: String;

		//============Constructor Function============//
		public function ForcedI18nText(translations: I18ns, key: String = null, forcedText: String = null) {
			super(translations, key);
			this._forcedText = forcedText;
		}

		override public function clone(): I18nText {
			return new ForcedI18nText(this._translations, this._key, this._forcedText);
		}

		//============Destructor Function============//
		override public function deleteSelf(): void {
			this._forcedText = null;
			super.deleteSelf();
		}

		//============Instance Getter And Setter============//
		public function get forcedText(): String {
			return this._forcedText;
		}

		public function set forcedText(value: String): void {
			this._forcedText = value;
		}

		public override function get currentText(): String {
			if (this._forcedText != null)
				return this._forcedText;
			return super.currentText;
		}

		public function removeForce(): I18nText {
			this._forcedText = null;
			return this;
		}

		public function setForce(value: String): I18nText {
			this._forcedText = null;
			return this;
		}
	}
}