import { int, uint } from "../../../../../legacy/AS3Legacy";
import { Matrix } from "../../../../../legacy/flash/geom";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Block from "../../../../api/block/Block";
import GameRule_V1 from "../../rule/GameRule_V1";
import PlayerStats from "../../stat/PlayerStats";
import Entity from "../../../../api/entity/Entity";
import BonusBox from "../item/BonusBox";
import AIPlayer from "./AIPlayer";
import PlayerController from "./controller/PlayerController";
import PlayerGUI from "../../../../../display/mods/native/entity/player/PlayerGUI";
import IPlayerProfile from "./profile/IPlayerProfile";
import PlayerTeam from "./team/PlayerTeam";
import { iPoint } from "../../../../../common/geometricTools";
import { IEntityActive, IEntityDisplayable, IEntityHasStats, IEntityInGrid, IEntityNeedsIO, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import { CommonIO_IR } from "../../../../api/io/CommonIO";
import IBatrGame from "../../../../main/IBatrGame";
import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";

export default class Player extends Entity implements IPlayerProfile, IEntityInGrid, IEntityNeedsIO, IEntityActive, IEntityDisplayable, IEntityWithDirection, IEntityHasStats {

	// TODO: 顶个档，凑个数（日后要作为格点实体做接口的）
	public position: iPoint = new iPoint()
	//============Static Variables============//
	public static readonly SIZE: number = 1 * DEFAULT_SIZE;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 96;
	public static readonly CARRIED_BLOCK_ALPHA: number = 1 / 4;

	public static readonly DEFAULT_MAX_HEALTH: int = 100;
	public static readonly DEFAULT_HEALTH: int = Player.DEFAULT_MAX_HEALTH;
	public static readonly MAX_DAMAGE_DELAY: uint = 0.5 * FIXED_TPS;
	public static isAI(player: Player): boolean {
		return player instanceof AIPlayer;
	}

	public static getLevelUpExperience(level: uint): uint {
		return (level + 1) * 5 + (level >> 1);
	}


	//============Instance Variables============//
	protected _team: PlayerTeam;

	protected _customName: string;

	protected _tool: Tool;

	protected _droneTool: Tool = GameRule_V1.DEFAULT_DRONE_TOOL;

	//====Graphics Variables====//
	protected _lineColor: uint = 0x888888;
	protected _fillColor: uint = 0xffffff;
	protected _fillColor2: uint = 0xcccccc;

	// TODO: remove the _GUI to remove the reliances
	protected _GUI: PlayerGUI;

	protected _carriedBlock: Block;

	// TODO: uses the controller, not set the control keys!
	protected _controller: PlayerController

	//====Control Variables====//
	// ControlDelay
	public controlDelay_Move: uint = FIXED_TPS * 0.5;

	// public controlDelay_Use:uint=TPS/4
	// public controlDelay_Select:uint=TPS/5

	// ControlLoop
	public controlLoop_Move: uint = FIXED_TPS * 0.05;

	// public controlLoop_Use:uint=TPS/25
	// public controlLoop_Select:uint=TPS/40

	// ControlKey
	public controlKey_Up: uint;
	public controlKey_Down: uint;
	public controlKey_Left: uint;
	public controlKey_Right: uint;
	public controlKey_Use: uint;
	// public ControlKey_Select_Left:uint;
	// public ControlKey_Select_Right:uint;

	// isPress
	public isPress_Up: boolean;
	public isPress_Down: boolean;
	public isPress_Left: boolean;
	public isPress_Right: boolean;
	public isPress_Use: boolean;
	// public isPress_Select_Left:Boolean;
	// public isPress_Select_Right:Boolean;

	// KeyDelay
	public keyDelay_Move: int;
	// public keyDelay_Use:int;
	// public keyDelay_Select:int;

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
	protected _lastHurtByPlayer: Player = null;

	protected _stats: PlayerStats;

	protected _damageDelay: int = 0;

	protected _healDelay: uint = 0;

	//========Attributes========//
	public moveDistance: uint = 1;

	public invulnerable: boolean = false;

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
		return Player.getLevelUpExperience(this._level);
	}

	public get experiencePercent(): number {
		return this._experience / this.levelupExperience;
	}

	//====Buff====//

	/**
	 * The EXTRA power of Damage
	 * #TotalDamage=ToolDamage+buff*ToolCoefficient
	 */
	protected _buffDamage: uint = 0;

	public get buffDamage(): uint {
		return this._buffDamage;
	}

	public set buffDamage(value: uint) {
		this._buffDamage = value;
	}

	/**
	 * The EXTRA power of Tool Usage CD
	 * #TotalCD=ToolCD/(1+buff/10)
	 */
	protected _buffCD: uint = 0;

	public get buffCD(): uint {
		return this._buffCD;
	}

	public set buffCD(value: uint) {
		this._buffCD = value;
	}

	/**
	 * The EXTRA power of Resistance
	 * #FinalDamage=TotalDamage-buff*ToolCoefficient>0
	 */
	protected _buffResistance: uint = 0;

	public get buffResistance(): uint {
		return this._buffResistance;
	}

	public set buffResistance(value: uint) {
		this._buffResistance = value;
	}

	/**
	 * The EXTRA power of Radius
	 * #FinalRadius=DefaultRadius*(1+buff/10)
	 */
	protected _buffRadius: uint = 0;

	public get buffRadius(): uint {
		return this._buffRadius;
	}

	public set buffRadius(value: uint) {
		this._buffRadius = value;
	}

	//============Constructor & Destructor============//
	public constructor(
		host: IBatrGame,
		x: number,
		y: number,
		team: PlayerTeam,
		controlKeyId: uint,
		isActive: boolean = true,
		fillColor: number = NaN,
		lineColor: number = NaN): void {
		super(this.position, isActive);
		// Set Team
		this._team = team;
		// Set Stats
		this._stats = new PlayerStats(this);
		// Set Shape
		this.initColors(fillColor, lineColor);
		this.shapeInit(shape: IBatrShape);
		// Set GUI And Effects
		this._GUI = new PlayerGUI(this);

		this.addChildren();

		// Set Control Key
		this.initControlKey(controlKeyId);
		this.updateKeyDelay();
	}

	// TODO: 继续实现 //
	i_InGrid: true;
	i_needsIO: true;
	onIO(host: IBatrGame, inf: CommonIO_IR): void {
		throw new Error("Method not implemented.");
	}
	i_active: true;
	onTick(host: IBatrGame): void {
		throw new Error("Method not implemented.");
	}
	i_displayable: true;
	shapeInit(shape: IBatrShape, ...params: any[]): void {
		throw new Error("Method not implemented.");
	}
	shapeRefresh(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	shapeDestruct(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	get zIndex(): number {
		throw new Error("Method not implemented.");
	}
	set zIndex(value: number) {
		throw new Error("Method not implemented.");
	}
	i_hasDirection: true;
	get direction(): number {
		throw new Error("Method not implemented.");
	}
	set direction(value: number) {
		throw new Error("Method not implemented.");
	}
	i_hasStats: true;

	//============Destructor Function============//
	override destructor(): void {
		// Reset Key
		this.turnAllKeyUp();
		this.clearControlKeys();
		// Remove Display Object
		Utils.removeChildIfContains(host.playerGUIContainer, this._GUI);
		// Remove Variables
		// Primitive
		this._customName = null;
		this._toolUsingCD = 0;
		this._team = null;
		// Complex
		this._stats.destructor();
		this._stats = null;
		this._lastHurtByPlayer = null;
		this._tool = null;
		this._GUI.destructor();
		this._GUI = null;
		// Call Super Class
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public get gui(): PlayerGUI {
		return this._GUI;
	}

	/**
	 * Cannot using INT to return!
	 * Because it's on the center of block!
	 */
	public get frontX(): number {
		return this.getFrontIntX(this.moveDistance);
	}

	/**
	 * Cannot using INT to return!
	 * Because it's on the center of block!
	 */
	public get frontY(): number {
		return this.getFrontIntY(this.moveDistance);
	}

	public get team(): PlayerTeam {
		return this._team;
	}

	public set team(value: PlayerTeam) {
		if (value == this._team)
			return;
		this._team = value;
		this.initColors();
		this.shapeInit(shape: IBatrShape);
		this._GUI.updateTeam();
		host.updateProjectilesColor();
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
		return this._droneTool;
	}

	public set droneTool(value: Tool) {
		this._droneTool = value;
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

		return this.toolMaxCD > 0;
	}

	public get toolMaxCD(): number {
		return host.rule.toolsNoCD ? TOOL_MIN_CD : this._tool.getBuffedCD(this.buffCD);
	}

	public get toolReverseCharge(): boolean {
		return this._tool.reverseCharge;
	}

	public get toolCDPercent(): number {
		if (!this.toolNeedsCD)
			return 1;

		return this._toolUsingCD / this.toolMaxCD;
	}

	public get toolNeedsCharge(): boolean {
		if (this._tool == null)
			return false;

		return this._tool.defaultChargeTime > 0;
	}

	public get isCharging(): boolean {
		if (!this.toolNeedsCharge)
			return false;

		return this._toolChargeTime >= 0;
	}

	public get chargingPercent(): number { // 0~1
		if (!this.toolNeedsCharge)
			return 1;

		if (!this.isCharging)
			return 0;

		return this._toolChargeTime / this._toolChargeMaxTime;
	}

	// Color
	public get lineColor(): uint {
		return this._lineColor;
	}

	public get fillColor(): uint {
		return this._fillColor;
	}

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
	public get lastHurtByPlayer(): Player {
		return this._lastHurtByPlayer;
	}

	// Key&Control
	public get someKeyDown(): boolean {
		return (this.isPress_Up ||
			this.isPress_Down ||
			this.isPress_Left ||
			this.isPress_Right ||
			this.isPress_Use /*||
					this.isPress_Select_Left||
					this.isPress_Select_Right*/);
	}

	public get someMoveKeyDown(): boolean {
		return (this.isPress_Up ||
			this.isPress_Down ||
			this.isPress_Left ||
			this.isPress_Right);
	}
	/*
	public get someSelectKeyDown():Boolean {
		return (this.isPress_Select_Left||this.isPress_Select_Right)
	}*/

	public set pressLeft(turn: boolean) {
		this.isPress_Left = turn;
	}

	public set pressRight(turn: boolean) {
		this.isPress_Right = turn;
	}

	public set pressUp(turn: boolean) {
		this.isPress_Up = turn;
	}

	public set pressDown(turn: boolean) {
		this.isPress_Down = turn;
	}

	public set pressUse(turn: boolean) {
		if (this.isPress_Use && !turn) {
			this.isPress_Use = turn;

			if (this.isCharging)
				this.onDisableCharge();

			return;
		}
		this.isPress_Use = turn;
	}

	/*public set pressLeftSelect(turn:Boolean) {
		this.isPress_Select_Left=turn
	}
	
	public set pressRightSelect(turn:Boolean) {
		this.isPress_Select_Right=turn
	}*/

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

		this.setLifeByInt(this instanceof AIPlayer ? host.rule.remainLivesAI : host.rule.remainLivesPlayer);

		// Tool
		if (toolID < -1)
			this._tool = host.rule.randomToolEnable;
		else if (!Tool.isValidAvailableToolID(toolID) && uniformTool != null)
			this._tool = uniformTool;
		else
			this._tool = Tool.fromToolID(toolID);
	}

	//====Functions About Health====//
	public addHealth(value: uint, healer: Player = null): void {
		this.health += value;

		this.onHeal(value, healer);
	}

	public removeHealth(value: uint, attacker: Player = null): void {
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
	protected onHeal(amount: uint, healer: Player = null): void {
	}

	protected onHurt(damage: uint, attacker: Player = null): void {
		// this._hurtOverlay.playAnimation();
		host.addPlayerHurtEffect(this);
		host.onPlayerHurt(attacker, this, damage);
	}

	protected onDeath(damage: uint, attacker: Player = null): void {
		host.onPlayerDeath(attacker, this, damage);
		if (attacker != null)
			attacker.onKillPlayer(this, damage);
	}

	protected onKillPlayer(victim: Player, damage: uint): void {
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
			this._GUI.entityX = this.entityX;
			this._GUI.entityY = this.entityY;
		}
		host.onPlayerLocationChange(this, newX, newY);
		super.onLocationUpdate(newX, newY);
	}

	public onLevelup(): void {
		host.onPlayerLevelup(this);
	}

	//====Functions About Gameplay====//
	public isEnemy(player: Player): boolean {
		return (!this.isAlly(player, true));
	}

	public isSelf(player: Player): boolean {
		return player === this;
	}

	public isAlly(player: Player, includeSelf: boolean = false): boolean {
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

	protected dealUsingCD(): void {
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

	protected dealToolCharge(): void {
		if (this._toolChargeTime >= this._toolChargeMaxTime) {
			this.useTool();
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
			this.useTool();
			this.resetCharge(false, false);
		}
		this._GUI.updateCharge();
	}

	protected onDisableCharge(): void {
		if (!this.toolNeedsCharge || this._toolUsingCD > 0 || !this.isActive || this.isRespawning)
			return;
		this.useTool();
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
	public computeFinalDamage(attacker: Player, attackerTool: Tool, defaultDamage: uint): uint {
		if (attacker == null)
			return attackerTool == null ? 0 : attackerTool.defaultDamage;
		if (attackerTool == null)
			attackerTool = attacker.tool;
		if (attackerTool != null)
			return attackerTool.getBuffedDamage(defaultDamage, attacker.buffDamage, this.buffResistance);
		return 0;
	}

	public finalRemoveHealth(attacker: Player, attackerTool: Tool, defaultDamage: uint): void {
		this.removeHealth(this.computeFinalDamage(attacker, attackerTool, defaultDamage), attacker);
	}

	public computeFinalCD(tool: Tool): uint {
		return tool.getBuffedCD(this.buffCD);
	}

	public computeFinalRadius(defaultRadius: number): number {
		return defaultRadius * (1 + Math.min(this.buffRadius / 16, 3));
	}

	public computeFinalLightningEnergy(defaultEnergy: uint): int {
		return defaultEnergy * (1 + this._buffDamage / 20 + this._buffRadius / 10);
	}

	//====Functions About Graphics====//
	protected drawShape(Alpha: number = 1): void {
		let realRadiusX: number = (Player.SIZE - Player.LINE_SIZE) / 2;
		let realRadiusY: number = (Player.SIZE - Player.LINE_SIZE) / 2;
		graphics.clear();
		graphics.lineStyle(Player.LINE_SIZE, this._lineColor);
		// graphics.beginFill(this._fillColor,Alpha);
		let m: Matrix = new Matrix();
		m.createGradientBox(DEFAULT_SIZE,
			DEFAULT_SIZE, 0, -realRadiusX, -realRadiusX);
		graphics.beginGradientFill(GradientType.LINEAR,
			[this._fillColor, this._fillColor2],
			[Alpha, Alpha],
			[63, 255],
			m,
			SpreadMethod.PAD,
			InterpolationMethod.RGB,
			1);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		// graphics.drawCircle(0,0,10);
		graphics.endFill();
	}

	protected initColors(fillColor: number = NaN, lineColor: number = NaN): void {
		// Deal fillColor
		if (isNaN(fillColor))
			this._fillColor = this._team.defaultColor;
		else
			this._fillColor = uint(fillColor);
		// Deal lineColor
		let HSV: number[] = Color.HEXtoHSV(this._fillColor);
		this._fillColor2 = Color.HSVtoHEX(HSV[0], HSV[1], HSV[2] / 1.5);
		if (isNaN(lineColor)) {
			this._lineColor = Color.HSVtoHEX(HSV[0], HSV[1], HSV[2] / 2);
		}
		else
			this._lineColor = uint(lineColor);
	}

	public setCarriedBlock(block: Block, copyBlock: boolean = true): void {
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
	}

	protected addChildren(): void {
		host.playerGUIContainer.addChild(this._GUI);
	}

	//====Tick Run Function====//
	public onTick(host: IBatrGame): void {
		this.dealUsingCD();
		this.updateKeyDelay();
		this.dealKeyControl();
		this.dealMoveInTest(this.entityX, this.entityY, false, false);
		this.dealHeal();
	}

	//====Control Functions====//

	// !【2023-09-23 16:53:17】把涉及「玩家基本操作」的部分留下（作为接口），把涉及「具体按键」的部分外迁
	public turnAllKeyUp(): void {
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

	public updateKeyDelay(): void {
		// console.log(this.keyDelay_Move,this.controlDelay_Move,this.controlLoop_Move);
		//==Set==//
		// Move
		if (this.someMoveKeyDown) {
			this.keyDelay_Move++;
			if (this.keyDelay_Move >= this.controlLoop_Move) {
				this.keyDelay_Move = 0;
			}
		}
		else {
			this.keyDelay_Move = -this.controlDelay_Move;
		}
	}

	public runActionByKeyCode(code: uint): void {
		if (!this.isActive || this.isRespawning)
			return;
		switch (code) {
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
				if (!this.toolReverseCharge)
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

	public dealKeyControl(): void {
		if (!this.isActive || this.isRespawning)
			return;
		if (this.someKeyDown) {
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

	override moveForward(distance: number = 1): void {
		if (this.isRespawning)
			return;
		switch (this.rot) {
			case GlobalRot.RIGHT:
				this.moveRight();
				break;

			case GlobalRot.LEFT:
				this.moveLeft();
				break;

			case GlobalRot.UP:
				this.moveUp();
				break;

			case GlobalRot.DOWN:
				this.moveDown();
				break;
		}
	}

	override moveIntForward(distance: number = 1): void {
		this.moveForward(distance);
	}

	public moveLeft(): void {
		host.movePlayer(this, GlobalRot.LEFT, this.moveDistance);
	}

	public moveRight(): void {
		host.movePlayer(this, GlobalRot.RIGHT, this.moveDistance);
	}

	public moveUp(): void {
		host.movePlayer(this, GlobalRot.UP, this.moveDistance);
	}

	public moveDown(): void {
		host.movePlayer(this, GlobalRot.DOWN, this.moveDistance);
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

	public useTool(): void {
		if (!this.toolNeedsCharge || this.chargingPercent > 0) {
			host.playerUseTool(this, this.rot, this.chargingPercent);
		}
		if (this.toolNeedsCharge)
			this._GUI.updateCharge();
	}
}
