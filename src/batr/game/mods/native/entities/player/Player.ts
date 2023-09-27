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
import { isAIControl, playerLevelUpExperience } from "../../registry/NativeGameMechanics";
import { NativeControllerLabels } from "./controller/ControllerLabels";

export default class Player extends Entity implements IPlayer {

	// TODO: 顶个档，凑个数（日后要作为格点实体做接口的）
	//============Static Variables============//
	public static readonly SIZE: number = 1 * DEFAULT_SIZE;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 96;
	public static readonly CARRIED_BLOCK_ALPHA: number = 1 / 4;

	public static readonly DEFAULT_MAX_HEALTH: int = 100;
	public static readonly DEFAULT_HEALTH: int = Player.DEFAULT_MAX_HEALTH;
	public static readonly MAX_DAMAGE_DELAY: uint = 0.5 * FIXED_TPS;

	//============Instance Variables============//
	protected _team: PlayerTeam;

	protected _customName: string = 'noname';

	protected _tool: Tool; // TODO: 思考此类「不想在构造函数中赋值，但又想在引用时绝对非空」的统一解决方案

	// protected _droneTool: Tool = GameRule_V1.DEFAULT_DRONE_TOOL; // !【2023-09-27 22:49:24】弃用：现在直接用原工具映射。。。

	//====Graphics Variables====//
	protected _lineColor: uint = 0x888888;
	protected _fillColor: uint = 0xffffff;
	protected _fillColor2: uint = 0xcccccc;

	// TODO: remove the _GUI to remove the reliances
	protected _GUI: IPlayerGUI;

	protected _carriedBlock: Block;

	// TODO: 使用「控制器」抽象并集中管理「控制」模块
	// ! 现在在「玩家」一侧绑定「控制器」链接了，改由「游戏本体⇒控制器⇒玩家」的调用路线
	// protected _controller: IPlayerController

	//========Custom Variables========//
	// Health
	protected _health: uint = Player.DEFAULT_HEALTH;

	protected _maxHealth: uint = Player.DEFAULT_MAX_HEALTH;

	protected _heal: uint = 0;

	protected _lives: uint = 10;

	protected _infinityLife: boolean = true;

	// Tool
	protected _toolUsingCD: uint = 0;

	protected _toolChargeTime: int = -1;

	protected _toolChargeMaxTime: uint = 0;

	// Respawn
	public respawnTick: int = -1;

	// negative number means isn't respawning

	// Gameplay
	protected _lastHurtByPlayer: IPlayer | null = null;

	protected _damageDelay: int = 0;

	protected _healDelay: uint = 0;

	//========Attributes========//
	// public moveDistance: uint = 1; // ? 这俩还从没用过……
	// public invulnerable: boolean = false; // ? 这俩还从没用过……

	//====Experience====//
	protected _experience: uint = 0;

	public get experience(): uint {
		return this._experience;
	}

	public set experience(value: uint) {
		while (value > this.levelupExperience) {
			value -= this.levelupExperience;
			this.level++;
			this.onLevelup();
		}
		this._experience = value;
		if (this._GUI != null)
			this._GUI.updateExperience();
	}

	/** If the experience up to levelupExperience,level++ */
	protected _level: uint = 0;

	public get level(): uint {
		return this._level;
	}

	public set level(value: uint) {
		this._level = value;
	}

	public get levelupExperience(): uint {
		return playerLevelUpExperience(this._level);
	}

	public get experiencePercent(): number {
		return this._experience / this.levelupExperience;
	}

	//====Attributes====//
	/** 现在直接内置一个「玩家属性」对象 */
	protected _attributes: PlayerAttributes = new PlayerAttributes()
	public get attributes(): PlayerAttributes { return this._attributes }

