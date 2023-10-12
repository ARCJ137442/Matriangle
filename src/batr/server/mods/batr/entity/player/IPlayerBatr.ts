import IPlayerHasTool from "./IPlayerHasTool";
import IPlayerHasExperience from "./IPlayerHasExperience";
import IPlayerHasTeam from "./IPlayerHasTeam";
import IPlayerHasAttributes from "./IPlayerHasAttributes";
import IPlayerHasStats from "./IPlayerHasStats";
import IMatrix from "../../../../main/IMatrix";
import BonusBox from "../item/BonusBox";
import IPlayer from "../../../native/entities/player/IPlayer";

/**
 * 「Batr玩家」是
 * * 继承自原AS3版本Player的
 * * 拥有「经验」机制的
 * * 可以使用「工具」的
 * * 拥有「队伍」机制的
 * * 拥有「属性」机制的
 * * 拥有「统计」机制的
 * 玩家
 * 
 * ! 现在的实现：全部使用「模块化接口」替代
 */
export default interface IPlayerBatr extends
	IPlayerHasTool,
	IPlayerHasExperience,
	IPlayerHasTeam,
	IPlayerHasAttributes,
	IPlayerHasStats {

	i_batrPlayer: true;

	// *新加入的内容* //

	/**
	 * 事件：外部地图变换
	 * * 在「外界地图发生变换，自身武器状态等发生改变」后调用
	 * * 调用来源：母体
	 * 
	 * ?【2023-10-08 17:28:15】这个后续也许需要随着「地图变换程序建立」而移出接口
	 * 
	 * @param host 发生在的「世界母体」
	 */
	onMapTransform(host: IMatrix): void;

	/**
	 * 事件：捡到奖励箱
	 * * 在「奖励箱拾取后消失，自身已获得加成」后调用
	 * * 调用来源：母体
	 * 
	 * ?【2023-10-08 17:28:15】这个后续也许需要随着「地图变换程序建立」而移出接口
	 * 
	 * @param host 发生在的「世界母体」
	 */
	onPickupBonusBox(host: IMatrix, box: BonusBox): void;

}

export function i_batrPlayer(player: IPlayer): player is IPlayerBatr {
	return (player as IPlayerBatr)?.i_batrPlayer !== undefined;
}
