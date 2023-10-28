import { uint } from 'matriangle-legacy/AS3Legacy'
import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import { voidF } from 'matriangle-common/utils'
import {
	IMessageRouter,
	MessageCallback,
	getAddress,
} from './MessageInterfaces'
import { IMessageService } from './MessageInterfaces'

/**
 * 「网络消息路由器」是
 * * 统一管理各种「消息服务」的
 * * 支持对接外界消息（请求）与内部行为（订阅、消息）对接的
 * 对象
 *
 * ! 路由器使用形如「主机:端口」的「地址」进行「服务区分」
 * * 此即：一个「地址」只能对应一个「消息服务」
 *   * 这样保证只存在一个`localhost:8080`不会同时存在`http://localhost:8080`和`ws://localhost:8080`
 */
export default class MessageRouter implements IMessageRouter {
	// 服务部分 //

	/**
	 * 服务（器）集群
	 * * 以地址为键，以服务为值
	 */
	protected _services: Map<string, IMessageService> = new Map()
	/**
	 * 回调集群
	 * * 用于分派所有订阅到该回复的消息
	 *   * ！可能会对「并行回复」失效
	 */
	protected _callbacks: Map<string, IMessageService> = new Map()

	/** @implements 实现：查字典 */
	hasServiceAt(host: string, port: uint): boolean {
		return this._services.has(getAddress(host, port))
	}

	/** @implements 实现：查字典 */
	getServiceAt(host: string, port: uint): IMessageService | undefined {
		return this._services.get(getAddress(host, port))
	}

	/** @implements 实现：对接内部实现 */
	registerService(
		service: IMessageService,
		launchedCallback?: voidF
	): boolean {
		// 先判断是否有，如果有则阻止
		if (this.hasServiceAt(service.host, service.port)) {
			console.warn(
				`[WebMessageRouter] 服务地址「${service.address}」已被注册，无法重复注册！`
			)
			console.info(`（WIP）正在尝试追加服务回调...`)
			const currentService: IMessageService = this.getServiceAt(
				service.host,
				service.port
			) as IMessageService
			const oldCallback: MessageCallback = currentService.messageCallback
			currentService.messageCallback = (
				message: string
			): string | undefined => {
				// * 【2023-10-14 18:45:56】服务串联：send先前的一个，返回最新的（HTTP可能就直接舍弃了）
				const msg1: string | undefined = oldCallback(message)
				const msg2: string | undefined =
					service.messageCallback(message)
				if (msg1 !== undefined) currentService.send?.(msg1)
				return msg2
			}
			return false
		}
		// 注册并启动
		this._services.set(service.address, service)
		service.launch(launchedCallback)
		return true
	}

	/**
	 * 注销服务
	 *
	 * @param {IMessageService} service 要注销的服务
	 * @returns {boolean} 是否注销成功
	 */
	public unregisterService(
		service: IMessageService,
		stoppedCallBack?: voidF
	): boolean {
		// 先判断有没有，如果没有则阻止
		if (this.hasServiceAt(service.host, service.port)) {
			console.warn(
				`[WebMessageRouter] 服务地址「${service.address}」未注册，无法注销！`
			)
			return false
		}
		// 停止并注销
		service.stop(stoppedCallBack)
		this._services.delete(service.address)
		return true
	}

	// !【2023-10-28 13:47:56】现在不内置任何「特定服务注册」的方法，转向暴露「各类服务」的注册方法

	/**
	 * 注销指定地址的服务
	 * * 地址格式：`协议类型://主机名:端口`
	 *
	 * @param {string} host 注销服务的服务主机地址
	 * @param {uint} port 注销服务的服务端口
	 * @param {() => void} callback 在服务停止时回传的回调函数
	 */
	public unregisterServiceAt(
		host: string,
		port: uint,
		callback?: voidF
	): boolean {
		const key: string = getAddress(host, port)
		if (this._services.has(key))
			return this.unregisterService(
				this._services.get(key) as IMessageService,
				callback
			)
		return false
	}

	protected _temp_sendMessageTo_address: string | undefined = undefined
	sendMessageTo(host: string, port: uint, message: string): boolean {
		this._temp_sendMessageTo_address = getAddress(host, port)
		// 有服务
		if (this._services.has(this._temp_sendMessageTo_address))
			if (
				(
					this._services.get(
						this._temp_sendMessageTo_address
					) as IMessageService
				).send !== undefined
			) {
				// 支持发送消息
				;(
					(
						this._services.get(
							this._temp_sendMessageTo_address
						) as IMessageService
					).send as CallableFunction
				)(message)
				return true // 只要到了这里，都视作「可传输⇒成功发送」
			}
			// 不支持
			else
				console.error(
					`服务「${this._temp_sendMessageTo_address}」不支持发送消息`
				)
		// 没服务
		else console.error(`服务「${this._temp_sendMessageTo_address}」不存在`)

		return false
	}
}

/**
 * 「消息路由器程序」是
 * * 统一管理各种「消息服务」的
 * * 支持对接外界消息（请求）与内部行为（订阅、消息）对接的
 * 母体程序
 *
 * ! 其内置一个「消息路由器」对象，以便集成到Matriangle中
 */
export class ProgramMessageRouter
	extends MatrixProgram
	implements IMessageRouter
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'MessageRouter'

	// 构造函数&析构函数 //
	public constructor(
		label: MatrixProgramLabel = ProgramMessageRouter.LABEL,
		protected router: IMessageRouter = new MessageRouter()
	) {
		super(label)
	}

	// 服务部分 //

	/** @implements 实现：转发给内部路由器 */
	registerService(
		service: IMessageService,
		launchedCallback?: voidF
	): boolean {
		return this.router.registerService(service, launchedCallback)
	}

	/** @implements 实现：转发给内部路由器 */
	unregisterServiceAt(host: string, port: number, callback?: voidF): boolean {
		return this.router.unregisterServiceAt(host, port, callback)
	}

	/** @implements 实现：转发给内部路由器 */
	hasServiceAt(host: string, port: number): boolean {
		return this.router.hasServiceAt(host, port)
	}

	/** @implements 实现：转发给内部路由器 */
	getServiceAt(host: string, port: number): IMessageService | undefined {
		return this.router.getServiceAt(host, port)
	}

	/** @implements 实现：转发给内部路由器 */
	sendMessageTo(host: string, port: number, message: string): boolean {
		return this.router.sendMessageTo(host, port, message)
	}
}
