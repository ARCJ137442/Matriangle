/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { int, uint, uint$MAX_VALUE, Class } from '../legacy/AS3Legacy'
import { DisplayObject, DisplayObjectContainer } from '../legacy/flash/display'
import * as exMath from './exMath'

//============Math Methods============//
export function NumberToPercent(x: number, floatCount: uint = 0): string {
	if (floatCount > 0) {
		const pow: uint = 10 ** floatCount
		const returnNum: number = Math.floor(x * pow * 100) / pow
		return returnNum + '%'
	}
	return Math.round(x * 100) + '%'
}

export function NTP(x: number, floatCount: uint = 0): string {
	return NumberToPercent(x, floatCount)
}

/**
 * Lock uint[0,uint$MAX_VALUE] into Number[0,1].
 * @param	value	uint.
 * @return	Number between 0~1.
 */
export function uintToPercent(value: uint): number {
	return value / uint$MAX_VALUE
}

/**
 * The reverse  based :uintToPercent.
 * @param	value	Number 0~1.
 * @return	uint.
 */
export function percentToUint(value: number): uint {
	return uint(value * uint$MAX_VALUE)
}

//============Display Methods============//
export function removeChildIfContains(
	parent: DisplayObjectContainer,
	child: DisplayObject
): void {
	if (child !== null && parent.contains(child)) parent.removeChild(child)
}

export function clearChildren(container: DisplayObjectContainer): void {
	while (container.numChildren > 0) {
		container.removeChildAt(0)
	}
}

//============Boolean Methods============//
export function randomBoolean(
	trueWeight: uint = 1,
	falseWeight: uint = 1
): boolean {
	return exMath.randomFloat(trueWeight + falseWeight) < trueWeight
}

export function randomBoolean2(chance: number = 0.5): boolean {
	return Math.random() <= chance
}

export function binaryToBooleans(bin: uint, length: uint = 0): boolean[] {
	const l: uint = Math.max(bin.toString(2).length, length)
	const v: boolean[] = new Array<boolean>(Boolean(l), true) // ???
	for (let i: uint = 0; i < l; i++) {
		v[i] = Boolean((bin >> i) & 1)
	}
	return v
}

export function booleansToBinary(...boo: boolean[]): uint {
	const args: boolean[] = new Array<boolean>()

	for (let i: uint = 0; i < boo.length; i++) {
		args[i] = boo[i]
	}
	return booleansToBinary2(args)
}

export function booleansToBinary2(boo: boolean[]): uint {
	const l: uint = boo.length

	let uin: uint = 0

	for (let i: int = l - 1; i >= 0; i--) {
		uin |= uint(boo[i]) << i
	}
	return uin
}

//============String Methods============//
export function hasSpellInString(spell: string, string: string): boolean {
	return string.toLowerCase().indexOf(spell) >= 0
}

export function startswith(string: string, start: string): boolean {
	return string.indexOf(start) == 0
}

//============Array Methods============//
export function randomIn<T>(array: T[]): T {
	return array[exMath.randInt(array.length)]
}

export function randomInParas<T>(...paras: Array<T>): T {
	return randomIn(paras)
}

/**
 * 数组计数
 */
export function countIn<T>(P: (item: T) => boolean, array: T[]): uint {
	let result: uint = 0
	for (let i = 0; i < array.length; i++) {
		if (P(array[i])) result++
	}
	return result
}

/**
 * 原地映射
 *
 * @param arr 待映射的数组
 * @param mapF 映射函数
 */
export function inplaceMapIn<T>(arr: T[], mapF: (item: T) => T): T[] {
	for (let i = 0; i < arr.length; i++) arr[i] = mapF(arr[i])
	return arr
}

/**
 * 随机挑选，但排除某个元素
 *
 * ! 确保要排除的元素在数组内
 *
 * @param array 随机范围
 * @param excepts （数组中唯一的）要排除的对象
 */
export function randomWithout<T>(array: T[], excepts: T): T {
	const result: T =
		array[exMath.randModWithout(array.indexOf(excepts), array.length)]
	// 还是等于，就启用filter（性能&正确性考量）
	return result === excepts
		? randomIn(array.filter(item => item !== excepts))
		: result
}

