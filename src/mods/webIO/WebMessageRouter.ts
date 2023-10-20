import {
	createServer,
	Server as HTTPServer,
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	Server as WebSocketServer,
	WebSocket,
	MessageEvent,
	ErrorEvent,
	CloseEvent,
} from 'ws' // 需要使用`npm i --save-dev ws @types/ws`安装
import { uint } from 'matriangle-legacy/AS3Legacy'
import {
	MatrixProgram,
	MatrixProgramLabel,
} from 'matriangle-api/server/control/MatrixProgram'
import { MessageCallback, IMessageRouter } from './MessageInterfaces'
import { voidF } from 'matriangle-common/utils'

/**
 * 目前支持的「网络」服务类型
 */
export type NativeWebServiceType = 'http' | 'ws' | 'ws-client'

/**
 * 拼接地址
 * * 只会拼接完整服务地址，不会区分具体协议
 * @param {string} hostName 主机地址
 * @param {uint} port 端口
 * @returns 主机地址:端口
 */
function getAddress(hostName: string, port: uint): string {
	return `${hostName}:${port}`
}

/**
 * 「网络消息路由器」是
 * * 统一管理各种「消息服务」，包括HTTP和WebSocket的（均使用Node框架）
 * * 支持对接外界消息（请求）与内部行为（订阅、消息）对接的
 * 母体程序
 */
