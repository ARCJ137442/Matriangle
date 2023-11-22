/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 一个轻量级「JS对象化」库，用于各类对象到JS对象（再到JSON）的序列化
 */
import { Class, uint } from '../legacy/AS3Legacy'
import { intMin } from './exMath'
import {
	addNReturnKey,
	getClass,
	identity,
	isEmptyObject,
	isTrueObject,
	key,
	numKeysOf,
	safeMerge,
	uniqueIntersectArray,
} from './utils'

/**
 *  ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
 */
export type JSObjectValue<RecursiveObject = JSObject, RecurseArray = JSArray> =
	| number
	| bigint
	| string
	| boolean
	| null
	| RecurseArray // !【2023-11-15 20:37:05】改成`JSObjectValue`会出现「实例化过深」，改成`unknown`会在`MatrixRules_Batr.ts`报错
	| RecursiveObject

/**
 * JS数组类型
 */
export type JSArray = JSObjectValue[]

/**
 * 可转换为JSON的JS对象类型
 *
 * ! 对object键的限制：只能为字符串
 */
export type JSObject = {
	[key: string]: JSObjectValue
}

/**
 * JS对象值 | undefined
 * * 可递归包含undefined
 * * 应用：JS对象对比中用「不可能存在的值」undefined表示「值被删除/值相同」
 */
export type JSObjectValueWithUndefined =
	| JSObjectValue<JSObjectWithUndefined, JSObjectValueWithUndefined[]>
	| undefined

/**
 * 内部可含有undefined的JS数组类型
 */
export type JSArrayWithUndefined = JSObjectValueWithUndefined[]

/**
 * 内部可含有undefined的JS对象类型
 * * 可能会被JSON处理失真
 */
export type JSObjectWithUndefined = {
	[key: string]: JSObjectValueWithUndefined
}

/**
 * 过滤掉所有「非JSObject键」的类型
 */
export type JSObjectFiltered<T> = {
	[k: key]: T[typeof k & keyof T] extends JSObject
		? JSObjectFiltered<T>
		: never
}

/**
 * 定义一类「可对象化」成JS原生object的对象
 *
 * !【2023-09-24 20:29:40】现在需要有一个静态方法「getBlank」，不然难以实现「不靠实例得实例」
 */
export interface IJSObjectifiable<T> {
	/**
	 * 将该对象的信息加载到为通用可交换的object格式
	 * * 该格式最大地保留了可操作性，并可直接通过`JSON.stringify`方法转化为JSON文本
	 * * 【2023-09-23 18:03:55】现在只需要「把数据加载到某个object中」，这样就很容易支持「动态继承性添加属性」了
	 *   * 其中的「目标」参数可以留空（默认为空对象），这时相当于原来的`toObject`方法
	 *
	 * ! 对object键的限制：只能为字符串
	 *
	 * ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
	 *
	 * ! 现在不强制要求有这两个方法，只需要有「对象化映射表」能`uniSave`就行
	 *
	 * ! 现在要求其不能调用`uniSave`/`uniLoad`，避免额外的递归现象
	 *
	 * @param target 目标对象
	 */
	saveToJSObject?(target?: JSObject): JSObject

	/**
	 * 用object中的属性覆盖对象
	 * * 静态方法可因此使用「`new C()`+`C.copyFromObject(json)`」实现
	 *
	 * ! 现在不强制要求有这两个方法，只需要有「对象化映射表」能`uniLoad`就行
	 *
	 * ! 现在要求其不能调用`uniSave`/`uniLoad`，避免额外的递归现象
	 *
	 * @param source 源头对象
	 */
	loadFromJSObject?(source: JSObject): this

	/**
	 * 获取「通用对象化映射表」
	 *
	 * 参见`JSObjectifyInf`
	 */
	get objectifyMap(): JSObjectifyMap

	/**
	 * 实例方法：复制出一个新的「白板对象」
	 */
	cloneBlank?(): T

	/**
	 * ! 需要有一个静态方法「getBlank」，不然难以实现「不靠实例得实例」
	 */
	// static getBlank(): T;
}

/**
 * 下面是「通用序列化机制」
 */

/**
 * 统一的JS对象序列化方式
 * 实现这种序列化标准的类，只需提供以下信息
 * ①自身内部属性键:类型→JS对象内的属性键(:同样类型)的「键值对映射」
 * * 这个就是下面定义的类型
 * * 更推广地，可以提供一个「propertyConverter函数」来实现相应的附加操作
 * ②无参数返回一个「模板对象」的「模板构造函数」，用于「新建一个对象，然后往里面塞值」
 * * ②可以在键值对映射里添加方法
 *
 * !【2023-09-24 18:23:56】现在不需要加泛型了。。。
 */
export type JSObjectifyMap = {
	[propertyKey: key]: JSObjectifyMapProperty<any> // ! 这里要any，因为每个属性的类型可能是不同的
}

/**
 * 源对象中要对象化的属性
 *
 * ? 这个泛型<T>似乎没法在实质性上加上去
 */