/**
 * 从一个数组经过一定运算得到一个「累计分布」
 * * 例如：求一个数组中所有数的「和数组」，其中和的分布从0开始依次增大
 *
 * @param array 被累积的函数
 * @param cumulateF 将两个值进行合并累积的函数
 * @returns 累积结果（与「被累积数组」相同长度的数组，且首个元素与第一个「被累积元素」相同）
 *
 * @example cumulate([3,2,1], (x,y) => x + y) == [3,5,6]
 */
export function cumulate<T>(array: T[], cumulateF: (t1: T, t2: T) => T): T[] {
	// 长度为零⇒返回本身
	if (array.length === 0) return []
	/** 相同长度的返回值数组 */
	const result: T[] = new Array<T>(array.length)
	// 设置首个值
	result[0] = array[0]
	// 从0开始累积
	for (let i = 1; i < array.length; i++) {
		result[i] = cumulateF(result[i - 1], array[i])
	}
	// 返回结果
	return result
}

/**
 * 在数组中选择一个将内容视为权重的索引
 * * 索引权重核心公式：// `P(return i) = weights[i] / sum(weights)` //
 *
 * @param weights 权重随机的权重
 * @returns 权重的选定索引，概率分布如上述公式
 */
export function randomByWeight(weights: number[]): uint {
	// 处理「长度过短」的情况
	if (weights.length === 0) throw new Error('根本就没有要随机选择的对象！')
	if (weights.length === 1) return 0

	/** 对数组进行累积 */
	const cumulatedWeights: number[] = cumulate(weights, exMath.plus)
	/** 随机探针：在「0~sum(weights)」之间取一个随机数 */
	const randomProbe: number = exMath.randomFloat(
		cumulatedWeights[cumulatedWeights.length - 1]
	)

	// 基于区间的二分查找（区分三个区间，优先看「是否等于」）
	/**
	 * 返回值
	 * * 初值：取中点
	 * * 最终情况：`cumulatedWeights[result-1] ?? 0 < randomProbe < cumulatedWeights[result]`
	 *   * 这时候`weights[result]`正好对应于`randomProbe`
	 */
	let result: uint = weights.length >> 1
	/**
	 * 区间左端点
	 * * 若`result===0`，其为`0`
	 * * 否则为`cumulatedWeights[result-1]`
	 */
	let left: number, right: number
	/** 返回值对应 */
	while (0 <= result && result < weights.length) {
		/* console.log(
			'while',
			cumulatedWeights,
			result,
			`(${left}, ${right}]`,
			randomProbe
		) */
		// * 计算区间左右端点
		left = result === 0 ? 0 : cumulatedWeights[result - 1]
		right = cumulatedWeights[result]
		// * 比「左端点」还左⇒左边切半
		if (randomProbe < left) {
			// * `result = (result + 0) / 2`等价的「移位写法」
			result >>= 1
		}
		// * 比「右端点」还右⇒右边切半
		else if (randomProbe >= right) {
			// ! 这里是「大于等于」，因为「随机探针」生成的区间是`[0, sum(weights))`不包含右边
			// * `result = (result + sum(weights)) / 2`等价的写法
			result += (cumulatedWeights.length - result) >> 1
		}
		// * 在区间内⇒返回
		else return result
	}
	/* let lo: uint = 0 // ? 「两个范围中间夹」和「一个指针到处走」可能是等价的
	let hi: uint = cumulatedWeights.length - 1
	while (lo < hi) {
		const mid: uint = (lo + hi) >> 1
		if (cumulatedWeights[mid] < randomProbe) lo = mid + 1
		else hi = mid
	} */

	console.error(weights, cumulatedWeights)
	throw new Error('加权随机：未正常随机到结果！')
}

/**
 * 对参数加权随机
 * @param weights 权重集（以任意长参数形式出现）
 * @returns 其中一个元素的索引
 */
export function randomByWeight_params(...weights: number[]): number {
	return randomByWeight(weights)
}

/**
 * 加权随机：按「值表、权重表」从中按权选出索引
 */
export function randomByWeight_KW<T>(values: T[], weights: number[]): T {
	return values[randomByWeight(weights)]
}

/**
 *
 * @param weightMap 权重映射：元素→权重
 * @returns
 */
export function randomInWeightMap<T>(weightMap: Map<T, number>): T {
	// 尺寸=1 ⇒ 唯一键
	if (weightMap.size == 1) return weightMap.keys().next().value as T

	// 拆解成顺序数组
	const elements: T[] = []
	const weights: number[] = []
	weightMap.forEach((value, key): void => {
		elements.push(key)
		weights.push(value)
	})

	// 索引对照
	return elements[randomByWeight(weights)]
}

