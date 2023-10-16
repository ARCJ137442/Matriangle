import { MatrixEventDispatcher, MatrixProgramLabel } from 'matriangle-api'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from '../IPlayer'
import { PlayerEventOptions } from './PlayerEvent'

/**
 * 「玩家控制器」
 * * 一个专用的用于控制玩家的世界控制器
 * * 封装了一系列有关玩家的钩子
 * * 适用于：在「控制玩家」的基础上，需要「获取玩家反馈」的控制程序
 *
 * !【2023-10-09 21:20:28】现在不再是「活跃实体」：目前只需要处理「玩家需要其『反应』的`NativePlayerEvent.TICK`事件」，而无需在此添油加醋
 *
 */
export default abstract class PlayerController extends MatrixEventDispatcher {
	/**
	 * 构造函数
	 */
	public constructor(
		/**
		 * 母体程序标签
		 */
		label: MatrixProgramLabel,
		/**
		 * 订阅者列表：订阅者只能是玩家
		 */
		public readonly subscribers: IPlayer[] = []
	) {
		super(label, subscribers)
	}

	// 重构：只接受玩家订阅者 //
	override addSubscriber(subscriber: IPlayer): void {
		return super.addSubscriber(subscriber)
	}

	override removeSubscriber(subscriber: IPlayer): boolean {
		return super.removeSubscriber(subscriber)
	}

	override hasSubscriber(subscriber: IPlayer): boolean {
		return super.hasSubscriber(subscriber)
	}

	// 响应函数：响应所有钩子 //
	// ? 一个疑点：是否要如此地「专用」以至于「每次增加一个新类型的事件，都要在这里新注册一个钩子函数」？至于「需要传递的、明确类型的参数」，有什么好的解决办法？
	// ! 最核心的问题：如何把这些「不同到家」的参数统一起来
	// ! 亦即「既要使用id集中管理保证通用性，又要传递额外参数确保灵活性」
	/**
	 * 响应玩家的行为
	 * * 使用「索引类型」半自动根据事件锁定类型
	 *   * 【2023-10-09 19:53:37】目前还是需要手动锁定参数类型
	 * * 亦或着直接使用「EventOptions」参数类型，但这样自由度过高。。。
	 */
	public abstract reactPlayerEvent<
		OptionMap extends PlayerEventOptions,
		T extends keyof OptionMap,
	>(
		eventType: T,
		self: IPlayer,
		host: IMatrix,
		otherInf: OptionMap[T] // ...otherInf: OptionMap[T] // !【2023-10-09 20:08:16】使用「元组类型+可变长参数」的方法不可行：即便在`OptionMap`中的值类型全是数组，它也「rest 参数必须是数组类型。ts(2370)」不认
	): void
}
