import { uint, int } from "../../../../legacy/AS3Legacy";
import IMap from "../../../api/map/IMap";
import PlayerTeam from "../entities/player/team/PlayerTeam";
import Game from "../../../main/Game";
import GameRuleEvent from "../../../api/rule/GameRuleEvent";
import { TPS } from "../../../main/GlobalGameVariables";
import IGameRule from "../../../api/rule/IGameRule";
import { key } from "../../../../common/utils";
import BonusType from "../registry/BonusRegistry";
import Tool from "../tool/Tool";
import { HSVtoHEX } from "../../../../common/color";

/**
 * 存储一系列与游戏相关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * TODO: 有待迁移，搬迁至「模组/原生」
 */
export default class GameRule_V1 implements IGameRule {

	public static readonly TEMPLATE: GameRule_V1 = new GameRule_V1();

	//============Static Variables============//
	//========Rules========//
	/**
	 * 格式：属性名/默认值/实例属性
	 */
	//====Player====//
	protected static readonly name_playerCount: key = 'playerCount';
	protected static readonly d_playerCount: uint = 1;
	protected _playerCount: uint = GameRule_V1.d_playerCount;

	protected static readonly name_AICount: key = 'AICount';
	protected static readonly d_AICount: uint = 3;
	protected _AICount: uint = GameRule_V1.d_AICount;

	//====Team====//
	protected static readonly name_coloredTeamCount: key = 'coloredTeamCount';
	protected static readonly d_coloredTeamCount: uint = 8;
	protected _coloredTeamCount: uint = GameRule_V1.d_coloredTeamCount;

	protected static readonly name_grayscaleTeamCount: key = 'grayscaleTeamCount';
	protected static readonly d_grayscaleTeamCount: uint = 3;
	protected _grayscaleTeamCount: uint = GameRule_V1.d_grayscaleTeamCount;

	protected static readonly name_playerTeams: key = 'playerTeams';
	protected static readonly d_playerTeams: PlayerTeam[] = GameRule_V1.initPlayerTeams(GameRule_V1.d_coloredTeamCount, GameRule_V1.d_grayscaleTeamCount);
	protected _playerTeams: PlayerTeam[] = GameRule_V1.d_playerTeams;

	/** Allows players change their teams by general means */
	protected static readonly name_allowPlayerChangeTeam: key = 'allowPlayerChangeTeam';
	protected static readonly d_allowPlayerChangeTeam: boolean = true;
	protected _allowPlayerChangeTeam: boolean = GameRule_V1.d_allowPlayerChangeTeam;

	//====GamePlay====//
	protected static readonly name_defaultHealth: key = 'defaultHealth';
	protected static readonly d_defaultHealth: uint = 100;
	protected _defaultHealth: uint = GameRule_V1.d_defaultHealth;

	protected static readonly name_defaultMaxHealth: key = 'defaultMaxHealth';
	protected static readonly d_defaultMaxHealth: uint = 100;
	protected _defaultMaxHealth: uint = GameRule_V1.d_defaultMaxHealth;

	/** Use as a int with negative numbers means infinity */
	protected static readonly name_remainLivesPlayer: key = 'remainLivesPlayer';
	protected static readonly d_remainLivesPlayer: int = -1;
	protected _remainLivesPlayer: int = GameRule_V1.d_remainLivesPlayer;

	protected static readonly name_remainLivesAI: key = 'remainLivesAI';
	protected static readonly d_remainLivesAI: int = -1;
	protected _remainLivesAI: int = GameRule_V1.d_remainLivesAI;

	protected static readonly name_defaultRespawnTime: key = 'defaultRespawnTime';
	protected static readonly d_defaultRespawnTime: uint = 3 * TPS; // tick
	protected _defaultRespawnTime: uint = GameRule_V1.d_defaultRespawnTime;

	protected static readonly name_deadPlayerMoveToX: key = 'deadPlayerMoveToX';
	protected static readonly d_deadPlayerMoveToX: number = -10;
	protected _deadPlayerMoveToX: number = GameRule_V1.d_deadPlayerMoveToX;

