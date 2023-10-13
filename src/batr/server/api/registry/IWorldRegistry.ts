import Block from '../block/Block'
import BlockEventRegistry from '../block/BlockEventRegistry'
import EntityType from '../entity/EntityType'

/**
 * 所有「使用ID进行索引的物件」ID的类型
 *
 * ! 固定是字符串：若更改，无法一并改变「对象化」等多个地方的功能
 */
export type typeID = string

/**
 * 「总注册表」
 * * 负责与「对象化/反对象化」「类型映射表」等数据交互
 * * 只负责「查找&返回」与「保存&加载」，不负责「具体运行」
 *
 * TODO: JS对象化
 * * 作为通用API，不会涉及「工具使用映射表」
 */
export default interface IWorldRegistry {
	/**
	 * 方块类型映射表：方块id⇒方块类型
	 *
	 * !【2023-10-07 18:27:11】现在因为「方块数据结构」的改变（属性-状态 结构）而改为「无参白板构造函数」
	 */
	get blockConstructorMap(): Map<typeID, () => Block>

	/**
	 * 方块事件注册表
	 */
	get blockEventRegistry(): BlockEventRegistry

	/**
	 * 实体类型映射表：实体id⇒实体类型
	 */
	get entityTypeMap(): Map<typeID, EntityType>
}
