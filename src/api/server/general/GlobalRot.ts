import * as exMath from 'matriangle-common/exMath'
import { iPoint } from 'matriangle-common/geometricTools'
import { int, uint, uint$MAX_VALUE } from 'matriangle-legacy/AS3Legacy'

/**
 * 「π/4⇔1」机制的角度（整数值）
 */
export type intRot = uint
export type iRot = intRot
/**
 * 「π/4⇔1」机制的角度（浮点值）
 */
export type floatRot = number
export type fRot = floatRot
/**
 * 「x±→y±→z±…」机制的角度（整数值）
 */
export type multiDimRot = uint
export type mRot = multiDimRot

export const NULL: intRot = uint$MAX_VALUE

// ↓ 二维特色，不再使用
// export const UP: intRot = 3;
// export const DOWN: intRot = 1;
// export const LEFT: intRot = 2;
// export const RIGHT: intRot = 0;
// export const DEFAULT: intRot = RIGHT;

/**
 * 反转方向，上→下，左→右
 * @param rot 「π/4⇔1」机制的角度
 * @returns 旋转到反面的角度值
 */
export function toOpposite_F(rot: fRot): fRot {
	return (rot + 2) % 4
}

/**
 * 反转方向，上→下，左→右
 * @param rot 「π/4⇔1」机制的角度
 * @returns 旋转到反面的角度值
 */
export function toOpposite_I(rot: intRot): intRot {
	return (rot + 2) & 3
}

/**
 * （多维整数角度版本）反转方向，上→下，左→右
 * * 原理：直接使用按位异或`1`
 * @param rot 「x±→y±→z±…」机制的角度
 * @returns 方向反转后的角度值
 */
export function toOpposite_M(rot: intRot): intRot {
	return rot ^ 1
}

/**
 * 旋转⇒角度总和
 * @param rot 采用「角度值/弧度制」连续值的角度
 * @param angle 另一个同类角度
 * @returns 两个角度的总和
 */
export function rotate_F(rot: fRot, angle: fRot): fRot {
	// angle instanceof Local Rot.
	return lockRot_F(rot + angle)
}

/**
 * 旋转⇒角度综合
 * @param rot 离散整数角
 * @param angle 附加的整数角（可正可负）
 * @returns 旋转后的整数角
 */
export function rotate_I(rot: iRot, angle: int): iRot {
	return lockRot_I(rot + angle)
}

/**
 * 从「任意维整数角」到「整数角所在轴向」
 *
 * ! 处于性能考量，不强制要求本文件内使用，但建议在其它地方统一使用以便日后统一修改
 *
 * @param rot 任意维整数角
 * @returns 这个「任意维整数角」对应的轴向（01→x@0, 12→y@1, ...）
 */
export function mRot2axis(rot: mRot): uint {
	return rot >> 1
}

/**
 * 从「整数角所在轴向」到「任意维整数角」（正方向）
 *
 * ! 处于性能考量，不强制要求本文件内使用，但建议在其它地方统一使用以便日后统一修改
 *
 * @param axis 「任意维整数角」对应的轴向（01→x@0, 12→y@1, ...）
 * @returns 这个轴向上的「任意维整数角」（正方向）
 */
export function axis2mRot_p(axis: uint): mRot {
	return axis << 1
}

/**
 * 从「整数角所在轴向」到「任意维整数角」（负方向）
 *
 * ! 处于性能考量，不强制要求本文件内使用，但建议在其它地方统一使用以便日后统一修改
 *
 * @param axis 「任意维整数角」对应的轴向（01→x@0, 12→y@1, ...）
 * @returns 这个轴向上的「任意维整数角」（负方向）
 */
export function axis2mRot_n(axis: uint): mRot {
	return (axis << 1) + 1
}

/**
 * 从「任意维整数角」直接获取「方向增量」
 * @param rot 「任意维整数角」
 * @returns 正方向⇒+1，负方向⇒-1
 */
export function mRot2increment(rot: mRot): 1 | -1 {
	return (rot & 1) === 0 ? 1 : -1
}

/**
 * 返回一个「任意维整数角」是否在正方向
 */
export function isAxisPositive_M(rot: mRot): boolean {
	return (rot & 1) === 0
}

