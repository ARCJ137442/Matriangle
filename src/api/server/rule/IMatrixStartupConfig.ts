import { key } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy'

/**
 * 一个通用的「母体启动配置」
 * * 应用：在创建母体时，向母体提供「启动信息」
 *   * 例：玩家数量、初始地图、武器原型、队伍原型……
 *
 * ! 这个信息仅用于代码，而无需支持JSON
 * *【2023-11-18 16:52:28】暂时无需限定至「JS对象格式」
 *
 * ! 其中所有的信息在「被母体加载」后，其关系就与母体无关
 * * 例：「玩家数量」在被游戏用于「生成初始玩家」后，便不再被使用
 * * 例：「武器原型」在被加载（到「世界规则」中）后，便不再参与
 */
export default interface IMatrixStartupConfig {
	/**
	 * 「配置」的一般格式
	 * * 兜底包含所有自定义属性
	 *
	 * ! 所有的「配置规则」都必须使用「能JS对象化」的值
	 */
	[config: key]: unknown

	/**
	 * 总玩家数量
	 * * （旧AS3遗留）在世界加载时预置的玩家数量
	 *
	 */
	playerCount: uint

	/**
	 * 总AI数量
	 * * （旧AS3遗留）在世界加载时预置的AI数量
	 *
	 * !【2023-10-10 17:02:04】目前情况：无用，意义待重新考量
	 */
	AICount: uint
}