export type JSObjectifyMapProperty<T> = {
	JSObject_key: key // 映射到JS对象上的键
	propertyType: string | Class | undefined // 用于判断的类型（string⇒`typeof===`;Class⇒`instanceof`）
	propertyConverterS: (v: any) => any // 预存储：在向JS对象存储原始值前，预处理其值。如：对数组内所有元素再次应用（可自定义的）转换
	propertyConverterL: (v: JSObjectValue) => any // 预加载：在「读取原始值」后，对「原始数据」进行一定转换以应用到最终目标加载上的函数（有需求直接转换并赋值，如Map类型）
	loadRecursiveCriterion: (v: JSObjectValue) => boolean // 在加载时「确定『可能要递归加载』」后，以原始值更细致地判断「是否要『进一步递归加载』」
	blankConstructor?: (this_?: T) => IJSObjectifiable<any> // 模板构造函数：（可能根据「父对象」）生成一个「空白的」「可用于后续加载属性的」「白板对象」，也同时用于判断「是否要递归对象化/解对象化」
}

/**
 * 根据指定的「对象化映射表」提取一个对象的信息（as any），并将其转换成JS对象
 *
 * 流程：
 * * 有专门的「对象化」方法⇒优先使用
 * * 否则⇒遍历「对象化映射表」中所有的键（源对象中要对象化的属性）
 *   * 在「目标」对象上的「映射后的键」上注入「转换后的值」
 *	 * 需要「递归对象化」（一般是其实现了对象化的方法）⇒递归调用转换过程
 *	   * 代码上体现为「是否实现了接口声明的方法」
 *	 * 否则：值是「基础类型」⇒不做转换
 *
 * ? 是否要做「深拷贝」支持
 * @param this_ 待「JS对象化」的对象
 * @param objectifyMap 对象化 映射表
 * @param target
 * @returns 一个转换好的JS对象
 */
export function uniSaveJSObject<T extends IJSObjectifiable<T>>(
	this_: T,
	target: JSObject = {},
	objectifyMap: JSObjectifyMap = this_.objectifyMap
): JSObject {
	// 有专门的「对象化」方法⇒优先使用
	if (this_?.saveToJSObject !== undefined) this_.saveToJSObject(target)
	// 否则⇒遍历「对象化映射表」中所有的键
	else
		for (const propertyKey in objectifyMap) {
			// 获取值&预处理
			const property: any = objectifyMap[propertyKey].propertyConverterS(
				(this_ as any)[propertyKey]
			)
			// 映射键
			const JSObjectKey: key = objectifyMap[propertyKey].JSObject_key
			// 转换值
			if (
				objectifyMap[propertyKey]?.blankConstructor !== undefined && // 第一个看「空白构造函数」是否定义
				property?.objectifyMap !== undefined // 第二个看「对象化映射表」是否定义
			) {
				// 可递归
				target[JSObjectKey] = uniSaveJSObject(
					property, // 从当前属性值开始
					{}, // 必从一全新对象开始
					property.objectifyMap // 使用属性值自己的「JS对象化映射表」
				)
			} else {
				if (!verifyJSObjectValue(property)) {
					console.error(target, property)
					throw new Error(`尝试设置一个非法的JS对象值${property}`)
				}
				// 基础类型：直接设置
				target[JSObjectKey] = property
			}
		}
	// 返回前检查：如果检查失败，则报错
	if (!verifyJSObject(target)) {
		console.error(this_, target)
		throw new Error(String(target) + '不是JS对象')
	}
	// 返回以作管道操作
	return target
}

/**
 * 根据指定的「对象化映射表」从指定JS对象中加载自身数据
 *
 * 流程：
 * * 有专门的「对象加载方法」⇒调用
 * * 否则⇒遍历「对象化映射表」中所有的键（源对象中要对象化的属性）
 *   * 在「目标」对象上查找「映射后的键」
 *	 * 找到⇒类型还原
 *	   * 需要「递归对象化」（一般是其实现了对象化的方法）⇒递归调用转换过程
 *	   * 否则⇒基础类型⇒直接拷贝（引用）
 *	 * 未找到⇒警告「未找到」
 *
 * ? 是否要做「沉拷贝」支持
 * @param this_ 数据的载入目标
 * @param objectifyMap 对象化映射表（同构逆用）
 * @param source 数据来源JS对象
 */
export function uniLoadJSObject<T extends IJSObjectifiable<T>>(
	this_: T,
	source: JSObject,
	objectifyMap: JSObjectifyMap = this_.objectifyMap
): T {
	// 有专门的「对象化」方法⇒优先使用
	if (this_?.loadFromJSObject !== undefined) this_.loadFromJSObject(source)
	// 否则⇒遍历「对象化映射表」中所有的键
	else
		for (const propertyKey in objectifyMap) {
			// 映射键
			const JSObjectKey: key = objectifyMap[propertyKey].JSObject_key
			// 没属性⇒警告，跳过循环
			if (!(JSObjectKey in source)) {
				console.error(
					'在JS对象',
					source,
					'中未找到键',
					JSObjectKey,
					'对应的数据'
				)
				continue
			}
			// 获取（原始）值
			const rawProperty: any = source[JSObjectKey]
			// 转换值
			if (
				objectifyMap[propertyKey]?.blankConstructor !== undefined && // 第一个条件：看「有无实现『白板构造函数』」
				objectifyMap[propertyKey].loadRecursiveCriterion(rawProperty) // 再细致视察「这原始值有无『触发递归加载』的必要」
			) {
				// 创造一个该属性「原本类型」的空对象
				const blank: IJSObjectifiable<any> = (
					objectifyMap[propertyKey].blankConstructor as (
						this_?: any
					) => IJSObjectifiable<any>
				)(
					// 先前已经判断好了
					this_
				)
				// 递归操作
				;(this_ as any)[propertyKey] = uniLoadJSObject(
					blank,
					objectifyMap[propertyKey].propertyConverterL(
						rawProperty
					) as JSObject, // 从当前属性值开始
					blank.objectifyMap // 使用属性值自己的「JS对象化映射表」
				)
			} else {
				// 基础类型：过滤→设置
				;(this_ as any)[propertyKey] =
					objectifyMap[propertyKey].propertyType === undefined // 以`undefined`作通配符（不进行类型检查）
						? objectifyMap[propertyKey].propertyConverterL(
								rawProperty
						  )
						: safeMerge(
								(this_ as any)[propertyKey], // 原先值的类型以作参考
								objectifyMap[propertyKey].propertyConverterL(
									rawProperty
								) // 转换后的原始值 // !【2023-09-24 15:22:40】现在有可能是「任意类型」了
						  )
			}
		}
	return this_
}

