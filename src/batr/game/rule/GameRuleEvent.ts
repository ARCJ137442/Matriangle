package batr.game.events {

	import flash.events.Event;

	export default class GameRuleEvent extends Event {
		//============Static Variables============//
		public static const VARIABLE_UPDATE: string = 'variableUpdate';
		public static const TEAMS_CHANGE: string = 'teamsChange';

		//============Instance Variables============//
		protected _variableOld: any;
		protected _variableNew: any;

		//============Constructor Function============//
		public GameRuleEvent(type: string, variableOld: any = null, variableNew: any = null, bubbles: boolean = false, cancelable: boolean = false): void {
			super(type, bubbles, cancelable);
		}

		//============Copy Constructor Function============//
		public override function clone(): Event {
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
		public override function toString(): string {
			return formatToString('GameRuleEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}
