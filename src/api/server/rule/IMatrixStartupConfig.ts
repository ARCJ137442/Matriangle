import { JSObjectValue } from 'matriangle-common/JSObjectify'
import { key } from 'matriangle-common/utils'

/**
 * 一个通用的「母体启动配置」
 * * 应用：在创建母体时，向母体提供「启动信息」
 *   * 例：玩家数量、初始地图、武器原型、队伍原型……
 *
 * ! 其中所有的信息在「被母体加载」后，其关系就与母体无关
 * * 例：「玩家数量」在被游戏用于「生成初始玩家」后，便不再被使用
 * * 例：「武器原型」在被加载（到「世界规则」中）后，便不再参与
 */
export default interface IMatrixStartupConfig {
	/**
	 * 「配置」的一般格式
	 *
	 * ! 所有的「配置规则」都必须使用「能」
	 */
	[config: key]: JSObjectValue
}
