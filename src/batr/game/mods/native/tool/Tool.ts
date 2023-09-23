import { IBatrJSobject, JSObject } from "../../../../common/abstractInterfaces";
import { contains, fastLoadJSObject_dash, fastSaveJSObject_dash, key, pushNReturn, safeMerge } from "../../../../common/utils";
import { uint, int } from "../../../../legacy/AS3Legacy";
import Weapon from "./Weapon";

/**
 * 原`Tool`，现为（暂时轻量级的）「工具」类
 *
 *  「工具」是
 * * 能被「使用者」（暂定为玩家）使用的
 * * 对「使用」而言有「使用冷却」与「充能状态」（百分比）的
 * * 可以绑定各种属性的
 * * 作为一个提供「原型复制」的「独立物品」，而非「共用模板对象」的
 * 对象类型
 * 
 * ! 一些原本是用于「静态注册表」（压根不为可能的后续Mods开发着想）的方法已被移除
 * ! 一些用于「类型」而非「类型の实例」的方法已被移除，以适应新的「类&继承」架构
 * 
 * * 新的架构（草案）：
 *   * 一个实例相当于一个
 *   * 把「武器」单独开一个类，利用面向对象特性复用其属性
 *   * 其他情况可以用来开发一些像「方块迁移器」（临时名，其存储「所持有的方块」以兼容TriangleCraft这类沙盒向游戏）的「更自定义化工具」
 *   
 * 
 * ! 【2023-09-23 11:45:07】现在不再使用「共用引用」的形式，改为「一个玩家，一个工具」
 * * 日后游戏机制的「随机武器」（初始分派、奖励箱……）也将使用「原型复制」的方式，而非「共用引用」的方法
 */
export default abstract class Tool implements IBatrJSobject<Tool> {

	//============Static Getter And Setter============//
	/** （国际化文本）翻译时的共同父键 */
	public static get label(): string { return 'tool' }

	/** 存储所有要序列化的「独有属性」 */
	public static readonly ALL_OWN_PROPERTY_NAMES: key[] = [];

	/**
	 * 存储「工具名称」
	 * 
	 * TODO: 国际化文本支持
	 */
	protected _name: string;
	public get name(): string { return this._name }
	public static readonly key_name: key = pushNReturn(Tool.ALL_OWN_PROPERTY_NAMES, 'name')

	//============Constructor & Destructor============//
	/**
	 * 构造方法
	 * @param id 工具ID（逻辑&国际化 识别）
	 * @param maxCD 工具的「使用冷却」
	 * @param chargeMaxTime 工具的「最大充能时间」
	 */
	public constructor(
		id: string,
		maxCD: uint,
		chargeMaxTime: uint = 0,
	) {
		this._name = id;
		this._CD = this._maxCD = maxCD;
		this._chargeTime = this._chargeMaxTime = chargeMaxTime;
	}

	// JS对象 //
	/**
	 * 现在承载默认方法，子类必须super以承接父类信息
	 */
	public dumpToObject(target: JSObject = {}): JSObject {
		return fastSaveJSObject_dash(this, target, Tool.ALL_OWN_PROPERTY_NAMES);
	}

	/**
	 * 现在承载默认方法，子类必须super以承接父类信息
	 */
	public copyFromObject(source: JSObject): Tool {
		return fastLoadJSObject_dash(this, source, Tool.ALL_OWN_PROPERTY_NAMES);
	}

	//============Game Mechanics============//

	/**
	 * 工具使用冷却
	 * * 原理：完全冷却 maxCD ~ 0 可使用
	 * * 决定玩家使用工具的最快频率
	 * 
	 * ! 在设置时（玩家需）更新：
	 * * GUI状态
	*/
	get CD(): uint { return this._CD }
	set CD(value: uint) { this._CD = value }
	protected _CD: uint;
	public static readonly key_CD: key = pushNReturn(Tool.ALL_OWN_PROPERTY_NAMES, 'CD')

	/**
	 * 工具使用最大冷却
	 * * 决定「工具使用冷却」在重置会重置到的值
	 * 
	 * ! 在设置时（玩家需）更新：
	 * * GUI状态
	*/
	get maxCD(): uint { return this._maxCD }
	set maxCD(value: uint) { this._maxCD = value }
	protected _maxCD: uint;
	public static readonly key_maxCD: key = pushNReturn(Tool.ALL_OWN_PROPERTY_NAMES, 'maxCD')

	/**
	 * 工具充能状态（时间）
	 * * 原理：未充能 0 ~ chargeMaxTime 完全充能 （正计时）
	 * * 默认值@无需充能的工具：如「完全充能」
	 * 
	 * ! 在设置时（玩家需）更新：
	 * * GUI状态
	 */
	get chargeTime(): uint { return this._chargeTime }
	set chargeTime(value: uint) { this._chargeTime = value }
	protected _chargeTime: uint;
	public static readonly key_chargeTime: key = pushNReturn(Tool.ALL_OWN_PROPERTY_NAMES, 'chargeTime')

	/**
	 * 工具最大充能时间
	 * * 其值为0意味着「无需充能」
	 * 
	 * ! 在设置时（玩家需）更新：
	 * * GUI状态
	 */
	get chargeMaxTime(): uint { return this._chargeMaxTime }
	set chargeMaxTime(value: uint) { this._chargeMaxTime = value }
	protected _chargeMaxTime: uint;
	public static readonly key_chargeMaxTime: key = pushNReturn(Tool.ALL_OWN_PROPERTY_NAMES, 'chargeMaxTime')

	/**
	 * （衍生）工具是否需要「冷却时间」
	 * * 返回「工具最大冷却时间」是否>0
	 * * 应用：GUI显示（在「无需冷却」时不显示冷却条）
	 */
	get needsCD(): boolean { return this._maxCD > 0 }

	/**
	 * （衍生）工具的「冷却百分比」
	 * * 原理：完全冷却 1~0 完全可用
	 * * 算法：工具冷却时间（倒计时）/最大冷却时间
	 * 
	 * ! TODO: 【2023-09-23 11:42:01】现在在计算「最大冷却时间」时，不再直接依赖系统的「无CD最小冷却时间」
	 * * 缘由：出于「通用性」着想
	 * * 现在系统将根据此设置在「分派武器时」自动设置CD
	 * * 原先的`toolMaxCD`已启用
	 */
	get CDPercent(): number { return this._CD / this._maxCD }

	/**
	 * （衍生）工具是否需要充能
	 * * 返回「工具最大充能时间」是否>0
	 * * 应用：GUI显示（在「无需充能」时不显示充能条）
	 */
	get needsCharge(): boolean { return this._chargeMaxTime > 0 }

	/**
	 * （衍生）工具是否正在充能
	 * * 原理：「工具充能时间」是否>0
	 *   * `===0` 有可能是「无需充能」武器所使用的
	 */
	get isCharging(): boolean { return this._chargeTime > 0; }

	/**
	 * （衍生）工具的充能百分比
	 * * 范围：无（需）充能 0 ~ 1 完全充能
	 */
	get chargingPercent(): number { return this._chargeTime / this._chargeMaxTime; }

	/**
	 * 重置CD：变为最大值
	 */
	public resetCD(): void {
		this._CD = this._maxCD;
	}

	/**
	 * 重置充能状态：变为0
	 */
	public resetCharge(): void {
		this._chargeTime = 0;
	}

	/**
	 * 重置所有「使用状态」
	 * * CD
	 * * 充能状态
	 */
	public resetUsingState(): void {
		this.resetCD();
		this.resetCharge();
	}

}
