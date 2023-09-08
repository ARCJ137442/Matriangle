package batr.game.entity.ai {

	import batr.common.*;
	import batr.general.*;

	public final class AIPlayerAction {
		//============Static Variables============//
		public static readonly NULL: AIPlayerAction = null;

		public static readonly MOVE_UP: AIPlayerAction = new AIPlayerAction('moveUp');
		public static readonly MOVE_DOWN: AIPlayerAction = new AIPlayerAction('moveDown');
		public static readonly MOVE_LEFT_ABS: AIPlayerAction = new AIPlayerAction('moveLeftAbs');
		public static readonly MOVE_RIGHT_ABS: AIPlayerAction = new AIPlayerAction('moveRightAbs');
		public static readonly MOVE_FORWARD: AIPlayerAction = new AIPlayerAction('moveForward');
		public static readonly MOVE_BACK: AIPlayerAction = new AIPlayerAction('moveBack');
		public static readonly MOVE_LEFT_REL: AIPlayerAction = new AIPlayerAction('moveLeftRel');
		public static readonly MOVE_RIGHT_REL: AIPlayerAction = new AIPlayerAction('moveRightRel');
		public static readonly TRUN_UP: AIPlayerAction = new AIPlayerAction('turnUp');
		public static readonly TRUN_DOWN: AIPlayerAction = new AIPlayerAction('turnDown');
		public static readonly TRUN_LEFT_ABS: AIPlayerAction = new AIPlayerAction('turnLeftAbs');
		public static readonly TRUN_RIGHT_ABS: AIPlayerAction = new AIPlayerAction('turnRightAbs');
		public static readonly TRUN_BACK: AIPlayerAction = new AIPlayerAction('turnBack');
		public static readonly TRUN_LEFT_REL: AIPlayerAction = new AIPlayerAction('turnLeftRel');
		public static readonly TRUN_RIGHT_REL: AIPlayerAction = new AIPlayerAction('turnRightRel');
		public static readonly USE_TOOL: AIPlayerAction = new AIPlayerAction('useTool');
		public static readonly PRESS_KEY_UP: AIPlayerAction = new AIPlayerAction('pressKeyUp');
		public static readonly PRESS_KEY_DOWN: AIPlayerAction = new AIPlayerAction('pressKeyDown');
		public static readonly PRESS_KEY_LEFT: AIPlayerAction = new AIPlayerAction('pressKeyLeft');
		public static readonly PRESS_KEY_RIGHT: AIPlayerAction = new AIPlayerAction('pressKeyRight');
		public static readonly PRESS_KEY_USE: AIPlayerAction = new AIPlayerAction('pressKeyUse');
		public static readonly RELEASE_KEY_UP: AIPlayerAction = new AIPlayerAction('releaseKeyUp');
		public static readonly RELEASE_KEY_DOWN: AIPlayerAction = new AIPlayerAction('releaseKeyDown');
		public static readonly RELEASE_KEY_LEFT: AIPlayerAction = new AIPlayerAction('releaseKeyLeft');
		public static readonly RELEASE_KEY_RIGHT: AIPlayerAction = new AIPlayerAction('releaseKeyRight');
		public static readonly RELEASE_KEY_USE: AIPlayerAction = new AIPlayerAction('releaseKeyUse');
		public static readonly DISABLE_CHARGE: AIPlayerAction = new AIPlayerAction('disableCharge');

		public static readonly _ALL_ACTIONS: AIPlayerAction[] = [
			AIPlayerAction.MOVE_UP,
			AIPlayerAction.MOVE_DOWN,
			AIPlayerAction.MOVE_LEFT_ABS,
			AIPlayerAction.MOVE_RIGHT_ABS,
			AIPlayerAction.MOVE_FORWARD,
			AIPlayerAction.MOVE_BACK,
			AIPlayerAction.MOVE_LEFT_REL,
			AIPlayerAction.MOVE_RIGHT_REL,
			AIPlayerAction.TRUN_UP,
			AIPlayerAction.TRUN_DOWN,
			AIPlayerAction.TRUN_LEFT_ABS,
			AIPlayerAction.TRUN_RIGHT_ABS,
			AIPlayerAction.TRUN_BACK,
			AIPlayerAction.TRUN_LEFT_REL,
			AIPlayerAction.TRUN_RIGHT_REL,
			AIPlayerAction.USE_TOOL,
			AIPlayerAction.PRESS_KEY_UP,
			AIPlayerAction.PRESS_KEY_DOWN,
			AIPlayerAction.PRESS_KEY_LEFT,
			AIPlayerAction.PRESS_KEY_RIGHT,
			AIPlayerAction.PRESS_KEY_USE,
			AIPlayerAction.RELEASE_KEY_UP,
			AIPlayerAction.RELEASE_KEY_DOWN,
			AIPlayerAction.RELEASE_KEY_LEFT,
			AIPlayerAction.RELEASE_KEY_RIGHT,
			AIPlayerAction.RELEASE_KEY_USE,
			AIPlayerAction.DISABLE_CHARGE
		];
		//============Static Functions============//
		public static fromString(str: string): AIPlayerAction {
			for (var action of AIPlayerAction._ALL_ACTIONS) {
				if (action.name == str)
					return action;
			}
			return AIPlayerAction.NULL;
		}

		public static getMoveActionFromEntityRot(rot: uint): AIPlayerAction {
			switch (rot) {
				case GlobalRot.UP:
					return AIPlayerAction.MOVE_UP;
				case GlobalRot.DOWN:
					return AIPlayerAction.MOVE_DOWN;
				case GlobalRot.LEFT:
					return AIPlayerAction.MOVE_LEFT_ABS;
				case GlobalRot.RIGHT:
					return AIPlayerAction.MOVE_RIGHT_ABS;
				default:
					return AIPlayerAction.NULL;
			}
		}

		public static getTrunActionFromEntityRot(rot: uint): AIPlayerAction {
			switch (rot) {
				case GlobalRot.UP:
					return AIPlayerAction.TRUN_UP;
				case GlobalRot.DOWN:
					return AIPlayerAction.TRUN_DOWN;
				case GlobalRot.LEFT:
					return AIPlayerAction.TRUN_LEFT_ABS;
				case GlobalRot.RIGHT:
					return AIPlayerAction.TRUN_RIGHT_ABS;
				default:
					return AIPlayerAction.NULL;
			}
		}

		public static get RANDOM(): AIPlayerAction {
			return _ALL_ACTIONS[exMath.random(_ALL_ACTIONS.length)];
		}

		//============Instance Variables============//
		protected _name: string;

		//============Constructor & Destructor============//
		public constructor(name: string) {
			this._name = name;
		}

		//============Instance Getter And Setter============//
		public get name(): string {
			return this._name;
		}

		//============Instance Functions============//
		public toString(): string {
			return 'AIPlayerAction/' + this.name;
		}
	}
}