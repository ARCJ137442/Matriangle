import { int, uint } from "../../../../../legacy/AS3Legacy";
import PlayerStats from "../../stat/PlayerStats";
import IPlayerProfile from "./profile/IPlayerProfile";
import PlayerTeam from "./team/PlayerTeam";
import { iPoint, iPointRef } from "../../../../../common/geometricTools";
import { IEntityActive, IEntityDisplayable, IEntityHasHPAndHeal, IEntityHasHPAndLives, IEntityHasStats, IEntityInGrid, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import IBatrMatrix from "../../../../main/IBatrMatrix";
import { mRot } from "../../../../general/GlobalRot";
import Tool from "../../tool/Tool";
import PlayerAttributes from "./attributes/PlayerAttributes";
import BonusBox from "../item/BonusBox";
import { NativeDecorationLabel } from "../../../../../display/mods/native/entity/player/NativeDecorationLabels";
import PlayerController from "./controller/PlayerController";
import { IMatrixControlReceiver } from "../../../../api/control/MatrixControl";

/* 
TODO: 【2023-09-23 00:20:12】现在工作焦点：
 * 抽象出一个「玩家接口」
 * 在「架空玩家实际类实现」后，测试抛射体
 * 重构「玩家」「AI玩家」，将这两者的区别细化为「控制器」「显示模板」不同
   * 控制：一个是键鼠控制（人类），一个是基于时钟的自动程序控制（AI）……
	 * 这样较容易支持其它方式（如使用HTTP/WebSocket请求控制）
	 * 📌在重写「AI控制器」时，用上先前学的「行为树」模型（虽然原型还没调试通）
	 * 如果有机会的话，尝试使用「装饰器」
   * 显示：一个用「渐变无缝填充」的算法（人类），一个用「纯色镂空填充」的方法（AI）
 * 由此开始写「外部IO模块」（可能只会先留一个抽象接口）
   * 🎯给所有类型的「玩家」一个通用的「行为控制系统」（而非所谓「AI专属」）
   * 💭这个所谓「外部IO」或许仍然需要从游戏中分派，或者受游戏的控制
   * 参考案例：有如电脑「管理外设，但不限制外设的输入输出」一样
 * 并且，再对接「玩家统计」模块……
 * 📌原则：尽可能向Julia这样的「数据集中，方法分派」范式靠拢——不要在其中塞太多「游戏机制」方法
   * 适度独立出去
 */

/**
 * 抽象的「玩家」是
 * * 作为「格点实体」的
 * * 有朝向的
 * * 可被显示的
 * * 能被某个「控制器」控制，并缓存外部IO接口的
 * * 拥有统计信息的
 * * 拥有「经验」「加成」机制的
 * * 可以使用「工具」的
 * * 可以被「玩家控制器」控制的
 * 实体
 */
export default interface IPlayer extends IPlayerProfile, IEntityInGrid, IEntityActive, IEntityDisplayable, IEntityWithDirection, IEntityHasStats, IEntityHasHPAndHeal, IEntityHasHPAndLives, IMatrixControlReceiver {

	/**
	 * 用于替代`instanceof`
	 */
	readonly i_isPlayer: true;

	/**
	 * 玩家的「经验值」
	 * * 目前在游戏机制上的应用仅在于「升级时的加成」以及「玩家表现的平均化、单一化测量」
	 * * 📌机制：在设置的经验超过「目前等级最大经验」时，玩家会直接升级
	 */
	get experience(): uint;
	set experience(value: uint);

	/** 经验等级 */
	get level(): uint;
	set level(value: uint);

	/** 玩家升级所需经验（目前等级最大经验） */
	get levelupExperience(): uint;

	/**
	 * 玩家「当前所持有经验」与「目前等级最大经验」的百分比
	 * * 范围：[0, 1]（1也会达到，因为只有在「超过」时才升级）
	 * * 应用：目前只有「经验条显示」
	 */
	get experiencePercent(): number

	//====Buff====//

	/**
	 * 玩家的所有属性（原「Buff系统」）
	 * * 包括「伤害提升」「冷却减免」「抗性提升」「范围提升」
	*/
	get attributes(): PlayerAttributes;

	/**
	 * 获取玩家的「控制器」
	 * 
	 * ? 目前还是有些存疑：是否只需要控制器一方控制？但实际上必须由玩家向控制器分派事件
	 */
	get controller(): PlayerController | null; // !【2023-10-05 01:19:13】重新启用，以作为玩家一侧的请求

	/**
	 * 连接到一个控制器
	 */
	connectController(controller: PlayerController): void

	/**
		 * 与当前控制器断开
		 */
	disconnectController(): void

	/**
	 * 存取玩家队伍
	 * * 在「设置队伍」时（请求）更新显示（UI、图形）
	 * 
	 * ! 【2023-09-23 11:25:58】不再请求更新所有抛射体的颜色
	 * * 💭或许可以通过「发射时玩家队伍ID缓存至抛射体以便后续伤害判断」解决由此导致的「显示与预期不一致」问题
	 */
	get team(): PlayerTeam;
	set team(value: PlayerTeam);

	/**
	 * 获取玩家的统计信息
	 * 
	 * TODO: 后续支持「自定义统计字段」
	 */
	get stats(): PlayerStats;

	/**
	 * 存取玩家「当前所持有工具」
	 * * 📌只留存引用
	 * 
	 * ! 在设置时会重置：
	 * * 现在参数附着在工具上，所以不需要再考量了
	 * // * 使用冷却
	 * // * 充能状态&百分比
	 * 
	 * ! 现在有关「使用冷却」「充能状态」的代码已独立到「工具」对象中
	 * 
	 * ? 工具彻底「独立化」：每个玩家使用的「工具」都将是一个「独立的对象」而非「全局引用形式」？
	 * * 这样可用于彻底将「使用冷却」「充能状态」独立出来
	 * * 基于工具的类-对象系统
	 * * 在游戏分派工具（武器）时，使用「复制原型」而非「引用持有」的方机制
	 */
	get tool(): Tool;
	set tool(value: Tool);

	/** 玩家的「自定义名称」（不受「国际化文本」影响） */
	get customName(): string;
	set customName(value: string);

	// /** 获取「上一个伤害它的玩家」 */ // !【2023-09-28 20:55:34】弃用：不再需要
	// get lastHurtByPlayer(): IPlayer | null;

	//============Instance Functions============//

	//====Functions About HP====//
	/**
	 * 增加生命值
	 * * 需要「游戏母体」以处理「伤害」「死亡」事件
	 */
	addHP(host: IBatrMatrix, value: uint, healer: IPlayer | null): void;

	/**
	 * 减少生命值
	 * * 需要「游戏母体」以处理「伤害」「死亡」事件
	 */
	removeHP(host: IBatrMatrix, value: uint, attacker: IPlayer | null): void;

	/**
	 * 处理「储备生命值」
	 * * 功能：实现玩家「储备生命值」的「储备」效果
	 * 
	 * 逻辑：
	 * * 无「储备生命值」⇒不进行处理
	 * * 「治疗延时」达到一定值后：
	 *   * 生命值满⇒不处理
	 *   * 未满⇒将一点「储备生命值」移入「生命值」
	 *   * 重置「治疗延时」
	 * * 否则：
	 *   * 持续计时
	 */
	dealHeal(): void;

	//====Functions About Gameplay====//

	/*
	! ↓【2023-09-23 16:52:31】这两段代码现将拿到「工具」中，不再在这里使用
	* 会在「方块投掷器」中使用，然后在显示的时候调用
	*/
	// get carriedBlock(): Block {
	// 	return this._carriedBlock;
	// }

	// get isCarriedBlock(): boolean {
	// 	return this._carriedBlock !== null && this._carriedBlock.visible;
	// }

	/**
	 * 特别的「设置坐标」函数
	 * * 作为`position`一个特殊的setter
	 * * 用于「坐标变更」逻辑
	 */
	setPosition(host: IBatrMatrix, position: iPointRef): void;

	/** 实现：所处位置方块更新⇒传递更新（忽略延时、是位置改变） */
	onPositedBlockUpdate(host: IBatrMatrix): void;

	/**
	 * 在玩家位置改变时「测试移动」
	 * * 【2023-09-23 16:56:03】目前的功能就是「测试移动」 
	 * * 现在使用自身位置作「更新后位置」
	 * 
	 * ! 这个因为涉及封装玩家的内部变量，所以不能迁移至「原生游戏机制」中
	 * 
	 * 迁移前逻辑：
	 * * 调用游戏处理「『在方块内时』动作」
	 *   * 如果调用者「忽略冷却」则不论如何立即开始
	 *   * 如果进行了动作，则重置冷却时间（固定值）
	 * * 若非「忽略冷却」，开始降低冷却（计数递减）
	 *   * 递减到0时停止递减，等待下一个处理
	 *   * 且一般只在位置更新/方块更新后才开始——一旦「当前位置无需额外处理动作」就停下来
	 * 
	 * @param host 所处的「游戏母体」
	 * @param ignoreDelay 是否忽略「方块伤害」等冷却直接开始
	 * @param isLocationChange 是否为「位置改变」引发的
	 */
	dealMoveInTest(
		host: IBatrMatrix,
		ignoreDelay?: boolean/* =false */,
		isLocationChange?: boolean/* =false */
	): void;

	/**
	 * 用于判断「玩家是否可当前位置移动到另一位置」
	 * * 【2023-10-04 18:07:01】不会考虑「移动前坐标」
	 * 
	 * TODO: 日后细化「实体类型」的时候，还会分「有碰撞箱」与「无碰撞箱」来具体决定
	 * 
	 * @param host 判断所发生在的游戏母体
	 * //@param player 要判断的玩家// !【2023-09-30 12:23:44】现在就直接用this
	 * @param p 位置
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param avoidOthers 是否避开其它（格点）实体
	 * @param others 避开的实体列表
	 */
	testCanGoTo(
		host: IBatrMatrix, p: iPointRef,
		avoidHurt?: boolean/* = false*/,
		avoidOthers?: boolean/* = true*/,
		others?: IEntityInGrid[]/* =[] */,
	): boolean

	/**
	 * （快捷封装）用于判断「玩家是否可向前移动（一格）」
	 * 
	 * @param host 判断所发生在的游戏母体
	 * //@param player 要判断的玩家（整数坐标）// !【2023-09-30 12:23:44】现在就直接用this
	 * @param rotatedAsRot 是否采用「特定方向」覆盖「使用玩家方向」
	 * @param avoidOthers 是否包括其他玩家
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param others 避开的实体列表
	 */
	testCanGoForward(
		host: IBatrMatrix, rotatedAsRot?: uint/* = 5*/,
		avoidHurt?: boolean/* = false*/,
		avoidOthers?: boolean/* = true*/,
		others?: IEntityInGrid[]/* =[] */,
	): boolean;

	//====Functions About Respawn====//
	/**
	 * 处理「重生」
	 * * 功能：实现玩家在「死后重生」的等待时间
	 * 
	 * 逻辑：
	 * * 「重生延时」递减
	 * * 到一定程度后⇒处理「重生」
	 *   * 重置到「未开始计时」状态
	 *   * 自身「剩余生命数」递减
	 *   * 调用游戏机制代码，设置玩家在游戏内的状态
	 *	 * 寻找并设置坐标在「合适的重生点」
	 *	 * 生成一个「重生」特效
	 *   * 发送事件「重生时」
	 */
	dealRespawn(host: IBatrMatrix): void;

	//====Functions About Tool====//
	/**
	 * 当持有的工具改变时
	 * 
	 * !【2023-09-23 17:45:32】弃用：现在几乎无需处理逻辑
	 * * 一切基本已由「赋给新工具时」处理完毕（新工具的CD和充能状态都已「重置」）
	 * * 对于「二阶武器」（如「冲击波」），也已在「奖励箱设置工具」时处理好
	 *   * 直接装填玩家当前武器，并赋值给玩家
	 * 
	 * @param oldT 旧工具
	 * @param newT 新工具
	 */
	onToolChange?(oldT: Tool, newT: Tool): void;

	/**
	 * 缓存玩家「正在使用工具」的状态
	 * * 目的：保证玩家是「正常通过『冷却&充能』的方式使用工具」的
	 */
	get isUsing(): boolean;

	//====Control Functions====//
	/**
	 * * 下面是一些用于「从IO中读取并执行」的「基本操作集合」
	 * TODO: 【2023-09-27 22:34:09】目前这些「立即执行操作」还需要以「PlayerIO」的形式重构成「读取IO⇒根据读取时传入的『游戏母体』行动」
	 */

	/**
	 * （控制）玩家向前移动（一格）
	 * 
	 * !【2023-09-27 20:19:33】现在废除了「非整数前进」，因为已经锁定玩家为「格点实体」
	 * * 同时也废除了「不定长度前进」，限定为「只前进一格」
	 */
	moveForward(host: IBatrMatrix): void;

	/**
	 * （控制）玩家向某个方向移动（一格）
	 * * 📌实际上相当于「转向+前进」
	 */
	moveToward(host: IBatrMatrix, direction: mRot): void;

	// ! 原先一些「向固定朝向旋转」的功能已停用

	/**
	 * （控制）玩家转向指定方向
	 * * 为何要附上「游戏母体」参数？其本身可能要触发一些钩子函数什么的
	 * @param host 所依附的「游戏母体」
	 * @param direction 要转向的方向
	 */
	turnTo(host: IBatrMatrix, direction: mRot): void;

	/**
	 * （控制）玩家转向后方
	 * * 为何要附上「游戏母体」参数？其本身可能要触发一些钩子函数什么的
	 */
	turnBack(host: IBatrMatrix): void;

	/**
	 * （可选）（控制玩家）向指定方向旋转
	 * * 与`turnTo`的区别：这是「相对方向」旋转
	 * * 详情参见`rotate_M`
	 * 
	 * ! 注意：不能连续使用两次「协轴相同的旋转」
	 * * 原因：第一次旋转时，玩家方向已经与协轴方向一致，导致第二次无法构造「旋转平面」
	 * 
	 * @param coaxis 旋转的「协轴」，与玩家的「当前朝向」构成整个「旋转平面」
	 * @param 经过旋转的「任意维整数角」
	 */
	turnRelative?(host: IBatrMatrix, coaxis: uint, step?: int): void;

	/**
	 * （控制玩家）开始使用工具
	 * * 对应「开始按下『使用』键」
	 */
	startUsingTool(host: IBatrMatrix): void;

	/**
	 * （控制玩家）停止使用工具
	 * * 对应「开始按下『使用』键」
	 */
	stopUsingTool(host: IBatrMatrix): void;

	// 钩子函数 //
	onHeal(host: IBatrMatrix, amount: uint, healer: IPlayer | null/*  = null */): void;
	onHurt(host: IBatrMatrix, damage: uint, attacker: IPlayer | null/*  = null */): void;
	onDeath(host: IBatrMatrix, damage: uint, attacker: IPlayer | null/*  = null */): void;
	onKillPlayer(host: IBatrMatrix, victim: IPlayer, damage: uint): void;
	onRespawn(host: IBatrMatrix,): void;
	onMapTransform(host: IBatrMatrix,): void;
	onPickupBonusBox(host: IBatrMatrix, box: BonusBox): void;
	preLocationUpdate(host: IBatrMatrix, oldP: iPoint): void;
	onLocationUpdate(host: IBatrMatrix, newP: iPoint): void;
	onLevelup(host: IBatrMatrix): void;

	//============Display Implements============//
	// Color
	/** 获取（缓存的）十六进制线条颜色 */
	get lineColor(): uint;

	/** 获取（缓存的）十六进制填充颜色 */
	get fillColor(): uint;

	/** 用于在GUI上显示的文本：生命值+最大生命值+储备生命值+剩余生命数（若生命数有限） */
	get HPText(): string;
	/**
	 * 用于判断「装饰类型」的标记
	 * * 用途：在「玩家类特效」从玩家处构造时，用于获取到所有绘制信息
	 */
	decorationLabel: NativeDecorationLabel;

}
