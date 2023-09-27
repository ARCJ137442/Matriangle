import { uint } from "../../../../../../legacy/AS3Legacy";

/**
 * 用于在「游戏统计」中存储玩家信息的「档案」
 * 
 * * 被用作接口的理由：这是玩家属性的一部分，但在呈现「统计信息」时又需要一个轻量级的对象实现它
 * 
 * ! 无需继承「可对象化对象」：若继承，相当于「玩家也要对象化」
 * 
 * @author ARCJ137442
 */
export default interface IPlayerProfile {
	/**
	 * 玩家的自定义名称（非国际化文本）
	 */
	get customName(): string;

	/**
	 * 玩家的经验值
	 */
	get experience(): uint;

	/**
	 * 玩家的经验等级
	 */
	get level(): uint;

	/**
	 * 玩家的队伍ID
	 */
	get teamID(): string;

	/**
	 * 玩家的队伍颜色
	 */
	get teamColor(): uint;
}
