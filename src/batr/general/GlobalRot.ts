import * as exMath from "../common/exMath";
import { int, uint, uint$MAX_VALUE } from "../legacy/AS3Legacy";

// ! 有待后续更新：支持多个维度、解决「连续角度」等问题
/**
 * 「π/4⇔1」机制的角度（整数值）
 */
export type intRot = uint;
export type iRot = intRot;
/**
 * 「π/4⇔1」机制的角度（浮点值）
 */
export type floatRot = number;
export type fRot = floatRot;
/**
 * 「x±→y±→z±…」机制的角度（整数值）
 */
export type multiDimRot = uint;
export type mRot = multiDimRot;

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

/**
 * 反转方向，上→下，左→右
 * @param rot 「π/4⇔1」机制的角度
 * @returns 旋转到反面的角度值
 */
export function toOpposite(rot: fRot): fRot {
	return (rot + 2) % 4;
}

/**
 * 反转方向，上→下，左→右
 * @param rot 「π/4⇔1」机制的角度
 * @returns 旋转到反面的角度值
 */
export function toOppositeInt(rot: intRot): intRot {
	return (rot + 2) & 3;
}

/**
 * （多维整数角度版本）反转方向，上→下，左→右
 * @param rot 「x±→y±→z±…」机制的角度
 * @returns 方向反转后的角度值
 */
export function toOppositeMDim(rot: intRot): intRot {
	return (rot + 2) & 3;
}

/**
 * 旋转⇒角度总和
 * @param rot 采用「角度值/弧度制」连续值的角度
 * @param angle 另一个同类角度
 * @returns 两个角度的总和
 */
export function rotate(rot: fRot, angle: fRot): fRot {
	// angle is Local Rot.
	return lockToStandard(rot + angle);
}

export function rotateInt(rot: intRot, angle: int): intRot {
	// angle is Local Rot.
	return lockIntToStandard(rot + angle);
}

// ! 弃用：现在依赖于地图设置
// export function randomWithout(rot: intRot): intRot {
// 	return lockIntToStandard(rot + 1 + exMath.randInt(3));
// }

export function lockToStandard(rot: fRot): fRot {
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

export function fromRealRot(rot: fRot): fRot {
	return lockToStandard(rot / 90);
}

export function toRealRot(rot: fRot): fRot {
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
export function globalToLocal(currentRot: fRot, containerRot: fRot): fRot {
	return lockToStandard(currentRot - containerRot);
}

/** Use for express the currentRot out the containerRot
 * 	examples:
 * 	1.A rot in a object is 45°(local:0.5),
 * 	2.The object's rot is 90°(local:1),
 * 	3.Then the value out of object is 135°(local:1.5).
 */
export function localToGlobal(currentRot: fRot, containerRot: fRot): fRot {
	return lockToStandard(containerRot + currentRot);
}

/**
 * ! 下面这些函数应该只在「地图存储结构」中使用，游戏主体不应直接调用
 * * 根据参数类型的不同，分别使用不同的方法
 *   * I 整数 int
 *   * F 浮点 number
 *   * M 多维度 mRot(仅适用于方向)
 * TODO: 重新整理并实现
 */

/**
 * 获得「前进的x增量」
 * @param rot 角度
 * @param radius 半径
 * @returns 前进的增量x
 */
export function towardX_II(rot: iRot, radius: int): int {
	return exMath.chi(rot) * radius
}

export function towardX(rot: fRot, radius: number = 1): number {
	if (uint(rot) == rot)
		return towardIntX(rot, radius);
	return exMath.redirectNum(radius * Math.cos(exMath.angleToArc(toRealRot(rot))), 10000);
}

export function towardY(rot: fRot, radius: number = 1): number {
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
