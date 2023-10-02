import { int } from "../../../../../../legacy/AS3Legacy";
import { GameEventType } from "../../../../../api/control/GameControl";

/**
 * 玩家事件：从「控制器」向玩家回分派的事件类型
 * * 目前只有一个——添加动作
 */
export const ADD_ACTION: GameEventType = 'addAction';

/**
 * 一个用于统一所有玩家输出的枚举
 * * 用于在玩家接收事件时分派
 */
export enum EnumPlayerAction {
	// **空操作** //
	/**
	 * 空操作
	 * * 不会被「AI控制器」分派
	 * * 执行时不会做任何事情
	 */
	NULL = '',

	// **基本操作集** //

	/**
	 * 向前移动
	 */
	MOVE_FORWARD = 'moveForward',

	/**
	 * 转向某方向
	 * 
	 * ! 这是一系列操作的前缀
	 * * 完整形式为「转向某方向(方向)」
	 * 
	 * * 💭数值-字符串转换确实挺低效，还不如类型不稳定
	 */
	// TURN_TO_ = 'moveToward_',

	/**
	 * 转向后方
	 * * 「向后移动」可以表示为二者的复合
	 */
	TURN_BACK = 'moveForward',

	/**
	 * 开始使用（工具）
	 */
	START_USING = 'startUsing',

	/**
	 * 停止使用（工具）
	 */
	STOP_USING = 'stopUsing',

	// **一些复合操作** //

	/**
	 * 向某方向前进（一格）
	 * * 分解：转向某方向+前进（一格）
	 * 
	 * ! 这是一系列操作的前缀
	 * * 完整形式为「向某方向前进(方向)」
	 * 
	 * * 💭数值-字符串转换确实挺低效，还不如类型不稳定
	 */
	// MOVE_TOWARD_ = 'moveToward_',

	/**
	 * 向后移动（一格）
	 * * 分解：转向后方+前进（一格）
	 */
	MOVE_BACK = 'moveBack',

	/**
	 * 停止充能
	 * * 分解：停止使用+开始使用
	 */
	DISABLE_CHARGE = 'disableCharge',

}

/**
 * 总体的「玩家行动」类型
 * * 用于处理带有「无限空间」参数的情况
 *   * 例如「转向」「移动」
 * * 目前对应：
 *   * 非负数n⇒转向「任意维整数角」n
 *   * 负数-n⇒转向「任意维整数角」(-n-1) + 前进
 */
export type PlayerAction = EnumPlayerAction | int;

/**
 * 原「requestActionOn」系列事件
 * * 现在用于从「玩家」到「控制器」的事件分派
 */
export enum PlayerEvent {
	NULL = '', // !【2023-10-02 08:09:40】空事件，不必响应
	INIT = 'init', // !【2023-10-02 08:09:40】用于跳过第一个「无用yield」
	TICK = 'Tick',
	AI_TICK = 'AITick', // 这个是AI独有 // TODO: 暂时还不明确是否要移除/合并
	CAUSE_DAMAGE = 'CauseDamage',
	HURT = 'Hurt',
	KILL = 'Kill',
	DEATH = 'Death',
	KILL_PLAYER = 'KillPlayer',
	RESPAWN = 'Respawn',
	MAP_TRANSFORM = 'MapTransform',
	PICKUP_BONUS_BOX = 'PickupBonusBox',
}