/**
 * 对（一般是JS对象的）对象的键值对作映射，并返回一个新的（JS）对象
 * * 这里是「分别映射」
 * * 因为「JS对象存储」的需要，这里暂时都变成`any`类型
 */
export function mapObject<V = any, VT = any>(
	obj: { [k: key]: V },
	kF: (arg: key) => key,
	vF: (arg: V) => VT,
	target: { [k: key]: VT } = {}
): { [k: key]: VT } {
	for (const k in obj) target[kF(k)] = vF(obj[k])
	return target
}

/**
 * 向一个数组`push`一个对象后，返回该对象
 */
export function pushNReturn<T>(arr: T[], item: T): T {
	arr.push(item)
	return item
}

/**
 * 向一个对象添加一个属性，然后返回该属性
 */
export function addNReturn<T, K extends keyof T>(
	obj: T,
	key: K,
	value: T[K]
): T[K] {
	obj[key] = value
	return value
}

/**
 * 向一个对象添加一个属性，然后返回该属性的键
 */
export function addNReturnKey<T, K extends keyof T>(
	obj: T,
	key: K,
	value: T[K]
): K {
	obj[key] = value
	return key
}

/**
 * 安全合并
 * * 判断旧值与新值`typeof`的类型是否相同，同⇒返回新值|异⇒报错
 * * 一般用于「安全从JS对象载入数据」如`copyFromObject`方法中
 */
export function safeMerge<T>(oldVal: T, newVal: any): T {
	if (typeof oldVal === typeof newVal) return newVal
	throw new Error(`safeMerge: 旧值${oldVal}、新值${newVal}类型不同`)
}

/**
 * 在赋值前检查类型是否一致，但是「软检查」
 * * 何为「软」：可使用通配符`undefined`逃过类型检查
 * * 应用：在要检查的类型是一个「不便检查的接口」时，使用通配符逃过检查
 *   * 例如：在「要设置的JS对象」中，不会出现`undefined`
 */
export function softMerge<T>(oldVal: T, newVal: any | undefined): T {
	if (newVal === undefined || typeof oldVal === typeof newVal) return newVal
	throw new Error(`safeMerge: 旧值${oldVal}、新值${newVal}类型不同`)
}

export function getPropertyInObjects(objects: object[], key: string): any[] {
	const ra: any[] = new Array<any>()

	for (let i: uint = 0; i < objects.length; i++) {
		if (key in objects[i]) {
			ra.push((objects[i] as any)?.[key]) // if not have value, do not return
		}
	}
	return ra
}

/**
 * @param arr array
 * @param input element
 * @returns whether the element instanceof contains in array
 */
export function contains<T>(arr: T[], input: T): boolean {
	return arr.indexOf(input) >= 0
}

export function spliceAndReturnCount<T>(
	arr: T[],
	input: T | T[],
	count: uint = 0
): uint {
	if (isEmptyArray(arr)) {
		return 0
	}
	let tempCount: uint = count

	for (let ts: uint = arr.length - 1; ts >= 0; ts--) {
		if (count == 0 || tempCount > 0) {
			if (input instanceof Array) {
				if (contains(input, arr[ts])) {
					arr.splice(ts, 1)
					if (tempCount > 0) tempCount--
				}
			} else if (arr[ts] == input) {
				arr.splice(ts, 1)
				if (tempCount > 0) tempCount--
			}
		} else {
			break
		}
	}
	return count - tempCount
}

export function isEmptyArray<T>(A: Array<T> | null): boolean {
	return A === null || A.length < 1
}

export function isEmptyString(S: string): boolean {
	return S === null || S.length < 1
}

export function clearArray<T>(arr: Array<T>): void {
	// * 直接设定长度，JS会自动清除
	arr.length = 0
}

export function isEqualArray<T>(A: T[], B: T[]): boolean {
	if (A.length != B.length) {
		return false
	} else {
		for (let i = 0; i < A.length; i++) {
			if (A[i] != B[i]) {
				return false
			}
		}
		return true
	}
}

//============Object Methods============//