	protected static readonly name_deadPlayerMoveToY: key = 'deadPlayerMoveToY';
	protected static readonly d_deadPlayerMoveToY: number = -10;
	protected _deadPlayerMoveToY: number = GameRule_V1.d_deadPlayerMoveToY;

	protected static readonly name_recordPlayerStats: key = 'recordPlayerStats';
	protected static readonly d_recordPlayerStats: boolean = true;
	protected _recordPlayerStats: boolean = GameRule_V1.d_recordPlayerStats;

	/** Negative Number means asphyxia can kill player */
	protected static readonly name_playerAsphyxiaDamage: key = 'playerAsphyxiaDamage';
	protected static readonly d_playerAsphyxiaDamage: int = 15;
	protected _playerAsphyxiaDamage: int = GameRule_V1.d_playerAsphyxiaDamage;

	//====Bonus====//

	/** negative number means infinity */
	protected static readonly name_bonusBoxMaxCount: key = 'bonusBoxMaxCount';
	protected static readonly d_bonusBoxMaxCount: int = 8;
	protected _bonusBoxMaxCount: int = GameRule_V1.d_bonusBoxMaxCount;

	protected static readonly name_bonusBoxSpawnChance: key = 'bonusBoxSpawnChance';
	protected static readonly d_bonusBoxSpawnChance: number = 1 / TPS / 8;
	protected _bonusBoxSpawnChance: number = GameRule_V1.d_bonusBoxSpawnChance;

	/**
	 * 奖励类型→权重
	 */
	protected static readonly name_bonusBoxSpawnPotentials: key = 'bonusBoxSpawnPotentials';
	protected static readonly d_bonusBoxSpawnPotentials: Map<BonusType, number> = new Map<BonusType, number>();
	protected _bonusBoxSpawnPotentials: Map<BonusType, number> = GameRule_V1.d_bonusBoxSpawnPotentials

	/** null means all type can be spawned and they have same weight */
	protected static readonly name_bonusBoxSpawnAfterPlayerDeath: key = 'bonusBoxSpawnAfterPlayerDeath';
	protected static readonly d_bonusBoxSpawnAfterPlayerDeath: boolean = true;
	protected _bonusBoxSpawnAfterPlayerDeath: boolean = GameRule_V1.d_bonusBoxSpawnAfterPlayerDeath;

	//====Bonus's Buff====//

	/** Determines bonus(type=buffs)'s amount of addition */
	protected static readonly name_bonusBuffAdditionAmount: key = 'bonusBuffAdditionAmount';
	protected static readonly d_bonusBuffAdditionAmount: uint = 1;
	protected _bonusBuffAdditionAmount: uint = GameRule_V1.d_bonusBuffAdditionAmount;

	/** Determines bonus(type=ADD_LIFE)'s amount of addition */
	protected static readonly name_bonusMaxHealthAdditionAmount: key = 'bonusMaxHealthAdditionAmount';
	protected static readonly d_bonusMaxHealthAdditionAmount: uint = 5;
	protected _bonusMaxHealthAdditionAmount: uint = GameRule_V1.d_bonusMaxHealthAdditionAmount;

	//====Map====//

	/**
	 * 格式：地图→权重
	 * * 默认是空映射
	 * 
	 * ! 【2023-09-17 11:41:26】现在一定需要初始化，即便只是「平均分布」
	 */
	protected static readonly name_mapRandomPotentials: key = 'mapRandomPotentials';
	protected static readonly d_mapRandomPotentials: Map<IMap, number> = new Map<IMap, number>();
	protected _mapRandomPotentials: Map<IMap, number> = GameRule_V1.d_mapRandomPotentials;

	protected static readonly name_initialMapID: key = 'initialMapID';
	protected static readonly d_initialMapID: int = -1;
	protected _initialMapID: int = GameRule_V1.d_initialMapID;

	/**
	 * The time of the map transform loop.
	 * stranded by second.
	 */
	protected static readonly name_mapTransformTime: key = 'mapTransformTime';
	protected static readonly d_mapTransformTime: uint = 60;
	protected _mapTransformTime: uint = GameRule_V1.d_mapTransformTime;

