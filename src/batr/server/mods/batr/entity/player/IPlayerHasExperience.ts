import { uint } from "../../../../../legacy/AS3Legacy";
import IMatrix from "../../../../main/IMatrix";
import IPlayer from "../../../native/entities/player/IPlayer";

/**
 * 「有经验玩家」是
 * * 拥有「经验」机制的
 * 玩家
 */
export default interface IPlayerHasExperience extends IPlayer {

	/**
	 * 玩家的「经验值」
	 * * 目前在世界机制上的应用仅在于「升级时的加成」以及「玩家表现的平均化、单一化测量」
	 * 
	 * !【2023-10-05 22:40:44】现在因为需要「升级の特效」，所以不再开放setter
	 */
	get experience(): uint;
	/**
	 * 设置经验
	 * * 📌机制：在设置的经验超过「目前等级最大经验」时，玩家会直接升级
	 */
	setExperience(host: IMatrix, value: uint): void;
	/** 添加经验 */
	addExperience(host: IMatrix, value: uint): void;

	/** 经验等级 */
	get level(): uint;
	set level(value: uint);

	/** 玩家升级所需经验（目前等级最大经验） */
	get levelupExperience(): uint;

	/**
	 * 玩家「当前所持有经验」与「目前等级最大经验」的百分比
	 * * 范围：[0, 1]（1也会达到，因为只有在「超过」时才升级）
	 * * 应用：目前只有「经验条显示」
	 */
	get experiencePercent(): number;

	// 钩子函数 //

	/**
	 * 事件：升级
	 * * 调用来源：玩家
	 * 
	 * @param host 发生在的「世界母体」
	 */
	onLevelup(host: IMatrix): void;

}

/**
 * 集中、通用的「判定继承接口」的方法
 * * 逻辑：判断指定属性是否存在
 */
export function i_hasExperience(player: IPlayer): player is IPlayerHasExperience {
	return (player as IPlayerHasExperience)?.experience !== undefined;
}