export function isEqualObject(
	a: { [key: string]: [value: any] },
	b: { [key: string]: [value: any] },
	ignoreUnique: boolean = false,
	ignoreVariable: boolean = false,
	notDetectB: boolean = false
): boolean {
	for (const i in a) {
		const fa: any = a[i]
		if (ignoreUnique || b.hasOwnProperty(i)) {
			const fb: any = b[i]
			if (!ignoreVariable) {
				if (isPrimitiveInstance(fa) == isComplexInstance(fb)) {
					return false
				} else if (isPrimitiveInstance(fa)) {
					if (fa != fb) {
						return false
					}
				} else {
					if (!isEqualObject(fa, fb)) {
						return false
					}
				}
			}
		} else {
			return false
		}
	}
	if (!notDetectB) {
		if (!isEqualObject(b, a, ignoreUnique, ignoreVariable, true)) {
			return false
		}
	}
	return true
}

/**
 * 合并一个映射表到另一个映射表
 * * 映射覆盖规则：后者覆盖前者
 *
 * @param a 要合并入的映射表
 * @param b 提供键值对的映射表
 * @param 合并后的映射表
 */
export function mergeMaps<K, V>(a: Map<K, V>, b: Map<K, V>): Map<K, V> {
	for (const [key, value] of b) {
		a.set(key, value)
	}
	return a
}

/**
 * 合并多个映射表到一个映射表
 * * 映射覆盖规则：后者覆盖前者
 *
 * @param a 要合并入的映射表
 * @param b 提供键值对的所有映射表
 * @param 合并后的映射表
 */
export function mergeMultiMaps<K, V>(
	a: Map<K, V>,
	...bs: Map<K, V>[]
): Map<K, V> {
	for (const b of bs) {
		for (const [key, value] of b) {
			a.set(key, value)
		}
	}
	return a
}

/**
 * 合并两个记录
 * * {@link target}可为空：此时相当于（浅）拷贝source中的内容
 *
 * @param source 需要选取键值对合并的记录
 * @param target 键值对合并的目标记录
 * @param mergeCallback 合并的回调函数，默认选取「原记录」的值
 * @returns 合并后的目标记录
 */
export function mergeRecords<K extends key | symbol, V>(
	source: Record<K, V>,
	target: Record<K, V>,
	mergeCallback: (sourceV: V, targetV: V) => V = _temp_choose_first
): Record<K, V> {
	for (const k in source) {
		target[k] = mergeCallback(source[k], target[k])
	}
	return target
}
const _temp_choose_first = <V>(v1: V, v2: V): V => v1

/**
 * 从对象构建映射
 * @param obj 要变成映射的对象
 * @returns 对象变成的映射
 */
export function MapFromObject<K extends key, V>(obj: { [key in K]: V }): Map<
	K,
	V
> {
	return new Map<K, V>(Object.entries(obj) as [K, V][])
}

/**
 * 从「基础对象列表」构建「键值对映射表」
 *
 * @param basis 用于构造键值对的「基础对象列表」
 * @param kF 基础对象⇒键
 * @param vF 基础对象⇒值
 * @returns 一个键值对映射表
 */
export function MapFromGeneratorKV<B, K extends key, V>(
	basis: B[],
	kF: (b: B) => K,
	vF: (b: B) => V
): Map<K, V> {
	const map: Map<K, V> = new Map<K, V>()
	for (const base of basis) {
		map.set(kF(base), vF(base))
	}
	return map
}

/**
 * 上一个「键值对映射表」的特殊情况：基础对象=键
 *
 * @param keys 所有键的列表
 * @param vF 键⇒值
 * @returns 构造出来的映射表
 */
export function MapFromGeneratorK<K extends key, V>(
	keys: K[],
	vF: (k: K) => V
): Map<K, V> {
	return MapFromGeneratorKV(keys, identity, vF)
}

export const isDefined = (obj: unknown): boolean => obj !== undefined
export const isInvalidNumber = (num: unknown): boolean =>
	num === undefined || isNaN(num as number)

export function isPrimitiveInstance(v: unknown): boolean {
	return (
		v === undefined ||
		v === null ||
		typeof v === 'boolean' ||
		typeof v === 'number' ||
		typeof v === 'bigint' ||
		typeof v === 'string' ||
		typeof v === 'symbol'
	)
}

export function isComplexInstance(v: any): boolean {
	return !isPrimitiveInstance(v)
}

