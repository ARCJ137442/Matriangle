import {
	Server as HTTPServer,
	createServer,
	IncomingMessage,
	ServerResponse,
} from 'http'
import { voidF } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import {
	Server as WebSocketServer,
	WebSocket,
	MessageEvent,
	CloseEvent,
	ErrorEvent,
} from 'ws'
import { MessageService } from 'matriangle-mod-message-io-api/MessageService'

/** HTTP服务-服务端 */
export class HTTPServiceServer extends MessageService {
	/**
	 * 存储当前HTTP服务端
	 */
	protected _server?: HTTPServer

	/** 存储「是否启动成功」 */
	protected _launched: boolean = false

	/** 服务类型 = 协议头 = http */
	override readonly type: string = 'http'

	/** @override 重载：是否成功启动 */
	override get isActive(): boolean {
		return this._launched
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
						// 尝试从URL中解析 // * 示例：`/%3CA%20--%3E%20B%3E.`(<A --> B>.)
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
				console.log(`${this.addressFull}：服务器启动成功`)
				this._launched = true
			})
			// 报错
			this._server.on('error', (e: Error): void => {
				console.error(`${this.addressFull}：服务器运行出错！`, e)
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
			this._launched = false
			// 这里可以执行一些清理操作或其他必要的处理
			callback?.()
		})
	}
}

/** WebSocket服务-服务端 */
export class WebSocketServiceServer extends MessageService {
	/**
	 * 存储当前WebSocket服务器
	 */
	protected _server?: WebSocketServer

	/** 存储所有连接至此的WebSocket连接 */
	protected _connections: Set<WebSocket> = new Set()

	/** 服务器类型：WebSocket */
	override readonly type: string = 'ws'

	/** @override 重载：是否有一个连接 */
	override get isActive(): boolean {
		return this._connections.size > 0
	}

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
					console.log(`${this.addressFull}：服务器已成功启动`)
					// 回调告知
					callback?.()
				}
			)
			// 开始侦听连接
			this._server.on('connection', (socket: WebSocket): void => {
				// 提示
				console.log(
					`${this.addressFull}：与${socket.url}的WebSocket连接已建立！`
					// socket
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
						`${this.addressFull}：与${socket.url}的WebSocket连接已断开！`,
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
						`${this.addressFull}：与${socket.url}的WebSocket连接发生错误！`,
						`error=${error.toString()}`
					)
					// 移出集合
					this._connections.delete(socket)
				})
			})
		} catch (e) {
			console.error(`${this.addressFull}：服务器启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket服务器
	 */
	stop(callback?: voidF): void {
		// 关闭服务器
		this._server?.close((): void => {
			console.log(`${this.addressFull}：服务器已关闭！`)
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

/** WebSocket服务-客户端 */
export class WebSocketServiceClient extends MessageService {
	/**
	 * 存储当前WebSocket连接
	 */
	protected _connection?: WebSocket

	/** 客户端类型：WebSocket */
	override readonly type: string = 'ws'

	/** @override 重载：是否连接到Websocket服务器且连接处于「打开」状态 */
	override get isActive(): boolean {
		return (
			this._connection !== undefined &&
			this._connection.readyState === WebSocket.OPEN
		)
	}

	/**
	 * 启动WebSocket客户端
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	launch(callback?: voidF): void {
		try {
			// 创建服务
			this._connection = new WebSocket(this.addressFull) // ! 这里必须使用完整地址启动
			// 开始侦听连接
			this._connection.onopen = (): void => {
				// 直接回调 // ! 只有「连接开启」才算「已经启动」
				callback?.()
				// 提示
				console.log(
					`${this.addressFull}：WebSocket连接已建立！`
					// this._connection
				)
			}
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
					`${this.addressFull}：与${this._connection?.url}的WebSocket连接已断开！`,
					`退出码=${event.code}`,
					`断开原因=${event.reason}`
				)
			}
			// 报错
			this._connection.onerror = (event: ErrorEvent): void => {
				// 提示
				console.error(
					`${this.addressFull}：与${this._connection?.url}的WebSocket连接发生错误！`,
					`error=${event.error}`
				)
			}
		} catch (e) {
			console.error(`${this.addressFull}：服务启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket客户端
	 */
	stop(callback?: voidF): void {
		this._connection?.close(1005, '调用`stop(callback?: voidF)`方法')
		console.log(`${this.addressFull}：客户端已关闭！`)
		// 这里可以执行一些清理操作或其他必要的处理
		callback?.() // ? 是否需要识别readyState
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
