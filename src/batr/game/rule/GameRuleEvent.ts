package batr.game.events {

	import flash.events.Event;

	export default class GameRuleEvent extends Event {
		//============Static Variables============//
		public static const VARIABLE_UPDATE: String = 'variableUpdate';
		public static const TEAMS_CHANGE: String = 'teamsChange';

		//============Instance Variables============//
		protected _variableOld: any;
		protected _variableNew: any;

		//============Constructor Function============//
		public function GameRuleEvent(type: String, variableOld: any = null, variableNew: any = null, bubbles: Boolean = false, cancelable: Boolean = false): void {
			super(type, bubbles, cancelable);
		}

		//============Copy Constructor Function============//
		public override function clone(): Event {
			return new GameRuleEvent(type, bubbles, cancelable);
		}

		//============Instance Getter And Setter============//
		public function get variableOld(): any {
			return this._variableOld;
		}

		public function get variableNew(): any {
			return this._variableNew;
		}

		//============Instance Functions============//
		public override function toString(): String {
			return formatToString('GameRuleEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}