// ! 索引签名参数类型不能为文本类型或泛型类型。请考虑改用映射的对象类型。ts(1337)
/* export type Records<K extends string | number | symbol, V> = {
	[k: K]: V
} */

/**
 * 像「字典」一样「用字符串/数值/符号查询值」的对象
 */
export type DictionaryLikeObject<V = any> = {
	// ! 不要尝试改动这里的`string`：索引签名参数类型不能为文本类型或泛型类型。请考虑改用映射的对象类型。ts(1337)
	[key: string | number | symbol]: V
}

/**
 * 合并两个对象的键值对
 * * 使用`hasOwnProperty`判断对象「有哪些键」
 * * 键重复⇒新的覆盖旧的
 *
 * ! 浅拷贝：只会合并一层引用
 *
 * @param from 合并的数据来源（对象）
 * @param to 要合并到的对象
 * @returns 合并后的数据对象
 */
export function mergeObject(from: any, to: any): any {
	for (const i in from) {
		if (from.hasOwnProperty(i)) {
			to[i] = from[i]
		}
	}
	return to
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
	obj: DictionaryLikeObject,
	separator: string = '.',
	prefix: string = ''
): DictionaryLikeObject {
	const result: DictionaryLikeObject = {}
	for (const key in obj) {
		if (!obj.hasOwnProperty(key)) continue
		const value = obj[key]
		console.log('flattenObject:', key, value)
		if (isPrimitiveInstance(value)) result[prefix + key] = value
		else
			mergeObject(
				flattenObject(value, separator, prefix + key + separator),
				result
			)
	}
	return result
}

/**
 * Get the class from a object.
 *
 * * `getClass(new A()) === A` instanceof partial equals to `new A() instanceof A`,
 *   * which the former can not match the superclass of A
 *
 * @param instance the instance of a class
 * @returns the class(constructor) of the instance
 */
export function getClass(instance: any): Class | undefined {
	return instance?.constructor
}

/**
 * 判断「一个类是否可以被另一个类所替换」
 * 继承自Julia的`<:`运算符（使用如`C1 <: C`）
 * @param C1 子类
 * @param C 超类
 * @returns 子类是否可替换超类
 */
export function isExtend(C1: Class, C: Class): boolean {
	return C1 === C || C1.prototype instanceof C
}

/**
 * 扩展而来的「具体类」
 * * 拥有构造函数签名
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConcreteClass<T = unknown, Args extends any[] = any[]> = {
	new (...args: Args): T
}

/**
 * 包括「抽象类」和「具体类」的构造函数
 */
export type Constructor<T = any, Args extends Array<any> = any[]> =
	| (new (...args: Args) => T)
	| (abstract new (...args: Args) => T)

export type ConcreteClassConstructor<T extends Constructor> = new (
	...args: ConstructorParameters<T>
) => InstanceType<T>

/**
 * 单位函数
 * * 映射结果即返回自身
 *
 * @param x 输入
 * @returns 输入量自身
 */
export const identity = <T>(x: T): T => x

/**
 * 纯空函数
 * * 零参数
 * * 空返回
 */
export type voidF = () => void
/**
 * （零输入/单输入）空值函数
 * * 不管输入任何结果，都只会返回空值（`undefined`）
 *
 * !【2023-10-14 11:20:37】使用`void 0`比使用`void x`性能更佳（这个`void`语句会在编译后的JS中保留）
 */
export const omega = (x?: unknown): void => void 0

/**
 * 空值函数
 * * 不管输入任何结果，都只会返回空值（`undefined`）
 */
export const omegas = (...args: unknown[]): void => undefined

/**
 * 根据索引生成数组
 *
 * @param length 数组的长度
 * @param f 「索引→元素」映射
 * @returns 一个指定类型的数组，满足`arr[i] = f(i)`
 */

export function generateArray<T>(length: uint, f: (index: uint) => T): T[] {
	const arr: T[] = new Array<T>(length)
	for (let i = 0; i < length; i++) arr[i] = f(i)
	return arr
}

/** 可以用来索引对象值的索引类型 */
export type key = string | number /*  | symbol */ // ? 【2023-10-07 21:24:37】是否要加入symbol，待定

/** 可空对象 */ // ! 【2023-09-20 20:42:40】目前不启用：这种类型会徒增很多耦合
export type Nullable<T> = T | null

