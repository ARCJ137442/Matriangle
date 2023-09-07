package batr.game.model {

	import batr.common.*;
	import batr.general.*;

	export default class GameModeType extends TypeCommon {
		//============Static Variables============//
		public static const NULL: GameModeType = null;

		public static const REGULAR: GameModeType = new GameModeType('regular');
		public static const BATTLE: GameModeType = new GameModeType('battle');
		public static const SURVIVAL: GameModeType = new GameModeType('survival');
		public static const HARD: GameModeType = new GameModeType('hard');

		public static const _ALL_TYPE: GameModeType[] = new <GameModeType>
		[
			REGULAR, BATTLE, SURVIVAL
		];

		//============Static Getter And Setter============//
		public static function get RANDOM(): GameModeType {
			return GameModeType._ALL_TYPE[exMath.random(GameModeType._ALL_TYPE.length)];
		}

		public static function get NUM_TYPES(): uint {
			return GameModeType._ALL_TYPE.length;
		}

		//============Static Functions============//
		public static function fromString(str: string): GameModeType {
			for (var type of GameModeType._ALL_TYPE) {
				if (type.name == str)
					return type;
			}
			return NULL;
		}

		public static function isIncludeIn(type: GameModeType, types: GameModeType[]): boolean {
			for (var type2 of types) {
				if (type === type2)
					return true;
			}
			return false;
		}

		//============Constructor Function============//
		public GameModeType(name: string): void {
			super(name);
		}

		//============Instance Getter And Setter============//
		public override function get label(): string {
			return 'gameMode';
		}
	}
}