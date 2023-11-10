import IMatrix from 'matriangle-api/server/main/IMatrix'
import { omegas } from 'matriangle-common/utils'
import {
	NativePlayerEventOptions,
	PlayerEvent,
	PlayerEventOptions,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import AIController from 'matriangle-mod-native/entities/player/controller/AIController'

/**
 * 所有「事件回调函数」的通用类型
 */
export type PlayerEventHandler<
	OptionMap extends PlayerEventOptions = PlayerEventOptions,
	T extends keyof OptionMap = PlayerEvent,
> = (
	eventType: T,
	self: IPlayer,
	host: IMatrix,
	otherInf: OptionMap[T]
	// ...otherInf: OptionMap[T] // !【2023-10-09 20:08:16】使用「元组类型+可变长参数」的方法不可行：即便在`OptionMap`中的值类型全是数组，它也「rest 参数必须是数组类型。ts(2370)」不认
) => void

/**
 * 「反馈控制器」是
 * * 基于「AI事件系统」的
 * * 依靠高度自定义的「侦听器」的
 * AI控制器
 */
export default class FeedbackController extends AIController {
	/** 所有对事件响应的回调函数映射 */
	protected readonly _eventHandlers: Map<PlayerEvent, PlayerEventHandler> =
		new Map()

	/**
	 * @override 直接分派给回调函数
	 * * 第一次分派时，依自身「是否初始化」使用`AIPlayerEvent.INIT`事件（以便初始化AI）
	 */
	override reactPlayerEvent<
		OptionMap extends PlayerEventOptions = NativePlayerEventOptions,
		T extends keyof OptionMap = keyof OptionMap,
	>(
		eventType: T,
		self: IPlayer,
		host: IMatrix,
		otherInf: OptionMap[T]
		// ...otherInf: OptionMap[T] // !【2023-10-09 20:08:16】使用「元组类型+可变长参数」的方法不可行：即便在`OptionMap`中的值类型全是数组，它也「rest 参数必须是数组类型。ts(2370)」不认
	): void {
		// 超类事件：处理AI刻
		super.reactPlayerEvent(eventType, self, host, otherInf)
		// 分派给回调函数
		;(this._eventHandlers.has(eventType as PlayerEvent)
			? (this._eventHandlers.get(
					eventType as PlayerEvent
			  ) as PlayerEventHandler)
			: this.fallbackHandler)(
			// ↑先计算出函数，↓再传入参数
			eventType as PlayerEvent,
			self,
			host,
			otherInf
		)
	}

	/**
	 * 默认的「事件处理函数」
	 */
	public fallbackHandler: (
		eventType: PlayerEvent,
		self: IPlayer,
		host: IMatrix,
		otherInf: unknown
	) => void = omegas

	/**
	 * 添加侦听器（自动覆盖）
	 *
	 * @param event 玩家事件的类型（若为null，则修改「默认处理函数」）
	 * @param handler 回调函数（若不提供，则视作「清空」）
	 */
	public on<
		OptionMap extends PlayerEventOptions = NativePlayerEventOptions,
		T extends keyof OptionMap = keyof OptionMap,
	>(
		event: T | null,
		handler: PlayerEventHandler<OptionMap, T> = omegas
	): void {
		// 空⇒设置「默认事件处理函数」
		if (event === null)
			(this.fallbackHandler as PlayerEventHandler<OptionMap, T>) = handler
		// 非空⇒设置对应事件处理函数
		else
			this._eventHandlers.set(
				event as string,
				handler as PlayerEventHandler
			)
	}
}