/**
 * 明确标识「引用类型」
 * * 应用：使用「原地操作」改变参数的函数参数类型
 */
export type Ref<T> = T

/**
 * 明确标识「值类型」
 * * 应用：「（使用`new`等）创建一个新对象」的函数返回值
 */
export type Val<T> = T

/**
 * 标识「就是泛型类型自身」
 */
export type Identity<T> = T

/**
 * 标识「所有键变得可选」
 * * 原理：将一个类型中所有的键都变成「可选参数」状态
 * * 应用：响应式、部分式远程更新中的「部分更新」机制
 *   * 如：原先是{x, y}的只需传入{x}
 *
 * ! 只会让其内部**直接统属**的所有键变得可选
 */
export type Optional<T> = { [K in keyof T]?: T[K] }

/**
 * 标识「所有键变得可用」，但是递归
 * * 和{@link Optional}的唯一区别是：递归将其内所有属性变得「可选」
 *
 * ! 不会影响{@link Primitive 原始类型}
 */
export type OptionalRecursive<T> = { [K in keyof T]?: OptionalRecursive<T[K]> }

/**
 * 标识「所有键变得可用」，但递归且保护原始类型
 * * 和{@link OptionalRecursive}的唯一区别：
 *   * 递归不会影响到原始类型，并且不会让数组变得「可选」
 *   * 编写的初衷：让数组元素不再变成`(T|undefined)[]`
 */
export type OptionalRecursive2<T> = {
	[K in keyof T]?: T[K] extends unknown[] ? T[K] : OptionalRecursive2<T[K]>
}

/**
 * 定义「原始类型」：
 * * 除数组、对象在内
 * * 所有的「可用简单字面量表示的类型」
 */
export type Primitive = string | number | boolean | symbol | null | undefined

/**
 * 字典值迁移
 * * 逻辑：将一个值从字典的一个键移动到另一个键上
 * * 原先的键会被删除
 *
 * ! 不会检测「原键是否存在」
 */
export function moveMapValue<K, V>(map: Map<K, V>, fromKey: K, toKey: K): void {
	// 先设置值
	map.set(toKey, map.get(fromKey)!)
	// 后删除原键
	map.delete(fromKey)
}

/**
 * 对象值迁移
 * * 逻辑：将一个值从对象的一个键移动到另一个键上
 * * 原先的键会被删除
 *
 * ! 不会检测「原键是否存在」
 */
export function moveObjectValue<K, V>(
	obj: DictionaryLikeObject<V>,
	fromKey: K,
	toKey: K
): void {
	// 先设置值
	;(obj as any)[toKey] = (obj as any)[fromKey]
	// 后删除原键
	delete (obj as any)[fromKey]
}

/**
 * 对象键映射
 * * 逻辑：根据「键映射对象」把原对象的键进行移动
 * @example
 * const obj = {
 * 	a: 1,
 * 	b: 2,
 * 	c: 3,
 * }
 * console.log(mapObjectKey(obj, {
 * 		a: 'a1',
 * 		b: 'b2',
 * 		c: 'c',
 * 		d: '0',
 * 	}))
 * * 结果：{ c: 3, a1: 1, b2: 2 }
 */
export function mapObjectKey<V>(
	obj: DictionaryLikeObject<V>,
	keyMap: DictionaryLikeObject<key>
): DictionaryLikeObject<V> {
	for (const [oldKey, newKey] of Object.entries(keyMap)) {
		if (oldKey in obj && oldKey !== newKey)
			moveObjectValue<key, V>(obj, oldKey, newKey)
	}
	return obj
}

/**
 * 用于表征一个对象「具体路径」的图式
 * * 支持使用`null`作为通配符
 */
export type DictPathPattern = (key | null)[]
/** 用于表征一个对象的具体「路径」 */
export type DictPath = key[]

