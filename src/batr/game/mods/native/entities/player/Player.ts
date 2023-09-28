import { int, uint } from "../../../../../legacy/AS3Legacy";
import { Matrix } from "../../../../../legacy/flash/geom";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Block from "../../../../api/block/Block";
import PlayerStats from "../../stat/PlayerStats";
import Entity from "../../../../api/entity/Entity";
import BonusBox from "../item/BonusBox";
import { iPoint } from "../../../../../common/geometricTools";
import { CommonIO_IR } from "../../../../api/io/CommonIO";
import IBatrGame from "../../../../main/IBatrGame";
import { DisplayLayers, IBatrGraphicContext, IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import PlayerAttributes from "./attributes/PlayerAttributes";
import EntityType from "../../../../api/entity/EntityType";
import { FIXED_TPS, TPS } from "../../../../main/GlobalGameVariables";
import Tool from "../../tool/Tool";
import IPlayerGUI from './IPlayerGUI';
import { mRot } from "../../../../general/GlobalRot";
import IPlayer from "./IPlayer";
import { halfBrightnessTo, turnBrightnessTo } from "../../../../../common/color";
import PlayerTeam from "./team/PlayerTeam";
import { playerLevelUpExperience } from "../../registry/NativeGameMechanics";
import { NativeControllerLabels } from "./controller/ControllerLabels";
import PlayerGUI from "../../../../../display/mods/native/entity/player/PlayerGUI";
import { NativeEntityTypes } from "../../registry/EntityRegistry";
import IGameRule from './../../../../api/rule/IGameRule';
import GameRule_V1 from "../../rule/GameRule_V1";

/**
 * 「玩家」的主类
 * * 具体特性参考「IPlayer」
 */
export default class Player extends Entity implements IPlayer {

	override get type(): EntityType { return NativeEntityTypes.PLAYER; }

	public static readonly DEFAULT_MAX_HEALTH: int = 100;
	public static readonly DEFAULT_HEALTH: int = Player.DEFAULT_MAX_HEALTH;
	public static readonly MAX_DAMAGE_DELAY: uint = 0.5 * FIXED_TPS;

	// **独有属性** //

	// 队伍 //

	/** 玩家的队伍 */
	protected _team: PlayerTeam;
	/** （玩家档案）队伍ID */
	public get teamID(): string { return this._team.id; }
	/** （玩家档案）队伍颜色 */
	public get teamColor(): uint { return this.team.color; }
	public get team(): PlayerTeam { return this._team; }
	public set team(value: PlayerTeam) {
		if (value == this._team)
			return;
		this._team = value;
		// TODO: 更新自身图形
		// this.initColors();
		// this._GUI.updateTeam();
		// host.updateProjectilesColor();
	}

	// 自定义名称 //

	/** 玩家的自定义名称（不受国际化影响） */
	protected _customName: string = 'noname';
	/** 玩家的自定义名称（不受国际化影响） */
	public get customName(): string { return this._customName; }
	public set customName(value: string) {
		if (value !== this._customName) {
			this._customName = value;
			// this._GUI.updateName(); // TODO: 显示更新
		}
	}

	// 工具 //

	/** 玩家所持有的工具 */
	protected _tool: Tool; // 默认可以是「空工具」
	/** 玩家所持有的工具 */
	public get tool(): Tool { return this._tool; }
	/** 更改工具时，触发钩子等 */
	/** Also Reset CD&Charge */
	public set tool(value: Tool) {
		if (value !== this._tool) {
			this._tool = value;
			// ? 可能的「显示更新」如「方块投掷器⇒持有的方块」}
		}
	}

	/**
	 * （根据工具信息）初始化冷却
	 * * 应用：显示更新
	 */
	protected initCD(): void {
		// TODO: 显示更新
		// this._GUI.updateCharge();
	}

	/** （内部使用）玩家工具的冷却 */
	protected get toolUsingCD(): uint { return this._tool.usingCD; }
	protected set toolUsingCD(value: uint) {
		if (value != this.toolUsingCD) {
			this._tool.usingCD = value;
			// TODO: 显示更新
			// this._GUI.updateCD();
		}
	}

	/**
	 * （根据工具信息）初始化充能状态
	 * * 应用：显示更新
	 */
	protected initCharge(): void {
		// TODO: 显示更新
		// this._GUI.updateCD();
	}
	/** （内部使用）玩家工具的充能状态 */
	protected get toolChargeTime(): int { return this._tool.chargeTime; }
	protected set toolChargeTime(value: int) {
		if (value == this.toolChargeTime) return;
		this._tool.chargeTime = value;
		// TODO: 显示更新
		// this._GUI.updateCharge();
	}

	/** 工具是否需要冷却 */
	public get toolNeedsCD(): boolean { return this._tool.needsCD }

	// !【2023-09-27 19:44:37】现在废除「根据游戏主体计算CD」这条规则，改为更软编码的「游戏根据规则在分派工具时决定」方式
	// !【2023-09-28 17:32:59】💭设置工具使用时间，这个不需要过早优化显示，但若以后的显示方式不是「充能条」，它就需要更新了
	/** 工具基础使用冷却 */
	public get toolBaseCD(): uint { return this._tool.baseCD; }
	/**
	 * !【2023-09-28 17:36:43】注意：设置值的时候，需要经过玩家这里设置，而不能直接设置工具
	 * *  这样是为了确保「工具更换之后，能及时更新显示」
	 */
	public set toolBaseCD(value: uint) {
		this._tool.usingCD = value;
		// TODO: 后续更新显示
	}

	/** 工具CD百分比 */
	public get toolCDPercent(): number {
		return (
			this.toolNeedsCD ?
				this.toolUsingCD / this.toolBaseCD :
				1
		);
	}

	/** 工具是否需要充能 */
	public get toolNeedsCharge(): boolean {
		return this._tool.needsCharge;
	}

	/** 工具是否在充能 */
	public get toolIsCharging(): boolean { return this._tool.isCharging; }

	/**
	 * 工具充能百分比
	 * * 无需充能⇒1
	 * * 未开始充能⇒0
	 * * 其它情况⇒充能时间/最大充能时间
	 */
	public get toolChargingPercent(): number { return this._tool.chargingPercent; }

	// 生命（有生命实体） //

	/** 玩家内部生命值 */
	protected _health: uint = Player.DEFAULT_HEALTH
	/** 玩家生命值 */
	public get health(): uint { return this._health; }
	// !【2023-09-28 18:26:07】因涉及「游戏主体」，现在不开放直接设置玩家生命值，用专门的「伤害」「治疗」方法替代
	/* public set health(value: uint) {
		if (value == this._health)
			return;

		this._health = Math.min(value, this._maxHealth);

		if (this._GUI != null)
			// this._GUI.updateHealth(); // TODO: 显示更新
	} */

	/** 玩家内部最大生命值 */
	protected _maxHealth: uint = Player.DEFAULT_MAX_HEALTH
	/** 玩家生命值 */ // * 设置时无需过游戏主体，故无需只读
	public get maxHealth(): uint { return this._maxHealth; }
	public set maxHealth(value: uint) {
		if (value == this._maxHealth)
			return;
		this._maxHealth = value;
		if (value < this._health)
			this._health = value;
		// this._GUI.updateHealth(); // TODO: 显示更新
	}

	/** 玩家的「治疗值」（储备生命值） */
	protected _heal: uint = 0;
	/** 玩家储备生命值 */ // * 设置时无需过游戏主体，故无需只读
	public get heal(): uint { return this._heal; }
	public set heal(value: uint) {
		if (value == this._heal)
			return;
		this._heal = value;
		// this._GUI.updateHealth(); // TODO: 显示更新
	}
	/** （衍生）是否满生命值 */
	public get isFullHealth(): boolean { return this._health >= this._maxHealth; }
	/** 玩家的「生命百分比」 */
	public get healthPercent(): number { return this.health / this.maxHealth; }

	/** 上一个伤害它的玩家（弃用） */
	// protected _lastHurtByPlayer: IPlayer | null = null;
	/** 伤害延时（用于陷阱等「持续伤害玩家」的伤害源） */
	protected _damageDelay: int = 0;
	/** 治疗延时（用于在「储备生命值」治疗玩家时延时） */
	protected _healDelay: uint = 0;

	/** 玩家的剩余生命数 */
	protected _lives: uint = 0;
	public get lives(): uint { return this._lives; }
	public set lives(value: uint) {
		if (value !== this._lives) {
			this._lives = value;
			// this._GUI.updateHealth(); // TODO: 显示更新
		}
	}

	/** 玩家剩余生命数是否会随「死亡」而减少 */
	protected _lifeNotDecay: boolean = false;
	public get lifeNotDecay(): boolean { return this._lifeNotDecay; }
	public set lifeNotDecay(value: boolean) {
		if (value !== this._lifeNotDecay) {
			this._lifeNotDecay = value;
			// this._GUI.updateHealth(); // TODO: 显示更新
		}
	}

	/** 玩家剩余生命数是否会随「死亡」而减少 */
	protected _respawnTick: int = -1;
	/** 玩家是否在重生 */
	public get isRespawning(): boolean { return this.respawnTick >= 0; }

	/** 
	 * （原`isCertainlyOut`）玩家是否「耗尽生命」
	 * * 机制：剩余生命值=0 && 剩余生命数=0
	 */
	public get isNoLives(): boolean {
		return (
			this.health == 0 &&
			this.lives == 0
		);
	}

	/**
	 * 重生刻
	 * * `-1`意味着「不在重生时」
	 */
	public respawnTick: int = -1;

	// 经验 //

	/** 玩家经验值 */
	protected _experience: uint = 0;
	/**
	 * 玩家经验值
	 *
	 * !【2023-09-28 18:05:47】因「升级⇒特效⇒需要联系主体」，现在不再通过「直接设置值」增加玩家经验了
	 */
	public get experience(): uint { return this._experience; }

	/**
	 * 设置经验值
	 * @param host 用于在后续「生成特效」时访问的「游戏主体」
	 */
	public setExperience(host: IBatrGame, value: uint): void {
		while (value > this.levelupExperience) {
			value -= this.levelupExperience;
			this.level++;
			this.onLevelup(host);
		}
		this._experience = value;
		//TODO: 显示更新
		// if (this._GUI != null) this._GUI.updateExperience();
	}

	/** 增加经验值 */
	public addExperience(host: IBatrGame, value: uint): void {
		this.setExperience(host, this.experience + value);
	}

	/** 玩家等级 */
	protected _level: uint = 0;
	/**
	 * 玩家等级
	 * * 【2023-09-28 18:10:26】目前还没有什么用，只是在「升级」时玩家会有属性提升
	 */
	public get level(): uint { return this._level; }
	public set level(value: uint) { this._level = value; }

	/** 升级所需经验 */
	public get levelupExperience(): uint { return playerLevelUpExperience(this._level); }

	/** 经验百分比：当前经验/升级所需经验 */
	public get experiencePercent(): number { return this._experience / this.levelupExperience; }

	// 属性（加成） //

	/** 玩家的所有属性 */
	protected _attributes: PlayerAttributes = new PlayerAttributes()
	/** 玩家的所有属性 */
	public get attributes(): PlayerAttributes { return this._attributes }

	// !【2023-09-28 18:13:17】现不再在「玩家」一侧绑定「控制器」链接，改由「游戏本体⇒控制器⇒玩家」的调用路线

	// 控制器 // TODO: 模仿AI玩家，实现其「操作缓冲区」「自动执行」等



	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 *
	 * 📌根据传入的「填充」「线条」初始化自身颜色
	 * * 填充颜色：渐变（1x亮度→3/4*亮度）
	 * * 线条颜色：0.5/亮度
	 *
	 * @param position 整数位置
	 * @param direction 方向
	 * @param team 队伍
	 * @param isActive （创建时是否已激活）
	 * @param fillColor 填充颜色（默认为队伍颜色）
	 * @param lineColor 线条颜色（默认从队伍颜色中产生）
	 */
	public constructor(
		position: iPoint, direction: mRot,
		isActive: boolean = true,
		team: PlayerTeam,
		tool: Tool,
		fillColor: number = team.color,
		lineColor: number = halfBrightnessTo(fillColor)
	) {
		super();
		this._isActive = isActive;

		// 独有属性 //
		this._team = team;
		this._tool = tool;

		// 有方向实体 & 格点实体 //
		this._position.copyFrom(position);
		this._direction = direction

		// 有统计实体 //
		this._stats = new PlayerStats(this);

		// 可显示实体 //
		new PlayerGUI(this)
		this._fillColor = fillColor;
		this._fillColor2 = turnBrightnessTo(fillColor, 0.75);
		this._lineColor = lineColor;
		// Set Shape
		// this.shapeInit(shape: IBatrShape);
		// Set GUI And Effects
		// this._GUI = new IPlayerGUI(this);
		// this.addChildren();

		// ! 控制器不在这里留有引用
	}

	// ! 一些置空的逻辑操作免了……虽然这会导致一堆「顽固引用」
	override destructor(): void {

		// Utils.removeChildIfContains(host.playerGUIContainer, this._GUI);

		// this._customName = null;
		this._tool.usingCD = 0;
		// this._team = null;

		this._stats.destructor();
		// this._stats = null;
		// this._tool = null;
		this._GUI.destructor();
		// this._GUI = null;

		super.destructor();
	}


	// TODO: 继续实现 //

	// 格点实体 //
	public readonly i_InGrid: true = true;

	protected _position: iPoint = new iPoint();
	public get position(): iPoint { return this._position }

	// 有朝向实体 //
	// 活跃实体 //
	public readonly i_active: true = true;

	public onTick(host: IBatrGame): void {
		this.dealUsingTime();
		// this.updateControl(); // TODO: 根据「输入缓冲区」响应输入
		this.dealMoveInTest(this.entityX, this.entityY, false, false);
		this.dealHeal();
	}

	// 有方向实体 //
	public readonly i_hasDirection: true = true;
	protected _direction: mRot;
	public get direction(): mRot { return this._direction; }
	public set direction(value: mRot) { this._direction = value; }

	// 有统计 //
	public readonly i_hasStats: true = true;

	protected _stats: PlayerStats;
	public get stats(): PlayerStats { return this._stats }

	// 可显示实体 // TODO: 【2023-09-28 18:22:42】这是不是要移出去。。。
	/** 显示时的像素大小 */
	public static readonly SIZE: number = 1 * DEFAULT_SIZE;
	/** 线条粗细 */
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 96;
	/** 所持有方块（若武器有🤔）的透明度 */
	public static readonly CARRIED_BLOCK_ALPHA: number = 1 / 4;

	/** 线条颜色 */
	protected _lineColor: uint = 0x888888;
	/** 填充颜色1 */
	protected _fillColor: uint = 0xffffff;
	/** 填充颜色2（用于渐变） */
	protected _fillColor2: uint = 0xcccccc;

	// TODO: remove the _GUI to remove the reliances
	protected _GUI: IPlayerGUI;

	public readonly i_displayable: true = true;
	public get gui(): IPlayerGUI { return this._GUI; }

	// Color
	public get lineColor(): uint {
		return this._lineColor;
	}

	public get fillColor(): uint {
		return this._fillColor;
	}

	/** 用于实现玩家的GUI显示 */ // TODO: 留给日后显示？实际上就是个「通知更新」的翻版？存疑。。。
	public get guiShape(): IPlayerGUI { return this._GUI };

	/** 堆叠覆盖层级：默认是「玩家」层级 */
	protected _zIndex: uint = DisplayLayers.PLAYER;
	public get zIndex(): uint { return this._zIndex }
	public set zIndex(value: uint) { this._zIndex = value }

	// TODO: 这个有些过于涉及显示实现了，到底要不要尾大不掉地放在这儿？本身跟逻辑毫无关系的代码，为什么还要有这样的冗余。。。
	public shapeInit(shape: IBatrShape): void {
		let realRadiusX: number = (Player.SIZE - Player.LINE_SIZE) / 2;
		let realRadiusY: number = (Player.SIZE - Player.LINE_SIZE) / 2;
		shape.graphics.clear();
		shape.graphics.lineStyle(Player.LINE_SIZE, this._lineColor);
		// shape.graphics.beginFill(this._fillColor,Alpha);
		// TODO: 渐变填充
		let m: Matrix = new Matrix();
		m.createGradientBox(
			DEFAULT_SIZE, DEFAULT_SIZE,
			0,
			-realRadiusX, -realRadiusX
		);
		shape.graphics.beginGradientFill(GradientType.LINEAR,
			[this._fillColor, this._fillColor2],
			[1.0, 1.0], // 透明度完全填充
			[63, 255], // 亮度渐变：1/4~1
			m,
			SpreadMethod.PAD,
			InterpolationMethod.RGB,
			1
		);
		shape.graphics.moveTo(-realRadiusX, -realRadiusY);
		shape.graphics.lineTo(realRadiusX, 0);
		shape.graphics.lineTo(-realRadiusX, realRadiusY);
		shape.graphics.lineTo(-realRadiusX, -realRadiusY);
		// shape.graphics.drawCircle(0,0,10);
		shape.graphics.endFill();
	}

	public static drawShapeDecoration(
		graphics: IBatrGraphicContext,
		decorationLabel: string = '',
		radius: number = Player.SIZE / 10
	): void {
		// TODO: 有待整理
		switch (decorationLabel) {
			case NativeControllerLabels.DUMMY:
				graphics.drawCircle(0, 0, radius);
				break;
			case NativeControllerLabels.NOVICE:
				graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
				break;
			case NativeControllerLabels.ADVENTURER:
				graphics.moveTo(-radius, -radius);
				graphics.lineTo(radius, 0);
				graphics.lineTo(-radius, radius);
				graphics.lineTo(-radius, -radius);
				break;
			case NativeControllerLabels.MASTER:
				graphics.moveTo(-radius, 0);
				graphics.lineTo(0, radius);
				graphics.lineTo(radius, 0);
				graphics.lineTo(0, -radius);
				graphics.lineTo(-radius, -0);
				break;
		}
	}

	/** TODO: 待实现的「更新」函数 */
	public shapeRefresh(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}

	/** TODO: 待实现的「析构」函数 */
	public shapeDestruct(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}

	//============Instance Getter And Setter============//

	// !【2023-09-27 23:36:42】删去「面前坐标」

	// Display for GUI
	public get healthText(): string {
		let healthText: string = this._health + '/' + this._maxHealth;
		let healText: string = this._heal > 0 ? '<' + this._heal + '>' : '';
		let lifeText: string = this.infinityLife ? '' : '[' + this._lives + ']';
		return healthText + healText + lifeText;
	}

	//============Instance Functions============//
	//====Functions About Rule====//

	/**
	 * This function init the variables without update when this Player has been created.
	 */
	public initVariablesByRule(rule: IGameRule): void {
		// Health&Life
		this._maxHealth = rule.getRule(GameRule_V1.key_defaultMaxHealth);

		this._health = rule.getRule(GameRule_V1.key_defaultHealth);

		// TODO: 下面的「判断是否AI」似乎要留给调用者
		// this.setLifeByInt(this instanceof AIPlayer ? rule.remainLivesAI : rule.remainLivesPlayer);

		// Tool
		if (toolID < - 1)
			this._tool = rule.randomToolEnable;
		else if (!Tool.isValidAvailableToolID(toolID) && uniformTool != null)
			this._tool = uniformTool;
		else
			this._tool = Tool.fromToolID(toolID);
	}

	//====Functions About Health====//
	public addHealth(value: uint, healer: IPlayer | null = null): void {
		this.health += value;
		this.onHeal(value, healer);
	}

	public removeHealth(value: uint, attacker: IPlayer | null = null): void {
		if (this.health > value) {
			this.health -= value;
			this.onHurt(value, attacker);
		}
		else {
			this.health = 0;
			this.onDeath(this.health, attacker);
		}
	}

	public setLifeByInt(lives: number): void {
		this._infinityLife = (lives < 0);
		if (this._lives >= 0)
			this._lives = lives;
	}

	//====Functions About Hook====//
	// TODO: 所有「钩子函数」直接向控制器发送信息，作为「外界环境」的一部分（这些不是接口的部分）
	protected onHeal(amount: uint, healer: IPlayer | null = null): void {
	}

	protected onHurt(damage: uint, attacker: IPlayer | null = null): void {
		// this._hurtOverlay.playAnimation();
		host.addPlayerHurtEffect(this);
		host.onPlayerHurt(attacker, this, damage);
	}

	protected onDeath(damage: uint, attacker: IPlayer | null = null): void {
		host.onPlayerDeath(attacker, this, damage);
		if (attacker != null)
			attacker.onKillPlayer(this, damage);
	}

	protected onKillPlayer(victim: IPlayer, damage: uint): void {
		if (victim != this && !this.isRespawning)
			this.experience++;
	}

	protected onRespawn(): void {
	}

	public onMapTransform(): void {
		this.resetCD();
		this.resetCharge(false);
	}

	public onPickupBonusBox(box: BonusBox): void {
	}

	override preLocationUpdate(oldX: number, oldY: number): void {
		host.prePlayerLocationChange(this, oldX, oldY);
		super.preLocationUpdate(oldX, oldY);
	}

	override onLocationUpdate(newX: number, newY: number): void {
		if (this._GUI != null) {
			this._GUI.logicalX = this.entityX;
			this._GUI.logicalY = this.entityY;
		}
		host.onPlayerLocationChange(this, newX, newY);
		super.onLocationUpdate(newX, newY);
	}

	public onLevelup(): void {
		host.onPlayerLevelup(this);
	}

	//====Functions About Gameplay====//
	public isEnemy(player: IPlayer): boolean {
		return (!this.isAlly(player, true));
	}

	public isSelf(player: IPlayer): boolean {
		return player === this;
	}

	public isAlly(player: IPlayer, includeSelf: boolean = false): boolean {
		return player != null && ((includeSelf || !this.isSelf(player)) &&
			this.team === player.team);
	}

	public get carriedBlock(): Block {
		return this._carriedBlock;
	}

	public get isCarriedBlock(): boolean {
		return this._carriedBlock != null && this._carriedBlock.visible;
	}

	public onPositedBlockUpdate(x: number, y: number, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
		this.dealMoveInTest(x, y, ignoreDelay, isLocationChange);
	}

	public dealMoveInTest(x: number, y: number, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
		if (ignoreDelay) {
			host.moveInTestPlayer(this, isLocationChange);
			this._damageDelay = Player.MAX_DAMAGE_DELAY;
		}
		else if (this._damageDelay > 0) {
			this._damageDelay--;
		}
		else if (this._damageDelay == 0 && host.moveInTestPlayer(this, isLocationChange)) {
			this._damageDelay = Player.MAX_DAMAGE_DELAY;
		}
		else if (this._damageDelay > -1) {
			this._damageDelay = -1;
		}
	}

	public dealHeal(): void {
		if (this._heal < 1)
			return;
		if (this._healDelay > TPS * (0.1 + this.healthPercent * 0.15)) {
			if (this.isFullHealth)
				return;
			this._healDelay = 0;
			this._heal--;
			this.health++;
		}
		else {
			this._healDelay++;
		}
	}

	//====Functions About Respawn====//
	public dealRespawn(host: IBatrGame): void {
		if (this.respawnTick > 0)
			this.respawnTick--;

		else {
			this.respawnTick = -1;
			if (!this._infinityLife && this._lives > 0)
				this._lives--;
			host.onPlayerRespawn(this);
			this.onRespawn();
		}
	}

	//====Functions About Tool====//
	protected onToolChange(oldT: Tool, newT: Tool): void {
		// TODO: 不再使用（待迁移）
	}

	protected dealUsingTime(): void {
		// console.log(this._tool.name,this.toolChargeTime,this._tool.chargeTime)
		if (this.toolUsingCD > 0) {
			this.toolUsingCD--;
			// this._GUI.updateCD(); // TODO: 显示更新
		}
		else {
			if (!this.toolNeedsCD) {
				if (this.isPress_Use)
					this.directUseTool();
			}
			else if (this.toolChargeTime < 0) {
				this.initToolCharge();
			}
			else {
				if (this.dealToolReverseCharge) {
					this.dealToolReverseCharge();
				}
				else if (this.isPress_Use) {
					this.dealToolCharge();
				}
			}
		}
	}

	protected dealToolCharge(): void {
		if (this.toolChargeTime >= this._tool.chargeTime) {
			this.directUseTool();
			this.resetCharge(false, false);
		}
		else
			this.toolChargeTime++;
		// this._GUI.updateCharge(); // TODO: 显示更新
	}

	protected dealToolReverseCharge(): void {
		if (this.toolChargeTime < this.toolChargeMaxTime) {
			this.toolChargeTime++;
		}
		if (this.isPress_Use) {
			this.directUseTool();
			this.resetCharge(false, false);
		}
		// this._GUI.updateCharge(); // TODO: 显示更新
	}

	protected onDisableCharge(): void {
		if (!this.toolNeedsCD || this.toolUsingCD > 0 || !this.isActive || this.isRespawning)
			return;
		this.directUseTool();
		this.resetCharge();
	}

	public initToolCharge(): void {
		this.toolChargeTime = 0;
		this._tool.chargeTime = this._tool.defaultChargeTime;
	}

	public resetCharge(includeMaxTime: boolean = true, updateGUI: boolean = true): void {
		this.toolChargeTime = -1;
		if (includeMaxTime)
			this._tool.chargeTime = 0;
		if (updateGUI)
	// this._GUI.updateCharge(); // TODO: 显示更新
}

	public resetCD(): void {
		this._tool.usingCD = 0;
		// this._GUI.updateCD(); // TODO: 显示更新
	}

	//====Functions About Graphics====//

	// TODO: 日后呈现时可能会用到这段代码
	/* public setCarriedBlock(block: Block, copyBlock: boolean = true): void {
		if (block == null) {
			this._carriedBlock.visible = false;
		}
		else {
			if (this._carriedBlock != null && this.contains(this._carriedBlock))
				this.removeChild(this._carriedBlock);
			this._carriedBlock = copyBlock ? block.clone() : block;
			this._carriedBlock.x = DEFAULT_SIZE / 2;
			this._carriedBlock.y = -DEFAULT_SIZE / 2;
			this._carriedBlock.alpha = Player.CARRIED_BLOCK_ALPHA;
			this.addChild(this._carriedBlock);
		}
	} */

	/* protected addChildren(): void {
		host.playerGUIContainer.addChild(this._GUI);
	} */

	//====Control Functions====//

	// !【2023-09-23 16:53:17】把涉及「玩家基本操作」的部分留下（作为接口），把涉及「具体按键」的部分外迁
	// !【2023-09-27 20:16:04】现在移除这部分的所有代码到`KeyboardController`中
	// TODO: 【2023-09-27 22:34:09】目前这些「立即执行操作」还需要以「PlayerIO」的形式重构成「读取IO⇒根据读取时传入的『游戏主体』行动」

	public moveForward(): void {
		host.movePlayer(this, this.direction, 1);
	}

	public moveToward(direction: mRot): void {
		// host.movePlayer(this, direction, this.moveDistance);
		this.direction = direction; // 使用setter以便显示更新
		this.moveForward();
	}

	public turnTo(host: IBatrGame, direction: number): void {
		this._direction = direction
	}

	public turnUp(): void {
		this.rot = GlobalRot.UP;
	}

	public turnDown(): void {
		this.rot = GlobalRot.DOWN;
	}

	public turnAbsoluteLeft(): void {
		this.rot = GlobalRot.LEFT;
	}

	public turnAbsoluteRight(): void {
		this.rot = GlobalRot.RIGHT;
	}

	public turnBack(): void {
		this.rot += 2;
	}

	public turnRelativeLeft(): void {
		this.rot += 3;
	}

	public turnRelativeRight(): void {
		this.rot += 1;
	}

	public directUseTool(host: IBatrGame): void {
		// ! 一般来说，「直接使用工具」都是在「无冷却」的时候使用的
		this._tool.onUseByPlayer(host, this);
		host.playerUseTool(this, this.rot, this.toolChargingPercent);
		// // 工具使用后⇒通知GUI更新
		// if (this.toolNeedsCharge) // TODO: 待显示模块完善
		// 	this._GUI.updateCharge();
	}
}
