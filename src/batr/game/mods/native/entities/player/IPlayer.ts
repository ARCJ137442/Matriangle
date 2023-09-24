import { int, uint } from "../../../../../legacy/AS3Legacy";
import PlayerStats from "../../stat/PlayerStats";
import PlayerController from "./controller/PlayerController";
import IPlayerProfile from "./profile/IPlayerProfile";
import PlayerTeam from "./team/PlayerTeam";
import { iPoint } from "../../../../../common/geometricTools";
import { IEntityActive, IEntityDisplayable, IEntityHasHPAndHeal, IEntityHasHPAndLives, IEntityHasStats, IEntityInGrid, IEntityNeedsIO, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import IBatrGame from "../../../../main/IBatrGame";
import { mRot } from "../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../main/GlobalGameVariables";
import Tool from "../../tool/Tool";
import Player from "./Player";
import IGameRule from './../../../../api/rule/IGameRule';

/* 
TODO: 【2023-09-23 00:20:12】现在工作焦点：
 * 抽象出一个「玩家接口」
 * 在「架空玩家实际类实现」后，测试抛射体
 * 重构「玩家」「AI玩家」，将这两者的区别细化为「控制器」「显示模板」不同
   * 控制：一个是键盘控制（人类），一个是基于时钟的自动程序控制（AI）……
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
export default interface IPlayer extends IPlayerProfile, IEntityInGrid, IEntityNeedsIO, IEntityActive, IEntityDisplayable, IEntityWithDirection, IEntityHasStats, IEntityHasHPAndHeal, IEntityHasHPAndLives {

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
	 * 玩家的伤害加成
	 * * 机制：用于在使用工具时增加额外的伤害
	 * * 算法：攻击者伤害=工具伤害+加成值*武器「伤害系数」 ?? 1
	*/
	get buffDamage(): uint;
	set buffDamage(value: uint);

	/**
	 * 玩家的冷却减免
	 * * 机制：用于在使用工具时减免冷却时间
	 * * 算法：使用者冷却=max(floor(工具冷却/(1+加成值/10)), 1)
	*/
	get buffCD(): uint;
	set buffCD(value: uint);

	/**
	 * 玩家的抗性加成
	 * * 机制：用于在受到「攻击者伤害」时减免伤害
	 * * 算法：最终伤害=max(攻击者伤害-加成值*攻击者武器减免系数 ?? 1, 1)
	*/
	get buffResistance(): uint;
	set buffResistance(value: uint);

	/**
	 * 玩家的影响加成
	 * * 机制：用于在使用工具时增加额外的「影响范围」，如「更大的子弹爆炸范围」
	 * * 算法：最终伤害=max(攻击者伤害-加成值*攻击者武器减免系数 ?? 1, 1)
	 */
	get buffRadius(): uint;
	set buffRadius(value: uint);

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
	): void

	/**
	 * 获取玩家的「控制器」
	 */
	get controller(): PlayerController | null;

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
	 * 设置「是否按下『使用键』」
	 * * 机制：松开使用键⇒充能中断（附带显示更新）
	 */
	set pressUse(turn: boolean): void;

	/*
	set pressLeftSelect(turn:Boolean)
	set pressRightSelect(turn:Boolean)
	*/

	//============Instance Functions============//

	// ! 「根据规则」
	/**
	 * 按照「游戏规则」初始化变量
	 * * 如：生命值，最大生命值等
	 * 
	 * ! 因涉及到内部变量的设置，不能提取到外面去
	 * 
	 * @param tool 分配给玩家的工具
	 */
	initVariablesByRule(rule: IGameRule, tool: Tool): void

	//====Functions About Health====//
	/** 实现：这个「治疗者」必须是玩家 */
	addHealth(value: uint, healer: IPlayer | null): void;

	/** 实现：这个「攻击者」必须是玩家 */
	removeHealth(value: uint, attacker: IPlayer | null): void

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
	onPositedBlockUpdate(host: IBatrGame): void

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
	dealMoveInTest(host: IBatrGame, ignoreDelay?: boolean, isLocationChange?: boolean): void

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
	dealHeal(): void

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

	dealUsingCD(): void {
	// console.log(this.tool.name,this._toolChargeTime,this._toolChargeMaxTime)
	if (this._toolUsingCD > 0) {
		this._toolUsingCD--;
		this._GUI.updateCD();
	}
	else {
		if (!this.toolNeedsCharge) {
			if (this.isPress_Use)
				this.useTool();
		}
		else if (this._toolChargeTime < 0) {
			this.initToolCharge();
		}
		else {
			if (this.toolReverseCharge) {
				this.dealToolReverseCharge();
			}
			else if (this.isPress_Use) {
				this.dealToolCharge();
			}
		}
	}
}

