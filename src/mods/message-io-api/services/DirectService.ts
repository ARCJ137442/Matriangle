import { voidF } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { IMessageRouter, MessageCallback } from '../MessageInterfaces'
import { MessageService } from '../MessageService'

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
		protected linkage: IMessageRouter
	) {
		console.log(
			'DirectService: constructor!',
			host,
			port,
			messageCallback,
			linkage
		)
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
		// 提示
		console.log(`${this.addressFull}：直连连接已建立！`, this.linkage)
	}

	/** @implements 实现：更改状态 */
	stop(callback?: voidF | undefined): void {
		// 更改状态
		this._isLaunched = false
		// 调用回调
		callback?.()
		// 提示
		console.log(`${this.addressFull}：直连连接已停止！`, this.linkage)
	}

	/** @implements 实现：是否启动 */
	get isActive(): boolean {
		return this._isLaunched
	}

	/**
	 * @implements 实现：查询「连接」中「地址相同的服务」，并直接调用其「消息回调函数」
	 *
	 * Notes:
	 * * 本身类似Websocket的逻辑，只不过「客户端」「服务端」使用一样的服务。
	 * * 其实际上不需要通过其它渠道侦听「消息被接收」，它只需要简单地调用「对方的消息回调函数」并（尝试）直接作回应
	 *
	 * ! 注意：可能会有「反复直连」（双方的「消息回调函数」都要求回信）的情况
	 * * 这时候两个「直连服务」就像两面镜子一样，几乎是极限速度地「反射」消息
	 * * 这可能导致运行者卡死，或递归层数太多堆栈溢出
	 * * 📌必须得有个「终止条件」
	 *
	 * @param message 要发送的消息
	 */
	send(message: string): void {
		// 仅「已激活」时处理
		if (this.isActive) {
			/* console.log(
				`DirectService: send! [isLaunched=${this._isLaunched}]`,
				message,
				this
			) */

			// 有服务⇒直接调用其消息回调函数
			if (this.linkage.hasServiceAt(this.host, this.port)) {
				// * 直接朝对应服务「发送消息」（调用回调函数），获得响应
				const response: string | undefined = this.linkage
					.getServiceAt(this.host, this.port)!
					.messageCallback(message)
				// * 模拟「收到回应」：只有在「有响应」时调用自身的回调函数
				if (response !== undefined) {
					/* console.log('接收消息：', message, '=>', response)
					console.log(
						'DirectService: response!',
						this.linkage.getServiceAt(this.host, this.port)!
							.messageCallback,
						this.messageCallback
					) */
					// ?【2023-11-05 18:31:11】是否要利用自身的回调函数
					this.messageCallback(response)
				}
			}
		}
	}
}
