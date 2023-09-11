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
	 * 拷贝自身为一个新点
	 * ! 使用数组的方式拷贝，但类型不会变成数组
	 * 
	 * @returns 返回一个自身的拷贝，仍然是自身类型
	 */
	public copy(): xPoint<T> { return this.slice() as xPoint<T> }

	/**
	 * 从其它点拷贝坐标到此处
	 * * 原理：逐一赋值
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身，与另一点相等
	 */
	public copyFrom(point: xPoint<T>): xPoint<T> {
		for (let i = 0; i < this.length; i++) {
			this[i] = point[i];
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
		for (let i = 0; i < this.length; i++) {
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
		for (let i = 0; i < this.length; i++) {
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
		for (let i: uint = 1; i < this.length; i++) {
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
		for (let i: uint = 1; i < this.length; i++) {
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
		for (let i = start; i < this.length; i++) {
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
		for (let i = start; i < this.length; i++) {
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
	 * ? 三维乃至高维空间下，寻路等操作似乎应该是「一个个对齐维度」而非「对齐维度到只剩下一个」
	 * 
	 * 二维示例：
	 * ```
	 * R---S
	 * |   |
	 * |   |
	 * |   |
	 * T======
	 * ```
	 * @param this 起始点
	 * @param target 目标点
	 * @param start 寻找开始的索引
	 * @return this 使「单维度距离最小」
	 */
	public alignAbsMinDistance(target: xPoint<T>, start: uint = 0): xPoint<T> {
		let index: uint = 0;
		let minDistance: T | undefined = undefined;
		let tempT: T | undefined = undefined;
		let i: uint;
		// 获得「最小绝对距离」
		for (i = start; i < this.length; i++) {
			tempT = this.getAbsDistanceAt(target, i);
			if (minDistance === undefined || (minDistance as T) > tempT) {
				index = i
				minDistance = tempT
			}
		}
		tempT = this[index] // * 复用变量存储设置值
		// 对齐自身坐标
		i = 0;
		while (i < this.length) {
			this[i] = target[i++] // ! 直接拷贝，且计算顺序「左边索引→右边索引→赋值」（20230911 测试无碍）
		}
		this[index] = tempT // * 只保留在「最短距离」处的距离
		return this;
	}

	/**
	 * （原`getLineTargetPoint`）相对某个目标点进行「目标对齐」，但返回一个新对象
	 * @param target 对齐的目标点
	 * @param start 搜索的起始索引
	 */
	public getAbsMinDistancePoint(target: xPoint<T>, start: uint = 0): xPoint<T> {
		return this.copy().alignAbsMinDistance(target, start);
	}

	/**
	 * 判断两个点「坐标是否相等」
	 * ! 技术细节：逐一比对其是否**全等**
	 * 
	 * @param p 比对的目标点
	 * @returns 两个点的坐标是否相等
	 */
	public isEqual(p: xPoint<T>): boolean {
		for (let i: uint = 0; i < this.length; i++) {
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
		for (let i: uint = 0; i < this.length; i++) {
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

// Full alias
export const iPoint = intPoint; // as class
export type iPoint = intPoint; // as type
export const fPoint = floatPoint; // as class
export type fPoint = floatPoint; // as type
