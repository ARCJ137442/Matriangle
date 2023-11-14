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
 * 所有「ID⇒类型」的映射
 * * 不是Map，只是Object
 *   * 因为只有Object才有可能被「对象化」
 *   * 而Map的键值类型是不确定的
 */
export type typeIDMap<T> = { [k: typeID]: T }

/**
 * 「总注册表」
 * * 负责与「对象化/反对象化」「类型映射表」等数据交互
 * * 只负责「查找&返回」与「保存&加载」，不负责「具体运行」
 *
 * TODO: JS对象化
 * * 作为通用API，不会涉及「工具使用映射表」
 * * 【2023-11-14 19:58:59】目前似乎没法对象化——其中**内嵌的函数**无法转换成JS对象
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
