import { int } from 'matriangle-legacy/AS3Legacy'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NativeMatrixPlayerEvent } from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import PlayerController from 'matriangle-mod-native/entities/player/controller/PlayerController'
import { PlayerEventOptions } from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import KeyboardControlCenter from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'

/**
 * 「多键控制器」是
 * * 不响应任何玩家发来的事件，但需要玩家订阅该控制器
 * * 使用「控制密钥」机制，以实现「一个服务器运行，指挥多个玩家」（需要在query中提供）的
 *   * 「控制密钥」相同的玩家会被同时分派相同的动作
 * 玩家控制器
 *
 * TODO: 📌承继{@link KeyboardControlCenter}键盘控制器，还原其中的键控逻辑
 */
export default abstract class MultiKeyController extends PlayerController {
	// 基于「控制密钥」的动作分派系统 //

	/** 自身持有的「玩家-密钥」映射表 */
	protected readonly _playerKeyMap: Map<IPlayer, string> = new Map<
		IPlayer,
		string
	>()
	/**
	 * 添加密钥绑定
	 * * 默认使用玩家的自定义名称
	 */
	protected addControlKeyBind(
		player: IPlayer,
		key: string = player.customName
	): void {
		this._playerKeyMap.set(player, key)
	}

	/**
	 * 移除密钥绑定
	 * * 默认使用玩家的自定义名称
	 */
	protected removeControlKeyBind(player: IPlayer): void {
		this._playerKeyMap.delete(player)
	}

	// ! 额外逻辑：增删密钥绑定
	override addSubscriber(subscriber: IPlayer): void {
		// 无参设置绑定
		this.addControlKeyBind(subscriber)
		// 继续超类逻辑
		return super.addSubscriber(subscriber)
	}

	// ! 额外逻辑：增删密钥绑定
	override removeSubscriber(subscriber: IPlayer): boolean {
		// 无参设置绑定
		this.removeControlKeyBind(subscriber)
		// 继续超类逻辑
		return super.removeSubscriber(subscriber)
	}

	/**
	 * 将一个玩家连接到此控制器
	 *
	 * @param player 要连接到此控制器的玩家
	 * @param controlKey 这个玩家对应的「控制密钥」（默认是玩家的自定义名称）
	 */
	public addConnection(
		player: IPlayer,
		controlKey: string = player.customName
	): void {
		// 无参设置绑定
		this.addControlKeyBind(player, controlKey)
		// 继续超类逻辑
		return super.addSubscriber(player)
	}

	/**
	 * 将一个玩家与此控制器断开连接
	 *
	 * @param player 要与此控制器断开连接的玩家
	 */
	public removeConnection(player: IPlayer): boolean {
		// 无参设置绑定
		this.removeControlKeyBind(player)
		// 继续超类逻辑
		return super.removeSubscriber(player)
	}

	/**
	 * 根据「控制密钥」分派操作
	 */
	protected dispatchByControlKey(
		controlKey: string,
		actionStr: string
	): void {
		// 解析整数行动
		const a: int = parseInt(actionStr)
		const action: int | string = isFinite(a) ? a : actionStr
		// 开始遍历执行
		for (const player of this.subscribers) {
			if (this._playerKeyMap.get(player) === controlKey) {
				// ! 这是唯一一个添加玩家行为的独有逻辑
				player.onReceive(NativeMatrixPlayerEvent.ADD_ACTION, action)
			}
		}
	}

	/** @implements 不响应「玩家上报的触发」 */
	public reactPlayerEvent<
		OptionMap extends PlayerEventOptions,
		T extends keyof OptionMap,
	>(
		eventType: T,
		self: IPlayer,
		host: IMatrix,
		otherInf: OptionMap[T]
	): void {}
}
