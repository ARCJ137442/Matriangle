import * as exMath from "../common/exMath";
import { int, uint, uint$MAX_VALUE } from "../legacy/AS3Legacy";

// ! 有待后续更新：支持多个维度、解决「连续角度」等问题
export type intRot = uint;
export type floatRot = number; // TODO: 有待支持

//============Static Variables============//
export const NULL: intRot = uint$MAX_VALUE;

export const UP: intRot = 3;
export const DOWN: intRot = 1;
export const LEFT: intRot = 2;
export const RIGHT: intRot = 0;
export const DEFAULT: intRot = RIGHT;

//============Static Getter ANd Setter============//
export function randomRot(): intRot {
	return exMath.randInt(4);
}

//============Static Functions============//
export function isValidRot(rot: intRot): boolean {
	return rot != NULL;
}

export function toOpposite(rot: number): number {
	return (rot + 2) & 3;
}

export function toOppositeInt(rot: intRot): intRot {
	return (rot + 2) & 3;
}

export function rotate(rot: number, angle: number): number {
	// angle is Local Rot.
	return lockToStandard(rot + angle);
}

export function rotateInt(rot: intRot, angle: int): intRot {
	// angle is Local Rot.
	return lockIntToStandard(rot + angle);
}

export function randomWithout(rot: intRot): intRot {
	return lockIntToStandard(rot + 1 + exMath.randInt(3));
}

export function lockToStandard(rot: number): number {
	if (isNaN(rot) || !isFinite(rot))
		return DEFAULT;
	if (rot < 0)
		return lockToStandard(rot + 4);
	if (rot >= 4)
		return lockToStandard(rot - 4);
	return rot;
}

export function lockIntToStandard(rot: int): intRot {
	if (rot < 0)
		return lockIntToStandard(rot + 4);
	return rot & 3;
}

/**
 * The Rot from target-this
 * @param	xD	Distance X.
 * @param	yD	Distance Y.
 * @return
 */
export function fromLinearDistance(xD: int, yD: int): intRot {
	if ((xD * yD) == 0) {
		if (xD == 0) {
			if (yD < 0)
				return UP;
			else
				return DOWN;
		}
		if (yD == 0) {
			if (xD > 0)
				return RIGHT;
			else
				return LEFT;
		}
	}
	return NULL;
}

export function fromRealRot(rot: number): number {
	return lockToStandard(rot / 90);
}

export function toRealRot(rot: number): number {
	return rot * 90;
}

export function toRealIntRot(rot: int): int {
	return rot * 90;
}

/** Use for express the currentRot in the containerRot
 * 	examples:
 * 	1.a rot out a object is 45°(local:0.5),
 * 	2.the object's rot is 90°(local:1),
 * 	3.then the value in of object is 315°(local:3.5).
 */
export function globalToLocal(currentRot: number, containerRot: number): number {
	return lockToStandard(currentRot - containerRot);
}

/** Use for express the currentRot out the containerRot
 * 	examples:
 * 	1.A rot in a object is 45°(local:0.5),
 * 	2.The object's rot is 90°(local:1),
 * 	3.Then the value out of object is 135°(local:1.5).
 */
export function localToGlobal(currentRot: number, containerRot: number): number {
	return lockToStandard(containerRot + currentRot);
}

export function towardX(rot: number, radius: number = 1): number {
	if (uint(rot) == rot)
		return towardIntX(rot, radius);
	return exMath.redirectNum(radius * Math.cos(exMath.angleToArc(toRealRot(rot))), 10000);
}

export function towardY(rot: number, radius: number = 1): number {
	if (uint(rot) == rot)
		return towardIntY(rot, radius);
	return exMath.redirectNum(radius * Math.sin(exMath.angleToArc(toRealRot(rot))), 10000);
}

export function towardIntX(rot: intRot, radius: number = 1): number {
	return exMath.chi(rot + 1) * radius;
}

export function towardIntY(rot: intRot, radius: number = 1): number {
	return exMath.chi(rot) * radius;
}

export function towardXInt(rot: intRot, radius: int = 1): int {
	return exMath.chi(rot + 1) * radius;
}

export function towardYInt(rot: intRot, radius: int = 1): int {
	return exMath.chi(rot) * radius;
}
