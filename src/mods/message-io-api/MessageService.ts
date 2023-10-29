import { voidF } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import {
	MessageCallback,
	MessageServiceType,
	getAddress,
	getFullAddress,
} from './MessageInterfaces'
import { IMessageService } from './MessageInterfaces'
import MessageRouter from './MessageRouter'

/**
 * 一个抽象的、封装好的「服务」
 * * 对外隐藏了具体协议的差别（除了在功能上的差别）
 * * 基础功能：回复消息、回传消息（仅双工协议支持）
 */
export abstract class MessageService implements IMessageService {
	/** 构造函数 */
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
		 * 收到消息时的「消息回调函数」
		 * * 类型：字符串⇒字符串
		 */
		public messageCallback: MessageCallback
	) {}

	/** @implements 释放主机地址、服务端口回调函数引用 */
	destructor(): void {
		;(this.host as unknown) = ''
		;(this.port as unknown) = 0
		;(this.messageCallback as unknown) = undefined
	}

	/** @implements 服务类型——抽象属性 */
	abstract readonly type: MessageServiceType

	/** @implements 默认实现 */
	get address(): string {
		return getAddress(this.host, this.port)
	}

	/** @implements 加上「主机类型」 */
	get addressFull(): string {
		return getFullAddress(this.type, this.host, this.port)
	}

	/** @implements 启动服务——抽象方法 */
	abstract launch(callback?: voidF): void

	/** @implements 终止服务——抽象方法 */
	abstract stop(callback?: voidF): void

	/** @implements 是否活跃——抽象方法 */
	abstract get isActive(): boolean
}

/**
 * 自带的「回响」服务
 * * 适用于「多输入单输出」的单向消息传输（不能回传）
 * * 实现：{@link send}方法**直接**向「消息回调函数」发送消息
 *   * 不管这里的{@link send}是从哪调用的
 * * 使用方法：
 *   * 「服务端」：注册一个这样的服务
 *   * 「客户端」：让路由器对这个地址调用{@link send}方法
 *
 * ! 不推荐尝试在「消息回调函数」中「回传消息」
 */
export class EchoService extends MessageService {
	/** 服务类型：直连 */
	override readonly type: string = 'echo'

	/** 记录「是否启动」 */
	protected _isLaunched: boolean = false

	/** @implements 实现：更改状态 */
	launch(callback?: voidF | undefined): void {
		// 更改状态
		this._isLaunched = true
		// 调用回调
		callback?.()
	}

	/** @implements 实现：更改状态 */
	stop(callback?: voidF | undefined): void {
		// 更改状态
		this._isLaunched = false
		// 调用回调
		callback?.()
	}

	/** @implements 实现：是否启动 */
	get isActive(): boolean {
		return this._isLaunched
	}

	/** @implements 实现：直接向「消息回调函数」发送消息 */
	send(message: string): void {
		this.messageCallback(message)
	}
}

/**
 * 自带的「直连」服务
 * * 适用于在同一端（同为Node或浏览器）中模拟「消息传输」
 * * 实现：{@link send}方法**直接**向「消息回调函数」发送消息
 *   * 不管这里的{@link send}是从哪调用的
 * * 使用方法：适用于「多输入单输出」的单向消息传输（不能回传）
 *   * 「服务端」：注册一个这样的服务
 *   * 「客户端」：让路由器对这个地址调用{@link send}方法
 *
 * ! 不推荐尝试在「消息回调函数」中「回传消息」
 */
export class DirectService extends MessageService {
	/**
	 * 构造函数
	 * @param host 服务主机地址
	 * @param port 服务端口
	 * @param messageCallback 收到消息时的「回调处理函数」
	 * @param linkage 见属性{@link linkage}
	 */
	public constructor(
		host: string,
		port: uint,
		messageCallback: MessageCallback,
		/**
		 * 用于配置「发送目标」的连接
		 * * 机制：发送消息时，直接调用另一方相同地址（若有）服务的「消息回调函数」
		 */
		protected linkage: MessageRouter
	) {
		super(host, port, messageCallback)
	}

	/** @override 释放「连接」的引用 */
	override destructor(): void {
		;(this.linkage as unknown) = undefined
		super.destructor()
	}

	/** 服务类型：直连 */
	override readonly type: string = 'direct'

	/** 记录「是否启动」 */
	protected _isLaunched: boolean = false

	/** @implements 实现：更改状态 */
	launch(callback?: voidF | undefined): void {
		// 更改状态
		this._isLaunched = true
		// 调用回调
		callback?.()
	}

	/** @implements 实现：更改状态 */
	stop(callback?: voidF | undefined): void {
		// 更改状态
		this._isLaunched = false
		// 调用回调
		callback?.()
	}

	/** @implements 实现：是否启动 */
	get isActive(): boolean {
		return this._isLaunched
	}

	/** @implements 实现：查询「连接」中「地址相同的服务」，并直接调用其「消息回调函数」 */
	send(message: string): void {
		if (this.linkage.hasServiceAt(this.host, this.port))
			/*
			?【2023-10-29 15:40:34】这里是否要有「利用其消息处理后的数据」
			! 目前观点是：不需要
			* 因为另一侧的服务（比如另一个「直连服务」）会使用{@link send}方法回传
			*/
			(
				this.linkage.getServiceAt(
					this.host,
					this.port
				) as IMessageService
			).messageCallback(message)
	}
}
