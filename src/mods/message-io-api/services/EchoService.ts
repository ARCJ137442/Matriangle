import { voidF } from 'matriangle-common/utils'
import { MessageService } from '../MessageService'

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
