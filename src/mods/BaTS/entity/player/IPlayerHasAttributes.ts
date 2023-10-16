import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import PlayerAttributes from './attributes/PlayerAttributes'

/**
 * 「有属性玩家」是
 * * 拥有「属性」机制的
 * 玩家
 */
export default interface IPlayerHasAttributes extends IPlayer {
	//====Buff====//

	/**
	 * 玩家的所有属性（原「Buff系统」）
	 * * 包括「伤害提升」「冷却减免」「抗性提升」「范围提升」
	 */
	get attributes(): PlayerAttributes
}

/**
 * 集中、通用的「判定继承接口」的方法
 * * 逻辑：判断指定属性是否存在
 * * 推导依据：使用「类型谓词」（返回值中的「is」关键字），告知推导器「返回的是一个『类型判别』」
 * * 参考资料：https://www.jianshu.com/p/57df3cb66d3d
 */
export function i_hasAttributes(
	player: IPlayer
): player is IPlayerHasAttributes {
	return (player as IPlayerHasAttributes)?.attributes !== undefined
}
