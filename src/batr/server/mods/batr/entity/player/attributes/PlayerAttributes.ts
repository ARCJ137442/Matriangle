import {
	IJSObjectifiable,
	JSObjectifyMap,
	fastAddJSObjectifyMapProperty_dashP,
} from '../../../../../../common/JSObjectify'
import { uint } from '../../../../../../legacy/AS3Legacy'

/**
 * 一个用于存储「玩家属性」的类
 *
 * ! 不另设「接口」的原因：这个类中的属性只会以「复合」的方式在玩家中使用，初衷是拆分「玩家信息」
 */
export default class PlayerAttributes implements IJSObjectifiable<PlayerAttributes> {
	// JS对象 //
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	public get objectifyMap(): JSObjectifyMap {
		return PlayerAttributes.OBJECTIFY_MAP
	}
	public cloneBlank = (): PlayerAttributes => PlayerAttributes.getBlank()
	public static getBlank = (): PlayerAttributes => new PlayerAttributes()

	// 具体属性 //
	protected _buffDamage: uint
	/**
	 * 玩家的伤害加成
	 * * 机制：用于在使用工具时增加额外的伤害
	 * * 算法：攻击者伤害=工具伤害+加成值*武器「伤害系数」 ?? 1
	 */
	public get buffDamage(): uint {
		return this._buffDamage
	}
	public set buffDamage(value: uint) {
		this._buffDamage = value
	}
	public static readonly key_buffDamage = fastAddJSObjectifyMapProperty_dashP(
		PlayerAttributes.OBJECTIFY_MAP,
		'buffDamage',
		0
	)

	protected _buffCD: uint
	/**
	 * 玩家的冷却减免
	 * * 机制：用于在使用工具时减免冷却时间
	 * * 算法：使用者冷却=max(floor(工具冷却/(1+加成值/10)), 1)
	 */
	public get buffCD(): uint {
		return this._buffCD
	}
	public set buffCD(value: uint) {
		this._buffCD = value
	}
	public static readonly key_buffCD = fastAddJSObjectifyMapProperty_dashP(PlayerAttributes.OBJECTIFY_MAP, 'buffCD', 0)

	protected _buffResistance: uint
	/**
	 * 玩家的抗性加成
	 * * 机制：用于在受到「攻击者伤害」时减免伤害
	 * * 算法：最终伤害=max(攻击者伤害-加成值*攻击者武器减免系数 ?? 1, 1)
	 */
	public get buffResistance(): uint {
		return this._buffResistance
	}
	public set buffResistance(value: uint) {
		this._buffResistance = value
	}
	public static readonly key_buffResistance = fastAddJSObjectifyMapProperty_dashP(
		PlayerAttributes.OBJECTIFY_MAP,
		'buffResistance',
		0
	)

	protected _buffRadius: uint
	/**
	 * 玩家的影响加成
	 * * 机制：用于在使用工具时增加额外的「影响范围」，如「更大的子弹爆炸范围」
	 * * 算法：最终伤害=max(攻击者伤害-加成值*攻击者武器减免系数 ?? 1, 1)
	 */
	public get buffRadius(): uint {
		return this._buffRadius
	}
	public set buffRadius(value: uint) {
		this._buffRadius = value
	}
	public static readonly key_buffRadius = fastAddJSObjectifyMapProperty_dashP(
		PlayerAttributes.OBJECTIFY_MAP,
		'buffRadius',
		0
	)

	// 构造方法 //
	public constructor(damage: uint = 0, CD: uint = 0, resistance: uint = 0, radius: uint = 0) {
		this._buffDamage = damage
		this._buffCD = CD
		this._buffResistance = resistance
		this._buffRadius = radius
	}
}
