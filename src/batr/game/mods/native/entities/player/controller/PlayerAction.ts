/**
 * 一个用于统一所有玩家输出的枚举
 * * 用于
 */
export enum PlayerAction {
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
	 * ? 后续是否要优化下？整数-字符串 转换似乎挺耗时的
	 */
	TURN_TO_ = 'moveToward_',

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
	 * ? 后续是否要优化下？整数-字符串 转换似乎挺耗时的
	 */
	MOVE_TOWARD_ = 'moveToward_',

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
