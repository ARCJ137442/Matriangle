import Tool from "../tool/Tool";
import Weapon from "../tool/Weapon";

/**
 * 原生工具（武器）注册表
 * 
 * !【2023-09-24 21:21:24】现在这里提供的「武器」更多是一种「原型」
 */
export module NativeTools {

	//================武器注册区================//
	export const WEAPON_ID_BULLET_BASIC: string = 'Bullet'
	export const WEAPON_BULLET_BASIC: Weapon = new Weapon(WEAPON_ID_BULLET_BASIC, 0.25, 5)
		.setExtraProperty(1, 1);

	export const WEAPON_ID_BULLET_NUKE: string = 'Nuke'
	export const WEAPON_BULLET_NUKE: Weapon = new Weapon(WEAPON_ID_BULLET_NUKE, 5, 320, 5)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 15)
		.setDroneProperty(0);

	export const WEAPON_ID_BULLET_BOMBER: string = 'Sub Bomber'
	export const WEAPON_BULLET_BOMBER: Weapon = new Weapon(WEAPON_ID_BULLET_BOMBER, 1, 10, 1, true)
		.setExtraProperty(2, 1)
		.setDroneProperty(0);

	export const WEAPON_ID_BULLET_TRACKING: string = 'Tracking Bullet'
	export const WEAPON_BULLET_TRACKING: Weapon = new Weapon(WEAPON_ID_BULLET_TRACKING, 0.25, 5, 0.5, true)
		.setExtraProperty(1, 1)
		.setDroneProperty(0);


	export const WEAPON_ID_LASER_BASIC: string = 'Laser'
	export const WEAPON_LASER_BASIC: Weapon = new Weapon(WEAPON_ID_LASER_BASIC, 3, 120, 1)
		.setExtraProperty(8, 6)
		.setDroneProperty(0.8);

	export const WEAPON_ID_LASER_PULSE: string = 'Pulse Laser'
	export const WEAPON_LASER_PULSE: Weapon = new Weapon(WEAPON_ID_LASER_PULSE, 0.5, 5, 0.5, true)
		.setExtraProperty(3, 3);

	export const WEAPON_ID_LASER_TELEPORT: string = 'Teleport Laser'
	export const WEAPON_LASER_TELEPORT: Weapon = new Weapon(WEAPON_ID_LASER_TELEPORT, 3.5, 40)
		.setExtraProperty(4, 3);

	export const WEAPON_ID_LASER_ABSORPTION: string = 'Absorption Laser'
	export const WEAPON_LASER_ABSORPTION: Weapon = new Weapon(WEAPON_ID_LASER_ABSORPTION, 4, 10)
		.setExtraProperty(4, 2);


	export const WEAPON_ID_WAVE: string = 'Wave'
	export const WEAPON_WAVE: Weapon = new Weapon(WEAPON_ID_WAVE, 0.5, 20, 2)
		.setExtraProperty(3, 3)
		.setDroneProperty(0.25); // Not Full Charge


	export const WEAPON_ID_MELEE: string = 'Melee'
	export const WEAPON_MELEE: Weapon = new Weapon(WEAPON_ID_MELEE, 0.25, 5)
		.setExtraProperty(5, 3); // Used in BATR-alpha&beta

	export const WEAPON_ID_BLOCK_THROWER: string = 'Block Thrower'
	export const WEAPON_BLOCK_THROWER: Weapon = new Weapon(WEAPON_ID_BLOCK_THROWER, .5, 200, 1)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 10);

	export const WEAPON_ID_LIGHTNING: string = 'Lightning'
	export const WEAPON_LIGHTNING: Weapon = new Weapon(WEAPON_ID_LIGHTNING, 0.25, 20, 0.5, true)
		.setCanHurt(true, true, true)
		.setExtraProperty(12, 10);

	// 这些武器更像是BOSS用的 //

	export const WEAPON_ID_SHOCKWAVE_ALPHA: string = 'Shockwave_alpha'
	export const WEAPON_SHOCKWAVE_ALPHA: Weapon = new Weapon(WEAPON_ID_SHOCKWAVE_ALPHA, 10, 100)
		.setExtraProperty(10, 2);

	export const WEAPON_ID_SHOCKWAVE_BETA: string = 'Shockwave_beta'
	export const WEAPON_SHOCKWAVE_BETA: Weapon = new Weapon(WEAPON_ID_SHOCKWAVE_BETA, 10, 100)
		.setExtraProperty(10, 2, true);

	// 一些归类
	export const WEAPONS_BULLET: Weapon[] = [
		WEAPON_BULLET_BASIC,
		WEAPON_BULLET_NUKE,
		WEAPON_BULLET_BOMBER,
		WEAPON_BULLET_TRACKING
	];

	export const WEAPONS_LASER: Weapon[] = [
		WEAPON_LASER_BASIC,
		WEAPON_LASER_PULSE,
		WEAPON_LASER_TELEPORT,
		WEAPON_LASER_ABSORPTION
	];

	export const WEAPONS_SPECIAL: Weapon[] = [
		WEAPON_WAVE,
		WEAPON_MELEE,
		WEAPON_BLOCK_THROWER,
		WEAPON_LIGHTNING
	];

	export const WEAPONS_BOSS: Weapon[] = [
		WEAPON_SHOCKWAVE_ALPHA,
		WEAPON_SHOCKWAVE_BETA
	];

	export const WEAPONS_ALL: Weapon[] = [
		...WEAPONS_BULLET,
		...WEAPONS_LASER,
		...WEAPONS_SPECIAL,
		...WEAPONS_BOSS
	];

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

	export const TOOLS_ALL: Tool[] = [
		...WEAPONS_ALL
	]

	export const TOOLS_AVAILABLE: Tool[] = [
		...WEAPONS_AVAILABLE
	]
}
