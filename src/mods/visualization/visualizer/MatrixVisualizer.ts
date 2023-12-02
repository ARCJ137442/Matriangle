import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import {
	IMessageRouter,
	MessageServiceConfig,
	linkToRouterLazy,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { uint } from 'matriangle-legacy'

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
	 * @param message 从客户端传递来的「显示请求」信息
	 * @param host 客户端的主机地址
	 * @param port 客户端的服务端口
	 *
	 * @returns 打包后的「可视化信号」 | undefined（无需回传，如「母体未连接」「无需更新」）
	 */
	public abstract getSignal(
		message: string,
		host: string,
		port: uint
	): string | undefined

	// 服务器部分 //

	/**
	 * 以指定IP、端口连接到「消息路由器」
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * !【2023-11-18 18:03:19】现在扩展自通用接口的处理方法
	 * * 尽可能统一信息接口，以便后续扩展多种不同的「可视化者」
	 * *【2023-11-22 15:38:34】现在将基于「消息服务配置」，将「消息地址信息」一并传入{@link getSignal}方法
	 *
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 * @param {MessageServiceConfig} config 消息服务配置
	 */
	public linkToRouter(
		router: IMessageRouter,
		config: MessageServiceConfig
	): boolean {
		return linkToRouterLazy(
			router,
			config,
			(message: string): string | undefined =>
				this.getSignal(message, config.host, config.port)
		)
	}
}
