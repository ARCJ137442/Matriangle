import { int, uint } from '../legacy/AS3Legacy'
import { IJSObjectifiable, JSObject, JSObjectifyMap } from './JSObjectify'
import { intAbs } from './exMath'

/**
 * 所有类型点的基类
 * * 支持任意维度的几何点表征
 * * 在索引访问的基础上提供使用特定名称的几何方法
 * * 可选的「留给后续重载优化」的方法
 */
export abstract class xPoint<T> extends Array<T> implements IJSObjectifiable<xPoint<T>> {

	// JS对象化 //
	/** 实现：{自身类名: 原始值（数组）} */
	public saveToJSObject(target: JSObject): JSObject {
		target[this.constructor.name] = [...this]; // ! `this.slice();`不能达到「抹除类型」的目的
		return target;
	}

	/** 实现：读取与自身类名相同的值 */
	public loadFromJSObject(source: JSObject): xPoint<T> {
		let value: any = source[this.constructor.name];
		if (Array.isArray(value))
			value.forEach(
				(item, index: number): void => {
					if (this.checkType(item))
						this[index] = item
				}
			);
		return this;
	}

	/**
	 * 根据指定的类型检验数组中的值
	 */
	public checkType(value: any): boolean { return false };

	/**
	 * 【2023-09-24 14:46:08】假实现：调用⇒返回空
	 * * 【2023-09-24 16:32:38】不报错的缘由：判断「是否有定义属性」时要访问这个getter
	 *   * 代码：`property?.objectifyMap !== undefined // 第二个看「对象化映射表」是否定义`
	 * 
	 * * 💭「动态添加属性」的弊端：可以是可以，但这样不如直接存储数组来得方便
	 * 
	 */
	public get objectifyMap(): JSObjectifyMap { return {} }

