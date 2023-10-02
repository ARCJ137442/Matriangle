import { Event } from "../../legacy/flash/events";

/**
 * !【2023-10-02 21:58:44】整个类行将弃用
 * * 目前来说，因为「逻辑」与「显示」的解耦，这里不再需要「规则更新」
 * * （实际上目的已不明）这个类不再需要，等待被删除
 */
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
		return new GameRuleEvent(this.type, this.bubbles, this.cancelable);
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
		return this.formatToString('GameRuleEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
	}
}
