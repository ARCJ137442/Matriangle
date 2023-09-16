

export default class GameRuleEvent extends Event {
	//============Static Variables============//
	public static readonly VARIABLE_UPDATE: string = 'variableUpdate';
	public static readonly TEAMS_CHANGE: string = 'teamsChange';

	//============Instance Variables============//
	protected _variableOld: any;
	protected _variableNew: any;

	//============Constructor & Destructor============//
	public constructor(type: string, variableOld: any = null, variableNew: any = null, bubbles: boolean = false, cancelable: boolean = false) {
		super(type, bubbles, cancelable);
	}

	//============Copy Constructor Function============//
	override clone(): Event {
		return new GameRuleEvent(type, bubbles, cancelable);
	}

	//============Instance Getter And Setter============//
	public get variableOld(): any {
		return this._variableOld;
	}

	public get variableNew(): any {
		return this._variableNew;
	}

	//============Instance Functions============//
	override toString(): string {
		return formatToString('GameRuleEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
	}
}
