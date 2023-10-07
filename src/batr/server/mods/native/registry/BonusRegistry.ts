export type BonusType = string;

/**
 * 登记所有的「奖励类型」
 */
export module NativeBonusTypes {
	//============Static Variables============//
	// HP,Life
	export const ADD_HP: BonusType = 'addHP';
	export const ADD_HEAL: BonusType = 'addHeal';
	export const ADD_LIFE: BonusType = 'addLife';

	// Tool
	export const RANDOM_TOOL: BonusType = 'randomTool';

	// Attributes&Experience
	export const BUFF_DAMAGE: BonusType = 'buffDamage';
	export const BUFF_CD: BonusType = 'buffCD';
	export const BUFF_RESISTANCE: BonusType = 'buffResistance';
	export const BUFF_RADIUS: BonusType = 'buffRadius';
	export const BUFF_RANDOM: BonusType = 'buffRandom';

	export const ADD_EXPERIENCE: BonusType = 'addExperience';

	// Teleport
	export const RANDOM_TELEPORT: BonusType = 'randomTeleport';

	// Team
	export const RANDOM_CHANGE_TEAM: BonusType = 'randomChangeTeam';

	// export const UNITE_PLAYER: BonusType = 'unitePlayer'; // !【2023-10-04 21:54:12】因「AI plays matter」，废除这个「人机分异」的奖励类型

	// export const UNITE_AI: BonusType = 'uniteAI'; // !【2023-10-04 21:54:12】因「AI plays matter」，废除这个「人机分异」的奖励类型

	// General
	export const _ABOUT_HP: BonusType[] = [
		NativeBonusTypes.ADD_HP,
		NativeBonusTypes.ADD_HEAL,
		NativeBonusTypes.ADD_LIFE
	];

	export const _ABOUT_TOOL: BonusType[] = [
		NativeBonusTypes.RANDOM_TOOL
	];
	export const _ABOUT_BUFF: BonusType[] = [
		NativeBonusTypes.BUFF_CD,
		NativeBonusTypes.BUFF_DAMAGE,
		NativeBonusTypes.BUFF_RADIUS,
		NativeBonusTypes.BUFF_RESISTANCE
	];
	export const _ABOUT_ATTRIBUTES: BonusType[] = [
		NativeBonusTypes.ADD_EXPERIENCE,
		NativeBonusTypes.BUFF_RANDOM,
		// *【2023-10-07 14:16:31】现在不用考虑「具体加成」的显示了
		..._ABOUT_BUFF,
	];
	export const _ABOUT_TEAM: BonusType[] = [
		NativeBonusTypes.RANDOM_CHANGE_TEAM
	];

	export const _OTHER: BonusType[] = [
		NativeBonusTypes.RANDOM_TELEPORT
	];

	// Unused:Union
	export const _UNUSED: BonusType[] = [
		// NativeBonusTypes.UNITE_PLAYER,
		// NativeBonusTypes.UNITE_AI,
		...NativeBonusTypes._ABOUT_BUFF
	];

	export const _ALL_AVAILABLE_TYPE: BonusType[] = [
		...NativeBonusTypes._OTHER,
		...NativeBonusTypes._ABOUT_HP,
		...NativeBonusTypes._ABOUT_TOOL,
		...NativeBonusTypes._ABOUT_ATTRIBUTES,
		...NativeBonusTypes._ABOUT_TEAM
	];
	export const _ALL_TYPE: BonusType[] = [
		...NativeBonusTypes._ALL_AVAILABLE_TYPE,
		...NativeBonusTypes._UNUSED
	];

}