	//====Tools====//
	protected static readonly name_enableTools: key = 'enableTools';
	protected static readonly d_enableTools: Tool[] = [];
	protected _enableTools: Tool[] = GameRule_V1.d_enableTools;

	protected static readonly name_defaultToolID: key = 'defaultToolID';
	protected static readonly d_defaultToolID: int = 0;
	protected _defaultToolID: int = GameRule_V1.d_defaultToolID;

	protected static readonly name_defaultLaserLength: key = 'defaultLaserLength';
	protected static readonly d_defaultLaserLength: uint = 32;
	protected _defaultLaserLength: uint = GameRule_V1.d_defaultLaserLength;

	protected static readonly name_allowLaserThroughAllBlock: key = 'allowLaserThroughAllBlock';
	protected static readonly d_allowLaserThroughAllBlock: boolean = false;
	protected _allowLaserThroughAllBlock: boolean = GameRule_V1.d_allowLaserThroughAllBlock;

	protected static readonly name_toolsNoCD: key = 'toolsNoCD';
	protected static readonly d_toolsNoCD: boolean = false;
	protected _toolsNoCD: boolean = GameRule_V1.d_toolsNoCD;

	//====End&Victory====//
	protected static readonly name_allowTeamVictory: key = 'allowTeamVictory';
	protected static readonly d_allowTeamVictory: boolean = true;
	protected _allowTeamVictory: boolean = GameRule_V1.d_allowTeamVictory;

	//========Preview========//
	/**
	 * （用于菜单背景）「游戏初始化」时产生的固定规则
	 * * 八个AI
	 * * 随机武器
	 * * 不断切换的地图
	 * * 混战
	 */
	public static readonly MENU_BACKGROUND: GameRule_V1 = GameRule_V1.getBackgroundRule();

	protected static getBackgroundRule(): GameRule_V1 {
		let rule: GameRule_V1 = new GameRule_V1();
		rule.playerCount = 0;
		rule.AICount = 8;
		rule.defaultToolID = -2;
		rule.remainLivesPlayer = -1;
		rule.remainLivesAI = -1;
		return rule;
	}

	//============Static Getter And Setter============//

	//============Static Functions============//

	/**
	 * Create a list of PlayerTeam that have different colors.
	 * @param	coloredTeamCount	the number of team that color instanceof colorful
	 * @param	grayscaleTeamCount	the number of team that color instanceof grayscale
	 * @return	A list of PlayerTeam,contains different colors.
	 */
	protected static initPlayerTeams(coloredTeamCount: uint, grayscaleTeamCount: uint): PlayerTeam[] {
		let returnTeams: PlayerTeam[] = new Array<PlayerTeam>();
		let h: uint, s: number, v: number, color: uint;
		let i: uint;
		// Grayscale Team
		h = 0;
		s = 0;
		for (i = 0; i < grayscaleTeamCount; i++) {
			v = i / (grayscaleTeamCount - 1) * 100;
			color = HSVtoHEX(h, s, v);
			returnTeams.push(new PlayerTeam(color));
		}
		h = 0;
		s = 100;
		v = 100;
		// Colored Team
		for (i = 0; i < coloredTeamCount; i++) {
			h = 360 * i / coloredTeamCount;
			color = HSVtoHEX(h, s, v);
			returnTeams.push(new PlayerTeam(color));
		}
		return returnTeams;
	}

	public toObject(): object {
		let i = true;

		// get all getter value
		let o: any = {}; // if not: recursive reference problem
		// filter
		let k: string, v: any;
		let result: any = {};

		let blankRule: GameRule_V1 = new GameRule_V1();
		for (k in o) {
			v = o[k];
			// Make sure the property instanceof writable
			try {
				// write as itself
				blankRule.setRule(k, v);
			}
			catch (e) {
				continue;
			}
			// not support with Infinity when JSON.stringify
			// if (v == Infinity || v == -Infinity) {
			// result[k] = v.toString();
			// }
			// Type
			if (
				v instanceof Boolean ||
				v instanceof Number ||
				v instanceof String ||
				v instanceof int ||
				v instanceof uint ||
				v === null
			) // Filter
				if (
					k != 'initialMap'
				)
					result[k] = v;
			console.log('Saving data', k, '=', result[k], '(' + v + ')');
		}
		return result as object;
	}

