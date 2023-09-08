import { int, uint, int$MAX_VALUE, int$MIN_VALUE, uint$MAX_VALUE, uint$MIN_VALUE } from '../legacy/AS3Legacy'
import { DisplayObject, DisplayObjectContainer } from '../legacy/flash/display';
import { ByteArray } from '../legacy/flash/utils';
import * as exMath from './exMath';

// import flash.getTimer;
// import flash.ByteArray;
// import *;

//============Math Methods============//
export function NumberToPercent(x: number, floatCount: uint = 0): string {
	if (floatCount > 0) {
		let pow: uint = 10 ** floatCount;
		let returnNum: number = Math.floor(x * pow * 100) / pow;
		return returnNum + '%';
	}
	return Math.round(x * 100) + '%';
}

export function NTP(x: number, floatCount: uint = 0): string {
	return NumberToPercent(x, floatCount);
}

/**
 * Lock uint[0,uint$MAX_VALUE] into Number[0,1].
 * @param	value	uint.
 * @return	Number between 0~1.
 */
export function uintToPercent(value: uint): number {
	return value / uint$MAX_VALUE;
}

/**
 * The reverse  based :uintToPercent.
 * @param	value	Number 0~1.
 * @return	uint.
 */
export function percentToUint(value: number): uint {
	return uint(value * uint$MAX_VALUE);
}

//============Display Methods============//
export function removeChildIfContains(parent: DisplayObjectContainer, child: DisplayObject): void {
	if (child != null && parent.contains(child))
		parent.removeChild(child);
}

export function removeAllChildren(container: DisplayObjectContainer): void {
	while (container.numChildren > 0) {
		container.removeChildAt(0);
	}
}

//============Boolean Methods============//
export function randomBoolean(trueWeight: uint = 1, falseWeight: uint = 1): boolean {
	return exMath.randomFloat(trueWeight + falseWeight) < trueWeight;
}

export function randomBoolean2(chance: number = 0.5): boolean {
	return (Math.random() <= chance);
}

export function binaryToBooleans(bin: uint, length: uint = 0): boolean[] {
	let l: uint = Math.max(bin.toString(2).length, length);
	let v: boolean[] = new Array<boolean>(Boolean(l), true); // ???
	for (let i: uint = 0; i < l; i++) {
		v[i] = Boolean(bin >> i & 1);
	}
	return v;
}

export function booleansToBinary(...boo: boolean[]): uint {
	let args: boolean[] = new Array<boolean>;

	for (let i: uint = 0; i < boo.length; i++) {
		args[i] = boo[i];
	}
	return booleansToBinary2(args);
}

export function booleansToBinary2(boo: boolean[]): uint {
	let l: uint = boo.length;

	let uin: uint = 0;

	for (let i: int = l - 1; i >= 0; i--) {
		uin |= uint(boo[i]) << i;
	}
	return uin;
}

//============String Methods============//
export function hasSpellInString(spell: string, string: string): boolean {
	return (string.toLowerCase().indexOf(spell) >= 0);
}

export function startswith(string: string, start: string): boolean {
	return (string.indexOf(start) == 0);
}

//============Code Methods============//
export function returnRandom<T>(...Paras: Array<T>): T {
	return Paras[exMath.randomFloat(Paras.length)];
}

export function getPropertyInObjects(objects: object[], key: string): any[] {
	let ra: any[] = new Array<any>();

	for (let i: uint = 0; i < objects.length; i++) {
		if (key in objects[i]) {
			ra.push((objects[i] as any)?.[key]); // if not have value, do not return
		}
	}
	return ra;
}

export function copyObjectByBytes(object: object): object - {
	let tempObject: ByteArray = new ByteArray();

	tempObject.writeObject(object);

	tempObject.position = 0;

	return tempObject.readObject() as Object;
}

/**
 * @param arr array
 * @param input element
 * @returns whether the element is contains in array
 */
export function contains<T>(arr: T[], input: T): boolean {
	return (arr.indexOf(input) >= 0);
}