// 一些特殊对象的JS对象化 //
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
 * @param map 要解包的映射
 * @param callbackKV 对其中每个键和值的递归回调函数
 * @param flag 从键值对映射到二维数组的标签
 * @returns 解包好的JSON对象/添加了新属性的对象
 */
export function mapSaveJSObject<K, V>(
	map: Map<K, V>,
	callbackKV: (key: K, value: V) => [any, any],
	flag: string = 'Map',
	parent: any = {}
): JSObject {
	// [flag: string]: Array<[any, any]>
	parent[flag] = Array.from(map).map((kv: [K, V]): [any, any] => {
		return callbackKV(kv[0], kv[1])
	})
	return parent as JSObject
}

/**
 * 把「JS对象」打包成映射
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
export function mapLoadJSObject<K, V>(
	// obj: { [flag: string]: Array<[any, any]> },
	obj: JSObject,
	callbackKV: (key: any, value: any) => [K, V],
	flag: string = 'Map',
	parent: Map<K, V> = new Map<K, V>()
): Map<K, V> {
	if (obj[flag] == undefined)
		throw new Error(`JSON2map: 没有找到标志为「${flag}」的键`)
	else if (!(obj[flag] instanceof Map))
		throw new Error(`JSON2map: 标志为「${flag}」的键的值不是映射`)
	;(obj[flag] as unknown as Map<any, any>).forEach((kv: [any, any]): void => {
		parent.set(...callbackKV(kv[0], kv[1]))
	})
	return parent
}

// 与JSON联动 //
export function uniSaveJSON<T extends IJSObjectifiable<T>>(
	this_: T,
	objectifyMap: JSObjectifyMap = this_.objectifyMap
): string {
	return JSON.stringify(uniSaveJSObject(this_, {}, objectifyMap))
}

/**
 * 从JSON字串中加载数据
 * * 原理：JSON字串→JS对象
 * @param this_ 要加载数据的（模板）对象
 * @param JSONString JSON字串（将转换成JS对象，然后被送入分析）
 * @param objectifyMap JS对象化映射表
 * @returns 加载好数据的对象
 */
export function uniLoadJSON<T extends IJSObjectifiable<T>>(
	this_: T,
	JSONString: string,
	objectifyMap: JSObjectifyMap = this_.objectifyMap
): T {
	return uniLoadJSObject(this_, JSON.parse(JSONString), objectifyMap)
}

/**
 * 检查一个「对象化后的JS对象」是否满足对「键」「值」的要求
 * * 必须是一个object对象，数组不满足要求
 *
 * @param value 待检查的JS对象（值）
 * @returns 是否合法
 */
export function verifyJSObject(value: any): value is JSObject {
	if (
		// * 先检查是否为null：为null⇒不合法
		value === null ||
		// * 再使用typeof检查：不是object⇒不合法
		typeof value !== 'object' ||
		// * 先检查其原型是否为对象：非对象⇒不合法
		Object.getPrototypeOf(value) !== Object.prototype ||
		// * 再检查是否为数组：为数组⇒非「对象」
		Array.isArray(value)
	)
		return false
	// * 最后对每个键值对进行检查：逐个点名
	for (const key in value) {
		if (!verifyJSObjectKey(key) || !verifyJSObjectValue(value[key]))
			return false
	}
	return true
}
/** @alias {@link verifyJSObject} */
export const isJSObject = verifyJSObject

/**
 * 检查一个「对象化后的JS数组」是否满足对「值」的要求
 * * 必须是JS数组数组不满足要求
 *
 * @param value 待检查的JS数组（值）
 * @returns 是否合法
 */
export function verifyJSArray(value: unknown): value is JSArray {
	if (
		// * 先检查是否为null：为null⇒不合法
		value === null ||
		// * 再使用typeof检查：不是object⇒不合法
		typeof value !== 'object' ||
		// * 再检查是否为数组：非数组⇒不合法
		!Array.isArray(value) ||
		// * 先检查其原型是否为数组：非数组⇒不合法
		Object.getPrototypeOf(value) !== Array.prototype
	)
		return false
	// * 最后对每个值进行检查：逐个点名
	for (const v of value) {
		// * 有一个不是⇒不合法
		if (!verifyJSObjectValue(v)) return false
	}
	return true
}
/** @alias {@link verifyJSArray} */
export const isJSArray = verifyJSArray

/**
 * 检查一个「对象化后的JS对象」的键是否合法
 * * 原理：检查其是否为数字/字符串
 *
 * @param key 待检查的键
 * @returns 是否合法
 */
export function verifyJSObjectKey(key: unknown): key is string | number {
	switch (typeof key) {
		// ! 只有字符串和数字才算
		case 'string':
		case 'number':
			return true
		// ! symbol就不算
		default:
			return false
	}
}
/** @alias {@link verifyJSObjectKey} */
export const isJSObjectKey = verifyJSObjectKey

