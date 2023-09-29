import { IJSObjectifiable, JSObjectifyMap, fastAddJSObjectifyMapProperty_dashP } from "../../../../common/JSObjectify";
import { key } from "../../../../common/utils";
import { uint } from "../../../../legacy/AS3Legacy";
import IPlayer from "../entities/player/IPlayer";
import IBatrGame from './../../../main/IBatrGame';

/**
 * 原`Tool`，现为（暂时轻量级的）「工具」类
 *
 *  「工具」是
 * * 能被「使用者」（暂定为使用者）使用的
 * * 对「使用」而言缓存了几乎所有「和自身有关的状态」的
 *   * 有「使用冷却」与「充能状态」（百分比）的
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
 * ! 【2023-09-23 11:45:07】现在不再使用「共用引用」的形式，改为「一个使用者，一个工具」
 * * 日后游戏机制的「随机武器」（初始分派、奖励箱……）也将使用「原型复制」的方式，而非「共用引用」的方法
 */
export default class Tool implements IJSObjectifiable<Tool> {

	/** （国际化文本）翻译时的共同父键 */
	public static get label(): string { return 'tool' }

	// JS对象 //

	/** 存储「JS对象化映射表」 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {};
	public get objectifyMap(): JSObjectifyMap { return Tool.OBJECTIFY_MAP }

	/** 模板构造函数 */
	public static getBlank(): Tool { return new Tool('undefined', 0, 0, false) };

