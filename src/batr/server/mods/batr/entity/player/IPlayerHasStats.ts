import IPlayer from "../../../native/entities/player/IPlayer";
import PlayerStats from "./stat/PlayerStats";

/**
 * 「有统计玩家」是
 * * 拥有「统计」机制的
 * 玩家
 */
export default interface IPlayerHasStats extends IPlayer {

	/**
	 * 获取玩家的统计信息
	 * 
	 * TODO: 后续支持「自定义统计字段」
	 */
	get stats(): PlayerStats;

}

/**
 * 集中、通用的「判定继承接口」的方法
 * * 逻辑：判断指定属性是否存在
 */
export function i_hasStats(player: IPlayer): player is IPlayerHasStats {
	return (player as IPlayerHasStats)?.stats !== undefined;
}
