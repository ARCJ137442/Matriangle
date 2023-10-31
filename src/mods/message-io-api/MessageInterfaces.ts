import { voidF } from 'matriangle-common'
import { uint } from 'matriangle-legacy'

/**
 * 一个「消息回调」的类型
 */
export type MessageCallback<M = string> = (message: M) => string | undefined

/**
 * 一个抽象的「消息路由器」
 * * 以「主机地址:端口」区分「消息服务」
 * * 可以进行「注册服务」「注销服务」「向服务发送消息」
 */
export interface IMessageRouter {
	/**
	 * 检查指定地址处是否有服务
	 *
	 * @param {string} host 主机地址
	 * @param {uint} port 服务端口
	 * @returns {boolean} 指定地址处是否有服务
	 */
	hasServiceAt(host: string, port: uint): boolean

	/**
	 * 获取指定地址处的服务
	 * * 无服务⇒undefined
	 *
	 * @param {string} host 主机地址
	 * @param {uint} port 服务端口
	 * @returns {IMessageService|undefined} 指定地址处的服务
	 */
	getServiceAt(host: string, port: uint): IMessageService | undefined

	/**
	 * 注册消息服务
	 *
	 * @param {IMessageService} service 已构造好的服务
	 * @param {voidF} launchedCallback 启动回调函数（可选）
	 * @returns {boolean} 是否成功
	 */
	registerService(service: IMessageService, launchedCallback?: voidF): boolean

	/**
	 * 注销消息服务
	 * * 地址格式：`主机名:端口`
	 *
	 * @param {string} host 主机地址
	 * @param {uint} port 服务端口
	 * @param {voidF} callback 注销后的回调
	 * @returns {boolean} 是否成功
	 */
	unregisterServiceAt(host: string, port: uint, callback?: voidF): boolean

	/**
	 * 变更指定地址的服务
	 * * 用于将服务从一个地址迁移到另一个地址
	 *
	 * @param {string} oldHost 旧主机地址
	 * @param {uint} oldPort 旧服务端口
	 * @param {string} newHost 新主机地址
	 * @param {uint} newPort 新服务端口
	 * @param {voidF} callback 变更后的回调
	 * @returns {boolean} 是否成功
	 */
	changeServiceAt(
		oldHost: string,
		oldPort: uint,
		newHost: string,
		newPort: uint,
		callback?: voidF
	): boolean

	/**
	 * 传递消息到指定地址
	 *
	 * @param {string} host 主机地址
	 * @param {uint} port 服务端口
	 * @param {string} message 消息
	 * @returns {boolean} 是否成功
	 */
	sendMessageTo(host: string, port: uint, message: string): boolean
}
/**
 * 目前支持的「消息服务」类型
 * * 支持所有的字符串，但只有指定字符串才有效
 */

export type MessageServiceType = string // 'http' | 'ws' | 'ws-client' | 'direct'

/**
 * 拼接地址
 * * 只会拼接完整服务地址，不会区分具体协议
 *
 * @param {string} hostName 主机地址
 * @param {uint} port 端口
 * @returns {string} 主机地址:端口
 */
export function getAddress(hostName: string, port: uint): string {
	return `${hostName}:${port}`
}

/**
 * 封装一个完整的消息服务地址
 * * 用于在消息路由器中索引
 *
 * @param type 消息服务类型
 * @param {string} host 主机地址
 * @param {uint} port 服务端口
 * @returns {string} 完整的「带协议头（类型）」地址，如`http://localhost:8080`
 */
export function getFullAddress(
	type: MessageServiceType,
	host: string,
	port: uint
): string {
	return ` ${type}://${getAddress(host, port)}`
}

/**
 * 所有「消息服务」的统一接口
 */
export interface IMessageService {
	/** 析构函数 */
	destructor(): void

	/** 主机地址 */
	get host(): string

	/** 服务端口 */
	get port(): uint

	/** 地址（无协议头） */
	get address(): string

	/** 完整地址（有协议头） */
	get addressFull(): string

	/**
	 * 服务类型（=协议类型）
	 *
	 * ! 不作为区分「服务类型」的唯一标识符
	 * * 如：「Websocket客户端」与「Websocket服务端」共用一个「服务类型」
	 */
	get type(): MessageServiceType

	/**
	 * 启动
	 * @param callback **成功启动**后的回调（启动失败⇒不会调用）
	 */
	launch(callback?: voidF): void

	/**
	 * 变更地址
	 * * 会涉及「启动」和「停止」
	 * * 可以理解成「换个地方再服务」
	 */
	changeAddress(host: string, port: uint, callback?: voidF): void

	/**
	 * 终止
	 * @param callback **成功终止**后的回调
	 */
	stop(callback?: voidF): void

	/**
	 * （主动）回传消息（不一定有实现，比如单工的HTTP）
	 *
	 * ?【2023-10-12 19:55:46】不知为何，在抽象类中无法做到可选实现，即便是标了问号也是一样
	 */
	send?(message: string): void

	/**
	 * 是否处于「活跃」状态
	 * * 例@HTTP：永远处于「待接收状态」，返回值=是否启动成功
	 * * 例@WebSocket：只需「有一个连接」，返回值=是否有连接
	 */
	get isActive(): boolean

	/**
	 * 收到消息时的「回调处理函数」
	 * * 类型：字符串⇒字符串
	 */
	messageCallback: MessageCallback
}

/**
 * 判断对象是否为「消息服务」
 * * 判断依据：是否有「消息回调函数」{@link IMessageService.messageCallback}
 *
 * @param obj 要判断的对象
 * @returns 对象是否是「消息服务」
 */
export function i_IMessageService(obj: unknown): obj is IMessageService {
	return (obj as IMessageService).messageCallback !== undefined
}
