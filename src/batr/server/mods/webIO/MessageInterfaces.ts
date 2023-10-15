/**
 * 一个「消息回调」的类型
 */
export type MessageCallback<M = string> = (message: M) => string | undefined

/**
 * 一个抽象的「消息路由器」
 * * 可以进行「注册服务」
 */
export interface IMessageRouter {
	/**
	 * 注册消息服务
	 *
	 * @param {MessageCallback} messageCallback 消息回调函数
	 * @param {...unknown[]} configs 其它配置
	 * @returns {boolean} 是否成功
	 */
	registerMessageService(
		messageCallback: MessageCallback,
		...configs: unknown[]
	): boolean

	/**
	 * 注册消息服务
	 *
	 * @param {...unknown[]} configs 其它配置
	 * @returns {boolean} 是否成功
	 */
	unregisterMessageService(...configs: unknown[]): boolean
}
