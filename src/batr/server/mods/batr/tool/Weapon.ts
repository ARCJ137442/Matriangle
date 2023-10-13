import {
	JSObjectifyMap,
	fastAddJSObjectifyMapProperty_dashP,
	uniLoadJSObject,
	uniSaveJSObject,
} from '../../../../common/JSObjectify'
import { key } from '../../../../common/utils'
import { uint } from '../../../../legacy/AS3Legacy'
import { typeID } from '../../../api/registry/IWorldRegistry'
import { FIXED_TPS } from '../../../main/GlobalWorldVariables'
import Tool from './Tool'

/**
 * 原`Tool`，现拆分为（暂时轻量级的）「武器」类
 *
 *  「武器」是
 * * 普遍能发射「抛射体」的
 * * 可以绑定各种属性的
 * * 专用于玩家对战的
 * 工具类型
 */
export default class Weapon extends Tool {
	/**
	 * ! 一些原本是用于「静态注册表」（压根不为可能的后续Mods开发着想）的方法已被移除
	 * ! 一些用于「类型」而非「类型の实例」的方法已被移除，以适应新的「类&继承」架构
	 *
	 * * 新的架构（草案）：
	 *   * 一个实例相当于一个
	 *   * 把「武器」单独开一个类，利用面向对象特性复用其属性
	 *   * 其他情况可以用来开发一些像「方块迁移器」（临时名，其存储「所持有的方块」以兼容TriangleCraft这类沙盒向世界）的「更自定义化工具」
	 *
	 */

	// TODO: 有待迁移——或许要作为「自身属性」？
	public static isAvailableDroneNotUse(weapon: Weapon): boolean {
		// return isDroneTool(weapon) || weapon == Tool.BLOCK_THROWER || weapon == Tool.MELEE || weapon == Tool.BULLET_BOMBER;
		return false
	}

	// JS对象 //

	/** 模板构造函数 */
	public static getBlank(): Weapon {
		return new Weapon('undefined', 0, 0, 0)
	}

	/** 复用「工具」的「对象化映射表」 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {
		...Tool.OBJECTIFY_MAP,
	}

	public static readonly key_baseDamage: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'baseDamage',
		uint(1)
	)
	protected _baseDamage: uint
	/** 武器的默认攻击伤害 */
	public get baseDamage(): uint {
		return this._baseDamage
	}

	// canHurt
	public static readonly key_canHurtEnemy: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'canHurtEnemy',
		true
	)
	protected _canHurtEnemy: boolean
	public get canHurtEnemy(): boolean {
		return this._canHurtEnemy
	}

	public static readonly key_canHurtSelf: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'canHurtSelf',
		true
	)
	protected _canHurtSelf: boolean
	public get canHurtSelf(): boolean {
		return this._canHurtSelf
	}

	public static readonly key_canHurtAlly: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'canHurtAlly',
		true
	)
	protected _canHurtAlly: boolean
	public get canHurtAlly(): boolean {
		return this._canHurtAlly
	}

	// Extra
	public static readonly key_extraDamageCoefficient: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'extraDamageCoefficient',
		uint(1)
	)
	protected _extraDamageCoefficient: uint = 5
	public get extraDamageCoefficient(): uint {
		return this._extraDamageCoefficient
	}

	public static readonly key_extraResistanceCoefficient: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'extraResistanceCoefficient',
		uint(1)
	)
	protected _extraResistanceCoefficient: uint = 1
	public get extraResistanceCoefficient(): uint {
		return this._extraResistanceCoefficient
	}

	public static readonly key_useOnCenter: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'useOnCenter',
		uint(1)
	)
	protected _useOnCenter: boolean = false
	public get useOnCenter(): boolean {
		return this._useOnCenter
	}

	// 无人机
	public static readonly key_chargePercentInDrone: key = fastAddJSObjectifyMapProperty_dashP(
		Weapon.OBJECTIFY_MAP,
		'chargePercentInDrone',
		1.0
	)
	protected _chargePercentInDrone: number = 1.0
	public get chargePercentInDrone(): number {
		return this._chargePercentInDrone
	}

	//============Constructor & Destructor============//
	public constructor(
		id: typeID,
		baseCD_S: number = 0,
		chargeMaxTime_S: number = 0,
		baseDamage: uint = 1,
		reverseCharge: boolean = false
	) {
		super(id, uint(baseCD_S * FIXED_TPS), uint(chargeMaxTime_S * FIXED_TPS))
		// defaultCD,defaultChargeTime instanceof Per Second
		this._baseDamage = baseDamage
		this._reverseCharge = reverseCharge
		// default
		this._canHurtEnemy = true
		this._canHurtSelf = false
		this._canHurtAlly = false
	}

	/** 覆盖：直接序列化 */
	override copy(): Weapon {
		return uniLoadJSObject(Weapon.getBlank(), uniSaveJSObject(this, {}))
	}

	/**
	 * ! 子类继承父类，必须要使用子类自己的「对象化映射表」，不然会使用父类的对象化映射表
	 */
	override get objectifyMap(): JSObjectifyMap {
		return Weapon.OBJECTIFY_MAP
	}

	//============Quick Initialize Tool Functions============//
	/**
	 * 快速初始化工具函数：用于设置武器的「伤害权限」
	 * @param enemy 是否可伤害「敌人」
	 * @param self 是否可伤害自身
	 * @param ally 是否可伤害「队友」
	 * @returns 自身
	 */
	public setCanHurt(enemy: boolean, self: boolean, ally: boolean): Weapon {
		this._canHurtEnemy = enemy
		this._canHurtSelf = self
		this._canHurtAlly = ally
		return this
	}

	/**
	 * 快速初始化工具函数：用于设置武器的「额外属性」
	 * @param damageCoefficient 基准伤害系数（用于与玩家属性一同计算最终伤害）
	 * @param resistanceCoefficient 基准抗性常数（用于与玩家属性一同计算被抗性减免的难以程度）
	 * @param useOnCenter 是否在玩家中心（而非玩家前方）使用（目前用于武器「冲击波」）
	 * @returns 自身
	 */
	public setExtraProperty(
		damageCoefficient: uint,
		resistanceCoefficient: uint,
		useOnCenter: boolean = false
	): Weapon {
		this._extraDamageCoefficient = damageCoefficient
		this._extraResistanceCoefficient = resistanceCoefficient
		this._useOnCenter = useOnCenter
		return this
	}

	/**
	 * 快速初始化工具函数：用预设值武器与「冲击波子机」的互动
	 *
	 * ? 是否要如此特别？或者可以针对所有「元武器」——使用其它武器的武器
	 *
	 * @param chargePercentInDrone 用于控制其在「冲击波子机」中被释放时的「充能强度」（默认为1——完全充能）
	 * @returns 自身
	 */
	public setDroneProperty(chargePercentInDrone: number = 1): Weapon {
		this._chargePercentInDrone = chargePercentInDrone
		return this
	}

	//============Additional Properties============//
	/**
	 * （衍生）默认的每秒伤害输出
	 * * 由默认伤害、CD、充能时间等计算而出
	 */
	public get baseDamageOutput(): uint {
		return this._baseDamage / (this._baseCD + this._chargeMaxTime)
	}
}
