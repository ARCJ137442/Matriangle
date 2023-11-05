import { voidF } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
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

	/** @implements 强制更改常量+直接重启服务 */
	changeAddress(host: string, port: number, callback?: voidF): void {
		// 在关闭后重新启动
		this.stop((): void => this.launch(callback))
		;(this.host as unknown) = host
		;(this.port as unknown) = port
	}

	/** @implements 启动服务——抽象方法 */
	abstract launch(callback?: voidF): void

	/** @implements 终止服务——抽象方法 */
	abstract stop(callback?: voidF): void

	/** @implements 是否活跃——抽象方法 */
	abstract get isActive(): boolean
}
