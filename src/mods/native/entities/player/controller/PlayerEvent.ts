import { uint } from 'matriangle-legacy'
import IPlayer from '../IPlayer'

/**
 * 通用的「玩家事件」类型
 */
export type PlayerEvent = string

/**
 * 原生玩家事件
 * * 原「PlayerEvent」，现在只用于表示「原生事件」
 * * 会在玩家代码的相应「钩子函数」中调用
 */
export enum NativePlayerEvent {
	/** 【2023-10-02 08:09:40】空事件，不必响应 */
	NULL = '',

	/** 在「每个世界刻」中响应 */
	TICK = 'tick',

	/** 在「受到治疗」时响应 */
	HEAL = 'heal',
	/** 在「造成伤害」时响应 */
	CAUSE_DAMAGE = 'causeDamage',
	/**
	 * 在「受到伤害」时响应
	 * * 应用如：Novice的「条件反射式回避」
	 */
	HURT = 'hurt',
	/**
	 * 在「死亡」时响应
	 * * 应用如Adventurer的「死亡时清除路径记忆」
	 */
	DEATH = 'death',
	/** 在「击杀玩家」时响应 */
	KILL_PLAYER = 'killPlayer',

	/**
	 * 在「重生」时响应
	 *
	 * ! 这时候应该已经恢复了状态，比如active参数
	 */
	RESPAWN = 'respawn',
}

/**
 * 通用的「玩家事件参数集」
 * * 【2023-10-09 19:29:37】用于从「类型索引」自动推断「所需的『附加参数类型』」
 * * 可继承：添加新类型事件时，可以直接继承于此
 */
export type PlayerEventOptions = { [e: PlayerEvent]: unknown }

/**
 * 「原生事件参数集」
 */
export interface NativePlayerEventOptions extends PlayerEventOptions {
	[NativePlayerEvent.NULL]: undefined

	[NativePlayerEvent.TICK]: undefined

	[NativePlayerEvent.HEAL]: {
		/** 治疗的生命点数 */
		amount: uint
		/** 治疗者 */
		healer: IPlayer | null
	}
	[NativePlayerEvent.CAUSE_DAMAGE]: {
		/** 造成伤害点数 */
		damage: uint
		/** 受害者 */
		victim: IPlayer | null
	}
	[NativePlayerEvent.HURT]: {
		/** 受到伤害点数 */
		damage: uint
		/** 攻击者 */
		attacker: IPlayer | null
	}

	[NativePlayerEvent.KILL_PLAYER]: {
		/** 造成伤害点数 */
		damage: uint
		/** 受害者 */
		victim: IPlayer | null
	}
	[NativePlayerEvent.DEATH]: {
		/** 受到伤害点数 */
		damage: uint
		/** 攻击者 */
		attacker: IPlayer | null
	}

	[NativePlayerEvent.RESPAWN]: undefined
}
