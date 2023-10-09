import IPlayerHasTool from "./IPlayerHasTool";
import IPlayerHasExperience from "./IPlayerHasExperience";
import IPlayerHasTeam from "./IPlayerHasTeam";
import IPlayerHasAttributes from "./IPlayerHasAttributes";
import IPlayerHasStats from "./IPlayerHasStats";

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
	IPlayerHasStats { }
