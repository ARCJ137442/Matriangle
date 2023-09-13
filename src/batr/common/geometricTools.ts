import { int, uint } from '../legacy/AS3Legacy'
import { intAbs } from './exMath'

/**
 * 所有类型点的基类
 * * 支持任意维度的几何点表征
 * * 在索引访问的基础上提供使用特定名称的几何方法
 * * 可选的「留给后续重载优化」的方法
 */
export abstract class xPoint<T> extends Array<T> {

	//================Position Getter/Setter================//
	public get nDimensions(): int { return this.length }
	public get nDim(): int { return this.length }

	// 各个维度的坐标快捷方式
	public get x(): T { return this[0] }
	public set x(value: T) { this[0] = value }
	public get y(): T { return this[1] }
	public set y(value: T) { this[1] = value }
	public get z(): T { return this[2] }
	public set z(value: T) { this[2] = value }
	public get w(): T { return this[3] }
	public set w(value: T) { this[3] = value }

	//================Util Functions================//

	/**
	 * 显示点是否（在其长度内）有未定义量
	 */
	public get hasUndefined(): boolean {
		for (let i = 0; i < this.length; i++)
			if (this[i] === undefined) return true;
		return false
	}

	/**
	 * 显示点是否含有`undefined`与`NaN`
	 * * 不能用全等判断`NaN`
	 * 
	 * ! 使用的必须是类型参数T为数值的类型
	*/
	public get invalid(): boolean {
		for (let i = 0; i < this.length; i++)
			if (this[i] === undefined || isNaN(this[i] as number)) return true;
		return false
	}

	/**
	 * 拷贝自身为一个新点
	 * ! 使用数组的方式拷贝，但类型不会变成数组
	 * 
	 * ! 注意：不能在频繁调用的函数中使用
	 * * 最好不要在任何带循环的函数体中使用，会导致大量数组创建，进而占用巨量存储空间
	 * * 其它可能导致「新对象创建」的函数同理
	 * 
	 * @returns 返回一个自身的拷贝，仍然是自身类型
	 */
	public copy(): xPoint<T> { return this.slice() as xPoint<T> }

	/**
	 * 使用特定的「生成函数」填充一系列值
	 * * 可以配合`new xPoint<T>(长度)`使用
	 * * 例如：`new xPoint<T>(长度).generateFrom(f)`
	 */
	public generate(f: (i: int) => T, length: uint = this.length): xPoint<T> {
		for (let i = 0; i < length; i++)
			this[i] = f(i)
		return this;
	}

	/**
	 * 使用特定的「映射函数」从另一个（同长数组）批量更改其中的值，并将函数结果返回到自身对象之中
	 * * 可以配合`new xPoint<T>(长度)`使用
	 * * 例如：`new xPoint<T>(长度).inplace(f)`
	 */
	public inplaceMap<T2>(f: (t: T2) => T, source: xPoint<T2> | null = null): xPoint<T> {
		source = source ?? (this as any);
		for (let i = 0; i < this.length; i++)
			this[i] = f((source as xPoint<T2>)[i])
		return this;
	}

	/**
	 * 从其它点拷贝坐标到此处
	 * * 原理：根据源头点各分量逐一赋值
	 * * 【20230912 16:31:39】现在循环采用的是「遍历对方的所有值」而非「遍历自己的所有值」
	 *   * 这样可以保证「遍历到的`point[i]`始终有效」
	 *   * 利用JS「设置数组值无需考虑边界问题」的特性，可以实现「自己只new未初始化到指定维度，仍然可以『开箱复制即用』」
	 *     * 便于其它地方使用「数组缓存技术」：先初始化一个空数组，需要的时候再把内容copy过去，避免「未初始化的维数」这样的情况
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身，与另一点相等
	 */
	public copyFrom(point: xPoint<T>): xPoint<T> {
		for (let i = 0; i < point.length; i++) {
			this[i] = point[i];
		}
		return this;
	}

	/**
	 * 从一系列参数中拷贝坐标到此处
	 * * 原理：遍历分量，逐一赋值（类似`copyFrom`方法）
	 */
	public copyFromArgs(...args: T[]): xPoint<T> {
		for (let i = 0; i < args.length; i++) {
			this[i] = args[i];
		}
		return this;
	}

	/**
	 * 从其它点附加坐标到此处
	 * * 原理：逐一增量赋值
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身，与另一点相等
	 */
	public addFrom(point: xPoint<T>): xPoint<T> {
		for (let i = 0; i < point.length; i++) {
			this[i] += point[i] as any;
		}
		return this;
	}

