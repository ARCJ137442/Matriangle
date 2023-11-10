import { mRot } from 'matriangle-api/server/general/GlobalRot'
import { int } from 'matriangle-legacy/AS3Legacy'

/**
 * 玩家事件：从「控制器」向玩家回分派的事件类型
 * * 继承自{@link MatrixEventType}
 * * 目前只有一个——添加动作
 *
 * !【2023-10-14 15:04:28】与「玩家告知给控制器的{@link PlayerEvent}不同」
 */
export enum NativeMatrixPlayerEvent {
	ADD_ACTION = 'addAction',
}

/**
 * 总体的「玩家行为」类型
 * * 字符串对应「无参行为」
 * * 数值用于表征「参数取值无限多」的「有参行为」
 *   * 目前对应：
 *     * 非负数⇒转向「任意维整数角」n
 *     * 负数⇒转向「任意维整数角」(-n-1) + 前进
 *   * 例如「转向」「移动」
 *
 * ?【2023-10-09 18:20:51】目前这样利用基础类型是否过于随意，不利于后续加入「有参行为」？
 */
export type PlayerAction = string | int

/**
 * 一个用于统一所有玩家输出的枚举
 * * 用于在玩家接收事件时分派
 */
export enum EnumNativePlayerAction {
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
	 * * 数值对应关系：正整数⇒转向「任意维整数角」n
	 *
	 * * 💭数值-字符串转换确实挺低效，还不如类型不稳定
	 */
	// TURN_TO_ = 'moveToward_',

	/**
	 * 转向后方
	 * * 「向后移动」可以表示为二者的复合
	 */
	TURN_BACK = 'turnBack',

	// **一些复合操作** //

	/**
	 * 向某方向前进（一格）
	 * * 分解：转向某方向+前进（一格）
	 *
	 * ! 这是一系列操作的前缀
	 * * 完整形式为「向某方向前进(方向)」
	 * * 数值对应关系：负整数⇒转向「任意维整数角」(-n-1) + 前进
	 *
	 * * 💭数值-字符串转换确实挺低效，还不如类型不稳定
	 */
	// MOVE_TOWARD_ = 'moveToward_',

	/**
	 * 向后移动（一格）
	 * * 分解：转向后方+前进（一格）
	 */
	MOVE_BACK = 'moveBack',
}

/**
 * 从「转向方向」获取对应的「玩家行为」
 * *【2023-11-10 19:30:23】转换关系：直接对应
 *
 * @param direction 转向方向（任意维整数角）
 * @returns 对应的玩家行为
 */
export function getPlayerActionFromTurn(direction: mRot): PlayerAction {
	return direction as PlayerAction
}

/**
 * 判断一个「玩家行为」是否为「转向」
 * *【2023-11-10 19:31:09】判断依据：是否为非负整数
 *
 * @param action 玩家行为
 * @returns 是否为「转向」行为
 */
export function isActionTurn(action: PlayerAction): boolean {
	return typeof action === 'number' && action >= 0
}

/**
 * 判断一个「玩家行为」是否为「转向+移动」
 * *【2023-11-10 19:31:09】判断依据：是否为负整数
 *
 * @param action 玩家行为
 * @returns 是否为「转向」行为
 */
export function isActionMoveForward(action: PlayerAction): boolean {
	return typeof action === 'number' && action < 0
}

/**
 * 从「玩家行为」获取对应的「转向方向」
 * *【2023-11-10 19:49:45】转换方法：直接对应
 *
 * ! 注意：不会检查「玩家行为」的类型（字符串类「枚举型行为」需要预先检测）
 *
 * @param action 玩家行为
 * @returns 对应的转向方向（任意维整数角）
 */
export function toRotFromActionTurn(action: PlayerAction): mRot {
	return action as mRot
}

/**
 * 从「玩家行为」获取对应的「移动方向」
 * *【2023-11-10 19:50:26】转换方法：`a => -a - 1`(a<0)
 *
 * ! 注意：不会检查「玩家行为」的类型（字符串类「枚举型行为」需要预先检测）
 *
 * @param action 玩家行为
 * @returns 对应的移动方向（任意维整数角）
 */
export function toRotFromActionMoveForward(action: PlayerAction): mRot {
	return -action - 1
}