/**
 * 检查一个「对象化后的JS对象」的键是否合法
 * * 原理：检查其是否为数字/字符串
 *
 * ! 必须用`any`的理由：元素隐式具有 "any" 类型，因为类型为 "string" 的表达式不能用于索引类型 "{}"。
 *
 * @param value 待检查的值
 * @returns 是否合法
 */
export function verifyJSObjectValue(
	value: any,
	log: boolean = false
): value is JSObjectValue {
	// * 检查是否为`null`
	if (value === null) return true
	// * 剩余的检查类型
	root: switch (typeof value) {
		// case 'symbol':
		// case 'undefined':
		// case 'function':
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
			return true
		// ! 针对「对象」：继续以「JS对象」的形式判断
		case 'object':
			// * 检查是否为数组，并且原型对象直接是原生数组（数组的子类型不能算）
			if (Array.isArray(value))
				if (Object.getPrototypeOf(value) === Array.prototype) {
					// * 逐一检查数组元素
					for (let i: uint = 0; i < value.length; i++)
						// * 只要有一个不是，就算不合法
						if (!verifyJSObjectValue(value[i])) break root // ! 从根部退出（switch也可加标签）
				}
				// * 若非直接以数组为原型⇒不合法
				else break root
			// * 数组之外：若为真正的「JS对象」
			else if (Object.getPrototypeOf(value) === Object.prototype) {
				// * 逐一检查对象元素
				for (const key in value)
					if (
						!verifyJSObjectKey(key) ||
						!verifyJSObjectValue(value[key])
					)
						break root // ! 从根部退出（switch也可加标签）
			}
			// * 并非真正的「JS对象」⇒不合法
			else break root //! 从根部退出（switch也可加标签）
			return true
		// * 默认为否
		default:
			return false
	}
	// * 若中途没return，说明不合法（为了统一log）
	log &&
		console.error(
			value,
			'不是JS对象值！',
			verifyJSObject(value),
			Object.getPrototypeOf(value),
			Object.getPrototypeOf(value) === Object.prototype,
			Object.getPrototypeOf(value) === Array.prototype
		)
	return false
}
/** @alias {@link verifyJSObjectValue} */
export const isJSObjectValue = verifyJSObjectValue

/**
 * 深判等JS对象值
 * * 逻辑：主要使用「负相等」策略
 *   * 对「全等」会提前检查
 *   * 若前面的「不相等判断」都未命中，则认为其相等
 *
 * ! 实际上也兼容`undefined`
 *
 * @param v1 待比对值1
 * @param v2 待比对值2
 * @returns 是否值相等
 */
export function isJSObjectValueEqual_deep(
	v1: JSObjectValueWithUndefined,
	v2: JSObjectValueWithUndefined
): boolean {
	// * 直接全等⇒返回`true`（包括`null`）
	if (v1 === v2) return true
	// * null不等⇒返回`false`
	if (v1 === null || v2 === null) return false
	// * 若不是全等，则进行typeof // 基础类型这时候都等完了
	if (typeof v1 !== typeof v2) return false
	// * 确保typeof相等后⇒分类型判断
	switch (typeof v1) {
		// * 数组/对象（null前边比过了）
		case 'object':
			// * 对「是数组」都有分歧⇒不等
			if (Array.isArray(v1) !== Array.isArray(v2)) return false
			// * 数组：开始逐个扫描
			else if (Array.isArray(v1))
				if (v1.length !== (v2 as any[]).length)
					// * 长度不一致⇒不等
					return false
				else {
					// * 长度一致：逐个扫描⇒一个不等，整体不等
					for (let i: uint = 0; i < v1.length; ++i)
						if (!isJSObjectValueEqual_deep(v1[i], (v2 as any[])[i]))
							return false
				}
			// * 对象：键值对数目+遍历键值对
			else {
				// * 键值对数目不一致⇒不等
				if (numKeysOf(v1) !== numKeysOf(v2 as object)) return false
				// * 遍历v1的所有键值对
				for (const key in v1)
					if (!(key in (v2 as object)))
						// * 若v2中没有该键⇒不等
						return false
					// * 若v2中有该键，则继续判断
					else {
						// * 若v1和v2的值不等⇒不等
						if (
							!isJSObjectValueEqual_deep(
								v1[key],
								(v2 as any)[key]
							)
						)
							return false
					}
			}
			// * 默认相等
			return true
		// * 默认：直接不等（基础类型相等前边比过了）
		default:
			return false
	}
}

/**
 * 深拷贝JS对象
 * * 创造一个与JS对象值相同的拷贝
 *
 * !【2023-11-20 23:48:44】偷懒：直接使用JSON类的方法
 */
export function copyJSObjectValue_deep<T extends JSObjectValue>(v: T): T {
	return JSON.parse(JSON.stringify(v)) as T
}

/**
 * 深拷贝JS对象，但带有`undefined`值
 * * 创造一个与JS对象值相同的拷贝
 * * 纯手写算法
 *   * 因为`JSON.stringify`会处理掉`undefined`
 */
export function copyJSObjectValueWithUndefined_deep<
	T extends JSObjectValueWithUndefined,
>(v: T): T {
	// * 是数组
	if (Array.isArray(v)) {
		// * 遍历复制每个值（直接调用`map`方法）
		return v.map(copyJSObjectValueWithUndefined_deep) as T
	}
	// * 是对象
	if (isTrueObject(v)) {
		const result: T = {} as T
		// * 遍历复制每个值
		for (const k in v)
			(result as any)[k] = copyJSObjectValueWithUndefined_deep(v[k])
		return result
	}
	// * 是其它类型值⇒返回自身
	return v
}