	// ! 现在弃用这种「直接获取属性」的办法
	/* public get buffDamage(): uint { return this._attributes.buffDamage }
	public set buffDamage(value: uint) { this._attributes.buffDamage = value }

	public get buffCD(): uint { return this._attributes.buffCD }
	public set buffCD(value: uint) { this._attributes.buffCD = value }

	public get buffResistance(): uint { return this._attributes.buffResistance }
	public set buffResistance(value: uint) { this._attributes.buffResistance = value }

	public get buffRadius(): uint { return this._attributes.buffRadius }
	public set buffRadius(value: uint) { this._attributes.buffRadius = value } */

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

		this._position.copyFrom(position);
		this._direction = direction

		this._team = team;
		this._tool = tool;
		// Set Stats
		this._stats = new PlayerStats(this);
		// Set Color
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
		this._toolUsingCD = 0;
		// this._team = null;

		this._stats.destructor();
		// this._stats = null;
		this._lastHurtByPlayer = null;
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
		this.updateControl(); // TODO: 根据「输入缓冲区」响应输入
		this.dealMoveInTest(this.entityX, this.entityY, false, false);
		this.dealHeal();
	}

	// 有方向实体 //
	public readonly i_hasDirection: true = true;
	protected _direction: mRot;
	public get direction(): number {
		throw new Error("Method not implemented.");
	}
	public set direction(value: number) {
		throw new Error("Method not implemented.");
	}

	// 有统计 //
	public readonly i_hasStats: true = true;

	protected _stats: PlayerStats;
	public get stats(): PlayerStats { return this._stats }

	// 玩家档案 //
	public get teamID(): string {
		throw new Error("Method not implemented.");
	}

	// 有输入输出 //
	public readonly i_needsIO: true = true;

	onIO(host: IBatrGame, inf: CommonIO_IR): void {
		throw new Error("Method not implemented.");
	}

	public get IOBuffer(): CommonIO_IR[] {
		throw new Error("Method not implemented.");
	}
	public clearIOBuffer(): void {
		throw new Error("Method not implemented.");
	}


	//============Display Implements============//
	public readonly i_displayable: true = true;

	// Color
	public get lineColor(): uint {
		return this._lineColor;
	}

	public get fillColor(): uint {
		return this._fillColor;
	}

	/** 用于实现玩家的GUI显示 */ // TODO: 留给日后显示？实际上就是个「通知更新」的翻版？存疑。。。
	public get guiShape(): IPlayerGUI { return this._GUI };

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

	/** 堆叠覆盖层级：默认是「玩家」层级 */
	protected _zIndex: uint = DisplayLayers.PLAYER;
	public get zIndex(): uint { return this._zIndex }
	public set zIndex(value: uint) { this._zIndex = value }

	//============Instance Getter And Setter============//
	public get gui(): IPlayerGUI {
		return this._GUI;
	}

	// !【2023-09-27 23:36:42】删去「面前坐标」

	public get team(): PlayerTeam {
		return this._team;
	}

	public set team(value: PlayerTeam) {
		if (value == this._team)
			return;
		this._team = value;
		// TODO: 更新自身图形
		// this.initColors();
		// this._GUI.updateTeam();
		// host.updateProjectilesColor();
	}

	public get teamColor(): uint {
		return this.team.color;
	}

	public get stats(): PlayerStats {
		return this._stats;
	}

	public get tool(): Tool {
		return this._tool;
	}

	/** This tool instanceof used by drones created from another tool */
	public get droneTool(): Tool {
		return this.droneTool;
	}

	public set droneTool(value: Tool) {
		this.droneTool = value;
	}

	/** Also Reset CD&Charge */
	public set tool(value: Tool) {
		if (value == this._tool)
			return;
		this._tool = value;
		// ? 可能的「显示更新」如「方块投掷器⇒持有的方块」
	}

	public get toolUsingCD(): uint {
		return this._toolUsingCD;
	}

	public set toolUsingCD(value: uint) {
		if (value == this._toolUsingCD)
			return;

		this._toolUsingCD = value;

		this._GUI.updateCD();
	}

	public get toolChargeTime(): int {
		return this._toolChargeTime;
	}

	public set toolChargeTime(value: int) {
		if (value == this._toolChargeTime)
			return;

		this._toolChargeTime = value;

		this._GUI.updateCharge();
	}

	public get toolChargeMaxTime(): uint {
		return this._toolChargeMaxTime;
	}

	public set toolChargeMaxTime(value: uint) {
		if (value == this._toolChargeMaxTime)
			return;

		this._toolChargeMaxTime = value;

		this._GUI.updateCharge();
	}

	public get toolNeedsCD(): boolean {
		if (this._tool == null)
			return false;

		return this.toolBaseCD > 0;
	}

	// !【2023-09-27 19:44:37】现在废除「根据游戏主体计算CD」这条规则，改为更软编码的「游戏根据规则在分派武器时决定」方式
	// !【2023-09-27 23:11:40】现在废除「获取获取工具信息」的相关函数，其后所有调用的代码必须重定向到其对应的工具中——《黑客与画家》不必过早优化
	// public get toolBaseCD(): number {
	// 	return this._tool.baseCD;
	// }

	// public get toolReverseCharge(): boolean {
	// 	return this._tool.reverseCharge;
	// }

	// public get toolCDPercent(): number {
	// 	if (!this.toolNeedsCD)
	// 		return 1;

	// 	return this._toolUsingCD / this.toolBaseCD;
	// }

	// public get toolNeedsCharge(): boolean {
	// 	if (this._tool == null)
	// 		return false;

	// 	return this._tool.defaultChargeTime > 0;
	// }

	// public get isCharging(): boolean {
	// 	return this.toolNeedsCharge && this._toolChargeTime >= 0;
	// }

	// public get chargingPercent(): number { // 0~1
	// 	if (!this.toolNeedsCharge)
	// 		return 1;

	// 	if (!this.isCharging)
	// 		return 0;

	// 	return this._toolChargeTime / this._toolChargeMaxTime;
	// }

	// Health,MaxHealth,Life&Respawn
	public get health(): uint {
		return this._health;
	}

	public set health(value: uint) {
		if (value == this._health)
			return;

		this._health = Math.min(value, this._maxHealth);

		if (this._GUI != null)
			this._GUI.updateHealth();
	}

	public get maxHealth(): uint {
		return this._maxHealth;
	}

	public set maxHealth(value: uint) {
		if (value == this._maxHealth)
			return;

		this._maxHealth = value;

		if (value < this._health)
			this._health = value;

		this._GUI.updateHealth();
	}

	public get isFullHealth(): boolean {
		return this._health >= this._maxHealth;
	}

	public get heal(): uint {
		return this._heal;
	}

	public set heal(value: uint) {
		if (value == this._heal)
			return;

		this._heal = value;

		this._GUI.updateHealth();
	}

	public get lives(): uint {
		return this._lives;
	}

	public set lives(value: uint) {
		if (value == this._lives)
			return;

		this._lives = value;

		this._GUI.updateHealth();
	}

	public get infinityLife(): boolean {
		return this._infinityLife;
	}

	public set infinityLife(value: boolean) {
		if (value == this._infinityLife)
			return;

		this._infinityLife = value;

		this._GUI.updateHealth();
	}

	public get isRespawning(): boolean {
		return this.respawnTick >= 0;
	}

	public get healthPercent(): number {
		return this.health / this.maxHealth;
	}

	public get isCertainlyOut(): boolean {
		return this.lives == 0 && this.health == 0 && !this.isActive;
	}

	// Display for GUI
	public get healthText(): string {
		let healthText: string = this._health + '/' + this._maxHealth;

		let healText: string = this._heal > 0 ? '<' + this._heal + '>' : '';

		let lifeText: string = this._infinityLife ? '' : '[' + this._lives + ']';

		return healthText + healText + lifeText;
	}

	public get customName(): string {
		return this._customName;
	}

	public set customName(value: string) {
		if (value == this._customName)
			return;

		this._customName = value;

		this._GUI.updateName();
	}

	// Other
	public get lastHurtByPlayer(): IPlayer {
		return this._lastHurtByPlayer;
	}

	// Entity Type
	override get type(): EntityType {
		return EntityType.PLAYER;
	}

	//============Instance Functions============//
	//====Functions About Rule====//

	/**
	 * This function init the variables without update when this Player has been created.
	 * @param	toolID	invalid number means random.
	 * @param	uniformTool	The uniform tool
	 */
	public initVariablesByRule(toolID: int, uniformTool: Tool = null): void {
		// Health&Life
		this._maxHealth = host.rule.defaultMaxHealth;

		this._health = host.rule.defaultHealth;

		// TODO: 下面的「判断是否AI」似乎要留给调用者
		// this.setLifeByInt(this instanceof AIPlayer ? host.rule.remainLivesAI : host.rule.remainLivesPlayer);

		// Tool
		if (toolID < - 1)
			this._tool = host.rule.randomToolEnable;
		else if (!Tool.isValidAvailableToolID(toolID) && uniformTool != null)
			this._tool = uniformTool;
		else
			this._tool = Tool.fromToolID(toolID);
	}

	//====Functions About Health====//
	public addHealth(value: uint, healer: IPlayer = null): void {
		this.health += value;

		this.onHeal(value, healer);
	}

	public removeHealth(value: uint, attacker: IPlayer = null): void {
		if (this.invulnerable)
			return;
		this._lastHurtByPlayer = attacker;
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
	protected onHeal(amount: uint, healer: IPlayer = null): void {
	}

	protected onHurt(damage: uint, attacker: IPlayer = null): void {
		// this._hurtOverlay.playAnimation();
		host.addPlayerHurtEffect(this);
		host.onPlayerHurt(attacker, this, damage);
	}

	protected onDeath(damage: uint, attacker: IPlayer = null): void {
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
		// console.log(this.tool.name,this._toolChargeTime,this._toolChargeMaxTime)
		if (this._toolUsingCD > 0) {
			this._toolUsingCD--;
			this._GUI.updateCD();
		}
		else {
			if (!this.toolNeedsCD) {
				if (this.isPress_Use)
					this.directUseTool();
			}
			else if (this._toolChargeTime < 0) {
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
		if (this._toolChargeTime >= this._toolChargeMaxTime) {
			this.directUseTool();
			this.resetCharge(false, false);
		}
		else
			this._toolChargeTime++;
		this._GUI.updateCharge();
	}

	protected dealToolReverseCharge(): void {
		if (this.toolChargeTime < this.toolChargeMaxTime) {
			this._toolChargeTime++;
		}
		if (this.isPress_Use) {
			this.directUseTool();
			this.resetCharge(false, false);
		}
		this._GUI.updateCharge();
	}

	protected onDisableCharge(): void {
		if (!this.toolNeedsCD || this._toolUsingCD > 0 || !this.isActive || this.isRespawning)
			return;
		this.directUseTool();
		this.resetCharge();
	}

	public initToolCharge(): void {
		this._toolChargeTime = 0;
		this._toolChargeMaxTime = this._tool.defaultChargeTime;
	}

	public resetCharge(includeMaxTime: boolean = true, updateGUI: boolean = true): void {
		this._toolChargeTime = -1;
		if (includeMaxTime)
			this._toolChargeMaxTime = 0;
		if (updateGUI)
			this._GUI.updateCharge();
	}

	public resetCD(): void {
		this._toolUsingCD = 0;
		this._GUI.updateCD();
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
		this.tool.onUseByPlayer(host, this);
		host.playerUseTool(this, this.rot, this.chargingPercent);
		// // 工具使用后⇒通知GUI更新
		// if (this.toolNeedsCharge) // TODO: 待显示模块完善
		// 	this._GUI.updateCharge();
	}
}
