import { int } from "../../../../../../legacy/AS3Legacy";
import { GameEventType } from "../../../../../api/control/GameControl";

/**
 * 玩家事件
 */
export const ADD_ACTION: GameEventType = 'addAction';

/**
 * 一个用于统一所有玩家输出的枚举
 * * 用于在玩家接收事件时分派
 */
export enum EnumPlayerAction {
	// **空操作** //
	/** 空操作：执行时不会做任何事情 */
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