/**
 * 比对JS对象，返回一个「比对结果」对象
 * * 因「逐层对比」的逻辑，每一层都会将对象复制
 *   * 最终的对象值相当于对`compare`的部分化拷贝
 * * 核心逻辑：`diff`中的值作为「有差异/要更新」的diff
 *   * `undefined`⇒删除：`diff`中值为`undefined`的键，表示「被删除」
 *     * 即「该值在`base`中存在，但在`compare`中不存在」
 *   * 其它值⇒覆盖：`diff`中值为其它值的键，表示「被覆盖」
 *     * 即「该值在`base`、`compare`中都存在，但值不相等」
 *     * 此时取`compare`的值作为`diff`的值
 *
 * ! 本质上保证严格的「对象被复制」
 * * 「更多权衡」的结果是：为保证后续diff结果不被「量子纠缠」修改，
 *   * 需要对所有「本来直接返回`compare`」的地方进行复制
 *
 * ! 本质上可能要权衡「`compare`是否一定得是JS对象」的问题
 * * 实际应用中，需要直接使用{@link IDisplayDataMatrix}进行对比
 *   * 至少为性能考虑，不希望从其中再复制一遍数据（这里会消耗大量内存）
 *
 * @param base 基准对象
 * @param compare 对比对象
 * @returns {JSObjectValueWithUndefined} diff对象
 */
export function diffJSObjectValue(
	base: JSObjectValue,
	compare: JSObjectValue
): JSObjectValueWithUndefined {
	// * 全等⇒undefined
	if (base === compare) return undefined
	// * 类型不等⇒直接返回对比对象 // ? 是否要真正复制？【2023-11-22 00:18:25】现在的答案：保证「引用无关」，需要复制（为后续同步不出bug做准备）
	if (typeof base !== typeof compare) return copyJSObjectValue_deep(compare)
	// * 分类型
	switch (typeof base) {
		// * 数组/对象（null前边比过了）
		case 'object':
			if (isJSArray(base) && Array.isArray(compare))
				return diffJSArray(base, compare)
			// * 同为JS对象⇒使用对象的diff
			else if (isJSObject(base) && isTrueObject(compare))
				return diffJSObject(base, compare as JSObject)
			// * 若都不符⇒复制后返回`compare`
			return copyJSObjectValue_deep(compare)
		// * 其它类型：复制后直接返回对比对象
		default:
			return copyJSObjectValue_deep(compare)
	}
}

/**
 * 特异于数组的diff方法
 * * 核心逻辑：一个不同⇒整体不同&指明不同之处
 * * 参考{@link diffJSObjectValue}
 *
 * ! 保证整个过程不会从compare中复制引用——换句话说，返回值和compare不会共用任何引用
 *
 * ! 保证第一层数组中没有`undefined`作为元素
 */
export function diffJSArray(
	base: JSObjectValue[],
	compare: JSObjectValue[]
): Exclude<JSObjectValueWithUndefined, undefined>[] | undefined {
	// * 全等⇒undefined
	if (base === compare) return undefined
	// * 长度相等⇒逐个对比：一个不同⇒整体不同
	if (base.length === compare.length) {
		/** 要返回的替换点（undefined⇒compare中的对象本身） */
		const result: Exclude<JSObjectValueWithUndefined, undefined>[] = []
		let diff: JSObjectValueWithUndefined
		let hasDiff: boolean = false
		for (let i: uint = 0; i < base.length; ++i) {
			// * 逐个对比
			diff = diffJSObjectValue(base[i], compare[i])
			if (diff === undefined) {
				// * 若没有不同⇒追加`compare`的元素
				result.push(copyJSObjectValue_deep(compare[i]))
			} else {
				// * 若有不同⇒整体不同
				hasDiff = true
				// * 追加
				result.push(diff)
			}
		}
		// * 整体不同？返回「无直属undefined的diff」 | 返回undefined
		return hasDiff ? result : undefined
	}
	// * 长度不等⇒复制后返回compare
	else return copyJSObjectValue_deep(compare)
}

/**
 * 特异于对象的diff方法
 * * 核心逻辑：一个不同⇒整体不同&指明不同之处
 * * 参考{@link diffJSObjectValue}
 *
 * ! 保证整个过程不会从compare中复制引用——换句话说，返回值和compare不会共用任何引用
 */
export function diffJSObject(
	base: JSObject,
	compare: JSObject
): JSObjectWithUndefined | undefined {
	// * 全等⇒undefined
	if (base === compare) return undefined
	// 预置变量
	const result: JSObjectWithUndefined = {}
	let diff: JSObjectValueWithUndefined
	let hasDiff: boolean = false
	let key: keyof JSObject
	/** [共有的键, `base`中存在但`compare`中不存在的键, `compare`中存在但`base`中不存在的键] */
	const [intersect, baseMinusCompare, compareMinusBase] =
		uniqueIntersectArray(Object.keys(base), Object.keys(compare))
	// * 共有键⇒逐个键进行对比
	for (key of intersect) {
		diff = diffJSObjectValue(base[key], compare[key])
		// * 若无不同⇒继续
		if (diff === undefined) continue
		// * 若有不同⇒整体不同，记录
		else {
			hasDiff = true
			result[key] = diff
		}
	}
	// * 差集有键⇒整体不同，开始比对
	if (baseMinusCompare.length > 0 || compareMinusBase.length > 0) {
		hasDiff = true
		// * `base`有值但`compare`无对应值⇒「删除」操作
		for (key of baseMinusCompare) {
			result[key] = undefined
		}
		// * `compare`有值但`base`无对应值⇒「新增」操作
		for (key of compareMinusBase) {
			result[key] = copyJSObjectValue_deep(compare[key])
		}
	}
	// * 最后看「是否有差异」返回
	return hasDiff ? result : undefined
}

