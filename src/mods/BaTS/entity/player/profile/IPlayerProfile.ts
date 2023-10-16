import { uint } from 'matriangle-legacy/AS3Legacy'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'

/**
 * 用于在「世界统计」中存储玩家信息的「档案」
 *
 * * 被用作接口的理由：这是玩家属性的一部分，但在呈现「统计信息」时又需要一个轻量级的对象实现它
 *
 * ! 无需继承「可对象化对象」：若继承，相当于「玩家也要对象化」
 *
 * !【2023-10-09 16:00:20】已经不知道这个接口的用途在何方了
 * * 目前因为新的「多模块玩家定义」的接口分离需要，其`level`属性与IPlayerHasExperience相冲突
 *
 * @author ARCJ137442
 */
export default interface IPlayerProfile {
	/**
	 * 从玩家处导入
	 * * 【2023-10-09 16:23:12】现在玩家不属于IPlayerProfile，故需手动设置
	 *   * 有些玩家可能没有经验系统
	 */
	copyFromPlayer(p: IPlayer): this

	/**
	 * 从另一个「玩家档案」拷贝
	 *
	 * @param profile 拷贝的源头
	 */
	copyFrom(profile: IPlayerProfile): void

	/**
	 * 玩家的自定义名称（非国际化文本）
	 */
	get customName(): string

	/**
	 * 玩家的经验值
	 */
	get experience(): uint

	/**
	 * 玩家的经验等级
	 */
	get level(): uint

	/**
	 * 玩家的队伍ID
	 */
	get teamID(): string

	/**
	 * 玩家的队伍颜色
	 */
	get teamColor(): uint
}
