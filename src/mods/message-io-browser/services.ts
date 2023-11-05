import { voidF } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { MessageService } from 'matriangle-mod-message-io-api/MessageService'

/** WebSocket服务-客户端 */
export class WebSocketServiceClient extends MessageService {
	/**
	 * 存储当前WebSocket连接
	 */
	protected _connection?: WebSocket

	/** 服务类型：WebSocket */
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
				// 直接回调 // ! 只有「连接建立」才算「启动完成」
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
			this._connection.onerror = (event: Event): void => {
				// 提示
				console.error(
					`${this.addressFull}：与${this._connection?.url}的WebSocket连接发生错误！`,
					event
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
		// ! 1000而非1005，因为实际运行报错：Failed to execute 'close' on 'WebSocket': The code must be either 1000, or between 3000 and 4999. 1005 is neither.
		this._connection?.close(1000, '调用`stop(callback?: voidF)`方法')
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

/** HTTP服务-客户端（请求发送者） */
export class HTTPServiceClient extends MessageService {
	/** 服务类型：WebSocket */
	override readonly type: string = 'http'

	/** @override 重载：是否连接到Websocket服务器且连接处于「打开」状态 */
	override get isActive(): boolean {
		return true
	}

	/**
	 * 启动WebSocket客户端
	 * * 似乎缺少一个「是否启动成功」的标签信息
	 */
	launch(callback?: voidF): void {
		try {
			// 视作成功，直接回调
			callback?.()
		} catch (e) {
			console.error(`${this.addressFull}：服务启动失败！`, e)
		}
	}

	/**
	 * 终止WebSocket客户端
	 */
	stop(callback?: voidF): void {
		console.log(`${this.addressFull}：客户端已关闭！`)
		// 这里可以执行一些清理操作或其他必要的处理
		callback?.()
	}

	/** @implements 实现：添加进缓存，然后尝试发送所有 */
	send(message: string): void {
		// 缓存
		this._temp_message_toSend.push(message)
		if (!this.trySendAll() /* 成功⇒清空缓存 */) {
			console.warn(`未能发送消息「${message}」，已将其缓存！`)
			if (!this.isActive) {
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
		if (this.isActive) {
			// 尝试发送所有缓存的消息
			for (let i: uint = 0; i < this._temp_message_toSend.length; i++) {
				// 使用XMLHttpRequest发送请求
				const xhr: XMLHttpRequest = new XMLHttpRequest()
				xhr.open(
					'POST',
					// * 形如：`http://127.0.0.1:8080/%3CA%20--%3E%20B%3E.` (<A --> B>.)
					this.addressFull + this._temp_message_toSend[i],
					true
				)
				xhr.setRequestHeader('Content-Type', 'text/plain')
				xhr.send() // 作为请求体发送
			}
			// 清空缓存
			this._temp_message_toSend.length = 0
			return true
		}
		return false
	}
	protected readonly _temp_message_toSend: string[] = []
}