	public static fromJSON(rule: string): GameRule_V1 {
		let r: GameRule_V1 = new GameRule_V1();
		let o: object = JSON.parse(rule);
		let v: any;
		for (let k in o) {
			try {
				v = o[k];
				// Infinity
				if (v === ' Infinity')
					r[k] = Infinity;
				else if (v === '-Infinity')
					r[k] = -Infinity;
				else {
					r[k] = v;
					console.log('Loaded data', k, '=', o[k]);
				}
			}
			catch (error: Error) {
				console.log('Error loading data', k, '=', o[k]);
			}
		}
		return r;
	}

	//============Constructor & Destructor============//
	public constructor() {
		// this.loadAsDefault(); // ! 现在直接使用属性默认值了
	}

	/** 实现：直接访问内部变量 */
	public hasRule(key: key): boolean {
		return this.hasOwnProperty(`_${key}`);
	}

	/** 实现：直接访问内部变量 */
	public getRule<T>(key: key): T {
		if (!this.hasRule(key))
			throw new Error(`规则「${key}」未找到`);
		return ((this as any)[`_${key}`] as T)
	}

	/** 实现：直接访问内部变量 */
	public setRule<T>(key: key, value: T): boolean {
		if (!this.hasRule(key))
			throw new Error(`规则「${key}」未找到`);
		(this as any)[`_${key}`] = value;
		return true;
	}

	//============Destructor Function============//
	public destructor(): void {
		this._bonusBoxSpawnPotentials.clear(); // ! 清除所有引用
		this._mapRandomPotentials = null;
		this._enableTools = null;
		this._playerTeams = null;
	}

	//============Instance Getter And Setter============//
	// Rule Random About
	public get randomToolEnable(): ToolType {
		return this.enableTools[exMath.random(this.enableTools.length)];
	}

	public get randomToolIDEnable(): int {
		return ToolType.toToolID(this.enableTools[exMath.random(this.enableTools.length)]);
	}

	public get randomMapEnable(): IMap {
		// Test
		if (this._mapRandomPotentials == null) {
			return Game.ALL_MAPS[exMath.random(Game.ALL_MAPS.length)];
		}
		// Add
		let maps: IMap[] = new Array<IMap>();
		let weights: number[] = new Array<Number>();
		let sum: number = 0;
		for (let mapPotential of this._mapRandomPotentials) {
			if (mapPotential['map'] instanceof IMap && mapPotential['weight'] instanceof Number) {
				maps.push(mapPotential['map'] as IMap);
				weights.push(Number(mapPotential['weight']));
				sum += Number(mapPotential['weight']);
			}
		}
		let randomNum: number = exMath.randomFloat(sum);
		// Choose
		for (let i: uint = 0; i < weights.length; i++) {
			if (weights[i] >= randomNum && randomNum < weights[i + 1]) {
				return maps[i];
			}
		}
		return null;
	}

