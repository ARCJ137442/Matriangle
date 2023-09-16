import Tool from "../tool/Tool";
import Weapon from "../tool/Weapon";

/**
 * 原生工具（武器）注册表
 */
export module NativeTools {

	//================武器注册区(旧BaTr)================//
	export const WEAPON_ABSTRACT: Weapon = new Weapon('Abstract', 0, 0);

	export const WEAPON_BULLET_BASIC: Weapon = new Weapon('Bullet', 0.25, 5)
		.setExtraProperty(1, 1);

	export const WEAPON_BULLET_NUKE: Weapon = new Weapon('Nuke', 5, 320, 5)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 15)
		.setDroneProperty(0);

	export const WEAPON_BULLET_BOMBER: Weapon = new Weapon('Sub Bomber', 1, 10, 1, true)
		.setExtraProperty(2, 1)
		.setDroneProperty(0);

	export const WEAPON_BULLET_TRACKING: Weapon = new Weapon('Tracking Bullet', 0.25, 5, 0.5, true)
		.setExtraProperty(1, 1)
		.setDroneProperty(0);


	export const WEAPON_LASER_BASIC: Weapon = new Weapon('Laser', 3, 120, 1)
		.setExtraProperty(8, 6)
		.setDroneProperty(0.8);

	export const WEAPON_LASER_PULSE: Weapon = new Weapon('Pulse Laser', 0.5, 5, 0.5, true)
		.setExtraProperty(3, 3);

	export const WEAPON_LASER_TELEPORT: Weapon = new Weapon('Teleport Laser', 3.5, 40)
		.setExtraProperty(4, 3);

	export const WEAPON_LASER_ABSORPTION: Weapon = new Weapon('Absorption Laser', 4, 10)
		.setExtraProperty(4, 2);


	export const WEAPON_WAVE: Weapon = new Weapon('Wave', 0.5, 20, 2)
		.setExtraProperty(3, 3)
		.setDroneProperty(0.25); // Not Full Charge


	export const WEAPON_MELEE: Weapon = new Weapon('Melee', 0.25, 5)
		.setExtraProperty(5, 3); // Used in BATR-alpha&beta

	export const WEAPON_BLOCK_THROWER: Weapon = new Weapon('Block Thrower', .5, 200, 1)
		.setCanHurt(true, true, true)
		.setExtraProperty(10, 10);

	export const WEAPON_LIGHTNING: Weapon = new Weapon('Lightning', 0.25, 20, 0.5, true)
		.setCanHurt(true, true, true)
		.setExtraProperty(12, 10);

	// 这些武器更像是BOSS用的 //

	export const WEAPON_SHOCKWAVE_ALPHA: Weapon = new Weapon('Shockwave-α', 10, 100)
		.setExtraProperty(10, 2);

	export const WEAPON_SHOCKWAVE_BETA: Weapon = new Weapon('Shockwave-β', 10, 100)
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
