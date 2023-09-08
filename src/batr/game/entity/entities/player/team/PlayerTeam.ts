
export default class PlayerTeam {
	//============Static Variables============//
	public static readonly isInited: boolean = cInit();

	//============Static Getter And Setter============//

	//============Static Functions============//
	protected static cInit(): boolean {
		return true;
	}

	//============Instance Variables============//
	protected _defaultColor: uint;

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000) {
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