dealToolCharge(): void {
	if(this._toolChargeTime >= this._toolChargeMaxTime) {
	this.useTool();
	this.resetCharge(false, false);
}
		else
this._toolChargeTime++;
this._GUI.updateCharge();
	}

dealToolReverseCharge(): void {
	if(this.toolChargeTime < this.toolChargeMaxTime) {
	this._toolChargeTime++;
}
if (this.isPress_Use) {
	this.useTool();
	this.resetCharge(false, false);
}
this._GUI.updateCharge();
	}

onDisableCharge(): void {
	if(!this.toolNeedsCharge || this._toolUsingCD > 0 || !this.isActive || this.isRespawning)
	return;
	this.useTool();
	this.resetCharge();
}

initToolCharge(): void {
	this._toolChargeTime = 0;
	this._toolChargeMaxTime = this._tool.defaultChargeTime;
}

resetCharge(includeMaxTime: boolean = true, updateGUI: boolean = true): void {
	this._toolChargeTime = -1;
	if(includeMaxTime)
			this._toolChargeMaxTime = 0;
	if(updateGUI)
			this._GUI.updateCharge();
}

resetCD(): void {
	this._toolUsingCD = 0;
	this._GUI.updateCD();
}

//====Functions About Attributes====//

/**
 * The Function returns the final damage with THIS PLAYER.
 * FinalDamage=DefaultDamage+
 * attacker.buffDamage*ToolCoefficient-
 * this.buffResistance*ToolCoefficient>=0.
 * @param	attacker	The attacker.
 * @param	attackerTool	The attacker's tool(null=attacker.tool).
 * @param	defaultDamage	The original damage by attacker.
 * @return	The Final Damage.
 */
computeFinalDamage(attacker: Player, attackerTool: Tool, defaultDamage: uint): uint {
	if (attacker == null)
		return attackerTool == null ? 0 : attackerTool.defaultDamage;
	if (attackerTool == null)
		attackerTool = attacker.tool;
	if (attackerTool != null)
		return attackerTool.getBuffedDamage(defaultDamage, attacker.buffDamage, this.buffResistance);
	return 0;
}

finalRemoveHealth(attacker: Player, attackerTool: Tool, defaultDamage: uint): void {
	this.removeHealth(this.computeFinalDamage(attacker, attackerTool, defaultDamage), attacker);
}

computeFinalCD(tool: Tool): uint {
	return tool.getBuffedCD(this.buffCD);
}

computeFinalRadius(defaultRadius: number): number {
	return defaultRadius * (1 + Math.min(this.buffRadius / 16, 3));
}

computeFinalLightningEnergy(defaultEnergy: uint): int {
	return defaultEnergy * (1 + this._buffDamage / 20 + this._buffRadius / 10);
}

//====Control Functions====//

clearControlKeys(): void {
	controlKey_Up = KeyCode.EMPTY;
	controlKey_Down = KeyCode.EMPTY;
	controlKey_Left = KeyCode.EMPTY;
	controlKey_Right = KeyCode.EMPTY;
	controlKey_Use = KeyCode.EMPTY;
}

turnAllKeyUp(): void {
	this.isPress_Up = false;
	this.isPress_Down = false;
	this.isPress_Left = false;
	this.isPress_Right = false;
	this.isPress_Use = false;
	// this.isPress_Select_Left=false;
	// this.isPress_Select_Right=false;
	this.keyDelay_Move = 0;
	this.controlDelay_Move = FIXED_TPS * 0.5;
	// this.controlDelay_Select=TPS/5;
	this.controlLoop_Move = FIXED_TPS * 0.05;
	// this.controlLoop_Select=TPS/40;
}

