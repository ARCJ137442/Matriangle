import { int, uint, int$MAX_VALUE, int$MIN_VALUE, uint$MAX_VALUE, uint$MIN_VALUE, Class } from '../legacy/AS3Legacy'
import { DisplayObject, DisplayObjectContainer } from '../legacy/flash/display';
import * as exMath from './exMath';

//============Math Methods============//
export function NumberToPercent(x: number, floatCount: uint = 0): string {
	if (floatCount > 0) {
		let pow: uint = 10 ** floatCount;
		let returnNum: number = Math.floor(x * pow * 100) / pow;
		return returnNum + '%';
	}
	return Math.round(x * 100) + '%';
}

export function NTP(x: number, floatCount: uint = 0): string {
	return NumberToPercent(x, floatCount);
}

/**
 * Lock uint[0,uint$MAX_VALUE] into Number[0,1].
 * @param	value	uint.
 * @return	Number between 0~1.
 */
export function uintToPercent(value: uint): number {
	return value / uint$MAX_VALUE;
}

/**
 * The reverse  based :uintToPercent.
 * @param	value	Number 0~1.
 * @return	uint.
 */
export function percentToUint(value: number): uint {
	return uint(value * uint$MAX_VALUE);
}

//============Display Methods============//
export function removeChildIfContains(parent: DisplayObjectContainer, child: DisplayObject): void {
	if (child !== null && parent.contains(child))
		parent.removeChild(child);
}

export function clearChildren(container: DisplayObjectContainer): void {
	while (container.numChildren > 0) {
		container.removeChildAt(0);
	}
}

//============Boolean Methods============//
export function randomBoolean(trueWeight: uint = 1, falseWeight: uint = 1): boolean {
	return exMath.randomFloat(trueWeight + falseWeight) < trueWeight;
}

export function randomBoolean2(chance: number = 0.5): boolean {
	return (Math.random() <= chance);
}

export function binaryToBooleans(bin: uint, length: uint = 0): boolean[] {
	let l: uint = Math.max(bin.toString(2).length, length);
	let v: boolean[] = new Array<boolean>(Boolean(l), true); // ???
	for (let i: uint = 0; i < l; i++) {
		v[i] = Boolean(bin >> i & 1);
	}
	return v;
}

export function booleansToBinary(...boo: boolean[]): uint {
	let args: boolean[] = new Array<boolean>;

	for (let i: uint = 0; i < boo.length; i++) {
		args[i] = boo[i];
	}
	return booleansToBinary2(args);
}

export function booleansToBinary2(boo: boolean[]): uint {
	let l: uint = boo.length;

	let uin: uint = 0;

	for (let i: int = l - 1; i >= 0; i--) {
		uin |= uint(boo[i]) << i;
	}
	return uin;
}

//============String Methods============//
export function hasSpellInString(spell: string, string: string): boolean {
	return (string.toLowerCase().indexOf(spell) >= 0);
}

export function startswith(string: string, start: string): boolean {
	return (string.indexOf(start) == 0);
}

//============Array Methods============//
export function randomIn<T>(array: T[]): T {
	return array[exMath.randInt(array.length)];
}

export function randomInParas<T>(...paras: Array<T>): T {
	return randomIn(paras);
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
	let result: T = array[exMath.randModWithout(
		array.indexOf(excepts),
		array.length
	)]
	// 还是等于，就启用filter（性能&正确性考量）
	return (
		result === excepts ?
			randomIn(array.filter(item => item !== excepts)) :
			result
	);
}

/**
 * Choose an index in an array that regard the content as weights
 * @param weights the weight of random
 * @returns the selected index of the weight
 */
export function randomByWeight(weights: number[]): uint {
	if (weights.length === 0) throw new Error("根本就没有要随机选择的对象！");
	if (weights.length === 1) return 0;

	let all: number = exMath.sum(weights);
	let r: number = exMath.randomFloat(all);
	for (let i = 0; i < weights.length; i++) {
		let N = weights[i];
		let rs = 0;
		for (let l = 0; l < i; l++)
			rs += weights[l];
		// console.log(R+'|'+(rs+N)+'>R>='+rs+','+(i+1))
		if (r <= rs + N)
			return i;
	}
	console.error(weights, all, r)
	throw new Error("加权随机：未正常随机到结果！")
}

/**
 * 对参数加权随机
 * @param weights 权重集（以任意长参数形式出现）
 * @returns 其中一个元素的索引
 */
export function randomByWeight_params(...weights: number[]): number {
	return randomByWeight(weights);
}

/**
 * 加权随机：按「值表、权重表」从中按权选出索引
 */
export function randomByWeight_KW<T>(values: T[], weights: number[]): T {
	return values[randomByWeight(weights)];
}

/**
 * 
 * @param weightMap 权重映射：元素→权重
 * @returns 
 */
export function randomInWeightMap<T>(weightMap: Map<T, number>): T {
	// 尺寸=1 ⇒ 唯一键
	if (weightMap.size == 1) return weightMap.keys().next().value;

	// 拆解成顺序数组
	let elements: T[] = [];
	let weights: number[] = [];
	weightMap.forEach((value, key) => {
		elements.push(key);
		weights.push(value);
	})

	// 索引对照
	return elements[randomByWeight(weights)];
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
	for (let k in obj)
		(target as any)[kF(k)] = vF(obj[k])
	return target
}

/**
 * 向一个数组`push`一个对象后，返回该对象
 */
export function pushNReturn<T>(arr: T[], item: T): T {
	arr.push(item);
	return item;
}