	/** 这是个可扩展的映射表 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {};

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

	/** 显示点是否（在其长度内）有未定义量 */
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
	 * 
	 * ! 使用数组的方式拷贝，但类型不会变成数组
	 * 
	 * ! 注意：不建议在频繁调用的函数中使用
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
	 *	 * 便于其它地方使用「数组缓存技术」：先初始化一个空数组，需要的时候再把内容copy过去，避免「未初始化的维数」这样的情况
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身，与另一点相等
	 */
	public copyFrom(point: xPoint<T>): xPoint<T> {
		// 先把长度对齐
		this.length = point.length;
		// 然后逐一设置值
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
	 * @returns 返回自身
	 */
	public addFrom(point: xPoint<T>): xPoint<T> {
		for (let i = 0; i < point.length; i++) {
			this[i] += point[i] as any;
		}
		return this;
	}

	/**
	 * 从一个量广播附加坐标到此处
	 * * 原理：逐一广播增量赋值
	 * 
	 * ! 会修改自身
	 * 
	 * @returns 返回自身
	 */
	public addFromSingle(x: T): xPoint<T> {
		for (let i = 0; i < this.length; i++) {
			this[i] += x as any;
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
		let tempDistance: T = ((this[0] as any) - (point[0] as any)) as T;
		let distanceSquare: T = ((tempDistance as any) * (tempDistance as any)) as any;
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
	 * ! 不会检查两个数组的长度（点の维度），仅遍历「目标点」各分量
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
	 * 获取与另一个点「各方向『绝对距离取最大值』的第一个索引」
	 * 
	 * ! 不会检查两个数组的长度（点の维度），仅遍历「目标点」各分量
	 * 
	 * * 在有「绝对距离相等」的情况时，会优先保留前者
	 * 
	 * @param start 寻找的起始索引
	 */
	public indexOfAbsMaxDistance(point: xPoint<T>, start: uint = 0): uint {
		let result: uint = 0;
		let maxDistance: T | undefined = undefined;
		let tempDistance: T | undefined = undefined;
		for (let i = start; i < point.length; i++) {
			tempDistance = this.getAbsDistanceAt(point, i);
			if (maxDistance === undefined || (maxDistance as T) < tempDistance) {
				result = i
				maxDistance = tempDistance
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

	/** 实现：检测是否为整数 */
	public checkType(value: any): boolean {
		return Number.isInteger(value)
	}
}

/**
 * 经过特殊定制的浮点数点支持
 * * 基本全盘继承抽象类`xPoint`的方法
*/
export class floatPoint extends xPoint<number> {

	/** 实现：检测是否为数值 */
	public checkType(value: any): boolean {
		return typeof value === 'number'
	}

}


// 别名 //
export const iPoint = intPoint; // 作为值
export type iPoint = intPoint; // 作为类型
export const fPoint = floatPoint; // 作为值
export type fPoint = floatPoint; // 作为类型

/**
 * 📌类似一种「指针参数」的类型（别名）
 * * 🎯目标：（在类型上）区分「要自身存储的值」还是「无需存储的引用」
 * * ✨应用：在函数调用时区分「是复制新的值进函数，还是只需把引用传递过去」以及「就地更改是否影响函数之外的对象」
 */
export type iPointRef = iPoint
/** 同上，作为一种「引用/指针」类型 */
export type fPointRef = fPoint
/**
 * 📌相对于「引用类型」
 * * 🎯目标：标注这里需要一个新的「值」
 * * ✨应用：实体的坐标必须「掌握在自己手中」，所以必须要「自身存储值」
 */
export type iPointVal = iPoint
/** 同上，作为一种「引用/指针」类型 */
export type fPointVal = fPoint


// ! 缓存的变量
const _temp_forEachPoint: iPointVal = new iPoint();
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
	pMin: iPointRef, pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
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

const _temp_forEachPointFrame_Meta: iPointVal = new iPoint();
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
	pMin: iPointRef, pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: any[]
): void {
	// 缓存常量
	let p: iPointRef = _temp_forEachPointFrame_Meta;
	// 直接执行代码
	return eval(traverseNDSquare_Meta_Code(
		pMin, pMax,
		'f(p, ...args);'
	))
}
function traverseNDSquare_Meta_Code(
	pMin: iPointRef, pMax: iPointRef,
	f_str: string,
): string {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length; // !【2023-10-04 20:47:24】用空间复杂度还时间复杂度，避免不断访问
	// 循环生成专用代码
	let code: string = f_str;
	// for循环不断套壳
	for (let i: uint = 0; i < nDim; i++) {
		// * 边界直接当常量嵌入；原先的遍历作为每一个数组下标
		code = `for(p[${i}] = ${pMin[i]}; p[${i}] <= ${pMax[i]}; ++p[${i}]) {
			${code}
		};`
	}
	// 返回代码
	return code;
}

const _temp_forEachPointFrame: iPointVal = new iPoint();
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
	pMin: iPointRef, pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: any[]
): void {
	// 通过数组长度获取维数
	const nDim: uint = pMax.length;
	// 当前点坐标的表示：复制mins数组
	_temp_forEachPointFrame.copyFrom(pMin);
	/** 表示「当前正在进位的位」 */
	let i: uint = 0;
	/** 锁定的i：锁定后只能在「最大值/最小值」之间 */
	let iLocked: uint = 0;
	// 不断遍历，直到「最高位进位」后返回
	while (iLocked < nDim) {
		while (i < nDim) {
			// 执行当前点：调用回调函数
			f(_temp_forEachPointFrame, ...args)
			// 迭代到下一个点：不断循环尝试进位
			// 先让第i轴递增（或「锁定性递增」），然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
			i = 0;
			while (
				i < nDim && (
					i === iLocked ? // 锁定⇒直接从最小值递增到最大值
						(_temp_forEachPointFrame[i] += pMax[i] - pMin[i]) : // 这里必须再递增，不然会死循环
						++_temp_forEachPointFrame[i] // 否则正常递增
					// ?💭这或许可以被拆分成两个for循环
				) > pMax[i]
			) {
				// 旧位清零
				_temp_forEachPointFrame[i] = pMin[i];
				// 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
				++i
			}
		}
		iLocked++;
		i = 0;
	}
}

const _temp_forEachPointSurface: iPointVal = new iPoint();
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
	pMin: iPointRef, pMax: iPointRef,
	f: (p: iPointRef, ...args: any[]) => void,
	...args: any[]
): void {
	const p: iPointRef = _temp_forEachPointSurface;
	eval(traverseNDSquareSurface_Code(
		pMin, pMax,
		'f(p, ...args)'
	))
}
function traverseNDSquareSurface_Code(
	pMin: iPointRef, pMax: iPointRef,
	f_code: string
): string {
	const nDim = pMax.length;
	let code: string = ''

	let temp_code: string
	for (let iLocked: uint = 0; iLocked < nDim; ++iLocked) {
		// 从函数执行本身开始
		temp_code = f_code;
		let i: uint;
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
		code += temp_code;
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
export const verifyIntPoint = (p: iPointRef): boolean => p.every(Number.isInteger)
/** 上一个函数的有报错版本 */
export function verifyIntPointStrict(p: iPointRef): iPointRef {
	if (p.every(Number.isInteger)) return p
	else throw new Error(`点${p}不是整数点`)
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
		p[i] %= modP[i];
	}
	return p;
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
		p[i] %= modP[i];
	}
	return p;
}
