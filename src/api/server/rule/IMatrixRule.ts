import { IJSObjectifiable } from '../../../common/JSObjectify'
import { key } from '../../../common/utils'

/**
 * 定义统一、可扩展的「世界规则」接口
 */
export default interface IMatrixRule extends IJSObjectifiable<IMatrixRule> {
	//================Variable Management================//

	/**
	 * 从「规则名」到「变量名」的函数
	 */
	readonly _hashRule: (k: key) => key

	/**
	 * 判断「是否有指定名称的规则」
	 *
	 * @param key 规则名
	 */
	hasRule(key: key): boolean

	/**
	 * 从名称获取规则
	 *
	 * ! 未找到则返回undefined
	 *
	 * @param key 规则名
	 */
	getRule<T>(key: key): T | undefined

	/**
	 * 从名称安全获取规则
	 *
	 * ! 未找到则报错
	 *
	 * @param key 规则名
	 */
	safeGetRule<T>(key: key): T

	/**
	 * 从名称、值处设置规则
	 * * 类似Julia的`getindex`
	 *
	 * ! 未找到则不进行设置
	 *
	 * @param key 规则名
	 * @param value 新规则值
	 * @returns 是否设置成功
	 */
	setRule<T>(key: key, value: T): boolean

	/**
	 * 从名称、值处安全设置规则
	 * * 相比{@link setRule}会检测「输入与已有类型是否相同」
	 *
	 * @param key 规则名
	 * @param value 新规则值
	 * @returns 是否设置成功
	 */
	safeSetRule<T>(key: key, value: T): boolean

	/**
	 * 从名称处删除规则
	 *
	 * @param key 规则名
	 * @returns 是否删除成功
	 */
	deleteRule(key: key): boolean

	/**
	 * 获取规则对象中存储的所有规则名
	 */
	get allKeys(): key[]

	/**
	 * 从一个「规则默认值映射」中加载规则
	 */
	loadFromDefaultValueMap(DVM: RuleDefaultValueMap): this

	// 事件机制 //

	/**
	 * 触发变量更新
	 * @param oldValue 旧值
	 * @param newValue 新值
	 */
	onVariableUpdate<T>(key: key, oldValue: T, newValue: T): void

	//============World Mechanics============//
	// ? 矛盾的是，这本是一个通用系统，结果还是要做「专用化」

	/**
	 * 获取一个随机地图
	 *
	 * ! 仅获取引用，并且不会「生成下一个」
	 */
	// getRandomMap(): IMap; // !【2023-10-04 23:00:40】专用系统，废弃。
}

/**
 * 定义「规则默认值映射」
 * *【2023-10-16 22:56:50】用于在「不直接依赖实例变量」的情况下「自动加载默认值」
 */
export type RuleDefaultValueMap<T = unknown> = Map<key, T>
