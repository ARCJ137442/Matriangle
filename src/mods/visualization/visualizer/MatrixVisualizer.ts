import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import {
	IMessageRouter,
	MessageServiceConfig,
	linkToRouterLazy,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { typeID } from 'matriangle-api'

/**
 * 「母体可视化者」是
 * * 用于传递可视化信号的
 * * 响应式的
 * 母体程序
 */
export default abstract class MatrixVisualizer extends MatrixProgram {
	// 构造函数&析构函数 //
	public constructor(id: typeID, label: MatrixProgramLabel) {
		super(id, label)
	}

	// 可视化部分 //

	/**
	 * 获取可视化信号
	 * @abstract 抽象方法，需要等子类自行实现
	 *
	 * @returns 打包后的「可视化信号」 | 空字串（若未连接母体）
	 */
	public abstract getSignal(message: string): string

	// 服务器部分 //

	/**
	 * 以指定IP、端口连接到「消息路由器」
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * !【2023-11-18 18:03:19】现在扩展自通用接口的处理方法
	 * * 以便于使用者在不知道
	 *
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 * @param {MessageServiceConfig} config 消息服务配置
	 */
	public linkToRouter(
		router: IMessageRouter,
		config: MessageServiceConfig
	): boolean {
		return linkToRouterLazy(router, config, this.getSignal.bind(this))
	}
}