/**
 * 对象模式替换
 * * 依赖于所给的路径，从对象路径中找到符合要求的子路径（不一定是头尾）以进行批量替换
 * * 可使用`null`作为「匹配任意对象」的通配符
 *   * 如`['a', null, 'b']`匹配`a.a.b`、`a.c.b`等
 * * 例如：
 *   * 头部替换：从`a.b.c`中查找模式`a.b`，并最终替换掉`a.b`的值
 *   * 尾部替换：从`a.b.c`中查找模式`b.c`，并最终替换掉`a.b.c`的值
 *   * 中部替换：从`a.b.c.d`中查找模式`b.c`，并最终替换掉`a.b.c`的值
 *
 * @param dict 待处理对象
 * @param pattern 需要查找的模式
 * @param replaceF 模式替换回调（亦可执行其它代码）
 * @returns 模式替换后的对象
 *
 * @example 如下例子输出结果：{ a: { b: [ 1, 1, 2 ], c: 3 }, b: 2 }
 * console.log(DictionaryPatternReplace({
 *     a:{
 *         b:[0,1,2],
 *         c:3
 *     },
 *     b:2
 * },['a','b',0],(v:unknown):number=>v as number+1))
 */
export function dictionaryPatternReplace<V>(
	dict: DictionaryLikeObject<V>,
	pattern: DictPathPattern,
	replaceF: (v: V) => V
): DictionaryLikeObject<V> {
	_dictionaryPatternReplace(dict, pattern, replaceF)
	return dict
}

// 用于将所有WS 服务替换为直连
// 递归在所有键上搜索，直到根模式匹配
function _dictionaryPatternReplace<V>(
	dict: DictionaryLikeObject<V>,
	pattern: DictPathPattern,
	replaceF: (v: V) => V
): void {
	/** 根部是否为通配 */
	const isRootUniversal: boolean = pattern[0] === null
	// 搜索对象的一层路径
	for (const key in dict) {
		// 匹配当前深度的key⇒用「头匹配」 && 深度到达模式极限⇒末端替换
		if (
			isRootUniversal ||
			key == pattern[0] // !这里需要「不严格相等」，以便数值类型自动转换为字符串
		) {
			dictionaryPatternReplaceHead(
				dict[key] as DictionaryLikeObject<V>,
				pattern,
				replaceF,
				1 // ! 这时候永远是相对的，`a.b`可能出现在`a.b.c.d`也可能出现在`c.a.b.d`，∴只需要深入1次（因为「根匹配」深入了一层）
			)
		} else if (
			isComplexInstance(dict[key]) // * 只有在目标是「复合对象」时深入
		) {
			// 递归深入，不记录深度，直到匹配
			_dictionaryPatternReplace(
				dict[key] as DictionaryLikeObject<V>,
				pattern,
				replaceF
			)
		}
	}
}

/**
 * 对象头部模式替换
 * * 参见{@link dictionaryPatternReplace}
 * * 这个算法的约束在于：只能从根目录开始匹配，无法在a.b.c中识别b.c
 *
 * @param dict 要搜索替换的对象
 * @param pattern 搜索替换的路径图式
 * @param replaceF 替换函数
 * @param currentPatternDepth 当前的搜索深度，如`1`和`a.b.c`可以被图式`b.c`匹配
 */
export function dictionaryPatternReplaceHead<V>(
	dict: DictionaryLikeObject<V>,
	pattern: DictPathPattern,
	replaceF: (v: V) => V,
	currentPatternDepth: uint = 0
): void {
	/** （指定深度的）模式是否为通配 */
	const isPatternUniversal: boolean = pattern[currentPatternDepth] === null
	// 搜索对象的一层路径
	for (const key in dict) {
		// 匹配当前深度的key 否则⇒深入 && 深度到达模式极限⇒末端替换
		if (
			isPatternUniversal ||
			key == pattern[currentPatternDepth] // !这里需要「不严格相等」，以便数值类型自动转换为字符串
		) {
			// 完全匹配⇒末端替换
			if (currentPatternDepth === pattern.length - 1) {
				// 找到⇒替换 // ! 不会考虑是否为「枝叶」，也就是说可能替换到分支节点如值`{a:1}`
				dict[key] = replaceF(dict[key])
			} else if (
				isComplexInstance(dict[key]) // * 只有在目标是「复合对象」时深入
			) {
				dictionaryPatternReplaceHead(
					dict[key] as DictionaryLikeObject<V>,
					pattern,
					replaceF,
					currentPatternDepth + 1
				)
			}
		}
	}
}

/**
 * 链式应用函数到指定对象上
 * @example 输出=3
 * chainApply(
 * 	1,
 * 	x => x + 1,
 * 	x => x + 1
 * )
 *
 */
export function chainApply<T>(obj: T, ...fs: ((t: T) => T)[]): T {
	return fs.length === 0 ? obj : chainApply(fs[0](obj), ...fs.slice(1))
}