/**
 * 返回一个「任意维整数角」是否在负方向
 */
export function isAxisNegative_M(rot: mRot): boolean {
	return (rot & 1) === 1
}

/**
 * 任意维整数角的「旋转」
 * * 通用于N维空间
 * * 举例：x+朝向在xOy平面的旋转，只需要调用「y+|y-」即可。其中：
 *   * 「y」用`coAxis = 1`表示
 *   * 「+|-」用`step`的正负号表示
 *
 * 关于「旋转角数」的规律：
 * * `&3=0`是「原朝向」
 * * `&3=1`是「协面轴+」
 * * `&3=2`是「反方向」
 * * `&3=3`是「协面轴-」
 *
 * ! 若「待算轴」与「协面轴」相同，则「正负方向」会以4为周期重复
 * * 例如：xOx+ -> x+, x+, x-, x-, ...
 *
 * @param rot 待计算的朝向⇒「待算轴」
 * @param coAxis 与「待算轴」构成「旋转平面」的「协面轴」
 * @param step 旋转角数
 */
export function rotate_M(rot: mRot, coAxis: uint, step: int): mRot {
	// if (coAxis === rotAxis) return rot; // ! 待算轴与目标轴本不应该相同（需要构成旋转平面），但需要能用
	switch (
		step & 3 // 取模，使之可适用于任意整数旋转步数
	) {
		default:
			return rot // 原朝向
		case 1:
			return coAxis << 1 // 协面轴+
		case 2:
			return toOpposite_M(rot) // 反方向
		case 3:
			return (coAxis << 1) + 1 //协面轴-
	}
}

/**
 * 任意维整数角的「旋转」，但是「独立版本」
 * * 使用两个旋转轴构成「旋转平面」
 *   * 一个是「起始角」，一个是「终止角」——二者构成一个「平面旋转2-向量」
 *   * ⚠️两个「任意维整数角」必须成90°角（即在不同轴向上，例如x+/y-、w+/z-）
 * * 若「待旋转角」不在这个「旋转平面」内，其将保持不变
 * * 否则在这个「旋转平面」内旋转
 *
 * @param rot 待算角
 * @param rotStart 起始角
 * @param rotEnd 终止角
 * @param step 旋转角数
 */
export function rotateInPlane_M(
	rot: mRot,
	rotStart: mRot,
	rotEnd: mRot,
	step: int
): mRot {
	// if (coAxis === rotAxis) return rot; // ! 起始角与目标轴本不应该相同（需要构成旋转平面），但需要能用
	// if (rotStart >> 1 === rotEnd >> 1) return rot; // ! 「起始角」「终止角」不应该在同一个轴向
	switch (
		rot ^ rotStart // 取异或，构造出最后一位
	) {
		// 待算角=起始角⇒从起始角开始
		case 0:
			return rotate_M(
				rotStart,
				rotEnd >> 1, // ! 因为这和「协轴朝向」无关，所以需要根据「终止轴的正负向」纠正
				(rotEnd & 1) === 0 ? step : step + 2
			)
		// 待算角=-起始角⇒从起始角对面开始
		case 1:
			return rotate_M(
				rotStart,
				rotEnd >> 1, // ! 因为这和「协轴朝向」无关，所以需要根据「终止轴的正负向」纠正
				(rotEnd & 1) === 0 ? step + 2 : step
			)
		// 若与「起始角」不在一个轴⇒判断其与「终止角」的关系
		default:
			switch (rot ^ rotEnd) {
				// 待算角=终止角⇒从终止角开始
				case 0:
					return rotate_M(
						rotEnd,
						rotStart >> 1, // ! 因为这和「协轴朝向」无关，所以需要根据「起始轴的正负向」纠正
						(rotStart & 1) === 0 ? step + 2 : step // !【2023-11-26 12:43:02】调一个修正，反过来试试
					)
				// 待算角=-终止角⇒从终止角对面开始
				case 1:
					return rotate_M(
						rotEnd,
						rotStart >> 1, // ! 因为这和「协轴朝向」无关，所以需要根据「起始轴的正负向」纠正
						(rotStart & 1) === 0 ? step : step + 2 // !【2023-11-26 12:43:02】调一个修正，反过来试试
					)
				// 若与「终止角」还是不在一个轴⇒返回其自身
				default:
					return rot
			}
	}
}