	/**
	 * 存储「工具id」
	 * * 作为「从JS对象重建」等地方的「唯一识别码」
	 * 
	 * !【2023-09-24 21:18:28】日后的「国际化文本支持」将基于id，而非在这里整什么「国际化文本」
	 */
	protected _id: string;
	public get id(): string { return this._id }
	public static readonly key_id: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'id', 'string',
	)

	//============Constructor & Destructor============//
	/**
	 * 构造方法
	 * @param id 工具ID（逻辑&国际化 识别）
	 * @param baseCD 工具的「使用冷却」
	 * @param chargeMaxTime 工具的「最大充能时间」
	 */
	public constructor(
		id: string,
		baseCD: uint,
		chargeMaxTime: uint = 0,
		reverseCharge: boolean = false,
	) {
		this._id = id;
		this._usingCD = this._baseCD = baseCD;
		this._chargeTime = this._chargeMaxTime = chargeMaxTime;
		this._reverseCharge = reverseCharge;
	}

	/** 复制：直接用构造函数（扩展性不强） */
	public copy(): Tool {
		return new Tool(
			this._id,
			this._baseCD,
			this._chargeMaxTime,
			this._reverseCharge,
		);
	}

	//============Game Mechanics============//

	/**
	 * 工具使用冷却
	 * * 原理：完全冷却 baseCD ~ 0 可使用
	 * * 决定使用者使用工具的最快频率
	 * 
	 * ! 在设置时（使用者需）更新：
	 * * GUI状态
	*/
	get usingCD(): uint { return this._usingCD }
	set usingCD(value: uint) { this._usingCD = value }
	protected _usingCD: uint;
	public static readonly key_usingCD: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'usingCD', uint(1),
	)

	/**
	 * 工具使用基础冷却
	 * * 决定「工具使用冷却」在重置会重置到的值
	 * 
	 * ! 在设置时（使用者需）更新：
	 * * GUI状态
	*/
	get baseCD(): uint { return this._baseCD }
	set baseCD(value: uint) { this._baseCD = value }
	protected _baseCD: uint;
	public static readonly key_baseCD: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'baseCD', uint(1),
	)

	/**
	 * 工具充能状态（时间）
	 * * 原理：未充能 0 ~ chargeMaxTime 完全充能 （正计时）
	 * * 默认值@无需充能的工具：如「完全充能」
	 * 
	 * ! 在设置时（使用者需）更新：
	 * * GUI状态
	 */
	get chargeTime(): uint { return this._chargeTime }
	set chargeTime(value: uint) { this._chargeTime = value }
	protected _chargeTime: uint;
	public static readonly key_chargeTime: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'chargeTime', uint(1),
	)

	/**
	 * 工具最大充能时间
	 * * 其值为0意味着「无需充能」
	 * 
	 * ! 在设置时（使用者需）更新：
	 * * GUI状态
	 */
	get chargeMaxTime(): uint { return this._chargeMaxTime }
	set chargeMaxTime(value: uint) { this._chargeMaxTime = value }
	protected _chargeMaxTime: uint;
	public static readonly key_chargeMaxTime: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'chargeMaxTime', uint(1),
	)

	/**
	 * 工具是否「反向充能」
	 * * 机制：
	 *   * 武器会在不使用时自动充能，类似一种「外加的冷却」
	 *   * 无需完全充能即可使用，但充能百分比会非满
	 * * 应用：未充能即可发射的激光；「脉冲激光」中「未完全充能」「完全充能」的两种不同状态
	 */
	get reverseCharge(): boolean { return this._reverseCharge }
	set reverseCharge(value: boolean) { this._reverseCharge = value }
	protected _reverseCharge: boolean;
	public static readonly key_reverseCharge: key = fastAddJSObjectifyMapProperty_dashP(
		Tool.OBJECTIFY_MAP,
		'reverseCharge', false,
	)

	/**
	 * （衍生）工具是否需要「冷却时间」
	 * * 返回「工具基础冷却时间」是否>0
	 * 
	 * ? 目前似乎没啥用，因为还没有工具不用CD。。。
	 */
	get needsCD(): boolean { return this._baseCD > 0 }

	/**
	 * （衍生）工具的「冷却百分比」
	 * * 原理：完全冷却 1~0 完全可用
	 * * 算法：工具冷却时间（倒计时）/基础冷却时间
	 * 
	 * ! TODO: 【2023-09-23 11:42:01】现在在计算「基础冷却时间」时，不再直接依赖系统的「无CD最小冷却时间」
	 * * 缘由：出于「通用性」着想
	 * * 现在系统将根据此设置在「分派武器时」自动设置CD
	 * * 原先的`toolMaxCD`已启用
	 */
	get CDPercent(): number { return this._usingCD / this._baseCD }

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
	 * * 范围：无充能 0 ~ 1 完全充能
	 * * 特殊：无需充能⇔完全充能
	 */
	get chargingPercent(): number {
		return (
			this.needsCharge ?
				this._chargeTime / this._chargeMaxTime :
				1
		);
	}

	/**
	 * 重置CD：变为最大值
	 */
	public resetCD(): void {
		this._usingCD = this._baseCD;
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

	/**
	 * 处理「冷却机制」
	 * * 逻辑：不断递减自身「冷却时间」，直到「冷却时间」为零
	 *   * 其后返回`isUsing`，表明「武器可以『随时使用』」
	 *   * 否则返回false，表明武器「还没到使用的时候」
	 * @param isUsing 判断使用者「是否在使用这个工具」（用于在「反向充能」时「打断充能」）
	 * @returns 是否「可以使用」
	 */
	public dealCD(isUsing: boolean): boolean {
		if (this._usingCD > 0) {
			this._usingCD--;
			return false;
		}
		else {
			this.resetCD();
			return isUsing;
		}
	}

	/**
	 * 处理「充能机制」
	 * * 逻辑：不断递增自身「充能时间」，直到「充能时间」达到自身的「最大充能时间」
	 *   * 其后返回true，表明「武器可以使用」
	 *   * 否则返回false，表明武器「还没到使用的时候」
	 * * 正反向逻辑模式：
	 *   * 正向：需要使用者**主动**使用工具充能，当满充能/停止使用时直接释放
	 *   * 反向：相当于一次额外的冷却，但使用者无需**主动使用**工具
	 * 
	 * @param isUsing 判断使用者「是否在使用这个工具」（用于在「反向充能」时「打断充能」）
	 * @returns 是否「可以使用」
	 */
	public dealCharge(isUsing: boolean): boolean {
		if (this._reverseCharge) {
			if (isUsing) { // 反向充能「只要使用就直接成功」
				this.resetCharge(); // 自动重置充能状态
				return true;
			}
			else if (this._chargeTime < this._chargeMaxTime)
				this._chargeTime++;
		}
		else if (isUsing) { // 正向充能只能在使用时
			if (this._chargeTime >= this._chargeMaxTime) {
				this.resetCharge(); // 自动重置充能状态
				return true;
			}
			else
				this._chargeTime++;
		}
		// 若先前未因「充能完毕/使用打断充能」返回true
		return false;
	}

	//============Game Mechanics============//
	/**
	 * 钩子「工具被使用」
	 * * 作用：自定义工具的行为
	 * 
	 * ? 使用「函数钩子」似乎不行……没法序列化
	 * 
	 * @param host 调用时处在的「游戏主体」
	 * @param user 使用者（暂定为使用者）
	 */
	public onUseByPlayer(host: IBatrGame, user: IPlayer): void {
		console.log('Tool', this, 'is used by', user, 'in', host)
	}

}
