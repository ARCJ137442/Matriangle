package batr.game.model {

	export default class PlayerTeam {
		//============Static Variables============//
		public static const isInited: boolean = cInit();

		//============Static Getter And Setter============//

		//============Static Functions============//
		protected static function cInit(): boolean {
			return true;
		}

		//============Instance Variables============//
		protected _defaultColor: uint;

		//============Constructor Function============//
		public PlayerTeam(color: uint = 0x000000): void {
			this._defaultColor = color;
		}

		//============Destructor Function============//
		public destructor(): void {
			this._defaultColor = 0x000000;
		}

		//============Copy Constructor Function============//
		public clone(): PlayerTeam {
			return new PlayerTeam(this._defaultColor);
		}

		//============Instance Getter And Setter============//
		public get defaultColor(): uint {
			return this._defaultColor;
		}

		//============Instance Functions============//
	}
}