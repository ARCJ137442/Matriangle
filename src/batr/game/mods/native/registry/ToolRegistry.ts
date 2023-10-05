import Tool from "../tool/Tool";
import Weapon from "../tool/Weapon";

/**
 * 原生工具（武器）注册表
 * * 其中的「TOOL_ID_」用于在「玩家使用工具」时提供「功能映射」参考
 * 
 * !【2023-09-24 21:21:24】现在这里提供的「武器」更多是一种「原型」
 */
export module NativeTools {

	// **空工具** //
	export const TOOL_ID_NULL: string = '';
	export const TOOL_NULL: Tool = new Tool(TOOL_ID_NULL, 0, 0, false);


	// 武器注册区 //

	// 子弹
	export const TOOL_ID_BULLET_BASIC: string = 'Bullet';
	export const WEAPON_BULLET_BASIC: Weapon = new Weapon(TOOL_ID_BULLET_BASIC, 0.25, 0, 5)
		.setExtraProperty(1, 1);

	export const TOOL_ID_BULLET_NUKE: string = 'Nuke';
	export const WEAPON_BULLET_NUKE: Weapon = new Weapon(TOOL_ID_BULLET_NUKE, 5, 320, 5)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 15)
		.setDroneProperty(0);

	export const TOOL_ID_BULLET_BOMBER: string = 'Sub Bomber';
	export const WEAPON_BULLET_BOMBER: Weapon = new Weapon(TOOL_ID_BULLET_BOMBER, 1, 1, 10, true)
		.setExtraProperty(2, 1)
		.setDroneProperty(0);

	export const TOOL_ID_BULLET_TRACKING: string = 'Tracking Bullet';
	export const WEAPON_BULLET_TRACKING: Weapon = new Weapon(TOOL_ID_BULLET_TRACKING, 0.25, 0.5, 5, true)
		.setExtraProperty(1, 1)
		.setDroneProperty(0);

	// 激光
	export const TOOL_ID_LASER_BASIC: string = 'Laser';
	export const WEAPON_LASER_BASIC: Weapon = new Weapon(TOOL_ID_LASER_BASIC, 3, 1, 120)
		.setExtraProperty(8, 6)
		.setDroneProperty(0.8);

	export const TOOL_ID_LASER_PULSE: string = 'Pulse Laser';
	export const WEAPON_LASER_PULSE: Weapon = new Weapon(TOOL_ID_LASER_PULSE, 0.5, 0.5, 5, true)
		.setExtraProperty(3, 3);

	export const TOOL_ID_LASER_TELEPORT: string = 'Teleport Laser';
	export const WEAPON_LASER_TELEPORT: Weapon = new Weapon(TOOL_ID_LASER_TELEPORT, 3.5, 0, 40)
		.setExtraProperty(4, 3);

	export const TOOL_ID_LASER_ABSORPTION: string = 'Absorption Laser';
	export const WEAPON_LASER_ABSORPTION: Weapon = new Weapon(TOOL_ID_LASER_ABSORPTION, 4, 0, 10)
		.setExtraProperty(4, 2);

	// 其它
	export const TOOL_ID_WAVE: string = 'Wave';
	export const WEAPON_WAVE: Weapon = new Weapon(TOOL_ID_WAVE, 0.5, 2, 20)
		.setExtraProperty(3, 3)
		.setDroneProperty(0.25); // Not Full Charge

	export const TOOL_ID_MELEE: string = 'Melee';
	export const WEAPON_MELEE: Weapon = new Weapon(TOOL_ID_MELEE, 0.25, 0, 5)
		.setExtraProperty(5, 3); // Used in BATR-alpha&beta

	export const TOOL_ID_BLOCK_THROWER: string = 'Block Thrower';
	export const WEAPON_BLOCK_THROWER: Weapon = new Weapon(TOOL_ID_BLOCK_THROWER, 0.5, 1, 200)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 10);

	export const TOOL_ID_LIGHTNING: string = 'Lightning';
	export const WEAPON_LIGHTNING: Weapon = new Weapon(TOOL_ID_LIGHTNING, 0.25, 0.5, 20, true)
		.setCanHurt(true, true, true)
		.setExtraProperty(12, 10);

	// 这些武器更像是BOSS用的 //

	export const TOOL_ID_SHOCKWAVE_ALPHA: string = 'Shockwave_alpha';
	export const WEAPON_SHOCKWAVE_ALPHA: Weapon = new Weapon(TOOL_ID_SHOCKWAVE_ALPHA, 10, 0, 100)
		.setExtraProperty(10, 2);

	export const TOOL_ID_SHOCKWAVE_BETA: string = 'Shockwave_beta';
	export const WEAPON_SHOCKWAVE_BETA: Weapon = new Weapon(TOOL_ID_SHOCKWAVE_BETA, 10, 0, 100)
		.setExtraProperty(10, 2, true);

	// 一些归类
	/** 子弹类武器 */
	export const WEAPONS_BULLET: Weapon[] = [
		WEAPON_BULLET_BASIC,
		WEAPON_BULLET_NUKE,
		WEAPON_BULLET_BOMBER,
		WEAPON_BULLET_TRACKING
	];

	/** 激光类武器 */
	export const WEAPONS_LASER: Weapon[] = [
		WEAPON_LASER_BASIC,
		WEAPON_LASER_PULSE,
		WEAPON_LASER_TELEPORT,
		WEAPON_LASER_ABSORPTION
	];

	/** 一些特殊的武器 */
	export const WEAPONS_SPECIAL: Weapon[] = [
		WEAPON_WAVE,
		WEAPON_MELEE,
		WEAPON_BLOCK_THROWER,
		WEAPON_LIGHTNING
	];

	/** 被认为是「BOSS使用」的武器 */
	export const WEAPONS_BOSS: Weapon[] = [
		WEAPON_SHOCKWAVE_ALPHA,
		WEAPON_SHOCKWAVE_BETA
	];

	/** 所有武器 */
	export const WEAPONS_ALL: Weapon[] = [
		...WEAPONS_BULLET,
		...WEAPONS_LASER,
		...WEAPONS_SPECIAL,
		...WEAPONS_BOSS
	];

	/** 所有目前可用的武器 */
	export const WEAPONS_AVAILABLE: Weapon[] = [
		WEAPON_BULLET_BASIC,
		WEAPON_BULLET_NUKE,
		WEAPON_BULLET_BOMBER,
		WEAPON_BULLET_TRACKING,
		WEAPON_LASER_BASIC,
		WEAPON_LASER_PULSE,
		WEAPON_LASER_TELEPORT,
		WEAPON_LASER_ABSORPTION,
		WEAPON_WAVE,
		WEAPON_BLOCK_THROWER,
		WEAPON_LIGHTNING,
		WEAPON_SHOCKWAVE_ALPHA,
		WEAPON_SHOCKWAVE_BETA
	];

	/** 所有工具 */
	export const TOOLS_ALL: Tool[] = [
		TOOL_NULL, // ! 包括空值
		...WEAPONS_ALL
	]

	/** 用于在游戏加载时注入「可分配工具」（原型） */
	export const TOOLS_AVAILABLE: Tool[] = [
		...WEAPONS_AVAILABLE
	]
}