/**
 * 「差异对象」合并入「基对象」
 * * 相当于git中的`merge`操作
 *
 * ! 确保这里的`diff`对象是「引用无关」的
 * * 不然会产生「量子纠缠赋值」现象
 *
 * @param base 要合并入的JS对象值
 * @param diff 要合并进的差异（undefined⇒删除属性）
 * @returns 合并后的JS对象值
 */
export function mergeJSObjectValue(
	base: JSObjectValue,
	diff: JSObjectValueWithUndefined
): JSObjectValue {
	// * 若`diff`为`undefined`⇒无需合并
	if (diff === undefined) return base
	// * 均为JS数组⇒扫描合并 | `diff`因为「可能有`undefined`」不一定为JS数组 | 这里的`diff`若是数组，则其长度一定与`base`相等）
	if (isJSArray(base) && Array.isArray(diff)) {
		// ! 不能单用`isJSArray(diff)`，因为`diff`可能不完整
		if (base.length === diff.length)
			for (let i: uint = 0; i < base.length; i++)
				base[i] = mergeJSObjectValue(base[i], diff[i])
		// * 长度不一致⇒按长度合并 | 要考虑「玩家重生」这样的情况
		else {
			// * 先清空
			base.length = 0
			// * 再填充
			for (let i: uint = 0; i < diff.length; i++)
				base.push(mergeJSObjectValue(base[i], diff[i]))
		}
		// * 合并完毕
		return base
	}
	// * 均为JS对象⇒逐键合并 | 注意：`diff`因为「可能有`undefined`」不能用`isJSObject`
	else if (isJSObject(base) && isTrueObject(diff)) {
		// * 不能使用`uniqueIntersectArray`，因为`diff`可能不完整
		let value: JSObjectValue
		for (const key in diff) {
			value = (diff as JSObject)[key]
			// * undefined⇒删除属性
			if (value === undefined) delete base[key]
			// * 存在值（修改）/不存在值（新增） & 是JS对象值⇒递归合并
			else if (isJSObjectValue(value) || isTrueObject(value))
				// ! 不能单用`isJSObjectValue`，因为`value`可能不完整
				base[key] = mergeJSObjectValue(base[key], value)
			// ! 不存在⇒不要理睬
		}
		// * 合并完毕
		return base
	}
	// * 类型不同|基础类型等其它情况⇒返回diff的值
	return diff as JSObjectValue
}

/**
 * 挖去diff对象中的`undefined`值
 * * 参照自JSON.stringify的处理方式
 * * 数组中的`undefined`：使用`replaceWithUndefined`进行处理（替换/删除）
 * * 对象中的`undefined`：使用`delete`进行处理（删除）
 *
 * ! 原地操作：会改变`valueWithUndefined`对象
 *
 * ! 不会尝试在运行时拷贝`replaceWithUndefined`
 *
 * @param valueWithUndefined 带有`undefined`的JS对象值
 * @param replaceWhenUndefined 在处理值时，当值为`undefined`时的处理方式（数组|自身⇒替换）
 * @param warnWhenUndefined 处理`undefined`时，是否输出警告
 * * 默认为`null`：采自`JSON.stringify`的默认行为
 */
export function removeUndefinedInJSObjectValueWithUndefined(
	valueWithUndefined: JSObjectValueWithUndefined,
	replaceWhenUndefined: JSObjectValue | undefined = null,
	warnWhenUndefined: boolean = false
): JSObjectValue {
	// * 排除直接undefined的选项
	if (valueWithUndefined === undefined) {
		// 警告
		if (warnWhenUndefined)
			console.warn(
				'[JSObjectify]removeUndefinedInJSObjectValueWithUndefined: 传入的值为undefined'
			)
		// 处理
		if (replaceWhenUndefined === undefined)
			// * 「要替换undefined的值」还是undefined⇒报错（相当于「报错模式」）
			throw new Error(
				`JSObjectify: 传入的对象为undefined，要替换undefined的还是undefined，这怎么移除？`
			)
		// * 否则⇒正常返回
		else return replaceWhenUndefined
	}
	// * 数组
	else if (Array.isArray(valueWithUndefined)) {
		// * 遍历数组，替换`undefined`为`replaceWithUndefined` / `replaceWithUndefined===undefined`⇒删除元素
		for (let i = valueWithUndefined.length - 1; i >= 0; i--) {
			// * 数组元素是`undefined`⇒删除/替换元素
			if (valueWithUndefined[i] === undefined) {
				// 警告
				if (warnWhenUndefined)
					console.warn(
						`[JSObjectify]removeUndefinedInJSObjectValueWithUndefined: 数组[${valueWithUndefined.join(
							', '
						)}]的元素valueWithUndefined[${i}] === undefined`
					)
				// 处理
				if (replaceWhenUndefined === undefined)
					valueWithUndefined.splice(i, 1)
				else valueWithUndefined[i] = replaceWhenUndefined
			}
			// * 否则⇒递归深入
			else
				valueWithUndefined[i] =
					removeUndefinedInJSObjectValueWithUndefined(
						valueWithUndefined[i],
						replaceWhenUndefined
					)
		}
		// * 最终返回自身
		return valueWithUndefined as JSObjectValue
	}
	// * 对象
	else if (isTrueObject(valueWithUndefined)) {
		// * 遍历对象
		let value: JSObjectValueWithUndefined
		for (const key in valueWithUndefined) {
			value = valueWithUndefined[key]
			// * 值为`undefined`⇒删除
			if (value === undefined) {
				// 警告
				if (warnWhenUndefined)
					console.warn(
						'[JSObjectify]removeUndefinedInJSObjectValueWithUndefined: 对象',
						valueWithUndefined,
						`在索引「${key}」处的值为undefined`
					)
				// 处理
				delete valueWithUndefined[key]
			}
			// * 否则⇒递归深入
			else
				valueWithUndefined[key] =
					removeUndefinedInJSObjectValueWithUndefined(
						value,
						replaceWhenUndefined
					)
		}
		// * 最终返回自身
		return valueWithUndefined as JSObjectValue
	}
	// * 否则（其它基础类型）⇒返回自身
	return valueWithUndefined as JSObjectValue
}

