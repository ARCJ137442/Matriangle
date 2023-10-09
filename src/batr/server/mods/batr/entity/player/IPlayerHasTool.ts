import IMatrix from "../../../../main/IMatrix";
import Tool from "../../tool/Tool";
import IPlayer from "../../../native/entities/player/IPlayer";

/**
 * 「有工具玩家」是
 * * 拥有并可使用工具的
 * 玩家
 * 
 * *📌为何不使用「有工具实体」：
 *   * 这个接口最初是为了「切分Player类」而产生的
 *   * 切分之后的接口，仍然包含像「onToolChange」这样「玩家专用」的钩子函数
 *   * 目前还没有构造其它「非玩家有工具实体」的必要
 */
export default interface IPlayerHasTool extends IPlayer {

	/**
	 * 存取玩家「当前所持有工具」
	 * * 📌只留存引用
	 * 
	 * ! 在设置时会重置：
	 * * 现在参数附着在工具上，所以不需要再考量了
	 * // * 使用冷却
	 * // * 充能状态&百分比
	 * 
	 * ! 现在有关「使用冷却」「充能状态」的代码已独立到「工具」对象中
	 * 
	 * ? 工具彻底「独立化」：每个玩家使用的「工具」都将是一个「独立的对象」而非「全局引用形式」？
	 * * 这样可用于彻底将「使用冷却」「充能状态」独立出来
	 * * 基于工具的类-对象系统
	 * * 在世界分派工具（武器）时，使用「复制原型」而非「引用持有」的方机制
	 */
	get tool(): Tool;
	set tool(value: Tool);

	/**
	 * 缓存玩家「正在使用工具」的状态
	 * * 目的：保证玩家是「正常通过『冷却&充能』的方式使用工具」的
	 */
	get isUsing(): boolean;

	// 钩子函数 //
	/**
	 * 当持有的工具改变时
	 * 
	 * !【2023-09-23 17:45:32】弃用：现在几乎无需处理逻辑
	 * * 一切基本已由「赋给新工具时」处理完毕（新工具的CD和充能状态都已「重置」）
	 * * 对于「二阶武器」（如「冲击波」），也已在「奖励箱设置工具」时处理好
	 *   * 直接装填玩家当前武器，并赋值给玩家
	 * 
	 * @param oldT 旧工具
	 * @param newT 新工具
	 */
	onToolChange?(oldT: Tool, newT: Tool): void;

	//====Control Functions====//
	/**
	 * （控制玩家）开始使用工具
	 * * 对应「开始按下『使用』键」
	 */
	startUsingTool(host: IMatrix): void;

	/**
	 * （控制玩家）停止使用工具
	 * * 对应「开始按下『使用』键」
	 */
	stopUsingTool(host: IMatrix): void;

}


/**
 * 集中、通用的「判定继承接口」的方法
 * * 逻辑：判断指定属性是否存在
 * * 推导依据：使用「类型谓词」（返回值中的「is」关键字），告知推导器「返回的是一个『类型判别』」
 * * 参考资料：https://www.jianshu.com/p/57df3cb66d3d
 */
export function i_hasTool(player: IPlayer): player is IPlayerHasTool {
	return (player as IPlayerHasTool)?.tool !== undefined;
}