	public get randomBonusEnable(): BonusType {
		// Test
		if (this._bonusBoxSpawnPotentials == null) {
			// return BonusType.RANDOM_AVAILABLE
			// 20230902: now initialize an equivalent potentials
			this._bonusBoxSpawnPotentials = BonusType.AVAILABLE_SPAWN_POTENTIALS;
		}
		// Add
		let types: BonusType[] = new Array<BonusType>();
		let weights: number[] = new Array<Number>();
		let sum: number = 0;
		for (let bonusPotential of this._bonusBoxSpawnPotentials) {
			if (bonusPotential['type'] instanceof BonusType && bonusPotential['weight'] instanceof Number) {
				// Filter
				if (
					// if the rule disallow player change their team, the type that potential can change player's team won't be push
					!this._allowPlayerChangeTeam && (
						bonusPotential['type'] == BonusType.RANDOM_CHANGE_TEAM ||
						bonusPotential['type'] == BonusType.UNITE_PLAYER ||
						bonusPotential['type'] == BonusType.UNITE_AI
					)
				)
					continue;
				// Push
				types.push(bonusPotential['type'] as BonusType);
				sum += Number(bonusPotential['weight']);
				weights.push(sum);
			}
		}
		let randomNum: number = exMath.randomFloat(sum);
		// Choose
		for (let i: uint = 0; i < weights.length; i++) {
			if (randomNum <= weights[i]) {
				return types[i];
			}
		}
		console.log('warn@GameRule.as: no bonus type instanceof selected, return NULL!');
		return BonusType.NULL;
	}

	public get randomTeam(): PlayerTeam {
		if (this._playerTeams == null)
			return null;

		return this._playerTeams[exMath.random(this._playerTeams.length)];
	}

	//====Rules====//
	// Player
	public get playerCount(): uint {
		return this._playerCount;
	}

	public set playerCount(value: uint) {
		if (value == this._playerCount)
			return;
		this.onVariableUpdate(this._playerCount, value);
		this._playerCount = value;
	}

	public get AICount(): uint {
		return this._AICount;
	}

	public set AICount(value: uint) {
		if (value == this._AICount)
			return;
		this.onVariableUpdate(this._AICount, value);
		this._AICount = value;
	}

	// Health
	public get defaultHealth(): uint {
		return this._defaultHealth;
	}

	public set defaultHealth(value: uint) {
		if (value == this._defaultHealth)
			return;
		this.onVariableUpdate(this._defaultHealth, value);
		this._defaultHealth = value;
	}

	public get defaultMaxHealth(): uint {
		return this._defaultMaxHealth;
	}

	public set defaultMaxHealth(value: uint) {
		if (value == this._defaultMaxHealth)
			return;
		this.onVariableUpdate(this._defaultMaxHealth, value);
		this._defaultMaxHealth = value;
	}

	// Bonus
	public get bonusBoxMaxCount(): int {
		return this._bonusBoxMaxCount;
	}

	public set bonusBoxMaxCount(value: int) {
		if (value == this._bonusBoxMaxCount)
			return;
		this.onVariableUpdate(this._bonusBoxMaxCount, value);
		this._bonusBoxMaxCount = value;
	}

	public get bonusBoxSpawnChance(): number {
		return this._bonusBoxSpawnChance;
	}

	public set bonusBoxSpawnChance(value: number) {
		if (value == this._bonusBoxSpawnChance)
			return;
		this.onVariableUpdate(this._bonusBoxSpawnChance, value);
		this._bonusBoxSpawnChance = value;
	}

	public get bonusBoxSpawnPotentials(): Map<BonusType, number> {
		return this._bonusBoxSpawnPotentials;
	}

	public set bonusBoxSpawnPotentials(value: Map<BonusType, number>) {
		this._bonusBoxSpawnPotentials = value
	}

	public get bonusBoxSpawnAfterPlayerDeath(): boolean {
		return this._bonusBoxSpawnAfterPlayerDeath;
	}

	public set bonusBoxSpawnAfterPlayerDeath(value: boolean) {
		if (value == this._bonusBoxSpawnAfterPlayerDeath)
			return;
		this.onVariableUpdate(this._bonusBoxSpawnAfterPlayerDeath, value);
		this._bonusBoxSpawnAfterPlayerDeath = value;
	}

	// Bonus's Buff
	public get bonusBuffAdditionAmount(): uint {
		return this._bonusBuffAdditionAmount;
	}

	public set bonusBuffAdditionAmount(value: uint) {
		if (value == this._bonusBuffAdditionAmount)
			return;
		this.onVariableUpdate(this._bonusBuffAdditionAmount, value);
		this._bonusBuffAdditionAmount = value;
	}

	public get bonusMaxHealthAdditionAmount(): uint {
		return this._bonusMaxHealthAdditionAmount;
	}

