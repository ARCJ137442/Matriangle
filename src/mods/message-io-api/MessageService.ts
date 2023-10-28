import { voidF } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import {
	MessageCallback,
	MessageServiceType,
	getAddress,
	getFullAddress,
} from './MessageInterfaces'
import { IMessageService } from './MessageInterfaces'

/**
 * 一个抽象的、封装好的「服务」
 * * 对外隐藏了具体协议的差别（除了在功能上的差别）
 * * 基础功能：回复消息、回传消息（仅双工协议支持）
 */
export abstract class MessageService implements IMessageService {
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
 * 自带的「直连」服务
 * * 实现的{@link send}方法**直接**向「消息回调函数」发送消息
 *   * 不管这里的{@link send}是从哪调用的
 *
 * ! 不推荐尝试在「消息回调函数」中「回传消息」
 */
export class DirectService extends MessageService {
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

	/** @implements 实现：直接向「消息回调函数」发送消息 */
	send(message: string): void {
		this.messageCallback(message)
	}
}