export function spliceAndReturnCount<T>(arr: T[], input: T | T[], count: uint = 0): uint {
	if (isEmptyArray(arr)) {
		return 0;
	}
	let tempCount: uint = count;

	for (let ts: uint = arr.length - 1; ts >= 0; ts--) {
		if (count == 0 || tempCount > 0) {
			if (input instanceof Array) {
				if (contains(input as T[], arr[ts])) {
					arr.splice(ts, 1);
					if (tempCount > 0)
						tempCount--;
				}
			}
			else if (arr[ts] == input) {
				arr.splice(ts, 1);
				if (tempCount > 0)
					tempCount--;
			}
		}
		else {
			break;
		}
	}
	return count - tempCount;
}

export function isEmptyArray<T>(A: Array<T> | null): boolean {
	return (A == null || A.length < 1);
}

export function isEmptyString(S: string): boolean {
	return (S == null || S.length < 1);
}

export function isEqualArray<T>(A: T[], B: T[]): boolean {
	if (A.length != B.length) {
		return false;
	}
	else {
		for (let i = 0; i < A.length; i++) {
			if (A[i] != B[i]) {
				return false;
			}
		}
		return true;
	}
}

export function isEqualObject(
	a: { [key: string]: [value: any] },
	b: { [key: string]: [value: any] },
	ignoreUnique: boolean = false,
	ignoreVariable: boolean = false,
	notDetectB: boolean = false
): boolean {
	for (let i in a) {
		let fa: any = a[i];
		if (ignoreUnique || b.hasOwnProperty(i)) {
			let fb: any = b[i];
			if (!ignoreVariable) {
				if (isPrimitiveInstance(fa) == isComplexInstance(fb)) {
					return false;
				}
				else if (isPrimitiveInstance(fa)) {
					if (fa != fb) {
						return false;
					}
				}
				else {
					if (!isEqualObject(fa, fb)) {
						return false;
					}
				}
			}
		}
		else {
			return false;
		}
	}
	if (!notDetectB) {
		if (!isEqualObject(b, a, ignoreUnique, ignoreVariable, true)) {
			return false;
		}
	}
	return true;
}

export function isPrimitiveInstance(v: any): boolean {
	return (
		v === undefined ||
		v === null ||
		typeof v === "boolean" ||
		typeof v === "number" ||
		typeof v === "bigint" ||
		typeof v === "string" ||
		typeof v === "symbol"
	)
}

export function isComplexInstance(v: any): boolean {
	return !isPrimitiveInstance(v);
}

export interface dictionaryLikeObject {
	[key: string]: any;
}

export function combineObject(from: any, to: any): any {
	for (let i in from) {
		if (from.hasOwnProperty(i)) {
			to[i] = from[i];
		}
	}
	return to;
}

/**
 * Flatten an nested object by concat the key:string with separators
 * 
 * Examples:
 *   for `obj = {"a": 1, "b": {"s":"string", "t": 1}, c: {d: null}, e:{}}`,
 *   with `separator='.'`, it will be convert to
 *   `{"a": 1, "b.s": "string", "b.t":1, "c.d":null}`
 * 
 * ! WILL REMOVE THE ENTRY OF EMPTY OBJECT VALUE
 * 
 * @param obj the dictionary-like object to flatten
 * @param separator whatever to be used as delim
 * @param prefix the prefix generally from parent object
 * @returns the new object with flatten values
 */