	public set bonusMaxHealthAdditionAmount(value: uint) {
		if (value == this._bonusMaxHealthAdditionAmount)
			return;
		this.onVariableUpdate(this._bonusMaxHealthAdditionAmount, value);
		this._bonusMaxHealthAdditionAmount = value;
	}

	// Map
	public get mapRandomPotentials(): Map<IMap, number> {
		return this._mapRandomPotentials;
	}

	public set mapRandomPotentials(value: Map<IMap, number>) {
		this._mapRandomPotentials = value;
	}

	public get mapWeightsByGame(): number[] {
		let wv: number[] = new Array<Number>(Game.ALL_MAPS.length);

		for (let i: uint = 0; i <= Game.ALL_MAPS.length; i++) {
			for (let map in this.mapRandomPotentials) {
				if (map.map == Game.ALL_MAPS[i]) {
					wv[i] = map.weight;
				}
			}
		}
		return wv;
	}

	public get initialMapID(): int {
		return this._initialMapID;
	}

	public set initialMapID(value: int) {
		if (value == this._initialMapID)
			return;
		this.onVariableUpdate(this._initialMapID, value);
		this._initialMapID = value;
	}

	public get mapTransformTime(): uint {
		return this._mapTransformTime;
	}

	public set mapTransformTime(value: uint) {
		if (value == this._mapTransformTime)
			return;
		this.onVariableUpdate(this._mapTransformTime, value);
		this._mapTransformTime = value;
	}

	/* The Copy Operation instanceof in Menu:getRuleFromMenu
		 * The Negative Number returns null and The Game will be start as random map
		 */
	public get initialMap(): IMap {
		if (this._initialMapID < 0)
			return null;
		return Game.getMapFromID(this._initialMapID);
	}

	/* The Map must be the true object in Game.ALL_MAPS not a clone!
		 * The initial map will be loaded in Game:loadMap
		 */
	public set initialMap(value: IMap) {
		this.initialMapID = Game.getIDFromMap(value);
	}

	// Tool
	public get defaultToolID(): int {
		return this._defaultToolID;
	}

	public set defaultToolID(value: int) {
		if (value == this._defaultToolID)
			return;
		this.onVariableUpdate(this._defaultToolID, value);
		this._defaultToolID = value;
	}

	public get defaultLaserLength(): uint {
		return this._defaultLaserLength;
	}

	public set defaultLaserLength(value: uint) {
		if (value == this._defaultLaserLength)
			return;
		this.onVariableUpdate(this._defaultLaserLength, value);
		this._defaultLaserLength = value;
	}

	public get allowLaserThroughAllBlock(): boolean {
		return this._allowLaserThroughAllBlock;
	}

	public set allowLaserThroughAllBlock(value: boolean) {
		if (value == this._allowLaserThroughAllBlock)
			return;
		this.onVariableUpdate(this._allowLaserThroughAllBlock, value);
		this._allowLaserThroughAllBlock = value;
	}

	public get toolsNoCD(): boolean {
		return this._toolsNoCD;
	}

	public set toolsNoCD(value: boolean) {
		if (value == this._toolsNoCD)
			return;
		this.onVariableUpdate(this._toolsNoCD, value);
		this._toolsNoCD = value;
	}

	// Respawn
	public get defaultRespawnTime(): uint {
		return this._defaultRespawnTime;
	}

	public set defaultRespawnTime(value: uint) {
		if (value == this._defaultRespawnTime)
			return;
		this.onVariableUpdate(this._defaultRespawnTime, value);
		this._defaultRespawnTime = value;
	}

	public get deadPlayerMoveToX(): number {
		return this._deadPlayerMoveToX;
	}

	public set deadPlayerMoveToX(value: number) {
		if (value == this._deadPlayerMoveToX)
			return;
		this.onVariableUpdate(this._deadPlayerMoveToX, value);
		this._deadPlayerMoveToX = value;
	}

	public get deadPlayerMoveToY(): number {
		return this._deadPlayerMoveToY;
	}

