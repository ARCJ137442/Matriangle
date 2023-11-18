/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 一个轻量级「JS对象化」库，用于各类对象到JS对象（再到JSON）的序列化
 */
import { Class } from '../legacy/AS3Legacy'
import {
	addNReturnKey,
	getClass,
	identity,
	isEmptyObject,
	isTrueObject,
	key,
	safeMerge,
} from './utils'

/**
 *  ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
 */
export type JSObjectValue =
	| number
	| string
	| boolean
	| null
	| Array<any> // !【2023-11-15 20:37:05】改成`JSObjectValue`会出现「实例化过深」，改成`unknown`会在`MatrixRules_Batr.ts`报错
	| JSObject

/**
 * 可转换为JSON的JS对象类型
 *
 * ! 对object键的限制：只能为字符串
 */
export type JSObject = {
	[key: string]: JSObjectValue
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
		throw new Error(target.toString() + '不是JS对象')
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
 * @param jso 待检查的JS对象（值）
 * @returns 是否合法
 */
export function verifyJSObject(jso: any): boolean {
	for (const key in jso) {
		if (!verifyJSObjectKey(key) || !verifyJSObjectValue(jso[key]))
			return false
	}
	return true
}

/**
 * 检查一个「对象化后的JS对象」的键是否合法
 * * 原理：检查其是否为数字/字符串
 *
 * @param key 待检查的键
 * @returns 是否合法
 */
export function verifyJSObjectKey(key: any): boolean {
	switch (typeof key) {
		case 'string':
		case 'number':
			return true
		default:
			return false
	}
}

/**
 * 检查一个「对象化后的JS对象」的键是否合法
 * * 原理：检查其是否为数字/字符串
 *
 * @param value 待检查的值
 * @returns 是否合法
 */
export function verifyJSObjectValue(value: any): boolean {
	if (value === null) return true
	switch (typeof value) {
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
			// 有构造器就非法
			if (
				(Object.getPrototypeOf(value) === Object.prototype ||
					Object.getPrototypeOf(value) === Array.prototype) &&
				verifyJSObject(value)
			)
				return true
			console.error(value, '不是JS对象')
			console.log(
				value,
				verifyJSObject(value),
				Object.getPrototypeOf(value),
				Object.getPrototypeOf(value) === Object.prototype,
				Object.getPrototypeOf(value) === Array.prototype
			)
			return false
		default:
			return false
	}
}

// 一些增进易用性的工具函数 //

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
