import { exMath } from "../common";
import { int, uint, uint$MAX_VALUE } from "../legacy/AS3Legacy";

// import batr.common.*;

//============Static Variables============//
export const NULL: uint = uint$MAX_VALUE;

export const UP: uint = 3;
export const DOWN: uint = 1;
export const LEFT: uint = 2;
export const RIGHT: uint = 0;
export const DEFAULT: uint = RIGHT;

//============Static Getter ANd Setter============//
export function getRandom(): uint {
	return exMath.randInt(4);
}

//============Static Functions============//
export function isValidRot(rot: uint): boolean {
	return rot != NULL;
}

export function toOpposite(rot: number): number {
	return (rot + 2) & 3;
}

export function toOppositeInt(rot: uint): uint {
	return (rot + 2) & 3;
}

export function rotate(rot: number, angle: number): number {
	// angle is Local Rot.
	return lockToStandard(rot + angle);
}

export function rotateInt(rot: uint, angle: int): uint {
	// angle is Local Rot.
	return lockIntToStandard(rot + angle);
}

export function randomWithout(rot: uint): uint {
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

export function lockIntToStandard(rot: int): uint {
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
export function fromLinearDistance(xD: int, yD: int): uint {
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

export function towardIntX(rot: uint, radius: number = 1): number {
	return exMath.chi(rot + 1) * radius;
}

export function towardIntY(rot: uint, radius: number = 1): number {
	return exMath.chi(rot) * radius;
}

export function towardXInt(rot: uint, radius: int = 1): int {
	return exMath.chi(rot + 1) * radius;
}

export function towardYInt(rot: uint, radius: int = 1): int {
	return exMath.chi(rot) * radius;
}
