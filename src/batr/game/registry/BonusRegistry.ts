
// import batr.common.*;
// import batr.general.*;

export default class BonusType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: BonusType = null;

	// Health,Life
	public static readonly ADD_HEALTH: BonusType = new BonusType('addHealth');
	public static readonly ADD_HEAL: BonusType = new BonusType('addHeal');
	public static readonly ADD_LIFE: BonusType = new BonusType('addLife');

	// Tool
	public static readonly RANDOM_TOOL: BonusType = new BonusType('randomTool');

	// Attributes&Experience
	public static readonly BUFF_DAMAGE: BonusType = new BonusType('buffDamage');
	public static readonly BUFF_CD: BonusType = new BonusType('buffCD');
	public static readonly BUFF_RESISTANCE: BonusType = new BonusType('buffResistance');
	public static readonly BUFF_RADIUS: BonusType = new BonusType('buffRadius');
	public static readonly BUFF_RANDOM: BonusType = new BonusType('buffRandom');

	public static readonly ADD_EXPERIENCE: BonusType = new BonusType('addExperience');

	// Teleport
	public static readonly RANDOM_TELEPORT: BonusType = new BonusType('randomTeleport');

	// Team
	public static readonly RANDOM_CHANGE_TEAM: BonusType = new BonusType('randomChangeTeam');

	public static readonly UNITE_PLAYER: BonusType = new BonusType('unitePlayer');

	public static readonly UNITE_AI: BonusType = new BonusType('uniteAI');

	// General
	public static readonly _ABOUT_HEALTH: BonusType[] = new Array<BonusType>(BonusType.ADD_HEALTH, BonusType.ADD_HEAL, BonusType.ADD_LIFE);
	public static readonly _ABOUT_TOOL: BonusType[] = new Array<BonusType>(BonusType.RANDOM_TOOL);
	public static readonly _ABOUT_ATTRIBUTES: BonusType[] = new Array<BonusType>(BonusType.ADD_EXPERIENCE, BonusType.BUFF_RANDOM);
	public static readonly _ABOUT_BUFF: BonusType[] = new Array<BonusType>(BonusType.BUFF_CD, BonusType.BUFF_DAMAGE, BonusType.BUFF_RADIUS, BonusType.BUFF_RESISTANCE);
	public static readonly _ABOUT_TEAM: BonusType[] = new Array<BonusType>(BonusType.RANDOM_CHANGE_TEAM);

	public static readonly _OTHER: BonusType[] = new Array<BonusType>(BonusType.RANDOM_TELEPORT);

	// Unused:Union
	public static readonly _UNUSED: BonusType[] = new Array<BonusType>(BonusType.UNITE_PLAYER, BonusType.UNITE_AI).concat(_ABOUT_BUFF);
	public static readonly _ALL_AVAILABLE_TYPE: BonusType[] = BonusType._OTHER.concat(BonusType._ABOUT_HEALTH, BonusType._ABOUT_TOOL, BonusType._ABOUT_ATTRIBUTES, BonusType._ABOUT_TEAM);
	public static readonly _ALL_TYPE: BonusType[] = BonusType._ALL_AVAILABLE_TYPE.concat(BonusType._UNUSED);

	//============Static Getter And Setter============//
	public static get RANDOM(): BonusType {
		return _ALL_TYPE[exMath.random(_ALL_TYPE.length)];
	}

	public static get RANDOM_AVAILABLE(): BonusType {
		return _ALL_AVAILABLE_TYPE[exMath.random(_ALL_AVAILABLE_TYPE.length)];
	}

	public static get RANDOM_BUFF(): BonusType {
		return _ABOUT_BUFF[exMath.random(_ABOUT_BUFF.length)];
	}

	public static get AVAILABLE_SPAWN_POTENTIALS(): object[] {
		var result: object[] = new Object[]();
		for (var bType of _ALL_AVAILABLE_TYPE) {
			result.push({
				type: bType,
				weight: 1.0
			}
			);
		}
		return result;
	}

	//============Static Functions============//
	public static fromString(str: string): BonusType {
		for (var type of BonusType._ALL_TYPE) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	public static isIncludeIn(type: BonusType, types: BonusType[]): boolean {
		for (var type2 of types) {
			if (type == type2)
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
		return 'bonus';
	}
}
