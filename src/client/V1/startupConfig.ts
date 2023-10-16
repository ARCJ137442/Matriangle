import IMatrixStartupConfig from 'matriangle-api/server/rule/IMatrixStartupConfig'

/**
 * 一个用于「配置母体启动」的文件
 *
 * ! 与「规则」的区别：只在「母体启动」时用到
 * * 不会影响母体启动后的运作
 */
const config: IMatrixStartupConfig = {
	/**
	 * 总玩家数量
	 * * （旧AS3遗留）在世界加载时预置的玩家数量
	 *
	 */
	playerCount: 1,

	/**
	 * 总AI数量
	 * * （旧AS3遗留）在世界加载时预置的AI数量
	 *
	 * !【2023-10-10 17:02:04】目前情况：无用，意义待重新考量
	 */
	AICount: 3,
}

export default config
