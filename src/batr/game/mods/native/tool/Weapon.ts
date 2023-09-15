import { intMax } from "../../../../common/exMath";
import { uint } from "../../../../legacy/AS3Legacy";
import { FIXED_TPS } from "../../../main/GlobalGameVariables";
import Tool from "./Tool";

/**
 * 原`ToolType`，现拆分为（暂时轻量级的）「武器」类
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
	 *   * 其他情况可以用来开发一些像「方块迁移器」（临时名，其存储「所持有的方块」以兼容TriangleCraft这类沙盒向游戏）的「更自定义化工具」
	 *   
	 */

	// TODO: 有待迁移——或许要作为「自身属性」？
	public static isAvailableDroneNotUse(weapon: Weapon): boolean {
		// return isDroneTool(weapon) || weapon == Tool.BLOCK_THROWER || weapon == Tool.MELEE || weapon == Tool.SUB_BOMBER;
		return false
	}

	//============Instance Variables============//
	protected _defaultCD: uint;
	public get defaultCD(): uint { return this._defaultCD; }

	// Tick
	protected _defaultChargeTime: uint;
	public get defaultChargeTime(): uint { return this._defaultChargeTime; }

	// Tick
	protected _defaultDamage: uint;
	public get defaultDamage(): uint { return this._defaultDamage; }

	protected _reverseCharge: boolean;
	public get reverseCharge(): boolean { return this._reverseCharge; }

	// Whether the weapon will auto charge and can use before full charge
	// canHurt
	protected _canHurtEnemy: boolean;
	public get canHurtEnemy(): boolean { return this._canHurtEnemy; }

	protected _canHurtSelf: boolean;
	public get canHurtSelf(): boolean { return this._canHurtSelf; }

	protected _canHurtAlly: boolean;
	public get canHurtAlly(): boolean { return this._canHurtAlly; }

	// Extra
	protected _extraDamageCoefficient: uint = 5;
	public get extraDamageCoefficient(): uint { return this._extraDamageCoefficient; }

	protected _extraResistanceCoefficient: uint = 1;
	public get extraResistanceCoefficient(): uint { return this._extraResistanceCoefficient; }

	protected _useOnCenter: boolean = false;
	public get useOnCenter(): boolean { return this._useOnCenter; }

	// 无人机
	protected _chargePercentInDrone: number = 1;
	public get chargePercentInDrone(): number { return this._chargePercentInDrone; }

	//============Constructor & Destructor============//
	public constructor(
		name: string,
		defaultCD: number = 0,
		defaultDamage: uint = 1,
		defaultChargeTime: number = 0,
		reverseCharge: boolean = false
	) {
		super(name);
		this._name = name;
		// defaultCD,defaultChargeTime is Per Second
		this._defaultCD = defaultCD * FIXED_TPS;
		this._defaultDamage = defaultDamage;
		this._defaultChargeTime = defaultChargeTime * FIXED_TPS;
		this._reverseCharge = reverseCharge;
		// default
		this._canHurtEnemy = true;
		this._canHurtSelf = false;
		this._canHurtAlly = false;
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
		this._canHurtEnemy = enemy;
		this._canHurtSelf = self;
		this._canHurtAlly = ally;
		return this;
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
		this._extraDamageCoefficient = damageCoefficient;
		this._extraResistanceCoefficient = resistanceCoefficient;
		this._useOnCenter = useOnCenter;
		return this;
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
		this._chargePercentInDrone = chargePercentInDrone;
		return this;
	}

	//============Additional Properties============//
	/**
	 * 默认的每秒伤害输出
	 * * 由默认伤害、CD、充能时间等计算而出
	 */
	public get defaultDamageOutput(): uint {
		return this._defaultDamage / (this._defaultCD + this._defaultChargeTime);
	}

	/**
	 * 用于结合玩家特性计算「最终伤害」
	 * @param defaultDamage 默认伤害
	 * @param buffDamage 玩家处的伤害加成
	 * @param buffResistance 玩家处的抗性减免
	 * @returns 最小为1的正整数值
	 */
	public getBuffedDamage(defaultDamage: uint, buffDamage: uint, buffResistance: uint): uint {
		return intMax(
			defaultDamage + buffDamage * this.extraDamageCoefficient - buffResistance * this.extraResistanceCoefficient,
			1
		);
	}

	/**
	 * 用于结合玩家特性计算「最终CD」
	 * @param buffCD 玩家处的CD减免
	 * @returns 最小为1的冷却时间
	 */
	public getBuffedCD(buffCD: uint): uint {
		return Math.ceil(this.defaultCD / (1 + buffCD / 10));
	}
}