export default class WebMessageRouter
	extends MatrixProgram
	implements IMessageRouter
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'WebMessageRouter'

	// 构造函数&析构函数 //
	public constructor(label: MatrixProgramLabel = WebMessageRouter.LABEL) {
		super(label)
	}

	// 服务部分 //

	/**
	 * 服务（器）集群
	 * * 以地址为键，以服务为值
	 */
	protected _services: Map<string, IService> = new Map()
	/**
	 * 回调集群
	 * * 用于分派所有订阅到该回复的消息
	 *   * ！可能会对「并行回复」失效
	 */
	protected _callbacks: Map<string, IService> = new Map()

	/**
	 * 注册服务
	 *
	 * @param {IService} service 已构造好的服务
	 *
	 * @returns {boolean} 是否注册成功
	 */
	public registerService(
		service: IService,
		launchedCallback?: voidF
	): boolean {
		// 先判断是否有，如果有则阻止
		if (this._services.has(service.address)) {
			console.warn(
				`[WebMessageRouter] 服务地址「${service.address}」已被注册，无法重复注册！`
			)
			console.info(`（WIP）正在尝试追加服务回调...`)
			const currentService: IService = this._services.get(
				service.address
			) as IService
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
	 * @param {IService} service 要注销的服务
	 *
	 * @returns {boolean} 是否注销成功
	 */
	public unregisterService(
		service: IService,
		stoppedCallBack?: voidF
	): boolean {
		// 先判断有没有，如果没有则阻止
		if (this._services.has(service.address)) {
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

	/**
	 * 注册HTTP服务（并立即启动）
	 *
	 * @param {string} host 注册服务的服务主机地址
	 * @param {uint} port 注册服务的服务端口
	 * @param {(message:string) => string} messageCallback 在收到消息时「进行处理并回传（阻塞）」的「消息处理回调函数」
	 * @param {() => void} launchedCallback 在启动时回传的回调函数
	 *
	 * @returns {boolean} 是否启动成功
	 */
	public registerHTTPService(
		host: string,
		port: uint,
		messageCallback: MessageCallback,
		launchedCallback?: voidF
	): boolean {
		return this.registerService(
			new HTTPServiceServer(host, port, messageCallback),
			launchedCallback
		)
	}

	/**
	 * 注册WebSocket（服务端）服务（并立即启动）
	 *
	 * @param {string} host 注册服务的服务主机地址
	 * @param {uint} port 注册服务的服务端口
	 * @param {(message:string) => string} messageCallback 在收到消息时「进行处理并回传（阻塞）」的「消息处理回调函数」
	 * @param {() => void} launchedCallback 在启动时回传的回调函数
	 *
	 * @returns {boolean} 是否启动成功
	 */
	public registerWebSocketService(
		host: string,
		port: uint,
		messageCallback: MessageCallback,
		launchedCallback?: voidF
	): boolean {
		return this.registerService(
			new WebSocketServiceServer(host, port, messageCallback),
			launchedCallback
		)
	}

	/**
	 * 注册WebSocket客户端服务（并立即启动）
	 *
	 * @param {string} host 注册服务的服务主机地址
	 * @param {uint} port 注册服务的服务端口
	 * @param {(message:string) => string} messageCallback 在收到消息时「进行处理并回传（阻塞）」的「消息处理回调函数」
	 * @param {() => void} launchedCallback 在启动时回传的回调函数
	 *
	 * @returns {boolean} 是否启动成功
	 */
	public registerWebSocketServiceClient(
		host: string,
		port: uint,
		messageCallback: MessageCallback,
		launchedCallback?: voidF
	): boolean {
		return this.registerService(
			new WebSocketServiceClient(host, port, messageCallback),
			launchedCallback
		)
	}

	/**
	 * 以指定类型注册（并立即启动）服务
	 * *【2023-10-12 20:28:35】目前只支持HTTP和WebSocket两种服务
	 *
	 * @param {NativeWebServiceType} type 注册的服务类型
	 * @param {string} host 注册服务的服务主机地址
	 * @param {uint} port 注册服务的服务端口
	 * @param {(message:string) => string} messageCallback 在收到消息时「进行处理并回传（阻塞）」的「消息处理回调函数」	 * @param {() => void} launchedCallback 在启动时回传的回调函数
	 * @param {() => void} launchedCallback 在启动时回传的回调函数
	 *
	 * @returns {boolean} 是否启动成功
	 */
	public registerServiceWithType(
		type: NativeWebServiceType,
		host: string,
		port: uint,
		messageCallback: MessageCallback,
		launchedCallback?: voidF
	): boolean {
		switch (type) {
			case 'http':
				return this.registerHTTPService(
					host,
					port,
					messageCallback,
					launchedCallback
				)
			case 'ws':
				return this.registerWebSocketService(
					host,
					port,
					messageCallback,
					launchedCallback
				)
			case 'ws-client':
				return this.registerWebSocketServiceClient(
					host,
					port,
					messageCallback,
					launchedCallback
				)
			/* default:
				console.error(`未知的服务类型：${type}`);
				return false; */
		}
	}

	/**
	 * 注销指定地址的服务
	 * * 地址格式：`协议类型://主机名:端口`
	 *
	 * @param {NativeWebServiceType} type 注销的服务类型
	 * @param {string} host 注销服务的服务主机地址
	 * @param {uint} port 注销服务的服务端口
	 * @param {() => void} callback 在服务停止时回传的回调函数
	 */
	public unregisterServiceWithType(
		type: NativeWebServiceType,
		host: string,
		port: uint,
		callback?: voidF
	): boolean {
		const key: string = `${type}:${getAddress(host, port)}`
		if (this._services.has(key))
			return this.unregisterService(
				this._services.get(key) as IService,
				callback
			)
		return false
	}

	public sendMessageTo(address: string, message: string): void {
		// 有服务
		if (this._services.has(address))
			if ((this._services.get(address) as IService).send !== undefined)
				// 支持发送消息
				(
					(this._services.get(address) as IService)
						.send as CallableFunction
				)(message)
			// 不支持
			else console.error(`服务「${address}」不支持发送消息`)
		// 没服务
		else console.error(`服务「${address}」不存在`)
	}

	// 实现：消息路由器 //
	/** @implements 实现：把「消息回调函数」放最前头 */
	registerMessageService(
		messageCallback: MessageCallback,
		type: NativeWebServiceType,
		host: string,
		port: uint,
		launchedCallback?: voidF
	): boolean {
		return this.registerServiceWithType(
			type,
			host,
			port,
			messageCallback,
			launchedCallback
		)
	}

	/** @implements 实现：复刻一遍先前的参数 */
	unregisterMessageService(
		type: NativeWebServiceType,
		host: string,
		port: uint,
		callback?: voidF
	): boolean {
		return this.unregisterServiceWithType(type, host, port, callback)
	}
}

// 服务（器）部分 //
interface IService {
	/** 地址 */
	get address(): string

	/** 启动 */
	launch(callback?: voidF): void

	/** 终止 */
	stop(callback?: voidF): void

	/**
	 * （主动）回传消息（不一定有实现，比如单工的HTTP）
	 *
	 * ?【2023-10-12 19:55:46】不知为何，在抽象类中无法做到可选实现，即便是标了问号也是一样
	 */
	send?(message: string): void

	/**
	 * 收到消息时的「回调处理函数」
	 * * 类型：字符串⇒字符串
	 */
	messageCallback: MessageCallback
}

/**
 * 一个抽象的、封装好的「服务」
 * * 对外隐藏了具体协议的差别（除了在功能上的差别）
 * * 基础功能：回复消息、回传消息（仅双工协议支持）
 */
abstract class Service implements IService {
	public constructor(
		/**
		 * 服务主机地址
		 */
		public readonly host: string,
		/**
		 * 服务端口
		 */
		public readonly port: uint,
		/**
		 * 收到消息时的「回调处理函数」
		 * * 类型：字符串⇒字符串
		 */
		public messageCallback: MessageCallback
	) {}

	/** 主机类型：HTTP/WebSocket */
	public abstract readonly SERVICE_TYPE: string

	/** 服务器地址 */
	public get address(): string {
		return getAddress(this.host, this.port)
	}

	/** 启动服务器 */
	public abstract launch(callback?: voidF): void

	/** 终止服务器 */
	public abstract stop(callback?: voidF): void
}

/** HTTP服务器 */
class HTTPServiceServer extends Service {
	/**
	 * 存储当前HTTP服务器
	 */
	protected _server?: HTTPServer

	/** 服务器类型：HTTP */
	override readonly SERVICE_TYPE: string = 'HTTP'

	/** @override 重载：HTTP地址前缀 */
	override get address(): string {
		return `http://${getAddress(this.host, this.port)}`
	}

	/**
	 * 启动HTTP服务器
	 * * 以所收到请求的URL（{@link IncomingMessage.url}）为消息
	 *   * 无消息⇒空字串
	 *
	 * ? 似乎缺少一个「是否启动成功」的标签信息
	 */
	launch(callback?: voidF): void {
		try {
			// 创建服务器 // ! 注意：服务器的行为在创建时就已决定
			this._server = createServer(
				(req: IncomingMessage, res: ServerResponse): void => {
					res.writeHead(200, { 'Content-Type': 'text/plain' })
					/** 有可能回调没有回复 */
					const reply: string | undefined = this.messageCallback(
						// 尝试从URL中解析
						req.url?.slice(1) /* 截取掉开头的「/」 */ ?? ''
					)
					// 直接使用reply，因为undefined也是允许的
					res.end(reply)
				}
			)
			// 回调告知
			if (callback !== undefined) this._server.on('listening', callback)
			// 开始侦听
			this._server.listen(this.port, this.host, (): void => {
				// 启动成功
				console.log(`${this.address}：服务器启动成功`)
			})
			// 报错
			this._server.on('error', (e: Error): void => {
				console.error(`${this.address}：服务器运行出错！`, e)
			})
		} catch (e) {
			console.error(`HTTP服务器${this.host}:${this.port}启动失败！`, e)
		}
	}

	/**
	 * 终止HTTP服务器
	 */
	stop(callback?: voidF): void {
		this._server?.close((): void => {
			console.log(`HTTP服务器${this.host}: ${this.port}已关闭！`)
			// 这里可以执行一些清理操作或其他必要的处理
			callback?.()
		})
	}
}

/** WebSocket服务器 */
class WebSocketServiceServer extends Service {
	/**
	 * 存储当前WebSocket服务器
	 */
	protected _server?: WebSocketServer

	/** 存储所有连接至此的WebSocket连接 */
	protected _connections: Set<WebSocket> = new Set()

	/** 服务器类型：WebSocket */
	override readonly SERVICE_TYPE: string = 'WebSocket'

	/** @override 重载：WebSocket地址前缀 */
	override get address(): string {
		return `ws://${getAddress(this.host, this.port)}`
	}

	// !【2023-10-12 21:08:47】目前无需存储所有与服务器连接的WebSocket
	// ! 1. 在`on('connection')`中传入的`socket.url`为undefined，无法生成有意义的键
	// ! 2. 目前只需「多个WS连接→一个回调函数」，暂时不需要「一对一」逻辑（后者可以再创建一个服务器）

	/**
	 * 启动WebSocket服务器
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	launch(callback?: voidF): void {
		try {
			// 创建服务器
			this._server = new WebSocketServer(
				{ host: this.host, port: this.port },
				(): void => {
					console.log(`${this.address}：服务器已成功启动`)
					// 回调告知
					callback?.()
				}
			)
			// 开始侦听连接
			this._server.on('connection', (socket: WebSocket): void => {
				// 提示
				console.log(
					`${this.address}：与${socket.url}的WebSocket连接已建立！`,
					socket
				)
				// 加入集合
				this._connections.add(socket)
				// 继续往Socket添加钩子
				socket.on('message', (messageBuffer: Buffer): void => {
					// !【2023-10-07 14:45:37】现在统一把消息缓冲区转成字符串，交给内部的函数处理
					/** 有可能不回复 */
					const reply: string | undefined = this.messageCallback(
						messageBuffer.toString('utf-8') // !【2023-10-12 20:39:19】统一使用UTF-8字符集
					)
					// 条件回传
					if (reply !== undefined) socket.send(reply)
				})
				// 关闭时（只有一次）
				socket.once('close', (code: number, reason: string): void => {
					// 提示
					console.log(
						`${this.address}：与${socket.url}的WebSocket连接已断开！`,
						code,
						reason
					)
					// 移出集合
					this._connections.delete(socket)
				})
				// 报错
				socket.once('error', (error: Error): void => {
					// 提示
					console.error(
						`${this.address}：与${socket.url}的WebSocket连接发生错误！`,
						error
					)
				})
				// 移出集合
				this._connections.delete(socket)
			})
		} catch (e) {
			console.error(`${this.address}：服务器启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket服务器
	 */
	stop(callback?: voidF): void {
		// 关闭服务器
		this._server?.close((): void => {
			console.log(`${this.address}：服务器已关闭！`)
			// 这里可以执行一些清理操作或其他必要的处理
			callback?.()
		})
		// 清除所有连接
		if (this._server !== undefined) this._connections.clear()
		// 删除服务器引用
		delete this._server
	}

	/** @implements 实现：向所有已连接的「WebSocket连接」发送消息 */
	send(message: string): void {
		for (const connection of this._connections) {
			// 有连接⇒发送
			if (connection.readyState === WebSocket.OPEN)
				connection.send(message)
			// 没连接⇒警告
			else
				console.warn(
					`send: 连接未打开，无法发送消息「${message}」！`,
					connection
				)
		}
	}
}

/** WebSocket客户端 */
class WebSocketServiceClient extends Service {
	/**
	 * 存储当前WebSocket服务器
	 */
	protected _connection?: WebSocket

	/** 服务器类型：WebSocket */
	override readonly SERVICE_TYPE: string = 'WebSocket-Client'

	/** @override 重载：WebSocket地址前缀 */
	override get address(): string {
		return `ws://${getAddress(this.host, this.port)}`
	}

	// !【2023-10-12 21:08:47】目前无需存储所有与服务器连接的WebSocket
	// ! 1. 在`on('connection')`中传入的`socket.url`为undefined，无法生成有意义的键
	// ! 2. 目前只需「多个WS连接→一个回调函数」，暂时不需要「一对一」逻辑（后者可以再创建一个服务器）

	/**
	 * 启动WebSocket服务器
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	launch(callback?: voidF): void {
		try {
			// 创建服务
			this._connection = new WebSocket(this.address)
			// 直接回调
			callback?.()
			// 开始侦听连接
			// 提示
			console.log(
				`${this.address}：WebSocket连接已建立！`,
				this._connection
			)
			// 继续往Socket添加钩子
			this._connection.onmessage = (event: MessageEvent): void => {
				// ! event.data的类型就是`string`
				/** 有可能不回复 */
				const reply: string | undefined = this.messageCallback(
					String(event.data)
				)
				// 条件回传
				if (reply !== undefined) this._connection?.send(reply)
			}
			// 关闭时（只有一次）
			this._connection.onclose = (event: CloseEvent): void => {
				// 提示
				console.log(
					`${this.address}：与${this._connection?.url}的WebSocket连接已断开！`,
					event.code,
					event.reason
				)
			}
			// 报错
			this._connection.onerror = (event: ErrorEvent): void => {
				// 提示
				console.error(
					`${this.address}：与${this._connection?.url}的WebSocket连接发生错误！`,
					event.error
				)
			}
		} catch (e) {
			console.error(`${this.address}：服务器启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket服务器
	 */
	stop(callback?: voidF): void {
		this._connection?.close()
		console.log(`${this.address}：服务器已关闭！`)
		// 这里可以执行一些清理操作或其他必要的处理
		callback?.()
		delete this._connection
	}

	/** @implements 实现：添加进缓存，然后尝试发送所有 */
	send(message: string): void {
		// 缓存
		this._temp_message_toSend.push(message)
		if (!this.trySendAll() /* 成功⇒清空缓存 */) {
			console.warn(`未能发送消息「${message}」，已将其缓存！`)
			if (
				this._connection === undefined ||
				this._connection?.readyState === WebSocket.CLOSED
			) {
				console.info(`正在尝试重连${this.address}。。。`)
				// 重启
				this.stop()
				this.launch()
			}
		}
	}

	/**
	 * 尝试发送所有缓存的消息
	 *
	 * @returns 是否发送成功（连接打开）
	 */
	protected trySendAll(): boolean {
		// 必须是打开状态
		if (this._connection?.readyState === WebSocket.OPEN) {
			// 尝试发送所有缓存的消息
			for (let i: uint = 0; i < this._temp_message_toSend.length; i++)
				this._connection.send(this._temp_message_toSend[i])
			// 清空缓存
			this._temp_message_toSend.length = 0
			return true
		}
		return false
	}
	protected readonly _temp_message_toSend: string[] = []
}
