import { int, uint } from "../../../../../legacy/AS3Legacy";
import PlayerStats from "../../stat/PlayerStats";
import PlayerController from "./controller/PlayerController";
import IPlayerProfile from "./profile/IPlayerProfile";
import PlayerTeam from "./team/PlayerTeam";
import { iPoint } from "../../../../../common/geometricTools";
import { IEntityActive, IEntityDisplayable, IEntityHasHPAndHeal, IEntityHasHPAndLives, IEntityHasStats, IEntityInGrid, IEntityNeedsIO, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import IBatrGame from "../../../../main/IBatrGame";
import { mRot } from "../../../../general/GlobalRot";
import Tool from "../../tool/Tool";
import IGameRule from './../../../../api/rule/IGameRule';
import PlayerAttributes from "./attributes/PlayerAttributes";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";

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
 * 实体
 */
export default interface IPlayer extends IPlayerProfile, IEntityInGrid, IEntityActive, IEntityDisplayable, IEntityWithDirection, IEntityHasStats, IEntityHasHPAndHeal, IEntityHasHPAndLives {

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

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * @param position 位置信息
	 * @param direction 朝向信息（任意维整数角）
	 * @param team 玩家队伍（存储颜色等信息）
	 * @param controller 玩家控制器
	 * @param args 其它附加参数
	 */
	new(
		position: iPoint,
		direction: mRot,
		team: PlayerTeam,
		controller: PlayerController | null,
		...args: any[] // ! 其它附加参数
	): void;

	// /**
	//  * 获取玩家的「控制器」
	//  */
	// get controller(): PlayerController | null; // !【2023-09-27 23:45:42】现在弃用

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

	/** 获取「上一个伤害它的玩家」 */
	get lastHurtByPlayer(): IPlayer | null;

	// Key&Control
	/**
	 * 获取「是否有任一『按键』按下」
	 * * 包括「移动键」与「使用键」
	 * 
	 * ! 实际应该是存在于「控制器」中的概念，但这里还是沿用来做了
	 */
	get someKeyDown(): boolean;

	/**
	 * 获取「是否有任一『移动键』按下」
	 * 
	 * 💡使用「按键数组」来兼容任意维：0123右左下上
	 * * 实现方法：利用JS特性直接使用「自动转换成布尔值后的值」判断，true/undefined
	 * * 一般来说，只有「按键被按下时」与「按键保持一定时间后」才会触发移动
	 */
	get someMoveKeyDown(): boolean;

	/** 获取「朝某个方向移动」的按键是否按下 */
	isPressMoveAt(direction: mRot): boolean;
	/** 设置「朝某个方向移动」的按键是否按下 */
	pressMoveAt(direction: mRot): void;
	releaseMoveAt(direction: mRot): void;

	/**
	 * 设置「是否『正在使用（工具）』」
	 * * 机制：松开使用键⇒充能中断（附带显示更新）
	 */
	set isUsing(turn: boolean);

	/*
	set pressLeftSelect(turn:Boolean)
	set pressRightSelect(turn:Boolean)
	*/

	//============Instance Functions============//

	/**
	 * 按照「游戏规则」初始化变量
	 * * 如：生命值，最大生命值等
	 * 
	 * ! 因涉及到内部变量的设置，不能提取到外面去
	 * 
	 */
	initVariablesByRule(rule: IGameRule): void;

	//====Functions About Health====//
	/** 实现：这个「治疗者」必须是玩家 */
	addHealth(value: uint, healer: IPlayer | null): void;

	/** 实现：这个「攻击者」必须是玩家 */
	removeHealth(value: uint, attacker: IPlayer | null): void;

	//====Functions About Gameplay====//

	/*
	! ↓【2023-09-23 16:52:31】这两段代码现将拿到「工具」中，不再在这里使用
	* 会在「方块投掷器」中使用，然后在显示的时候调用
	*/
	// get carriedBlock(): Block {
	// 	return this._carriedBlock;
	// }

	// get isCarriedBlock(): boolean {
	// 	return this._carriedBlock != null && this._carriedBlock.visible;
	// }

	/** 实现：所处位置方块更新⇒传递更新（忽略延时、是位置改变） */
	onPositedBlockUpdate(host: IBatrGame): void;

	/**
	 * 在玩家位置改变时「测试移动」
	 * * 【2023-09-23 16:56:03】目前的功能就是「测试移动」 
	 * * 现在使用自身位置作「更新后位置」
	 * 
	 * 迁移前逻辑：
	 * * 调用游戏处理「『在方块内时』动作」
	 *   * 如果调用者「忽略冷却」则不论如何立即开始
	 *   * 如果进行了动作，则重置冷却时间（固定值）
	 * * 若非「忽略冷却」，开始降低冷却（计数递减）
	 *   * 递减到0时停止递减，等待下一个处理
	 *   * 且一般只在位置更新/方块更新后才开始——一旦「当前位置无需额外处理动作」就停下来
	 * 
	 * @param ignoreDelay 是否忽略「方块伤害」等冷却直接开始
	 * @param isLocationChange 是否为「位置改变」引发的
	 */
	dealMoveInTest(host: IBatrGame, ignoreDelay?: boolean, isLocationChange?: boolean): void;

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
	 *     * 寻找并设置坐标在「合适的重生点」
	 *     * 生成一个「重生」特效
	 *   * 发送事件「重生时」
	 */
	dealRespawn(host: IBatrGame): void;

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
	 * 处理玩家工具的使用时间（冷却+充能）
	 * * 每个游戏刻调用一次
	 * * 逻辑：
	 *   * CD未归零⇒CD递减 + GUI更新CD
	 *   * CD已归零⇒
	 *     * 无需充能⇒在使用⇒使用工具
	 *     * 需要充能⇒正向充能|反向充能（现在因废弃掉`-1`的状态，不再需要「初始化充能」了）
	 * * 【2023-09-26 23:55:48】现在使用武器自身的数据，但「使用逻辑」还是在此处
	 *   * 一个是为了显示更新方便
	 *   * 一个是为了对接逻辑方便
	 * 
	 * ! 注意：因为「使用武器」需要对接「游戏主体」，所以需要传入「游戏主体」参数
	*/
	dealUsingTime(host: IBatrGame): void;

	/**
	 * 处理玩家工具的充能状态
	 * * 逻辑：需要玩家**主动**使用工具充能，当满充能/停止使用时直接释放
	 * * 每个游戏刻调用一次
	 * * 【2023-09-26 23:55:48】现在使用武器自身的数据，但「使用逻辑」还是在此处
	 *   * 一个是为了显示更新方便
	 *   * 一个是为了对接逻辑方便
	 * 
	 * ! 注意：因为「使用武器」需要对接「游戏主体」，所以需要传入「游戏主体」参数
	 */
	dealToolCharge(host: IBatrGame): void;

	/**
	 * 处理玩家工具的充能状态（反向）
	 * * 逻辑：相当于一次额外的冷却，但玩家无需**主动使用**工具
	 * * 每个游戏刻调用一次
	 * * 【2023-09-26 23:55:48】现在使用武器自身的数据，但「使用逻辑」还是在此处
	 *   * 一个是为了显示更新方便
	 *   * 一个是为了对接逻辑方便
	 * 
	 * ! 注意：因为「使用武器」需要对接「游戏主体」，所以需要传入「游戏主体」参数
	 */
	dealToolReverseCharge(host: IBatrGame): void;

	/**
	 * 在玩家停止充能之时
	 * * 逻辑：工具需充能 && 工具冷却结束 && 自身已激活 && 自身不在重生 ⇒ 使用工具+重置充能状态
	 */
	onDisableCharge(host: IBatrGame): void;

	/**
	 * 初始化工具充能状态
	 * * 逻辑：工具「已充能时长」归零
	 * 
	 * ! 即将废弃
	 * 
	 * ! 已移除：无需再根据「工具的默认充能（所需）时长」调整「最大充能时长」
	 */
	initToolCharge(): void;

	/**
	 * 重置充能状态
	 * * 逻辑：工具「已充能时长」归零
	 * 
	 * ! 现在对「已充能时长」不再使用`-1`作为「未充能」的标志——统一为无符号整数
	 * 
	 * ! 已移除 @param includeMaxTime 现在的「所需充能时长」由其自身工具决定
	 * @param updateGUI 是否更新GUI信息 // TODO: 暂时无用
	 */
	resetCharge(updateGUI: boolean): void;

	/**
	 * 重置冷却
	 * * 逻辑：冷却时间归零 + GUI更新
	 */
	resetCD(): void;

	//====Control Functions====//
	/**
	 * * 下面是一些用于「从IO中读取并执行」的「基本操作集合」
	 * TODO: 【2023-09-27 22:34:09】目前这些「立即执行操作」还需要以「PlayerIO」的形式重构成「读取IO⇒根据读取时传入的『游戏主体』行动」
	 */

	/**
	 * （控制）玩家向前移动（一格）
	 * 
	 * !【2023-09-27 20:19:33】现在废除了「非整数前进」，因为已经锁定玩家为「格点实体」
	 * * 同时也废除了「不定长度前进」，限定为「只前进一格」
	 */
	moveForward(host: IBatrGame): void;

	/**
	 * （控制）玩家向某个方向移动（一格）
	 * * 📌实际上相当于「转向+前进」
	 */
	moveToward(host: IBatrGame, direction: mRot): void;

	// ! 原先一些「向固定朝向旋转」的功能已停用

	/**
	 * （控制）玩家转向指定方向
	 * * 为何要附上「游戏主体」参数？其本身可能要触发一些钩子函数什么的
	 * @param host 所依附的「游戏主体」
	 * @param direction 要转向的方向
	 */
	turnTo(host: IBatrGame, direction: mRot): void;

	/**
	 * （控制）玩家转向后方
	 * * 为何要附上「游戏主体」参数？其本身可能要触发一些钩子函数什么的
	 */
	turnBack(host: IBatrGame): void

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
	turnRelative?(host: IBatrGame, coaxis: uint, step?: int): void;

	/**
	 * （控制玩家）开始使用工具
	 * * 对应「开始按下『使用』键」
	 */
	startUsingTool(host: IBatrGame): void

	/**
	 * （控制玩家）停止使用工具
	 * * 对应「开始按下『使用』键」
	 */
	stopUsingTool(host: IBatrGame): void

	//============Display Implements============//
	// Color
	/** 获取（缓存的）十六进制线条颜色 */
	get lineColor(): uint;

	/** 获取（缓存的）十六进制填充颜色 */
	get fillColor(): uint;

	/** 用于在GUI上显示的文本：生命值+最大生命值+储备生命值+剩余生命数（若生命数有限） */
	get healthText(): string;

	/** （移植自AIPlayer）用于在主图形上显示「附加装饰」 */
	drawShapeDecoration(shape: IBatrShape): void

}