// 一些增进易用性的工具函数 //

/**
 * 测试在同一位置的共享引用
 * * 这样的引用意味着两个对象可能会量子纠缠
 *
 * ! 不完备：可能在不同的位置共享相同引用
 *
 * @returns 第一个找到的「共享引用对象」，若无则为`undefined`
 */
export function getSharedReference(
	base: JSObjectValue,
	compare: JSObjectValue
): JSObjectValue | undefined {
	// * 其中一个为`null`⇒`false`
	if (base === null || compare === null) return undefined
	// * 若typeof='object' & 全等⇒肯定有共享引用（就是它们自身）
	if (typeof base === 'object' && base === compare) return base // ! ←只有这里是直接返回的
	// 临时变量
	let sharedRef: JSObjectValue | undefined
	// * 若为数组
	if (isJSArray(base)) {
		// * 同为数组
		if (isJSArray(compare)) {
			for (let i: uint = 0; i < intMin(base.length, compare.length); ++i)
				// * 相同索引上有共享引用⇒总体有
				if (
					(sharedRef = getSharedReference(base[i], compare[i])) !==
					undefined
				)
					return sharedRef
		}
	}
	// * 若为对象
	else if (isJSObject(base)) {
		// * 同为对象
		if (isJSObject(compare)) {
			// * 共同键上相同位置有共享引用⇒总体有
			for (const key in base)
				if (
					key in compare &&
					(sharedRef = getSharedReference(
						base[key],
						compare[key]
					)) !== undefined
				)
					return sharedRef
		}
	}
	// 默认没有共享引用
	return undefined
}
/** @alias getSharedReference */
export const getSharedRef = getSharedReference

/**
 * 判断「是否有共享引用」
 * * 原理：「第一个找到的共享引用」是否存在
 */
export function hasSharedReference(base: any, compare: any): boolean {
	return getSharedReference(base, compare) !== undefined
}
/** @alias hasSharedReference */
export const hasSharedRef = hasSharedReference

/** 判断「是否继续递归加载」恒真 */
export const loadRecursiveCriterion_true: (v: JSObjectValue) => boolean = (
	v: JSObjectValue
): true => true
/** 判断「是否继续递归加载」恒假 */
export const loadRecursiveCriterion_false: (v: JSObjectValue) => boolean = (
	v: JSObjectValue
): false => false

/**
 * 根据位置参数快速构造一个「JS对象化映射属性表」
 * * 无需再手动输入键名
 * * 参数含义参考`JSObjectifyMapProperty`
 *
 * @param JSObject_key 映射到JS对象上的键
 * @param propertyType 用于判断的类型（string⇒`typeof=== `;Class⇒` instanceof `）
 * @param propertyConverterS 预存储：在向JS对象存储原始值前，预处理其值。如：对数组内所有元素再次应用（可自定义的）转换
 * @param propertyConverterL 预加载：在「读取原始值」后，对「原始数据」进行一定转换以应用到最终目标加载上的函数（有需求直接转换并赋值，如Map类型）
 * @param loadRecursiveCriterion 在加载时「确定『可能要递归加载』」后，以原始值更细致地判断「是否要『进一步递归加载』」
 * @param blankConstructor 模板构造函数：生成一个「空白的」「可用于后续加载属性的」「白板对象」，也同时用于判断「是否要递归对象化/解对象化」
 */
export function fastGenerateJSObjectifyMapProperty<T>(
	JSObject_key: key,
	propertyType: string | Class | undefined,
	propertyConverterS: (v: any) => any,
	propertyConverterL: (v: JSObjectValue) => any,
	loadRecursiveCriterion: (v: JSObjectValue) => boolean,
	blankConstructor?: (this_?: T) => IJSObjectifiable<any>
): JSObjectifyMapProperty<T> {
	return {
		JSObject_key: JSObject_key,
		propertyType: propertyType,
		propertyConverterS: propertyConverterS,
		propertyConverterL: propertyConverterL,
		loadRecursiveCriterion: loadRecursiveCriterion,
		blankConstructor: blankConstructor,
	}
}

/**
 * 上面方法的专用化版本
 * * 默认是
 *   * 用`_属性名`作数据存取
 *   * 外部对象化时显示为`属性名`
 *
 * ! 注意：返回的是「不加下划线」的属性名
 */