	/**
	 * 逐个坐标减去目标点值
	 * * 原理：逐一增量赋值
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身，与另一点相等
	 */
	public minusFrom(point: xPoint<T>): xPoint<T> {
		for (let i = 0; i < point.length; i++) {
			(this[i] as any) -= point[i] as any;
		}
		return this;
	}

	/**
	 * 修改自身，返回「反转后的坐标」
	 * * 二维情况下是"x-y反转"，其它情况同数组反转
	 */
	public invert(): xPoint<T> { return this.reverse() as xPoint<T> }

	/**
	 * （抽象）获取欧氏距离
	 * * 原理：所有距离的方均根
	 * 
	 * ! 使用`as any`断言T支持减法
	 */
	public getDistance(point: xPoint<T>): T {
		let distanceSquare: T = ((this[0] as any) - (point[0] as any)) as T;
		let tempDistance: T;
		for (let i: uint = 1; i < point.length; i++) {
			tempDistance = ((this[i] as any) - (point[i] as any)) as T
			distanceSquare += ((tempDistance as any) * (tempDistance as any)) as any
		}
		return Math.sqrt(distanceSquare as any) as T
	}

	/**
	 * 获取曼哈顿距离
	 * * 原理：所有「绝对距离」之和
	 * 
	 * ! 技术上使用`as any`断言「+」能在类型T之间使用
	 * 
	 * @param point 计算的目标点
	 */
	public getManhattanDistance(point: xPoint<T>): T {
		let tempDistance: T = this[0]
		for (let i: uint = 1; i < point.length; i++) {
			tempDistance += this.getAbsDistanceAt(point, i) as any;
		}
		return tempDistance;
	}

	/**
	 * 获取「第i索引维度」方向的「绝对距离」
	 * * 默认采用`Math.abs`方法
	 * @param point 用于对比的点
	 * @param i 指定的索引
	 */
	public getAbsDistanceAt(point: xPoint<T>, i: uint): T {
		return Math.abs(this[i] as any - (point[i] as any)) as T;
	}

	/**
	 * （二维移植）获取x方向的「绝对距离」
	 * * 实质上就是「getAbsDistanceAt+固定轴向」
	 * @param point 用于对比的点
	 */
	public getAbsDistanceX(point: xPoint<T>): T {
		return this.getAbsDistanceAt(point, 0)
	}

	/**
	 * （二维移植）获取y方向的「绝对距离」
	 * * 实质上就是「getAbsDistanceAt+固定轴向」
	 * @param point 用于对比的点
	 */
	public getAbsDistanceY(point: xPoint<T>): T {
		return this.getAbsDistanceAt(point, 1)
	}

