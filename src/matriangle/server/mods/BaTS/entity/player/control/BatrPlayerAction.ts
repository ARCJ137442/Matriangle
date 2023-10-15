/**
 * 一个用于统一所有玩家输出的枚举
 * * 用于在玩家接收事件时分派
 */
export enum EnumBatrPlayerAction {
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
	 * 停止充能
	 * * 分解：停止使用+开始使用
	 */
	DISABLE_CHARGE = 'disableCharge',
}
