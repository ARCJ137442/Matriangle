import Tool from "../tool/Tool";
import Weapon from "../tool/Weapon";

/**
 * 原生工具（武器）注册表
 */
export module NativeTools {
	export const WEAPON_ABSTRACT: Tool = new Weapon('Abstract', 0, 0);

	export const WEAPON_BULLET: Tool = new Weapon('Bullet', 0.25, 5).setExtraProperty(1, 1);
	export const WEAPON_NUKE: Tool = new Weapon('Nuke', 5, 320, 5).setCanHurt(true, true, true).setExtraProperty(10, 15).setDroneProperty(0);
	export const WEAPON_SUB_BOMBER: Tool = new Weapon('Sub Bomber', 1, 10, 1, true).setExtraProperty(2, 1).setDroneProperty(0);
	export const WEAPON_TRACKING_BULLET: Tool = new Weapon('Tracking Bullet', 0.25, 5, 0.5, true).setExtraProperty(1, 1).setDroneProperty(0);

	export const WEAPON_LASER: Tool = new Weapon('Laser', 3, 120, 1).setExtraProperty(8, 6).setDroneProperty(0.8);
	export const WEAPON_PULSE_LASER: Tool = new Weapon('Pulse Laser', 0.5, 5, 0.5, true).setExtraProperty(3, 3);
	export const WEAPON_TELEPORT_LASER: Tool = new Weapon('Teleport Laser', 3.5, 40).setExtraProperty(4, 3);
	export const WEAPON_ABSORPTION_LASER: Tool = new Weapon('Absorption Laser', 4, 10).setExtraProperty(4, 2);

	export const WEAPON_WAVE: Tool = new Weapon('Wave', 0.5, 20, 2).setExtraProperty(3, 3).setDroneProperty(0.25); // Not Full Charge

	export const WEAPON_MELEE: Tool = new Weapon('Melee', 0.25, 5).setExtraProperty(5, 3); // Used in BATR-alpha&beta
	export const WEAPON_BLOCK_THROWER: Tool = new Weapon('Block Thrower', .5, 200, 1).setCanHurt(true, true, true).setExtraProperty(10, 10);
	export const WEAPON_LIGHTNING: Tool = new Weapon('Lightning', 0.25, 20, 0.5, true).setCanHurt(true, true, true).setExtraProperty(12, 10);

	// BOSS TOOL
	export const WEAPON_SHOCKWAVE_ALPHA: Tool = new Weapon('Shockwave-α', 10, 100).setExtraProperty(10, 2);
	export const WEAPON_SHOCKWAVE_BETA: Tool = new Weapon('Shockwave-β', 10, 100).setExtraProperty(10, 2, true);

	// TOOL SET
	export const WEAPON_BULLETS: Tool[] = new Array<Tool>(WEAPON_BULLET, WEAPON_NUKE, WEAPON_SUB_BOMBER, WEAPON_TRACKING_BULLET);
	export const WEAPON_LASERS: Tool[] = new Array<Tool>(WEAPON_LASER, WEAPON_PULSE_LASER, WEAPON_TELEPORT_LASER, WEAPON_ABSORPTION_LASER);
	export const WEAPON_SPECIAL: Tool[] = new Array<Tool>(WEAPON_WAVE, WEAPON_MELEE, WEAPON_BLOCK_THROWER, WEAPON_LIGHTNING);
	export const WEAPON_BOSS_TOOL: Tool[] = new Array<Tool>(WEAPON_SHOCKWAVE_ALPHA, WEAPON_SHOCKWAVE_BETA);
	export const WEAPON_ALL_TOOL: Tool[] = WEAPON_BULLETS.concat(WEAPON_LASERS).concat(WEAPON_SPECIAL).concat(WEAPON_BOSS_TOOL);

	export const ALL_AVAILABLE_WEAPONS: Tool[] = [
		WEAPON_BULLET,
		WEAPON_NUKE,
		WEAPON_SUB_BOMBER,
		WEAPON_TRACKING_BULLET,
		WEAPON_LASER,
		WEAPON_PULSE_LASER,
		WEAPON_TELEPORT_LASER,
		WEAPON_ABSORPTION_LASER,
		WEAPON_WAVE,
		WEAPON_BLOCK_THROWER,
		WEAPON_LIGHTNING,
		WEAPON_SHOCKWAVE_ALPHA,
		WEAPON_SHOCKWAVE_BETA
	];

}
