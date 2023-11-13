/* eslint-disable @typescript-eslint/no-explicit-any */
import { int, uint } from '../legacy/AS3Legacy'
import { IJSObjectifiable, JSObject, JSObjectifyMap } from './JSObjectify'
import { intAbs } from './exMath'
import { Ref, Val, isInvalidNumber } from './utils'

/**
 * 所有类型点的基类
 * * 支持任意维度的几何点表征
 * * 在索引访问的基础上提供使用特定名称的几何方法
 * * 可选的「留给后续重载优化」的方法
 */
export abstract class xPoint<T extends number = number>
	extends Array<T>
	implements IJSObjectifiable<xPoint<T>>
{
	// JS对象化 //
	/** 实现：{自身类名: 原始值（数组）} */
	public saveToJSObject(target: JSObject): JSObject {
		target[this.constructor.name] = [...this] // ! `this.slice();`不能达到「抹除类型」的目的
		return target
	}

	/** 实现：读取与自身类名相同的值 */
	loadFromJSObject(source: JSObject): this {
		const value: unknown = source[this.constructor.name]
		if (Array.isArray(value))
			value.forEach((item: any, index: number): void => {
				if (this.checkType(item))
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					this[index] = item
			})
		return this
	}

	/**
	 * 根据指定的类型检验数组中的值
	 */
	public checkType(value: unknown): boolean {
		return false
	}

	/**
	 * 【2023-09-24 14:46:08】假实现：调用⇒返回空
	 * * 【2023-09-24 16:32:38】不报错的缘由：判断「是否有定义属性」时要访问这个getter
	 *   * 代码：`property?.objectifyMap !== undefined // 第二个看「对象化映射表」是否定义`
	 *
	 * * 💭「动态添加属性」的弊端：可以是可以，但这样不如直接存储数组来得方便
	 *
	 */
	public get objectifyMap(): JSObjectifyMap {
		return {}
	}

	/** 这是个可扩展的映射表 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}

	/** 从数组中加载 */
	public loadFromArray(source: T[]): xPoint<T> {
		return this.copyFromArgs(...source)
	}

	//================Position Getter/Setter================//
	public get nDimensions(): int {
		return this.length
	}
	public get nDim(): int {
		return this.length
	}

	// 各个维度的坐标快捷方式
	public get x(): T {
		return this[0]
	}
	public set x(value: T) {
		this[0] = value
	}
	public get y(): T {
		return this[1]
	}
	public set y(value: T) {
		this[1] = value
	}
	public get z(): T {
		return this[2]
	}
	public set z(value: T) {
		this[2] = value
	}
	public get w(): T {
		return this[3]
	}
	public set w(value: T) {
		this[3] = value
	}

	//================Util Functions================//

	/**
	 * 清除点上的所有值
	 * * 但实际上可看作`this.length=0`的封装版
	 *
	 * @returns 自身（支持链式操作）
	 */
	public clear(): this {
		this.length = 0
		return this
	}

	/** 显示点是否（在其长度内）有未定义量 */
	public get hasUndefined(): boolean {
		for (let i = 0; i < this.length; i++)
			if (this[i] === undefined) return true
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
			if (this[i] === undefined || isNaN(this[i] as number)) return true
		return false
	}

	/**
	 * 拷贝自身为一个新点
	 *
	 * ! 使用数组的方式拷贝，但类型不会变成数组
	 *
	 * ! 注意：不建议在频繁调用的函数中使用
	 * * 最好不要在任何带循环的函数体中使用，会导致大量数组创建，进而占用巨量存储空间
	 * * 其它可能导致「新对象创建」的函数同理
	 *
	 * @returns 返回一个自身的拷贝，仍然是自身类型
	 */
	public copy(): xPoint<T> {
		return this.slice() as xPoint<T>
	}

	/**
	 * 使用特定的「生成函数」填充一系列值
	 * * 可以配合`new xPoint<T>(长度)`使用
	 * * 例如：`new xPoint<T>(长度).generateFrom(f)`
	 */
	public generate(f: (i: int) => T, length: uint = this.length): this {
		for (let i = 0; i < length; i++) {
			this[i] = f(i)
		}
		return this
	}

	/**
	 * 使用特定的「映射函数」从另一个（同长数组）批量更改其中的值，并将函数结果返回到自身对象之中
	 * * 可以配合`new xPoint<T>(长度)`使用
	 * * 例如：`new xPoint<T>(长度).inplace(f)`
	 */
	public inplaceMap(f: (t: T) => T, source: xPoint<T> = this): this {
		for (let i = 0; i < this.length; i++) {
			this[i] = f(source[i])
		}
		return this
	}

	/**
	 * 从其它点拷贝坐标到此处
	 * * 原理：根据源头点各分量逐一赋值
	 * * 【20230912 16:31:39】现在循环采用的是「遍历对方的所有值」而非「遍历自己的所有值」
	 *   * 这样可以保证「遍历到的`other[i]`始终有效」
	 *   * 利用JS「设置数组值无需考虑边界问题」的特性，可以实现「自己只new未初始化到指定维度，仍然可以『开箱复制即用』」
	 *	 * 便于其它地方使用「数组缓存技术」：先初始化一个空数组，需要的时候再把内容copy过去，避免「未初始化的维数」这样的情况
	 * * 【2023-11-13 18:08:14】现在参数名改为`other`，并可直接用数组
	 *
	 * ! 会修改自身
	 *
	 * @returns 返回自身，与另一点相等
	 */
	public copyFrom(other: Array<T>): xPoint<T> {
		// 先把长度对齐
		this.length = other.length
		// 然后逐一设置值
		for (let i = 0; i < other.length; i++) {
			this[i] = other[i]
		}
		return this
	}

	/**
	 * 从一系列参数中拷贝坐标到此处
	 * * 原理：遍历分量，逐一赋值（类似`copyFrom`方法）
	 */
	public copyFromArgs(...args: T[]): xPoint<T> {
		// !【2023-10-09 01:27:43】暂时不限制维数，这样可能会导致长度不稳定
		for (let i = 0; i < args.length; i++) {
			this[i] = args[i]
		}
		return this
	}

	/**
	 * 从其它点附加坐标到此处
	 * * 原理：逐一增量赋值
	 *
	 * ! 会修改自身
	 *
	 * 📌【2023-10-09 15:30:01】目前的性能测试中，`a=a+x` `a+=x`无明显性能差异：
	 * ```
	 * =+: 6.167s
	 * +=: 6.185s
	 * =+: 6.106s
	 * +=: 6.092s
	 * ```
	 * ! 为了可读性，目前还是使用`any`
	 *
	 * @returns 返回自身
	 */
	public addFrom(point: xPoint<T>): this {
		for (let i = 0; i < point.length; i++) {
			this[i] += point[i] as any
		}
		return this
	}

	/**
	 * 从一个量广播附加坐标到此处
	 * * 原理：逐一广播增量赋值
	 *
	 * ! 会修改自身
	 *
	 * @returns 返回自身
	 */
	public addFromSingle(x: T): this {
		for (let i = 0; i < this.length; i++) {
			this[i] += x as any
		}
		return this
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
			;(this[i] as any) -= point[i]
		}
		return this
	}

	/**
	 * 修改自身，返回「反转后的坐标」
	 * * 二维情况下是"x-y反转"，其它情况同数组反转
	 */
	public invert(): xPoint<T> {
		return this.reverse() as xPoint<T>
	}

	/**
	 * 获取两个坐标在某个分量上的距离
	 *
	 * ! 【2023-10-09 15:20:14】现在因为`T`已经是数字类型，所以自然支持
	 */
	public getDistanceAt(point: xPoint<T>, axis: uint): T {
		return (this[axis] - point[axis]) as T
	}

	/**
	 * （抽象）获取欧氏距离
	 * * 原理：所有距离的方均根
	 */
	public getDistance(point: xPoint<T>): number {
		return Math.sqrt(this.getDistanceSquare(point))
	}

	/**
	 * （抽象）获取欧氏距离的平方
	 * * 原理：所有距离的平方总和
	 *
	 * ! 【2023-10-09 15:20:14】现在因为`T`已经是数字类型，所以自然支持
	 */
	public getDistanceSquare(point: xPoint<T>): T {
		let tempDistance: T = this.getDistanceAt(point, 0)
		let distanceSquare: T = (tempDistance * tempDistance) as T
		for (let i: uint = 1; i < point.length; i++) {
			tempDistance = this.getDistanceAt(point, i)
			distanceSquare = (distanceSquare + tempDistance * tempDistance) as T
		}
		return distanceSquare
	}

	/**
	 * 获取曼哈顿距离
	 * * 原理：所有「绝对距离」之和
	 *
	 * @param point 计算的目标点
	 */
	public getManhattanDistance(point: xPoint<T>): T {
		let tempDistance: T = this[0]
		for (let i: uint = 1; i < point.length; i++) {
			tempDistance = (tempDistance + this.getAbsDistanceAt(point, i)) as T
		}
		return tempDistance
	}

	/**
	 * 获取「第i索引维度」方向的「绝对距离」
	 * * 默认采用`Math.abs`方法
	 * @param point 用于对比的点
	 * @param i 指定的索引
	 */
	public getAbsDistanceAt(point: xPoint<T>, i: uint): T {
		return Math.abs(this[i] - point[i]) as T
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
		let minDistance: T | undefined = undefined
		let tempDistance: T | undefined = undefined
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i)
			if (minDistance === undefined || minDistance > tempDistance) {
				minDistance = tempDistance
			}
		}
		return minDistance as T
	}

	/**
	 * （原`getLineTargetDistance`）获取与另一个点「各方向『绝对距离取最小值』的第一个索引」
	 *
	 * ! 不会检查两个数组的长度（点の维度），仅遍历「目标点」各分量
	 *
	 * * 在有「绝对距离相等」的情况时，会优先保留前者
	 *
	 * @param start 寻找的起始索引
	 */
	public indexOfAbsMinDistance(point: xPoint<T>, start: uint = 0): uint {
		let result: uint = 0
		let minDistance: T | undefined = undefined
		let tempDistance: T | undefined = undefined
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i)
			if (minDistance === undefined || minDistance > tempDistance) {
				result = i
				minDistance = tempDistance
			}
		}
		return result
	}

	/**
	 * 获取与另一个点「各方向『绝对距离取最大值』的第一个索引」
	 *
	 * ! 不会检查两个数组的长度（点の维度），仅遍历「目标点」各分量
	 *
	 * * 在有「绝对距离相等」的情况时，会优先保留前者
	 *
	 * @param start 寻找的起始索引
	 */
	public indexOfAbsMaxDistance(point: xPoint<T>, start: uint = 0): uint {
		let result: uint = 0
		let maxDistance: T | undefined = undefined
		let tempDistance: T | undefined = undefined
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i)
			if (maxDistance === undefined || maxDistance < tempDistance) {
				result = i
				maxDistance = tempDistance
			}
		}
		return result
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
	 * |	 |
	 * |	 3
	 * |	 |
	 * T=====R
	 * ```
	 * @param this 起始点
	 * @param target 目标点
	 * @param start 寻找开始的索引
	 * @return this 使「其中一个维度坐标一致」的方法
	 */
	public alignAbsMinDistance(target: xPoint<T>, start: uint = 0): xPoint<T> {
		let index: uint = 0
		let minDistance: T | undefined = undefined
		let tempT: T | undefined = undefined
		let i: uint
		// 获得「最小绝对距离」
		for (i = start; i < target.length; i++) {
			tempT = this.getAbsDistanceAt(target, i)
			if (minDistance === undefined || minDistance > tempT) {
				index = i
				minDistance = tempT
			}
		}
		// ! 注意：这里假定for循环至少执行了一次（不是零维的）
		// * 运算后，index即「最小值索引」
		this[index] = target[index] // * 只抹除在「最短距离」处的距离
		return this
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

	/**
	 * 检查是否有非法值，如
	 * * `undefined`（常见于「长度开辟未设置值」）
	 * * `NaN`（常见于「未开辟长度就运算」）
	 */
	public checkInvalid(): boolean {
		return this.some(isInvalidNumber)
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

	/** 实现：检测是否为整数 */
	public checkType(value: number): boolean {
		return Number.isInteger(value)
	}
}

/**
 * 经过特殊定制的浮点数点支持
 * * 基本全盘继承抽象类`xPoint`的方法
 */
export class floatPoint extends xPoint<number> {
	/** 实现：检测是否为数值 */
	public checkType(value: number): boolean {
		return typeof value === 'number'
	}
}

// 别名 //
export const iPoint = intPoint // 作为值
export type iPoint = intPoint // 作为类型
export const fPoint = floatPoint // 作为值
export type fPoint = floatPoint // 作为类型

/**
 * 📌类似一种「指针参数」的类型（别名）
 * * 🎯目标：（在类型上）区分「要自身存储的值」还是「无需存储的引用」
 * * ✨应用：在函数调用时区分「是复制新的值进函数，还是只需把引用传递过去」以及「就地更改是否影响函数之外的对象」
 */
export type iPointRef = Ref<iPoint>
/** 同上，作为一种「引用/指针」类型 */
export type fPointRef = Ref<fPoint>
/**
 * 📌相对于「引用类型」
 * * 🎯目标：标注这里需要一个新的「值」
 * * ✨应用：实体的坐标必须「掌握在自己手中」，所以必须要「自身存储值」
 */
export type iPointVal = Val<iPoint>
/** 同上，作为一种「引用/指针」类型 */
export type fPointVal = Val<fPoint>

// ! 缓存的变量
const _temp_forEachPoint: iPointVal = new iPoint()
/**
 * 循环遍历任意维超方形
 * * 由先前「地图遍历」算法迁移而来
 * * 基本逻辑：「数值进位」思想
 * * 性能🆚递归：复杂度更胜一筹，处理高维大规模均胜过递归算法
 *
 * ! 已知问题：直接使用args数组，TS编译会不通过
 *
 * ! 注意：出于性能考虑，不会对pMax与pMin的长度一致性进行检查
 *
 * @param pMin 所有坐标的最小值
 * @param pMax 所有坐标的最大值，其长度决定遍历的维数
 * @param f 回调函数：第一个回传的参数是「遍历到的点的坐标」
 * @param args 附加在「点坐标」后的参数
 */
export function traverseNDSquare(
	pMin: iPointRef,
	pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: unknown[]
): void {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length
	// 当前点坐标的表示：复制mins数组
	_temp_forEachPoint.copyFrom(pMin)
	// 进位的临时变量
	let i: uint = 0
	// 不断遍历，直到「最高位进位」后返回
	while (i < nDim) {
		// 执行当前点：调用回调函数
		f(_temp_forEachPoint, ...args)
		// 迭代到下一个点：不断循环尝试进位
		// 先让第i轴递增，然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
		for (i = 0; i < nDim && ++_temp_forEachPoint[i] > pMax[i]; ++i) {
			// 旧位清零
			_temp_forEachPoint[i] = pMin[i]
			// 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
		}
	}
}

// const _temp_forEachPointFrame_Meta: iPointVal = new iPoint();
/**
 * 循环遍历任意维超方形内部，但是「元编程」
 * * 由先前「地图遍历」算法迁移而来
 * * 基本逻辑：递归生成专用for循环代码⇒直接执行专用代码
 * * 性能：甚至比「纯算法」的性能好
 *
 * ! 注意：出于性能考虑，不会对pMax与pMin的长度一致性进行检查
 *
 * @param pMin 所有坐标的最小值
 * @param pMax 所有坐标的最大值，其长度决定遍历的维数
 * @param f 回调函数：第一个回传的参数是「遍历到的点的坐标」
 * @param args 附加在「点坐标」后的参数
 */
export function traverseNDSquare_Meta(
	pMin: iPointRef,
	pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: unknown[]
): void {
	// 直接执行代码
	return eval(
		traverseNDSquare_Meta_Code(pMin, pMax, 'f(p, ...args);')
	) as void
}
function traverseNDSquare_Meta_Code(
	pMin: iPointRef,
	pMax: iPointRef,
	f_str: string
): string {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length // !【2023-10-04 20:47:24】用空间复杂度还时间复杂度，避免不断访问
	// 循环生成专用代码
	let code: string = f_str
	// for循环不断套壳
	for (let i: uint = 0; i < nDim; i++) {
		// * 边界直接当常量嵌入；原先的遍历作为每一个数组下标
		code = `for(p[${i}] = ${pMin[i]}; p[${i}] <= ${pMax[i]}; ++p[${i}]) {
			${code}
		};`
	}
	// 返回代码
	return code
}

const _temp_forEachPointFrame: iPointVal = new iPoint()
/**
 * 循环遍历任意维超方形的框架
 * * 由先前「地图遍历」算法迁移而来
 * * 基本逻辑：「数值进位」思想+「固定一位『二值遍历』」
 * * 性能🆚递归：复杂度更胜一筹，处理高维大规模均胜过递归算法
 *
 * ! 已知问题
 * * 直接使用args数组，TS编译会不通过
 * * 会导致在边角处的「重复遍历」问题
 *
 * 📌示例：下面这段代码会输出包括四个角落在内的十二个点，但不包括`intPoint(2) [ 0, 0 ]`
 * ```
 * traverseNDSquareFrame(
 * 	new iPoint(-1, -1),
 * 	new iPoint(1, 1),
 * 	console.log
 * )
 * ```
 *
 * ! 注意：出于性能考虑，不会对pMax与pMin的长度一致性进行检查
 *
 * @param pMin 所有坐标的最小值
 * @param pMax 所有坐标的最大值，其长度决定遍历的维数
 * @param f 回调函数：第一个回传的参数是「遍历到的点的坐标」
 * @param args 附加在「点坐标」后的参数
 */
export function traverseNDSquareFrame(
	pMin: iPointRef,
	pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: unknown[]
): void {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length
	// 当前点坐标的表示：复制mins数组
	_temp_forEachPointFrame.copyFrom(pMin)
	/** 表示「当前正在进位的位」 */
	let i: uint = 0
	/** 锁定的i：锁定后只能在「最大值/最小值」之间 */
	let iLocked: uint = 0
	// 不断遍历，直到「最高位进位」后返回
	while (iLocked < nDim) {
		while (i < nDim) {
			// 执行当前点：调用回调函数
			f(_temp_forEachPointFrame, ...args)
			// 迭代到下一个点：不断循环尝试进位
			// 先让第i轴递增（或「锁定性递增」），然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
			i = 0
			while (
				i < nDim &&
				(i === iLocked // 锁定⇒直接从最小值递增到最大值
					? (_temp_forEachPointFrame[i] += pMax[i] - pMin[i]) // 这里必须再递增，不然会死循环
					: ++_temp_forEachPointFrame[i]) > // 否则正常递增
					// ?💭这或许可以被拆分成两个for循环
					pMax[i]
			) {
				// 旧位清零
				_temp_forEachPointFrame[i] = pMin[i]
				// 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
				++i
			}
		}
		iLocked++
		i = 0
	}
}

const _temp_forEachPointSurface: iPointVal = new iPoint()
/**
 * 循环遍历任意维超方形的表面（类似于「框架」版本，但不会遍历「角落」处）
 * * 算法：for循环生成代码⇒eval动态解释执行
 *
 * ! 已知问题
 * * 直接使用args数组，TS编译会不通过
 *
 * 📌示例：下面这段代码只会输出四个点，且每个点都有一个坐标分量的绝对值为1
 * ```
 * traverseNDSquareFrame(
 * 	new iPoint(-1, -1),
 * 	new iPoint(1, 1),
 * 	console.log
 * )
 * ```
 *
 * ! 注意：出于性能考虑，不会对pMax与pMin的长度一致性进行检查
 *
 * @param pMin 所有坐标的最小值
 * @param pMax 所有坐标的最大值，其长度决定遍历的维数
 * @param f 回调函数：第一个回传的参数是「遍历到的点的坐标」
 * @param args 附加在「点坐标」后的参数
 */
export function traverseNDSquareSurface(
	pMin: iPointRef,
	pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: unknown[]
): void {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const p: iPointRef = _temp_forEachPointSurface
	// * ↑实际上在eval中用到了
	eval(traverseNDSquareSurface_Code(pMin, pMax, 'f(p, ...args)'))
}
function traverseNDSquareSurface_Code(
	pMin: iPointRef,
	pMax: iPointRef,
	f_code: string
): string {
	const nDim = pMax.length
	let code: string = ''

	let temp_code: string
	for (let iLocked: uint = 0; iLocked < nDim; ++iLocked) {
		// 从函数执行本身开始
		temp_code = f_code
		let i: uint
		// iLocked之前
		for (i = 0; i < iLocked; ++i) {
			temp_code = `
			for(p[${i}] = ${pMin[i] + 1}; p[${i}] < ${pMax[i]}; ++p[${i}]) {
				${temp_code}
			}`
		}
		// 扩展代码，在iLocked的前后做文章
		temp_code = `
		p[${iLocked}] = ${pMin[iLocked]};
		${temp_code}
		p[${iLocked}] = ${pMax[iLocked]};
		${temp_code}
		`
		// iLocked之后
		for (i = iLocked + 1; i < nDim; ++i) {
			temp_code = `
			for(p[${i}] = ${pMin[i] + 1}; p[${i}] < ${pMax[i]}; ++p[${i}]) {
				${temp_code}
			}`
		}
		// 并入代码之中
		code += temp_code
	}
	return code
}

/**
 * 检验一个点是否为「整数点」
 * * 【2023-09-27 20:21:48】设置缘由：int/uint只是AS3遗产&严格区分所用，JS在实际代码运行时并不区分整数与浮点数
 *
 * @param p 待检验的点
 * @returns 是否严格为「整数点」
 */
export const verifyIntPoint = (p: iPointRef): boolean =>
	p.every(Number.isInteger)
/** 上一个函数的有报错版本 */
export function verifyIntPointStrict(p: iPointRef): iPointRef {
	if (p.every(Number.isInteger)) return p
	else throw new Error(`点${p.toString()}不是整数点`)
}

/**
 * （整数%整数版本）把一个点在每个坐标轴的坐标都限制在「原点xi-模点xi」中
 * * 原理：坐标逐个位取模
 * * 应用：构建高维版本的「有限无界地图」
 *
 * ! 破坏性操作：会改变参数`p`
 *
 * @param p 待约束坐标的点
 * @param modP 作为「各方面坐标上限」的点（取模后）
 * @returns 坐标被约束后的点
 */
export function modPoint_II(p: iPointRef, modP: iPointRef): iPointRef {
	for (let i: uint = 0; i < p.length; ++i) {
		p[i] %= modP[i]
	}
	return p
}

/**
 * （浮点数%整数版本）把一个点在每个坐标轴的坐标都限制在「原点xi-模点xi」中
 * * 原理：坐标逐个位取模
 * * 应用：构建高维版本的「有限无界地图」
 *
 * ! 破坏性操作：会改变参数`p`
 *
 * @param p 待约束坐标的点
 * @param modP 作为「各方面坐标上限」的点（取模后）
 * @returns 坐标被约束后的点
 */
export function modPoint_FI(p: fPointRef, modP: iPointRef): fPointRef {
	for (let i: uint = 0; i < p.length; ++i) {
		p[i] %= modP[i]
	}
	return p
}

/**
 * 数组（作为向量）点积
 * * 作为批量计算 $∑^n_{i=1} a_i b_i$ 的辅助函数
 *
 * @param a 点积参数1（作为维数参考与白板参考）
 * @param b 点积参数2
 * @param target 存放点积结果的数组（默认为a的新拷贝）
 * @returns 存放点积结果的数组
 */
export function dotProduct<T extends number = number>(
	a: xPoint<T>,
	b: xPoint<T>,
	target: xPoint<T> = a.copy()
): xPoint<T> {
	for (let i: uint = 0; i < a.length; ++i) {
		;(target[i] as number) = a[i] * b[i]
	}
	return target
}

// * 后面是更多面向应用的「专用化函数」 * //

/**
 * 直投影
 * * 逻辑：多余维度⇒去除，缺少维度⇒补数
 * * 用于不同维度之间点的坐标转换
 *
 * ! 原地操作：会改变传入的坐标点
 *
 * @param p 需要被投影的点
 * @param targetNDim 要投影到的目标维度
 * @param padValue 缺少维度时填充的值
 */
export function straightProjection<T extends number>(
	p: xPoint<T>,
	targetNDim: uint,
	padValue: T
): xPoint<T> {
	// 目标维度 > 点维度：填充
	for (let i: uint = p.length; i < targetNDim; ++i) p[i] = padValue
	// 目标维度 < 点维度：舍弃
	p.length = targetNDim
	// 返回
	return p
}

/**
 * 展开投影
 * * 在一个「固定尺寸」的「更低维空间」种，将更高维的点投影到能一一对应的点，并且按照指定的方向平铺
 * * 例如：基于「切片」的二维投影 [0, 12, 1] ==y=> [0, 12+24, 0]
 *
 * TODO: 有待实现
 */
void function unfoldProject<T extends number = number>(
	projectBox_min: xPoint<T>,
	projectBox_max: xPoint<T>,
	target: xPoint<T>
) {}

/**
 * 将一个高维点展开在二维（屏幕）上，以便呈现高维内容
 * * 目前只适用于「高维→二维」的情况
 * * 若对算法本身印象模糊，可以参考Git历史版本
 *
 * @param sizes 原空间的尺寸（使用前两个轴x、y进行投影）
 * @param target 被投影的点
 * @param result 投影的目标坐标（元组）
 * @returns 投影的目标元组
 *
 * @example AxBx2x2的四维投影 belike
 * |-----|
 * | z=1 |
 * | w=1 |
 * |-----| ↓往下挪移
 * | z=2 |
 * | w=1 |
 * |-----| ↓z轮完了，到w增加
 * | z=1 |
 * | w=2 |
 * |-----|
 * | z=2 |
 * | w=2 |
 * |-----|
 *
 * @example 代码测试：
 *  const sizes = new iPoint(2, 2, 2, 2)
 *
 * const targets = [
 * 	new iPoint(0, 0, 0, 0),
 * 	new iPoint(0, 0, 1, 0),
 * 	new iPoint(0, 0, 0, 1),
 * 	new iPoint(0, 0, 1, 1),
 * ]
 * for (const target of targets) {
 * 	console.log(target, '=>', unfoldProject2D(sizes, target))
 * 	target[2]++
 * }
 *
 * `测试结果：
 * { L=0 l=[ 2, 2, 1, 2 ] } | intPoint(4) [ 0, 0, 0, 0 ] => [ 0, 0 ]
 * { L=1 l=[ 2, 2, 1, 2 ] } | intPoint(4) [ 0, 0, 1, 0 ] => [ 0, 2 ]
 * { L=2 l=[ 2, 2, 1, 2 ] } | intPoint(4) [ 0, 0, 0, 1 ] => [ 0, 4 ]
 * { L=3 l=[ 2, 2, 1, 2 ] } | intPoint(4) [ 0, 0, 1, 1 ] => [ 0, 6 ]
 * `
 */
export function unfoldProject2D<T extends number = number>(
	// ! 需要提供所有维度上的尺寸，以便为「切片展开」奠定边界
	sizes: xPoint<T>,
	target: xPoint<T>,
	padAxis: uint = 1, // 默认y轴
	result: [T, T] = [target[0], target[1]]
): [T, T] {
	// * 处理平凡情况：目标和尺寸不足二维
	if (sizes.length < 2 || target.length < 2)
		throw new Error('unfoldProject2D: 目标和尺寸维数不足二维')
	// * 处理平凡情况：目标和尺寸维数相同且为2维
	else if (sizes.length === target.length && sizes.length == 2) {
		// 直接等于
		result[0] = target[0]
		result[1] = target[1]
	}
	// * 一般情况
	else {
		// 从自身位置开始
		result[0] = target[0]
		result[1] = target[1]
		// * 然后将「高维信息」转换为「低维的『盒子之外的展开』的长度增量」
		;(result[padAxis] as number) +=
			unfoldProjectPadBlockLength(sizes, target) * sizes[padAxis]
	}
	// 返回结果
	return result
}

/**
 * 此即「切片展开」中{@link unfoldProject2D}中出现的`L`值
 * * 这里的「L值」是「方块长度」而非「地图长度的『方块长度』」
 *   * 只能是「地图长度的倍数」
 * * 核心算法：`L = ∑^nDim_{i=2} (target_i * ∏^i_{j=1} (size_j / size_2) )`
 *   * `target_i`代表「高维溢出的部分」
 *   * `∏^i_{j=1} (size_j / size_2)`代表「累积乘积」
 *
 * ! 注意：「L值」的计算结果是「地图长度的倍数**增量**」，在实际使用时
 */
export function unfoldProjectPadBlockLength<T extends number = number>(
	// ! 需要提供所有维度上的尺寸，以便为「切片展开」奠定边界
	sizes: xPoint<T>,
	target: xPoint<T>
): uint {
	/** 目标值 */
	let L: uint = 0
	/** 用于累积求积的「尺寸乘积系数」 */
	let prod_size: uint = 1
	// 遍历，边计算乘积边累积 //
	// 处理`i=2`的「特殊情况」
	L += target[2]
	// 从`i=3`开始，类似「进位制遍历」
	for (let i = 3; i < target.length; i++) {
		// 计算「尺寸乘积系数」
		prod_size *= sizes[i - 1] // ! 这里要偏移一位，对应公式`∏^i_{j=1} (size_j / size_2)`中的`/ size_2`
		// 计算「目标值」
		L += prod_size * target[i]
	}
	// 返回
	return L
}
