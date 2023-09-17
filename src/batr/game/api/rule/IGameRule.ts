import { IBatrJSobject } from "../../../common/abstractInterfaces";
import { key } from "../../../common/utils";

/**
 * 定义统一、可扩展的「游戏规则」接口
 */
export default interface IGameRule extends IBatrJSobject {

	/**
	 * 判断「是否有指定名称的规则」
	 * 
	 * @param key 规则名
	 */
	hasRule(key: key): boolean;

	/**
	 * 从名称获取规则
	 * 
	 * ! 未找到则报错
	 * 
	 * @param key 规则名
	 */
	getRule<T>(key: key): T;

	/**
	 * 从名称、值处设置规则
	 * * 类似Julia的`getindex`
	 * @param key 规则名
	 * @param value 新规则值
	 * @returns 是否设置成功
	 */
	setRule<T>(key: key, value: T): boolean;

	/**
	 * 触发变量更新
	 * @param oldValue 旧值
	 * @param newValue 新值
	 */
	onVariableUpdate<T>(key: key, oldValue: T, newValue: T): void;

}
