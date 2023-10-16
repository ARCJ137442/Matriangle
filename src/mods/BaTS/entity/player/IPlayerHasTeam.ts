import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import PlayerTeam from './team/PlayerTeam'

/**
 * 「有队伍玩家」是
 * * 拥有「队伍」机制的
 * 玩家
 */
export default interface IPlayerHasTeam extends IPlayer {
	/**
	 * 存取玩家队伍
	 * * 在「设置队伍」时（请求）更新显示（UI、图形）
	 *
	 * ! 【2023-09-23 11:25:58】不再请求更新所有抛射体的颜色
	 * * 💭或许可以通过「发射时玩家队伍ID缓存至抛射体以便后续伤害判断」解决由此导致的「显示与预期不一致」问题
	 */
	get team(): PlayerTeam
	set team(value: PlayerTeam)
}

/**
 * 集中、通用的「判定继承接口」的方法
 * * 逻辑：判断指定属性是否存在
 * * 推导依据：使用「类型谓词」（返回值中的「is」关键字），告知推导器「返回的是一个『类型判别』」
 * * 参考资料：https://www.jianshu.com/p/57df3cb66d3d
 */
export function i_hasTeam(player: IPlayer): player is IPlayerHasTeam {
	return (player as IPlayerHasTeam)?.team !== undefined
}