	/**
	 * 获取与另一个点「各方向绝对距离」的最小值
	 * @param point 计算的目标点
	 * @param start 计算的起始索引
	 */
	public getAbsMinDistance(point: xPoint<T>, start: uint = 0): T {
		let minDistance: T | undefined = undefined;
		let tempDistance: T | undefined = undefined;
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i);
			if (minDistance === undefined || (minDistance as T) > tempDistance) {
				minDistance = tempDistance
			}
		}
		return minDistance as T;
	}

	/**
	 * （原`getLineTargetDistance`）获取与另一个点「各方向『绝对距离取最小值』的第一个索引」
	 * 
	 * ! 不会检查两个数组的长度（点の维度）
	 * 
	 * * 在有「绝对距离相等」的情况时，会优先保留前者
	 * 
	 * @param start 寻找的起始索引
	 */
	public indexOfAbsMinDistance(point: xPoint<T>, start: uint = 0): uint {
		let result: uint = 0;
		let minDistance: T | undefined = undefined;
		let tempDistance: T | undefined = undefined;
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i);
			if (minDistance === undefined || (minDistance as T) > tempDistance) {
				result = i
				minDistance = tempDistance
			}
		}
		return result;
	}

	/**
	 * （原`alignLineTargetPoint`）相对于某个目标点进行「目标对齐」
	 * * 效果：「对齐」后与目标点之间的距离为「各方向绝对距离最小值」
	 * * 在「有多个方向距离最小」时，默认从下标最小的值
	 * * 本可以通过调用「最小绝对距离」直接实现，但现通过「代码内联」提升性能
	 * 
	 * ! 会修改自身
	 * 
	 * ! 技术手段：通过`this.constructor as any`获取构造函数，从而根据实际的类型调用构造函数，绕过「抽象类不能进行构造」的限制
	 * 
	 * ! 【20230913 13:25:46】现在采用「一次对齐一个轴向」的方式
	 * 
	 * 二维示例：
	 * ```
	 * #--5--S
	 * |     |
	 * |     3
	 * |     |
	 * T=====R
	 * ```
	 * @param this 起始点
	 * @param target 目标点
	 * @param start 寻找开始的索引
	 * @return this 使「其中一个维度坐标一致」的方法
	 */
	public alignAbsMinDistance(target: xPoint<T>, start: uint = 0): xPoint<T> {
		let index: uint = 0;
		let minDistance: T | undefined = undefined;
		let tempT: T | undefined = undefined;
		let i: uint;
		// 获得「最小绝对距离」
		for (i = start; i < target.length; i++) {
			tempT = this.getAbsDistanceAt(target, i);
			if (minDistance === undefined || (minDistance as T) > tempT) {
				index = i
				minDistance = tempT
			}
		}
		// ! 注意：这里假定for循环至少执行了一次（不是零维的）
		// * 运算后，index即「最小值索引」
		this[index] = target[index] // * 只抹除在「最短距离」处的距离
		return this;
	}

	// ! 【20230912 0:36:18】所有「返回新对象」的函数，一律使用「copy+对应函数」的方式
	// /**
	//  * （原`getLineTargetPoint`）相对某个目标点进行「目标对齐」
	//  * * 但返回一个新对象
	//  * 
	//  * @param target 对齐的目标点
	//  * @param start 搜索的起始索引
	//  */
	// public getAbsMinDistancePoint(target: xPoint<T>, start: uint = 0): xPoint<T> {
	// 	return this.copy().alignAbsMinDistance(target, start);
	// }

	/**
	 * 判断两个点「坐标是否相等」
	 * ! 技术细节：逐一比对其是否**全等**
	 * 
	 * @param p 比对的目标点
	 * @returns 两个点的坐标是否相等
	 */
	public isEqual(p: xPoint<T>): boolean {
		for (let i: uint = 0; i < p.length; i++) {
			if (this[i] !== p[i]) return false
		}
		return true
	}

	/**
	 * （原`isInSameLine`）判断两个点「坐标是否有一处相等」
	 * ! 技术细节：逐一比对其是否**全等**，有一个就是true
	 * 
	 * @param p 比对的目标点
	 * @returns 两个点的坐标是否有一处相等
	 */
	public isAnyAxisEqual(p: xPoint<T>): boolean {
		for (let i: uint = 0; i < p.length; i++) {
			if (this[i] === p[i]) return true
		}
		return false
	}

}

/**
 * 经过特殊定制的整数点支持
 */
export class intPoint extends xPoint<int> {
	/**
	 * * 特化「比大小」为「整型最小值」
	 * @param point 计算的目标点
	 * @param i 计算所处的索引
	 * @returns 绝对距离
	 */
	override getAbsDistanceAt(point: intPoint, i: uint): int {
		return intAbs(this[i] - point[i])
	}
}

/**
 * 经过特殊定制的浮点数点支持
 * * 基本全盘继承抽象类`xPoint`的方法
 */
export class floatPoint extends xPoint<number> { }

// 别名
export const iPoint = intPoint; // as class
export type iPoint = intPoint; // as type
export const fPoint = floatPoint; // as class
export type fPoint = floatPoint; // as type

// ! 缓存的变量
const _temp_forEachPoint: iPoint = new iPoint();
/**
 * 循环遍历任意维超方形
 * * 由先前「地图遍历」算法迁移而来
 * * 基本逻辑：「数值进位」思想
 * * 性能🆚递归：复杂度更胜一筹，处理高维大规模均胜过递归算法
 * 
 * ! 已知问题：直接使用args数组，TS编译会不通过
 * 
 * ! 注意：处于性能考虑，不会对pMax与pMin的长度一致性进行检查
 * 
 * @param pMin 所有坐标的最小值
 * @param pMax 所有坐标的最大值，其长度决定遍历的维数
 * @param f 回调函数：第一个回传的参数是「遍历到的点的坐标」
 * @param args 附加在「点坐标」后的参数
 */
export function traverseNDSquare(
	pMin: iPoint, pMax: iPoint,
	f: (p: iPoint, ...args: any[]) => void,
	...args: any[]
): void {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length;
	// 当前点坐标的表示：复制mins数组
	_temp_forEachPoint.copyFrom(pMin);
	// 进位的临时变量
	let i: uint = 0;
	// 不断遍历，直到「最高位进位」后返回
	while (i < nDim) {
		// 执行当前点：调用回调函数
		f(_temp_forEachPoint, ...args)
		// 迭代到下一个点：不断循环尝试进位
		// 先让第i轴递增，然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
		for (i = 0; i < nDim && ++_temp_forEachPoint[i] > pMax[i]; ++i) {
			// 旧位清零
			_temp_forEachPoint[i] = pMin[i];
			// 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
		}
	}
}