updateKeyDelay(): void {
	// console.log(this.keyDelay_Move,this.controlDelay_Move,this.controlLoop_Move);
	//==Set==//
	// Move
	if(this.someMoveKeyDown) {
	this.keyDelay_Move++;
	if (this.keyDelay_Move >= this.controlLoop_Move) {
		this.keyDelay_Move = 0;
	}
}
		else {
	this.keyDelay_Move = -controlDelay_Move;
}
	}

runActionByKeyCode(code: uint): void {
	if(!this.isActive || this.isRespawning)
	return;
	switch(code) {
			case this.controlKey_Up:
	this.moveUp();
	break;
	case this.controlKey_Down:
	this.moveDown();
	break;
	case this.controlKey_Left:
	this.moveLeft();
	break;
	case this.controlKey_Right:
	this.moveRight();
	break;
	case this.controlKey_Use:
	if(!this.toolReverseCharge)
	this.useTool();
	break;
	/*case this.controlKey_Select_Left:
	this.moveSelect_Left();
break;
case this.controlKey_Select_Right:
	this.moveSelect_Right();
break;*/
}
	}

dealKeyControl(): void {
	if(!this.isActive || this.isRespawning)
	return;
	if(this.someKeyDown) {
	// Move
	if (this.keyDelay_Move == 0) {
		// Up
		if (this.isPress_Up) {
			this.moveUp();
		}
		// Down
		else if (this.isPress_Down) {
			this.moveDown();
		}
		// Left
		else if (this.isPress_Left) {
			this.moveLeft();
		}
		// Right
		else if (this.isPress_Right) {
			this.moveRight();
		}
	} /*
				//Select_Left
				if(this.keyDelay_Select==0) {
					//Select_Right
					if(this.isPress_Select_Right) {
						this.SelectRight();
					}
					else if(this.isPress_Select_Left) {
						this.SelectLeft();
					}
				}*/
}
	}

moveForward(distance: number = 1): void {
	if(this.isRespawning)
	return;
	switch(this.rot) {
			case GlobalRot.RIGHT:
	moveRight();
	break;

			case GlobalRot.LEFT:
	moveLeft();
	break;

			case GlobalRot.UP:
	moveUp();
	break;

			case GlobalRot.DOWN:
	moveDown();
	break;
}
	}

moveIntForward(distance: number = 1): void {
	moveForward(distance);
}

moveLeft(): void {
	host.movePlayer(this, GlobalRot.LEFT, this.moveDistance);
}

moveRight(): void {
	host.movePlayer(this, GlobalRot.RIGHT, this.moveDistance);
}

moveUp(): void {
	host.movePlayer(this, GlobalRot.UP, this.moveDistance);
}

moveDown(): void {
	host.movePlayer(this, GlobalRot.DOWN, this.moveDistance);
}

turnUp(): void {
	this.rot = GlobalRot.UP;
}

turnDown(): void {
	this.rot = GlobalRot.DOWN;
}

turnAbsoluteLeft(): void {
	this.rot = GlobalRot.LEFT;
}

turnAbsoluteRight(): void {
	this.rot = GlobalRot.RIGHT;
}

turnBack(): void {
	this.rot += 2;
}

turnRelativeLeft(): void {
	this.rot += 3;
}

turnRelativeRight(): void {
	this.rot += 1;
}

useTool(): void {
	if(!this.toolNeedsCharge || this.chargingPercent > 0) {
	host.playerUseTool(this, this.rot, this.chargingPercent);
}
if (this.toolNeedsCharge)
	this._GUI.updateCharge();
	}



	//============Display Implements============//
	// Color
	/** 获取（缓存的）十六进制线条颜色 */
	get lineColor(): uint;

	/** 获取（缓存的）十六进制填充颜色 */
	get fillColor(): uint;

	/** 用于在GUI上显示的文本：生命值+最大生命值+储备生命值+剩余生命数（若生命数有限） */
	get healthText(): string {
	let healthText: string = this._health + '/' + this._maxHealth;

	let healText: string = this._heal > 0 ? '<' + this._heal + '>' : '';

	let lifeText: string = this._infinityLife ? '' : '[' + this._lives + ']';

	return healthText + healText + lifeText;
}

}
