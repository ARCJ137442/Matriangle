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
	if (child != null && parent.contains(child))
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
	if (weights.length == 1) return 0;

	let all: number = exMath.sum(weights);
	let r: number = exMath.randomFloat(all);
	for (let i = 0; i < weights.length; i++) {
		let N = weights[i];
		let rs = 0;
		for (let l = 0; l < i; l++)
			rs += weights[l];
		// trace(R+'|'+(rs+N)+'>R>='+rs+','+(i+1))
		if (r <= rs + N)
			return i;
	}
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
 * 把映射解包成JSON可用的数组，并提供可被识别的「标志」
 * * 可以指定一个「宿主」，键值对会被添加到其中某个属性上（没有则创建一个空对象）
 * 
 * 原理：
 * * 使用`Array.from`方法把映射变成`[...[键, 值]]`的数组
 * * 再使用Array的`map`方法映射键值对
 * 
 * 例子：
 * * `Map { 1 => 2, 3 => 4 }` => `{ "Map": [[1, 2], [3, 4]] }`
 * 
 * @param map 要打包的映射
 * @param callbackKV 对其中每个键和值的递归回调函数
 * @param flag 从键值对映射到二维数组的标签
 * @returns 解包好的JSON对象/添加了新属性的对象
 */
export function map2JSON<K, V>(
	map: Map<K, V>,
	callbackKV: (key: K, value: V) => [any, any],
	flag: string = 'Map',
	parent: any = {}
): { [flag: string]: Array<[any, any]> } {
	parent[flag] = Array.from(map).map((kv: [K, V]): [any, any] => {
		return callbackKV(kv[0], kv[1]);
	})
	return parent;
}

/**
 * 把「有特定标识的JSON对象」打包成映射
 * 
 * 例子：
 * * `{ Map: [ [ 1, 2 ], [ 3, 4 ] ] }` => `Map(2) { 1 => 2, 3 => 4 }`
 * 
 * @param obj 待解析的JSON对象
 * @param callbackKV 对其中二维数组中`[键, 值]`元组的递归回调函数
 * @param flag 从键值对映射到二维数组的标签
 * @param parent 用于设置键值对的宿主对象（默认新建）
 * @returns 一个打包好的映射
 */
export function JSON2map<K, V>(
	// obj: { [flag: string]: Array<[any, any]> },
	obj: any,
	callbackKV: (key: any, value: any) => [K, V],
	flag: string = 'Map',
	parent: Map<K, V> = new Map<K, V>()
): Map<K, V> {
	if (obj[flag] == undefined) throw new Error('JSON2map: 没有找到标志为「' + flag + '」的键');
	obj[flag].forEach((kv: [any, any]): void => {
		parent.set(...callbackKV(kv[0], kv[1]))
	})
	return parent
}

/**
 * 向一个数组`push`一个对象后，返回该对象
 */
export function pushNReturn<T>(arr: T[], item: T): T {
	arr.push(item);
	return item;
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
 * @returns whether the element is contains in array
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
	return (A == null || A.length < 1);
}

export function isEmptyString(S: string): boolean {
	return (S == null || S.length < 1);
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
 * * `getClass(new A()) === A` is partial equals to `new A() instanceof A`, 
 *   * which the former can not match the superclass of A
 * 
 * @param instance the instance of a class
 * @returns the class(constructor) of the instance
 */
export function getClass(instance: any): Class {
	return instance.constructor
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
