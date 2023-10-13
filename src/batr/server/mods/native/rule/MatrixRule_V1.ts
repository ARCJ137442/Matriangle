/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-prototype-builtins */
import IMatrixRule from '../../../rule/IMatrixRule'
import { key } from '../../../../common/utils'
import { JSObjectifyMap } from '../../../../common/JSObjectify'

/**
 * 第一代「规则」
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * * 【2023-10-10 16:43:27】现在只负责实现最基本的「数据读写存取」，而不附加任何「世界内容」
 *
 * !【2023-10-10 16:41:34】目前暂废除事件系统，其本身在TS版本中已失去意义
 */
export default class MatrixRule_V1 implements IMatrixRule {
	// JS对象化 //

	/**
	 * 类自身的「对象化映射表」
	 *
	 * ?💭【2023-10-10 16:46:40】但实际上又如何应对「多个继承它的子类」
	 * * 特别是「继承它的子类又不知扩展了哪些属性」的情况下
	 * * 这样的情况不利于后续「JS对象化存储」的可扩展性
	 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	get objectifyMap(): JSObjectifyMap {
		return MatrixRule_V1.OBJECTIFY_MAP
	}

	/**
	 * 用于构造「白板对象」
	 * * 留给子类实现
	 */
	public reloadDefault(): void {}

	//============Constructor & Destructor============//
	public constructor() {}

	public destructor(): void {}

	// 实现接口 //
	/**
	 * ! 必须在所有属性初始化后再初始化「所有规则名」
	 * * 初衷：避免「规则名」带下划线
	 */
	public static readonly ALL_RULE_KEYS: key[] = Object.getOwnPropertyNames(this.OBJECTIFY_MAP).map(
		// * 映射到在JS对象中呈现的键
		(key: string): key => this.OBJECTIFY_MAP[key].JSObject_key
	)

	/** @implements 实现：暂时使用「静态常量」 */
	get allKeys(): key[] {
		return MatrixRule_V1.ALL_RULE_KEYS
	}

	/** @implements 实现：直接访问内部变量 */
	hasRule(key: key): boolean {
		return this.hasOwnProperty(`_${key}`)
	}

	/** @implements 实现：直接访问内部变量，但使用「非空访问」运算符 */
	getRule<T>(key: key): T | undefined {
		return (this as any)?.[`_${key}`]
	}

	/** @implements 实现：直接访问内部变量 */
	safeGetRule<T>(key: key): T {
		if (this.hasRule(key)) return (this as any)[`_${key}`] as T
		throw new Error(`规则「${key}」未找到`)
	}

	/** @implements 实现：直接访问内部变量 */
	setRule<T>(key: key, value: T): boolean {
		if (!this.hasRule(key)) {
			console.error(`规则「${key}」未找到`)
			return false
		}
		;(this as any)[`_${key}`] = value
		return true
	}

	// 遗留的「事件系统」 //

	protected static preUpdateVariable<T>(rule: MatrixRule_V1, k: key, oldV: T, newV: T): boolean {
		if (oldV == newV) return false
		rule.onVariableUpdate(k, oldV, newV)
		return true
	}

	public onVariableUpdate(key: key, oldValue: any, newValue: any): void {
		// TODO: 等待事件机制完善
		// this.dispatchEvent(
		// 	new WorldRuleEvent(WorldRuleEvent.VARIABLE_UPDATE, oldValue, newValue)
		// );
	}
}
