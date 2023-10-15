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
 * Choose an index in an array that regard the content as weights
 * @param weights the weight of random
 * @returns the selected index of the weight
 */
export function randomByWeight(weights: number[]): uint {
	if (weights.length === 0) throw new Error('根本就没有要随机选择的对象！')
	if (weights.length === 1) return 0

	const all: number = exMath.sum(weights)
	const r: number = exMath.randomFloat(all)
	for (let i = 0; i < weights.length; i++) {
		const N = weights[i]
		let rs = 0
		for (let l = 0; l < i; l++) rs += weights[l]
		// console.log(R+'|'+(rs+N)+'>R>='+rs+','+(i+1))
		if (r <= rs + N) return i
	}
	console.error(weights, all, r)
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
 */
export function mapObject(
	obj: any,
	kF: (arg: any) => any,
	vF: (arg: any) => any,
	target: any = {}
): any {
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
 * 像「字典」一样「用字符串查询值」的对象
 */
export type dictionaryLikeObject = {
	[key: string]: any
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
	obj: dictionaryLikeObject,
	separator: string = '.',
	prefix: string = ''
): dictionaryLikeObject {
	const result: dictionaryLikeObject = {}
	for (const key in obj) {
		if (!obj.hasOwnProperty(key)) continue
		const value = obj[key]
		console.log(key, value)
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