export function flattenObject(
	obj: dictionaryLikeObject,
	separator: string = '.',
	prefix: string = ''
): dictionaryLikeObject {
	const result: dictionaryLikeObject = {}
	for (const key in obj) {
		if (!obj.hasOwnProperty(key))
			continue;
		const value = obj[key];
		console.log(key, value)
		if (isPrimitiveInstance(value))
			result[prefix + key] = value;
		else
			combineObject(
				flattenObject(
					value,
					separator,
					prefix + key + separator
				),
				result
			)
	}
	return result;
}
let { log } = console;
log(flattenObject({
	"language_self": "English",
	"code": {
		"infinity": "Infinity",
		"true": "True",
		"false": "False",
		"yes": "yes",
		"no": "No",
		"completely_random": "C-Random",
		"uniform_random": "U-Random",
		"certainly_dead": "Certainly Dead",
		"never": "Never"
	},
	"menu": {
		"language": "Language",
		"quick_game": "Quick Game",
		"select_game": "Select Game",
		"custom_mode": "Custom Mode",
		"start": "Start",
		"advanced": "Advanced",
		"config": "Config File",
		"saves": "Saves",
		"back": "Back",
		"continue": "Continue",
		"main_menu": "Main Menu",
		"global_stat": "Global Stat",
		"score_ranking": "Score Ranking",
		"paused": "Paused",
		"restart": "Restart",
		"custom": {
			"player_count": "Player Count",
			"ai_player_count": "AI Count",
			"game_mode": "Game Mode",
			"initial_map": "Initial Map",
			"lock_teams": "Lock Teams",
			"default_weapon": "Default Weapon",
			"default_health": "Default Health",
			"default_max_health": "Default Max Health",
			"remain_lives_player": "Player Remain Lives",
			"remain_lives_ai": "AI Remain Lives",
			"max_bonus_count": "Max Bonus Count",
			"bonus_spawn_after_death": "Bonus Spawn After Death",
			"map_transform_time": "Map Transform Time",
			"weapons_no_cd": "Weapons No Cd",
			"respawn_time": "Respawn Time",
			"asphyxia_damage": "Asphyxia Damage"
		},
		"result": {
			"game_result": "Game Result",
			"nothing_win": "No player wins the game",
			"win_single_player": " wins the game",
			"win_multi_player": " wins the game",
			"win_per_player": "players win the game",
			"win_all_player": "All players win the game"
		},
		"fill_frame_off": "Fill Frame: Off",
		"fill_frame_on": "Fill Frame: On"
	},
	"game": {
		"map": {
			"random": "Random"
		},
		"mode": {
			"regular": "Regular",
			"battle": "Battle",
			"survival": "Survival",
			"hard": "Hard"
		},
		"gui": {
			"remain_transform_time": "Remaining Transform T",
			"game_duration": "Game Duration"
		},
		"stat": {
			"transform_map_count": "Map Transform Count",
			"bonus_generate_count": "Bonus Generate Count",
			"player": {
				"kill_count": "Kills",
				"death_count": "Deaths",
				"death_count_from_player": "Deaths by Player",
				"damage_cause": "Causes Damage",
				"damage_by": "Damage By",
				"pickup_bonus": "Pickup Bonus",
				"be_teleport_count": "Number of Being Teleport",
				"total_score": "Total Score"
			}
		}
	},
	"block": {
		"void": "Void",
		"wall": "Wall",
		"water": "Water",
		"glass": "Glass",
		"bedrock": "Bedrock",
		"x_trap_hurt": "X-Trap Hurt",
		"x_trap_kill": "X-Trap Kill",
		"x_trap_rotate": "X-Trap Rotate",
		"colored_block": "Colored Block",
		"color_spawner": "Color Spawner",
		"laser_trap": "Laser Trap",
		"metal": "Metal"
	},
	"entity": {
		"bullet_basic": "Bullet Basic",
		"bullet_nuke": "Bullet Nuke",
		"sub_bomber": "Sub Bomber",
		"bullet_tracking": "Bullet Tracking",
		"laser_basic": "Laser Basic",
		"laser_pulse": "Laser Pulse",
		"laser_teleport": "Laser Teleport",
		"laser_absorption": "Laser Absorption",
		"wave": "Wave",
		"thrown_block": "Thrown Block",
		"lightning": "Lightning",
		"bonus_box": "Bonus Box",
		"player": "Player",
		"ai_player": "Ai Player"
	},
	"effect": {
		"explode": "Explode",
		"spawn": "Spawn",
		"teleport": "Teleport",
		"player_death_light": "Player Death Light",
		"player_death_fadeout": "Player Death Fadeout",
		"player_levelup": "Player Levelup",
		"block_light": "Block Light"
	},
	"weapon": {
		"bullet": "Bullet",
		"nuke": "Nuke",
		"sub_bomber": "Sub Bomber",
		"bullet_tracking": "Tracking Bullet",
		"laser_basic": "Laser",
		"laser_pulse": "Pulse Laser",
		"laser_teleport": "Teleport Laser",
		"laser_absorption": "Absorption Laser",
		"wave": "Wave",
		"block_thrower": "Block Thrower",
		"melee": "Melee",
		"lightning": "Lightning",
		"shockwave_alpha": "Shockwave Alpha",
		"shockwave_beta": "Shockwave Beta"
	}
}))