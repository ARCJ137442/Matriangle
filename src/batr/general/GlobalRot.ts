import * as exMath from "../common/exMath";
import { iPoint } from "../common/geometricTools";
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
 * ! 下面这些函数应该只在「地图逻辑结构」中使用，游戏主体不应直接调用
 * * 根据参数类型的不同，分别使用不同的方法
 *   * I 整数 int
 *   * F 浮点 number
 *   * M 多维度 mRot(仅适用于方向)
 * TODO: 重新整理并实现
 */

/**
 * 获得「前进的x增量」：整数角度、整数半径
 * * `chi`相当于cos
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度
 * @param radius 整数半径
 * @returns 前进的增量x
 */
export function towardX_II(rot: iRot, radius: int): int {
	return exMath.chi(rot) * radius //
}

/**
 * 获得「前进的y增量」：整数角度、整数半径
 * * `chi(x+1)`相当于sin(x)
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度
 * @param radius 整数半径
 * @returns 前进的增量y
 */
export function towardY_II(rot: iRot, radius: int): int {
	return exMath.chi(rot + 1) * radius //
}

/**
 * 获得「前进的x增量」：整数角度、浮点半径
 * * `chi`相当于cos
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度（浮点）
 * @param radius 整数半径
 * @returns 前进的增量x
 */
export function towardX_IF(rot: iRot, radius: number): number {
	return exMath.chi(rot) * radius
}

/**
 * 获得「前进的y增量」：整数角度、浮点半径
 * * `chi(x+1)`相当于sin(x)
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度（浮点）
 * @param radius 整数半径
 * @returns 前进的增量y
 */
export function towardY_IF(rot: iRot, radius: number): number {
	return exMath.chi(rot + 1) * radius
}

/**
 * 获得「前进的x增量」：浮点角度、浮点半径
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度（浮点）
 * @param radius 浮点半径
 * @returns 前进的增量x
 */
export function towardX_FF(rot: fRot, radius: number): number {
	return Math.cos(Math.PI / 2 * rot) * radius
}

/**
 * 获得「前进的x增量」：浮点角度、浮点半径
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * @param rot 以「π/2=1」规格表示的角度（浮点）
 * @param radius 浮点半径
 * @returns 前进的增量x
 */
export function towardY_FF(rot: fRot, radius: number): number {
	return Math.cos(Math.PI / 2 * rot) * radius
	// return exMath.redirectNum(radius * Math.cos(exMath.angleToArc(toRealRot(rot))), 10000); // ! 原先的逻辑是保留四位小数
}

// ! 不提供FI版本，并入FF版本，因为代码逻辑是一样的

/**
 * 获得「前进的x增量」：多维度角度、整数半径
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * 
 * ! 因兼容N维，没有周期性
 * @param rot 使用「x±→y±→z±…」机制的角度，即「右左下上」顺序
 * @param radius 整数半径
 */
export function towardX_MI(rot: mRot, radius: int = 1): int {
	return exMath.psi(rot) * radius
}

/**
 * 获得「前进的x增量」：多维度角度、整数半径
 * 
 * ! 只提供「相对坐标」而非「绝对坐标」（后者在「地图逻辑结构」中实现）
 * 
 * ! 因兼容N维，没有周期性
 * @param rot 使用「x±→y±→z±…」机制的角度，即「右左下上」顺序
 * @param radius 整数半径
 */
export function towardY_MI(rot: mRot, radius: int = 1): int {
	return exMath.psi(rot - 2) * radius
}

/**
 * 集成上述所有点的整数取向
 * 
 * ! 【20230911 20:56:04】现在是集成了两种朝向表示系统，
 * * 一种是用「顺时针旋转90°」表示的「二维整数朝向」
 * * 一种是用「x±、y±」表示的「任意维整数朝向」
 * * 两种朝向体系目前还是较难兼容
 * @param rot 使用「x±→y±→z±…」机制的朝向，即「右左下上」顺序
 * @param radius 整数半径
 * @param nDims 点的维数
 * @returns 包括所有维度返回值的点
 */
export function toward_MI(rot: mRot, dim: uint, radius: int = 1): iPoint {
	let p: iPoint = new iPoint();
	for (let i = 0; i < dim; i++) {
		p.push(
			exMath.psi(rot - (i << 1)) *
			radius
		)
	}
	return p;
}

export function towardX_MF(rot: mRot, radius: number = 1): number {
	return exMath.psi(rot) * radius
}

export function towardY_MF(rot: mRot, radius: number = 1): number {
	return exMath.psi(rot - 2) * radius
}
