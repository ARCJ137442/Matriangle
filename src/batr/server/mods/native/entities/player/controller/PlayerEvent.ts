import { uint } from "../../../../../../legacy/AS3Legacy";
import IPlayer from "../IPlayer";

/**
 * 原「requestActionOn」系列事件
 * * 现在用于从「玩家」到「控制器」的事件分派
 */

export type PlayerEvent = string;

/**
 * 原「PlayerEvent」
 * * 现在只用于表示「原生事件」
 */
export enum NativePlayerEvent {
	/** 【2023-10-02 08:09:40】空事件，不必响应 */
	NULL = '',

	/** 用于在「AI控制器」中跳过第一个「无用yield」 */
	INIT = 'init',
	/** 在「每个世界刻」中响应 */
	TICK = 'tick',

	/** 🆕AI控制器独有：在「每个AI刻」中响应（一般用于「更人性化执行」的动作） */
	AI_TICK = 'AITick', // TODO: 暂时还不明确是否要移除/合并

	HEAL = 'heal',
	CAUSE_DAMAGE = 'causeDamage',
	/** 在「受到伤害」时响应（应用如：Novice的「条件反射式回避」） */
	HURT = 'hurt',
	/** 在「死亡」时响应（应用如Adventurer的「死亡时清除路径记忆」） */
	DEATH = 'death',
	/** 在「击杀玩家」时响应 */
	KILL_PLAYER = 'killPlayer',

	/** 在「重生」时响应（⚠️这时候应该已经恢复了状态，比如active参数） */
	RESPAWN = 'respawn'
}


type t = { [e: PlayerEvent]: unknown };
/**
 * 用于类型推断的「参数映射表」
 * * 【2023-10-09 19:29:37】用于从「类型索引」自动推断「所需的『附加参数类型』」
 * * 可继承：添加新类型事件时，可以直接继承于此
 */
export interface NativePlayerEventOptions extends t {
	[NativePlayerEvent.NULL]: undefined;

	[NativePlayerEvent.INIT]: undefined;
	[NativePlayerEvent.TICK]: undefined;
	[NativePlayerEvent.AI_TICK]: undefined;

	[NativePlayerEvent.HEAL]: {
		/** 治疗的生命点数 */
		amount: uint;
		/** 治疗者 */
		healer: IPlayer | null;
	};
	[NativePlayerEvent.CAUSE_DAMAGE]: {
		/** 造成伤害点数 */
		damage: uint;
		/** 受害者 */
		victim: IPlayer | null;
	};
	[NativePlayerEvent.HURT]: {
		/** 受到伤害点数 */
		damage: uint;
		/** 攻击者 */
		attacker: IPlayer | null;
	};

	[NativePlayerEvent.KILL_PLAYER]: {
		/** 造成伤害点数 */
		damage: uint;
		/** 受害者 */
		victim: IPlayer | null;
	};
	[NativePlayerEvent.DEATH]: {
		/** 受到伤害点数 */
		damage: uint;
		/** 攻击者 */
		attacker: IPlayer | null;
	};

	[NativePlayerEvent.RESPAWN]: undefined;
}