export function fastAddJSObjectifyMapProperty_dash<T>(
	objectiveMap: JSObjectifyMap,
	property_key: key,
	propertyType: string | Class | undefined,
	propertyConverterS: (v: any) => any,
	propertyConverterL: (v: JSObjectValue) => any,
	loadRecursiveCriterion: (v: JSObjectValue) => boolean,
	blankConstructor?: (this_?: T) => IJSObjectifiable<any>
): key {
	addNReturnKey(
		objectiveMap,
		`_${property_key}`,
		fastGenerateJSObjectifyMapProperty(
			property_key,
			propertyType,
			propertyConverterS,
			propertyConverterL,
			loadRecursiveCriterion,
			blankConstructor
		)
	)
	return property_key
}

/**
 * 上面方法的专用化版本
 * * 默认是
 *   * 用`_属性名`作数据存取
 *   * 外部对象化时显示为`属性名`
 * * 不同之处：用「示例实例」存储「类型」信息
 *
 * ! 注意：返回的是「不加下划线」的属性名
 */
export function fastAddJSObjectifyMapProperty_dash2(
	objectiveMap: JSObjectifyMap,
	property_key: key,
	propertyInstance: any,
	propertyConverterS: (v: any) => any,
	propertyConverterL: (v: JSObjectValue) => any,
	loadRecursiveCriterion: (v: JSObjectValue) => boolean,
	blankConstructor?: () => IJSObjectifiable<any>
): key {
	return fastAddJSObjectifyMapProperty_dash(
		objectiveMap,
		property_key,
		getClass(propertyInstance) ?? typeof propertyInstance,
		propertyConverterS,
		propertyConverterL,
		loadRecursiveCriterion,
		blankConstructor
	)
}

/**
 * 上面方法的更专用化版本
 * * 默认是
 *   * 其类型为基础类型
 *   * 无需进行额外转换（不论是存储还是加载）
 *   * 默认不进行递归解析
 *
 * ! 注意：返回的是「不加下划线」的属性名
 */
export function fastAddJSObjectifyMapProperty_dashP(
	objectiveMap: JSObjectifyMap,
	property_key: key,
	propertyInstance: any
): key {
	return fastAddJSObjectifyMapProperty_dash(
		objectiveMap,
		property_key,
		getClass(propertyInstance) ?? typeof propertyInstance,
		identity,
		identity,
		loadRecursiveCriterion_false
	)
}

/**
 * JS对象值简化（原地操作）
 * * 同{@link trimmedEmptyObjIn}，但会改变参数obj及其内部所有的值
 *
 * ! 破坏性操作：可能改变内部引用的数据
 *
 * @param obj 待简化的对象
 * @returns 简化后的同一对象
 *
 * @example // 测试样例 log结果：`{} {} { a: { a: 1 }, b: { d: 1 } }`
 * console.log(
 *     trimEmptyObjIn({}),
 *     trimEmptyObjIn({ a: {} }),
 *     trimEmptyObjIn({
 *         a: { a: 1 },
 *         b: { c: {}, d: 1 },
 *         e: {},
 *         f: { g: {}, h: {} },
 *         i: { j: {}, k: { l: {} } },
 *     })
 * )
 */
export function trimEmptyObjIn(obj: JSObject): JSObject {
	// 临时变量
	let value: JSObjectValue
	for (const key in obj) {
		value = obj[key]
		// * 数组⇒提前对元素进行过滤（不会让数组元素消失）
		if (Array.isArray(value))
			for (let i = value.length - 1; i >= 0; i--)
				value[i] = _temp_trimmedEmptyObjIn_arr(value[i])
		// * 对象⇒额外判断
		else if (typeof value === 'object' && value !== null) {
			// 肯定要简化一次的
			trimEmptyObjIn(value)
			// * 被简化后是空对象⇒删除
			if (isEmptyObject(value)) delete obj[key]
		}
		// * 其它值⇒跳过
	}
	// 返回自身
	return obj
}

/**
 * JS对象值简化
 * * 核心逻辑：返回一个新对象，这个对象中所有「值为空对象」的键值对都被省去
 * * 用于「显示更新」中的字符省略
 *
 * @param obj 需要简化的JS对象
 * @returns 简化后的新JS对象，不会对原有JS对象造成任何影响
 */
export function trimmedEmptyObjIn(obj: JSObject): JSObject {
	const result: JSObject = {}
	// 临时变量
	let value: JSObjectValue, trimmedObj: JSObject
	for (const key in obj) {
		value = obj[key]
		// * `undefined`⇒直接跳过（面向更一般的object类型）
		if (value === undefined) continue
		// * 数组⇒提前对元素进行过滤（不会让数组元素消失）
		else if (Array.isArray(value))
			result[key] = value.map(_temp_trimmedEmptyObjIn_arr)
		// * 对象⇒额外判断
		else if (typeof value === 'object' && value !== null) {
			// 肯定要简化一次的
			trimmedObj = trimmedEmptyObjIn(value)
			// * 被简化后是空对象⇒跳过
			if (isEmptyObject(trimmedObj)) continue
			// * 其它对象⇒递归深入
			else result[key] = trimmedObj
		}
		// * 其它值⇒直接设定
		else result[key] = value
	}
	// 返回结果
	return result
}
const _temp_trimmedEmptyObjIn_arr = (value: JSObjectValue): JSObjectValue =>
	isTrueObject(value) ? trimmedEmptyObjIn(value as JSObject) : value
