import { IJSObjectifiable } from "../../common/JSObjectify";
import { key } from "../../common/utils";

/**
 * 定义统一、可扩展的「游戏规则」接口
 */
export default interface IMatrixRule extends IJSObjectifiable<IMatrixRule> {

	//================Variable Management================//

	/**
	 * 判断「是否有指定名称的规则」
	 * 
	 * @param key 规则名
	 */
	hasRule(key: key): boolean;

	/**
	 * 从名称获取规则
	 * 
	 * ! 未找到则返回undefined
	 * 
	 * @param key 规则名
	 */
	getRule<T>(key: key): T | undefined;

	/**
	 * 从名称安全获取规则
	 * 
	 * ! 未找到则报错
	 * 
	 * @param key 规则名
	 */
	safeGetRule<T>(key: key): T;

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
	setRule<T>(key: key, value: T): boolean;

	/**
	 * 获取规则对象中存储的所有规则名
	 */
	get allKeys(): key[];

	/**
	 * 触发变量更新
	 * @param oldValue 旧值
	 * @param newValue 新值
	 */
	onVariableUpdate<T>(key: key, oldValue: T, newValue: T): void;

	//============Game Mechanics============//
	// ? 矛盾的是，这本是一个通用系统，结果还是要做「专用化」

	/**
	 * 获取一个随机地图
	 * 
	 * ! 仅获取引用，并且不会「生成下一个」
	 */
	// getRandomMap(): IMap; // !【2023-10-04 23:00:40】专用系统，废弃。

}