	public set deadPlayerMoveToY(value: number) {
		if (value == this._deadPlayerMoveToY)
			return;
		this.onVariableUpdate(this._deadPlayerMoveToY, value);
		this._deadPlayerMoveToY = value;
	}

	// Life
	public get remainLivesPlayer(): int {
		return this._remainLivesPlayer;
	}

	public set remainLivesPlayer(value: int) {
		if (value == this._remainLivesPlayer)
			return;
		this.onVariableUpdate(this._remainLivesPlayer, value);
		this._remainLivesPlayer = value;
	}

	public get remainLivesAI(): int {
		return this._remainLivesAI;
	}

	public set remainLivesAI(value: int) {
		if (value == this._remainLivesAI)
			return;
		this.onVariableUpdate(this._remainLivesAI, value);
		this._remainLivesAI = value;
	}

	// Stats
	public get recordPlayerStats(): boolean {
		return this._recordPlayerStats;
	}

	public set recordPlayerStats(value: boolean) {
		if (value == this._recordPlayerStats)
			return;
		this.onVariableUpdate(this._recordPlayerStats, value);
		this._recordPlayerStats = value;
	}

	// Tool Enable
	public get enableTools(): ToolType[] {
		return this._enableTools == null ? ToolType._ALL_AVAILABLE_TOOL : this._enableTools;
	}

	public set enableTools(value: ToolType[]) {
		if (value == this._enableTools)
			return;
		this.onVariableUpdate(this._enableTools, value);
		this._enableTools = value;
	}

	public get enableToolCount(): int {
		return this._enableTools == null ? ToolType._ALL_AVAILABLE_TOOL.length : this._enableTools.length;
	}

	// Asphyxia Damage
	public get playerAsphyxiaDamage(): int {
		return this._playerAsphyxiaDamage;
	}

	public set playerAsphyxiaDamage(value: int) {
		if (value == this._playerAsphyxiaDamage)
			return;
		this.onVariableUpdate(this._playerAsphyxiaDamage, value);
		this._playerAsphyxiaDamage = value;
	}

	// Team
	public get coloredTeamCount(): uint {
		return this._coloredTeamCount;
	}

	public set coloredTeamCount(value: uint) {
		if (value == this._coloredTeamCount)
			return;
		this.onVariableUpdate(this._coloredTeamCount, value);
		this._coloredTeamCount = value;
		this._playerTeams = GameRule_V1.initPlayerTeams(value, this._grayscaleTeamCount);
		dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
	}

	public get grayscaleTeamCount(): uint {
		return this._grayscaleTeamCount;
	}

	public set grayscaleTeamCount(value: uint) {
		if (value == this._grayscaleTeamCount)
			return;
		this.onVariableUpdate(this._grayscaleTeamCount, value);
		this._grayscaleTeamCount = value;
		this._playerTeams = GameRule_V1.initPlayerTeams(this._coloredTeamCount, value);
		dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
	}

	public get playerTeams(): PlayerTeam[] {
		return this._playerTeams;
	}

	public get allowPlayerChangeTeam(): boolean {
		return this._allowPlayerChangeTeam;
	}

	public set allowPlayerChangeTeam(value: boolean) {
		if (value == this._allowPlayerChangeTeam)
			return;
		this.onVariableUpdate(this._allowPlayerChangeTeam, value);
		this._allowPlayerChangeTeam = value;
	}

	// End&Victory
	public get allowTeamVictory(): boolean {
		return this._allowTeamVictory;
	}

	public set allowTeamVictory(value: boolean) {
		if (value == this._allowTeamVictory)
			return;
		this.onVariableUpdate(this._allowTeamVictory, value);
		this._allowTeamVictory = value;
	}

	//============Instance Functions============//
	public reloadDefault(): void {
		this.copyFrom(GameRule_V1.TEMPLATE)
	}

	public onVariableUpdate(oldValue: any, newValue: any): void {
		dispatchEvent(new GameRuleEvent(GameRuleEvent.VARIABLE_UPDATE, oldValue, newValue));
	}
}
