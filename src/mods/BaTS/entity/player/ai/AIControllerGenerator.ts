import { uint } from 'matriangle-legacy/AS3Legacy'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import BonusBox from '../../item/BonusBox'
import AIController, {
	AIPlayerEvent,
} from 'matriangle-mod-native/entities/player/controller/AIController'
import { PlayerAction } from 'matriangle-mod-native/entities/player/controller/PlayerAction'
import {
	NativePlayerEvent,
	NativePlayerEventOptions,
	PlayerEvent,
	PlayerEventOptions,
} from 'matriangle-mod-native/entities/player/controller/PlayerEvent'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { BatrPlayerEvent, BatrPlayerEventOptions } from '../BatrPlayerEvent'

/**
 * 「AI行为生成器」
 * * 输入「事件类型」（通过「内部状态」传参）
 *   * 会通过其中self变量的`currentPlayer:IPlayer`进行「当前自我接入」
 * * 输出「玩家行为」（不管是yield还是return）
 */
export type AIActionGenerator = Generator<
	PlayerAction,
	PlayerAction,
	PlayerEvent
>

/** 「AI行为生成器」的生成函数 */
export type AIActionGeneratorF = (
	self: AIControllerGenerator
) => AIActionGenerator

/**
 * 基于「行为生成器」的AI控制器
 * * 每个钩子都对应一个生成器
 * * 每个生成器都对应一个生成函数
 */
export default class AIControllerGenerator extends AIController {
	/**
	 * 大一统的「行为生成器」
	 * * 在每次事件发生后yield一个行为
	 * * 每一次next都会传入一个「事件类型」参数
	 * * 📌所有「事件类型」以外的参数，都（将自身视作一个状态机）以「控制器实例属性」的方式提供
	 *   * 变通一点：既然实体的`host`能从「实例属性」退化到「函数参数」，那反其道而行之，
	 *   * 所谓「函数传参」也可以变成「设置局部变量，然后在后续的调用中保证『这就是你要的参数』」来避免「含参事件的参数传递」问题
	 *   * 例如：在触发生成器next前，设置一个「lastHurtBy:IPlayer」，然后保证在调用next前不更改它⇒于是next函数中看到的「局部变量」就是其自身了
	 *   *
	 */
	protected _actionGenerator: AIActionGenerator

	/**
	 * 构造函数
	 *
	 * ! 其会在从生成函数初始化生成器时跳过第一个「自创建到第一个yield」的yield结果
	 * * 🎯保证后面是「先有输入，后有输出」
	 * * 📌此时「生成函数」大致是「跳过循环外的第一个yield，进入循环」
	 *
	 * @param label 标志
	 * @param actionGeneratorF 初始化所用的「生成函数」
	 */
	public constructor(label: string, actionGeneratorF: AIActionGeneratorF) {
		super(label)
		this._actionGenerator = actionGeneratorF(this)
		this._actionGenerator.next(AIPlayerEvent.INIT) // ! 跳过第一个「无用生成」
	}

	// 一些AI用的公开实例变量（在使用前是undefined，但这绝对不会在调用后发生）
	/** 存储「当前事件处理时的『自我』玩家」 */
	public _temp_currentPlayer?: IPlayer
	/** 存储「当前事件处理时的『当前所在母体』」 */
	public _temp_currentHost?: IMatrix
	/** 上一次受到的伤害 */
	public _temp_lastHurtByDamage?: uint
	/** 上一次受到伤害的攻击者 */
	public _temp_lastHurtByAttacker?: IPlayer | null
	/** 上一次致死的伤害 */
	public _temp_lastDeathDamage?: uint
	/** 上一次致死的攻击者 */
	public _temp_lastDeathAttacker?: IPlayer | null
	/** 上一次击杀所用伤害 */
	public _temp_lastKillDamage?: uint
	/** 上一次击杀的受害者 */
	public _temp_lastKillTarget?: IPlayer | null
	/** 上一次拾取的奖励箱 */
	public _temp_lastPickupBox?: BonusBox

	/** 上一次返回的行动 */
	protected _lastYieldedAction: PlayerAction | undefined = undefined
	/**
	 * 用指定的「事件类型」请求「生成函数」给出应答
	 * * 其它「要传入的参数」已经内置到「控制器实例属性」中了，只需要读取即可
	 *   * 但这要尽可能避免读取「未涉及的、作为参数的实例属性」
	 */
	protected requestAction(
		event: PlayerEvent,
		self: IPlayer,
		host: IMatrix
	): PlayerAction {
		// 否则⇒继续
		this._lastYieldedAction = this._actionGenerator.next(event).value
		if (this._lastYieldedAction === undefined)
			throw new Error('生成器未正常执行')
		return this._lastYieldedAction
	}

	// 钩子函数
	public reactPlayerEvent<
		OptionMap extends PlayerEventOptions,
		T extends keyof OptionMap,
	>(
		eventType: T,
		self: IPlayer,
		host: IMatrix,
		otherInf: OptionMap[T]
		// ...otherInf: OptionMap[T] // !【2023-10-09 20:08:16】使用「元组类型+可变长参数」的方法不可行：即便在`OptionMap`中的值类型全是数组，它也「rest 参数必须是数组类型。ts(2370)」不认
	): void {
		super.reactPlayerEvent(eventType, self, host, otherInf)
		// *【2023-10-09 20:40:52】现在把所有事件统一起来
		// 公共参数
		this._temp_currentPlayer = self
		this._temp_currentHost = host
		// 外加参数
		switch (eventType) {
			// 没有额外参数
			case AIPlayerEvent.INIT:
			case AIPlayerEvent.AI_TICK:
			case BatrPlayerEvent.MAP_TRANSFORM:
			case NativePlayerEvent.TICK:
			case NativePlayerEvent.RESPAWN:
				break
			case NativePlayerEvent.HURT:
				// `otherInf.damage;`似乎就是没法推导出来💢
				this._temp_lastHurtByDamage = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.HURT]
				).damage
				// `otherInf.attacker;`似乎就是没法推导出来💢
				this._temp_lastHurtByAttacker = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.HURT]
				).attacker
				break
			case NativePlayerEvent.DEATH:
				// `otherInf.damage;`似乎就是没法推导出来💢
				this._temp_lastDeathDamage = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.DEATH]
				).damage
				// `otherInf.attacker;`似乎就是没法推导出来💢
				this._temp_lastDeathAttacker = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.DEATH]
				).attacker
				break
			case NativePlayerEvent.KILL_PLAYER:
				// `otherInf.damage;`似乎就是没法推导出来💢
				this._temp_lastKillDamage = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.KILL_PLAYER]
				).damage
				// `otherInf.victim;`似乎就是没法推导出来💢
				this._temp_lastKillTarget = (
					otherInf as NativePlayerEventOptions[NativePlayerEvent.KILL_PLAYER]
				).victim
				break
			case BatrPlayerEvent.PICKUP_BONUS_BOX:
				this._temp_lastPickupBox = (
					otherInf as BatrPlayerEventOptions[BatrPlayerEvent.PICKUP_BONUS_BOX]
				).box // `otherInf.box;`似乎就是没法推导出来💢
				break
		}
		// * 统一「反应」
		this._action_buffer.push(
			this.requestAction(eventType as PlayerEvent, self, host)
		)
	}
}
