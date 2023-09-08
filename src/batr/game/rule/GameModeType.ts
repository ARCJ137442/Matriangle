
// import batr.common.*;
// import batr.general.*;

export default class GameModeType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: GameModeType = null;

	public static readonly REGULAR: GameModeType = new GameModeType('regular');
	public static readonly BATTLE: GameModeType = new GameModeType('battle');
	public static readonly SURVIVAL: GameModeType = new GameModeType('survival');
	public static readonly HARD: GameModeType = new GameModeType('hard');

	public static readonly _ALL_TYPE: GameModeType[] = new <GameModeType>
	[
		REGULAR, BATTLE, SURVIVAL
	];

	//============Static Getter And Setter============//
	public static get RANDOM(): GameModeType {
		return GameModeType._ALL_TYPE[exMath.random(GameModeType._ALL_TYPE.length)];
	}

	public static get NUM_TYPES(): uint {
		return GameModeType._ALL_TYPE.length;
	}

	//============Static Functions============//
	public static fromString(str: string): GameModeType {
		for (var type of GameModeType._ALL_TYPE) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	public static isIncludeIn(type: GameModeType, types: GameModeType[]): boolean {
		for (var type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Constructor & Destructor============//
	public constructor(name: string) {
		super(name);
	}

	//============Instance Getter And Setter============//
	override get label(): string {
		return 'gameMode';
	}
}