/**
 * 判断一个「任意维整数角」是否在「两个轴向构成的平面」内
 *
 * @param rot 要检测的「任意维整数角」
 * @param axis1 构成平面的第一个轴向
 * @param axis2 构成平面的第二个轴向
 * @returns 这个「任意维整数角」是否在「两个轴向构成的平面」内
 */
export function isRotInPlane_M(rot: mRot, axis1: uint, axis2: uint): boolean {
	return rot >> 1 === axis1 || rot >> 1 === axis2
}

/** 内置的「轴向名」 */
const NATIVE_N_DIM_AXISES: string = 'xyzw'
/**
 * 用于返回一个轴向的名称
 * * 逻辑：第1~4维（对应0~3轴向）按顺序称作xyzw，然后叫x5、x6、……
 * @param axis 轴向
 * @returns 轴向名
 */
export function nameOfAxis_M(axis: uint): string {
	return NATIVE_N_DIM_AXISES[axis] ?? `x${axis + 1}`
}
/**
 * 用于显示角度名：轴向+正负
 * @param rot 任意维整数角
 * @returns 这个角度的名字
 */
export function nameOfRot_M(rot: mRot): string {
	return nameOfAxis_M(rot >> 1) + '+-'[rot & 1]
}

export function lockRot_F(rot: fRot): fRot {
	// if (isNaN(rot) || !isFinite(rot))
	// 	return DEFAULT;
	if (rot < 0) return lockRot_F(rot + 4)
	if (rot >= 4) return lockRot_F(rot - 4)
	return rot
}

export function lockRot_I(rot: int): intRot {
	if (rot < 0) return lockRot_I(rot + 4)
	return rot & 3
}

export function fromRealRot(rot: fRot): fRot {
	return lockRot_F(rot / 90)
}

export function toRealRot(rot: fRot): fRot {
	return rot * 90
}

export function toRealIntRot(rot: int): int {
	return rot * 90
}

/** Use for express the currentRot in the containerRot
 * 	examples:
 * 	1.a rot out a object instanceof 45°(local:0.5),
 * 	2.the object's rot instanceof 90°(local:1),
 * 	3.then the value in of object instanceof 315°(local:3.5).
 */
export function globalToLocal(currentRot: fRot, containerRot: fRot): fRot {
	return lockRot_F(currentRot - containerRot)
}

/** Use for express the currentRot out the containerRot
 * 	examples:
 * 	1.A rot in a object instanceof 45°(local:0.5),
 * 	2.The object's rot instanceof 90°(local:1),
 * 	3.Then the value out of object instanceof 135°(local:1.5).
 */
export function localToGlobal(currentRot: fRot, containerRot: fRot): fRot {
	return lockRot_F(containerRot + currentRot)
}

/**
 * ! 下面这些函数应该只在「地图逻辑结构」中使用，母体不应直接调用
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
	return Math.cos((Math.PI / 2) * rot) * radius
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
	return Math.cos((Math.PI / 2) * rot) * radius
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
	const p: iPoint = new iPoint()
	for (let i = 0; i < dim; i++) {
		p.push(exMath.psi(rot - (i << 1)) * radius)
	}
	return p
}

export function towardX_MF(rot: mRot, radius: number = 1): number {
	return exMath.psi(rot) * radius
}

export function towardY_MF(rot: mRot, radius: number = 1): number {
	return exMath.psi(rot - 2) * radius
}

/**
 * （整数版本）根据两个数值，判断「前者在『更正方向』（返回1）还是『更负方向』（返回0）」
 * * 前者在「更负方向」|后者在「更正方向」⇒0
 * * 前者在「更正方向」|后者在「更负方向」⇒1
 */
export function comparePosition_I(a: int, b: int): 0 | 1 {
	return a > b ? 1 : 0
}

/**
 * （浮点版本）根据两个数值，判断「前者在『更正方向』（返回1）还是『更负方向』（返回0）」
 * * 前者在「更负方向」|后者在「更正方向」⇒0
 * * 前者在「更正方向」|后者在「更负方向」⇒1
 */
export function comparePosition_F(a: number, b: number): 0 | 1 {
	return a > b ? 1 : 0
}