/**
 * 向一个对象添加一个属性，然后返回该属性
 */
export function addNReturn<T, K extends keyof T>(obj: T, key: K, value: T[K]): T[K] {
	obj[key] = value;
	return value;
}

/**
 * 向一个对象添加一个属性，然后返回该属性的键
 */
export function addNReturnKey<T, K extends keyof T>(obj: T, key: K, value: T[K]): K {
	obj[key] = value;
	return key;
}

/**
 * 安全合并
 * * 判断旧值与新值`typeof`的类型是否相同，同⇒返回新值|异⇒报错
 * * 一般用于「安全从JS对象载入数据」如`copyFromObject`方法中
 */
export function safeMerge<T>(oldVal: T, newVal: any): T {
	if (typeof oldVal === typeof newVal) return newVal;
	throw new Error(`safeMerge: 旧值${oldVal}、新值${newVal}类型不同`);
}

/**
 * 在赋值前检查类型是否一致，但是「软检查」
 * * 何为「软」：可使用通配符`undefined`逃过类型检查
 * * 应用：在要检查的类型是一个「不便检查的接口」时，使用通配符逃过检查
 *   * 例如：在「要设置的JS对象」中，不会出现`undefined`
 */
export function softMerge<T>(oldVal: T, newVal: any | undefined): T {
	if (newVal === undefined || typeof oldVal === typeof newVal) return newVal;
	throw new Error(`safeMerge: 旧值${oldVal}、新值${newVal}类型不同`);
}

export function getPropertyInObjects(objects: object[], key: string): any[] {
	let ra: any[] = new Array<any>();

	for (let i: uint = 0; i < objects.length; i++) {
		if (key in objects[i]) {
			ra.push((objects[i] as any)?.[key]); // if not have value, do not return
		}
	}
	return ra;
}

/**
 * @param arr array
 * @param input element
 * @returns whether the element instanceof contains in array
 */
export function contains<T>(arr: T[], input: T): boolean {
	return (arr.indexOf(input) >= 0);
}

export function spliceAndReturnCount<T>(arr: T[], input: T | T[], count: uint = 0): uint {
	if (isEmptyArray(arr)) {
		return 0;
	}
	let tempCount: uint = count;

	for (let ts: uint = arr.length - 1; ts >= 0; ts--) {
		if (count == 0 || tempCount > 0) {
			if (input instanceof Array) {
				if (contains(input as T[], arr[ts])) {
					arr.splice(ts, 1);
					if (tempCount > 0)
						tempCount--;
				}
			}
			else if (arr[ts] == input) {
				arr.splice(ts, 1);
				if (tempCount > 0)
					tempCount--;
			}
		}
		else {
			break;
		}
	}
	return count - tempCount;
}

export function isEmptyArray<T>(A: Array<T> | null): boolean {
	return (A === null || A.length < 1);
}

export function isEmptyString(S: string): boolean {
	return (S === null || S.length < 1);
}

export function clearArray<T>(arr: Array<T>): void {
	// * 直接设定长度，JS会自动清除
	arr.length = 0;
}

export function isEqualArray<T>(A: T[], B: T[]): boolean {
	if (A.length != B.length) {
		return false;
	}
	else {
		for (let i = 0; i < A.length; i++) {
			if (A[i] != B[i]) {
				return false;
			}
		}
		return true;
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
	for (let i in a) {
		let fa: any = a[i];
		if (ignoreUnique || b.hasOwnProperty(i)) {
			let fb: any = b[i];
			if (!ignoreVariable) {
				if (isPrimitiveInstance(fa) == isComplexInstance(fb)) {
					return false;
				}
				else if (isPrimitiveInstance(fa)) {
					if (fa != fb) {
						return false;
					}
				}
				else {
					if (!isEqualObject(fa, fb)) {
						return false;
					}
				}
			}
		}
		else {
			return false;
		}
	}
	if (!notDetectB) {
		if (!isEqualObject(b, a, ignoreUnique, ignoreVariable, true)) {
			return false;
		}
	}
	return true;
}

export function isPrimitiveInstance(v: any): boolean {
	return (
		v === undefined ||
		v === null ||
		typeof v === "boolean" ||
		typeof v === "number" ||
		typeof v === "bigint" ||
		typeof v === "string" ||
		typeof v === "symbol"
	)
}

export function isComplexInstance(v: any): boolean {
	return !isPrimitiveInstance(v);
}

export interface dictionaryLikeObject {
	[key: string]: any;
}

export function combineObject(from: any, to: any): any {
	for (let i in from) {
		if (from.hasOwnProperty(i)) {
			to[i] = from[i];
		}
	}
	return to;
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
		if (!obj.hasOwnProperty(key))
			continue;
		const value = obj[key];
		console.log(key, value)
		if (isPrimitiveInstance(value))
			result[prefix + key] = value;
		else
			combineObject(
				flattenObject(
					value,
					separator,
					prefix + key + separator
				),
				result
			)
	}
	return result;
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

export function identity<T>(x: T): T {
	return x;
}

export function generateArray<T>(length: uint, f: (index: uint) => T): Array<T> {
	let arr: Array<T> = new Array<T>(length);
	for (let i = 0; i < length; i++)
		arr[i] = f(i);
	return arr;
}

/** 可以用来索引对象值的索引类型 */
export type key = string | number;

/** 可空对象 */ // ! 【2023-09-20 20:42:40】目前不启用：这种类型会徒增很多耦合
// export type nullable<T> = T | null;
