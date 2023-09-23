import { uint, int } from "../../../../legacy/AS3Legacy";
import IMap from "../../../api/map/IMap";
import PlayerTeam from "../entities/player/team/PlayerTeam";
// import GameRuleEvent from "../../../api/rule/GameRuleEvent"; // TODO: 待事件系统移植后
import { TPS } from "../../../main/GlobalGameVariables";
import IGameRule from "../../../api/rule/IGameRule";
import { clearArray, contains, key, pushNReturn, randomIn, safeMerge } from "../../../../common/utils";
import { BonusType, NativeBonusTypes } from "../registry/BonusRegistry";
import Tool from "../tool/Tool";
import { HSVtoHEX } from "../../../../common/color";
import { randomInWeightMap } from "../../../../common/utils";
import { iPoint } from "../../../../common/geometricTools";
import { NativeTools } from './../registry/ToolRegistry';
import { IBatrJSobject, JSObject } from "../../../../common/abstractInterfaces";

/**
 * 存储一系列与游戏相关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * TODO: 「事件系统」有待完善
 */
export default class GameRule_V1 implements IGameRule {

	protected static preUpdateVariable<T>(rule: IGameRule, k: key, oldV: T, newV: T): boolean {
		if (oldV == newV) return false;
		rule.onVariableUpdate(k, oldV, newV);
		return true
	}

	//============Static Variables============//
	//========Rules========//
	/**
	 * 格式：属性名/默认值/实例属性
	 */
	public static readonly ALL_RULE_KEYS: key[] = []
	//====Player====//
	public static readonly name_playerCount: key = pushNReturn(this.ALL_RULE_KEYS, 'playerCount');
	protected static readonly d_playerCount: uint = 1;
	protected _playerCount: uint = GameRule_V1.d_playerCount;
	public get playerCount(): uint { return this._playerCount; }
	public set playerCount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_playerCount,
				this._playerCount, value
			)
		) this._playerCount = value;
	}

	public static readonly name_AICount: key = pushNReturn(this.ALL_RULE_KEYS, 'AICount');
	protected static readonly d_AICount: uint = 3;
	protected _AICount: uint = GameRule_V1.d_AICount;
	public get AICount(): uint { return this._AICount; }
	public set AICount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_AICount,
				this._AICount, value
			)
		) this._AICount = value;
	}

	//====Team====//
	// TODO: 【2023-09-17 15:17:19】或许日后要移除这个「更面向显示的功能」，直接使用颜色值区分玩家队伍
	public static readonly name_coloredTeamCount: key = pushNReturn(this.ALL_RULE_KEYS, 'coloredTeamCount');
	protected static readonly d_coloredTeamCount: uint = 8;
	protected _coloredTeamCount: uint = GameRule_V1.d_coloredTeamCount;
	public get coloredTeamCount(): uint { return this._coloredTeamCount; }
	public set coloredTeamCount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_coloredTeamCount,
				this._coloredTeamCount, value
			)
		) this._coloredTeamCount = value;
		GameRule_V1.initPlayerTeams(this._temp_playerTeams, value, this._grayscaleTeamCount);
		// dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
	}
	/** 衍生getter */
	public get playerTeams(): PlayerTeam[] { return this._temp_playerTeams; }

	public static readonly name_grayscaleTeamCount: key = pushNReturn(this.ALL_RULE_KEYS, 'grayscaleTeamCount');
	protected static readonly d_grayscaleTeamCount: uint = 3;
	protected _grayscaleTeamCount: uint = GameRule_V1.d_grayscaleTeamCount;
	public get grayscaleTeamCount(): uint { return this._grayscaleTeamCount; }
	public set grayscaleTeamCount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_grayscaleTeamCount,
				this._grayscaleTeamCount, value
			)
		) this._grayscaleTeamCount = value;
		GameRule_V1.initPlayerTeams(this._temp_playerTeams, this._coloredTeamCount, value);
		// dispatchEvent(new GameRuleEvent(GameRuleEvent.TEAMS_CHANGE));
	}

	public static readonly name_playerTeams: key = 'playerTeams' // pushNReturn(this.ALL_RULE_KEYS, 'playerTeams');
	protected static readonly d_playerTeams: PlayerTeam[] = GameRule_V1.initPlayerTeams([], GameRule_V1.d_coloredTeamCount, GameRule_V1.d_grayscaleTeamCount);
	protected _temp_playerTeams: PlayerTeam[] = GameRule_V1.d_playerTeams.slice();

	/** Allows players change their teams by general means */
	public static readonly name_allowPlayerChangeTeam: key = pushNReturn(this.ALL_RULE_KEYS, 'allowPlayerChangeTeam');
	protected static readonly d_allowPlayerChangeTeam: boolean = true;
	protected _allowPlayerChangeTeam: boolean = GameRule_V1.d_allowPlayerChangeTeam;
	public get allowPlayerChangeTeam(): boolean { return this._allowPlayerChangeTeam; }
	public set allowPlayerChangeTeam(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_allowPlayerChangeTeam,
				this._allowPlayerChangeTeam, value
			)
		) this._allowPlayerChangeTeam = value;
	}

	//====GamePlay====//
	public static readonly name_defaultHealth: key = pushNReturn(this.ALL_RULE_KEYS, 'defaultHealth');
	protected static readonly d_defaultHealth: uint = 100;
	protected _defaultHealth: uint = GameRule_V1.d_defaultHealth;
	public get defaultHealth(): uint { return this._defaultHealth; }
	public set defaultHealth(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_defaultHealth,
				this._defaultHealth, value
			)
		) this._defaultHealth = value;
	}

	public static readonly name_defaultMaxHealth: key = pushNReturn(this.ALL_RULE_KEYS, 'defaultMaxHealth');
	protected static readonly d_defaultMaxHealth: uint = 100;
	protected _defaultMaxHealth: uint = GameRule_V1.d_defaultMaxHealth;
	public get defaultMaxHealth(): uint { return this._defaultMaxHealth; }
	public set defaultMaxHealth(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_defaultMaxHealth,
				this._defaultMaxHealth, value
			)
		) this._defaultMaxHealth = value;
	}

	/** Use as a int with negative numbers means infinity */
	public static readonly name_remainLivesPlayer: key = pushNReturn(this.ALL_RULE_KEYS, 'remainLivesPlayer');
	protected static readonly d_remainLivesPlayer: int = -1;
	protected _remainLivesPlayer: int = GameRule_V1.d_remainLivesPlayer;
	public get remainLivesPlayer(): int { return this._remainLivesPlayer; }
	public set remainLivesPlayer(value: int) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_remainLivesPlayer,
				this._remainLivesPlayer, value
			)
		) this._remainLivesPlayer = value;
	}

	public static readonly name_remainLivesAI: key = pushNReturn(this.ALL_RULE_KEYS, 'remainLivesAI');
	protected static readonly d_remainLivesAI: int = -1;
	protected _remainLivesAI: int = GameRule_V1.d_remainLivesAI;
	public get remainLivesAI(): int { return this._remainLivesAI; }
	public set remainLivesAI(value: int) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_remainLivesAI,
				this._remainLivesAI, value
			)
		) this._remainLivesAI = value;
	}

	public static readonly name_defaultRespawnTime: key = pushNReturn(this.ALL_RULE_KEYS, 'defaultRespawnTime');
	protected static readonly d_defaultRespawnTime: uint = 3 * TPS; // tick
	protected _defaultRespawnTime: uint = GameRule_V1.d_defaultRespawnTime;
	public get defaultRespawnTime(): uint { return this._defaultRespawnTime; }
	public set defaultRespawnTime(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_defaultRespawnTime,
				this._defaultRespawnTime, value
			)
		) this._defaultRespawnTime = value;
	}

	public static readonly name_deadPlayerMoveTo: key = pushNReturn(this.ALL_RULE_KEYS, 'deadPlayerMoveTo');
	protected static readonly d_deadPlayerMoveTo: iPoint = new iPoint(10, 10);
	protected readonly _deadPlayerMoveTo: iPoint = GameRule_V1.d_deadPlayerMoveTo.copy();
	public get deadPlayerMoveTo(): iPoint { return this._deadPlayerMoveTo; }
	public set deadPlayerMoveTo(value: iPoint) {
		if (this._deadPlayerMoveTo.isEqual(value)) return;
		this.onVariableUpdate(GameRule_V1.name_deadPlayerMoveTo, this._deadPlayerMoveTo.copy(), value)
		this._deadPlayerMoveTo.copyFrom(value);
	}

	public static readonly name_recordPlayerStats: key = pushNReturn(this.ALL_RULE_KEYS, 'recordPlayerStats');
	protected static readonly d_recordPlayerStats: boolean = true;
	protected _recordPlayerStats: boolean = GameRule_V1.d_recordPlayerStats;
	public get recordPlayerStats(): boolean { return this._recordPlayerStats; }
	public set recordPlayerStats(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_recordPlayerStats,
				this._recordPlayerStats, value
			)
		) this._recordPlayerStats = value;
	}

	/** Negative Number means asphyxia can kill player */
	public static readonly name_playerAsphyxiaDamage: key = pushNReturn(this.ALL_RULE_KEYS, 'playerAsphyxiaDamage');
	protected static readonly d_playerAsphyxiaDamage: int = 15;
	protected _playerAsphyxiaDamage: int = GameRule_V1.d_playerAsphyxiaDamage;
	public get playerAsphyxiaDamage(): int { return this._playerAsphyxiaDamage; }
	public set playerAsphyxiaDamage(value: int) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_playerAsphyxiaDamage,
				this._playerAsphyxiaDamage, value
			)
		) this._playerAsphyxiaDamage = value;
	}

	//====Bonus====//

	/** negative number means infinity */
	public static readonly name_bonusBoxMaxCount: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusBoxMaxCount');
	protected static readonly d_bonusBoxMaxCount: int = 8;
	protected _bonusBoxMaxCount: int = GameRule_V1.d_bonusBoxMaxCount;
	public get bonusBoxMaxCount(): int { return this._bonusBoxMaxCount; }
	public set bonusBoxMaxCount(value: int) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_bonusBoxMaxCount,
				this._bonusBoxMaxCount, value
			)
		) this._bonusBoxMaxCount = value;
	}

	public static readonly name_bonusBoxSpawnChance: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusBoxSpawnChance');
	protected static readonly d_bonusBoxSpawnChance: number = 1 / TPS / 8;
	protected _bonusBoxSpawnChance: number = GameRule_V1.d_bonusBoxSpawnChance;
	public get bonusBoxSpawnChance(): number { return this._bonusBoxSpawnChance; }
	public set bonusBoxSpawnChance(value: number) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_bonusBoxSpawnChance,
				this._bonusBoxSpawnChance, value
			)
		) this._bonusBoxSpawnChance = value;
	}

	/**
	 * 奖励类型→权重
	 */
	public static readonly name_bonusTypePotentials: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusTypePotentials');
	protected static readonly d_bonusTypePotentials: Map<BonusType, number> = new Map<BonusType, number>();
	protected _bonusTypePotentials: Map<BonusType, number> = GameRule_V1.d_bonusTypePotentials
	public get bonusTypePotentials(): Map<BonusType, number> { return this._bonusTypePotentials; }
	public set bonusTypePotentials(value: Map<BonusType, number>) {
		this._bonusTypePotentials = value
	}

	/** null means all type can be spawned and they have same weight */
	public static readonly name_bonusBoxSpawnAfterPlayerDeath: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusBoxSpawnAfterPlayerDeath');
	protected static readonly d_bonusBoxSpawnAfterPlayerDeath: boolean = true;
	protected _bonusBoxSpawnAfterPlayerDeath: boolean = GameRule_V1.d_bonusBoxSpawnAfterPlayerDeath;
	public get bonusBoxSpawnAfterPlayerDeath(): boolean { return this._bonusBoxSpawnAfterPlayerDeath; }
	public set bonusBoxSpawnAfterPlayerDeath(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_bonusBoxSpawnAfterPlayerDeath,
				this._bonusBoxSpawnAfterPlayerDeath, value
			)
		) this._bonusBoxSpawnAfterPlayerDeath = value;
	}

	//====Bonus's Buff====//

	/** Determines bonus(type=buffs)'s amount of addition */
	public static readonly name_bonusBuffAdditionAmount: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusBuffAdditionAmount');
	protected static readonly d_bonusBuffAdditionAmount: uint = 1;
	protected _bonusBuffAdditionAmount: uint = GameRule_V1.d_bonusBuffAdditionAmount;
	public get bonusBuffAdditionAmount(): uint { return this._bonusBuffAdditionAmount; }
	public set bonusBuffAdditionAmount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_bonusBuffAdditionAmount,
				this._bonusBuffAdditionAmount, value
			)
		) this._bonusBuffAdditionAmount = value;
	}

	/** Determines bonus(type=ADD_LIFE)'s amount of addition */
	public static readonly name_bonusMaxHealthAdditionAmount: key = pushNReturn(this.ALL_RULE_KEYS, 'bonusMaxHealthAdditionAmount');
	protected static readonly d_bonusMaxHealthAdditionAmount: uint = 5;
	protected _bonusMaxHealthAdditionAmount: uint = GameRule_V1.d_bonusMaxHealthAdditionAmount;
	public get bonusMaxHealthAdditionAmount(): uint { return this._bonusMaxHealthAdditionAmount; }
	public set bonusMaxHealthAdditionAmount(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_bonusMaxHealthAdditionAmount,
				this._bonusMaxHealthAdditionAmount, value
			)
		) this._bonusMaxHealthAdditionAmount = value;
	}

	//====Map====//

	/**
	 * 格式：地图→权重
	 * * 默认是空映射
	 * 
	 * ! 【2023-09-17 11:41:26】现在一定需要初始化，即便只是「平均分布」
	 */
	public static readonly name_mapRandomPotentials: key = pushNReturn(this.ALL_RULE_KEYS, 'mapRandomPotentials');
	protected static readonly d_mapRandomPotentials: Map<IMap, number> = new Map<IMap, number>();
	protected _mapRandomPotentials: Map<IMap, number> = GameRule_V1.d_mapRandomPotentials;
	public get mapRandomPotentials(): Map<IMap, number> { return this._mapRandomPotentials; }
	public set mapRandomPotentials(value: Map<IMap, number>) {
		this._mapRandomPotentials = value;
	}

	// TODO: 这些直接存储「地图」的数据，不好量化（或许需要一种「内部引用」的类型，以便「动态选择&绑定」）
	public static readonly name_initialMap: key = pushNReturn(this.ALL_RULE_KEYS, 'initialMap');
	protected static readonly d_initialMap: IMap | null = null;
	protected _initialMap: IMap | null = GameRule_V1.d_initialMap;
	public get initialMap(): IMap | null { return this._initialMap; }
	public set initialMap(value: IMap | null) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_initialMap,
				this._initialMap, value
			)
		) this._initialMap = value;
	}

	/**
	 * The time of the map transform loop.
	 * stranded by second.
	 */
	public static readonly name_mapTransformTime: key = pushNReturn(this.ALL_RULE_KEYS, 'mapTransformTime');
	protected static readonly d_mapTransformTime: uint = 60;
	protected _mapTransformTime: uint = GameRule_V1.d_mapTransformTime;
	public get mapTransformTime(): uint { return this._mapTransformTime; }
	public set mapTransformTime(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_mapTransformTime,
				this._mapTransformTime, value
			)
		) this._mapTransformTime = value;
	}

	//====Tools====//
	public static readonly name_enabledTools: key = pushNReturn(this.ALL_RULE_KEYS, 'enabledTools');
	protected static readonly d_enabledTools: Tool[] = [];
	protected _enabledTools: Tool[] = GameRule_V1.d_enabledTools;
	public get enabledTools(): Tool[] { return this._enabledTools; }
	public set enabledTools(value: Tool[]) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_enabledTools,
				this._enabledTools, value
			)
		) this._enabledTools = value;
	}
	/** 衍生getter */
	public get enabledToolCount(): int { return this._enabledTools.length; }

	/**
	 * 默认工具
	 * 
	 * 特殊值：
	 * * `null`: 统一随机——随机一个工具，然后在加载时装备到所有玩家
	 * * `undefined`: 完全随机——对每个玩家都装备一个随机工具
	 */
	public static readonly name_defaultTool: key = pushNReturn(this.ALL_RULE_KEYS, 'defaultTool');
	protected static readonly d_defaultTool: Tool | null | undefined = NativeTools.WEAPON_BULLET_BASIC; // ? 是否要这样硬编码
	protected _defaultTool: Tool | null | undefined = GameRule_V1.d_defaultTool;
	public get defaultTool(): Tool | null | undefined { return this._defaultTool; }
	public set defaultTool(value: Tool | null | undefined) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_defaultTool,
				this._defaultTool, value
			)
		) this._defaultTool = value;
	}

	public static readonly name_defaultLaserLength: key = pushNReturn(this.ALL_RULE_KEYS, 'defaultLaserLength');
	protected static readonly d_defaultLaserLength: uint = 32;
	protected _defaultLaserLength: uint = GameRule_V1.d_defaultLaserLength;
	public get defaultLaserLength(): uint { return this._defaultLaserLength; }
	public set defaultLaserLength(value: uint) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_defaultLaserLength,
				this._defaultLaserLength, value
			)
		) this._defaultLaserLength = value;
	}

	public static readonly name_allowLaserThroughAllBlock: key = pushNReturn(this.ALL_RULE_KEYS, 'allowLaserThroughAllBlock');
	protected static readonly d_allowLaserThroughAllBlock: boolean = false;
	protected _allowLaserThroughAllBlock: boolean = GameRule_V1.d_allowLaserThroughAllBlock;
	public get allowLaserThroughAllBlock(): boolean { return this._allowLaserThroughAllBlock; }
	public set allowLaserThroughAllBlock(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_allowLaserThroughAllBlock,
				this._allowLaserThroughAllBlock, value
			)
		) this._allowLaserThroughAllBlock = value;
	}

	public static readonly name_toolsNoCD: key = pushNReturn(this.ALL_RULE_KEYS, 'toolsNoCD');
	protected static readonly d_toolsNoCD: boolean = false;
	protected _toolsNoCD: boolean = GameRule_V1.d_toolsNoCD;
	public get toolsNoCD(): boolean { return this._toolsNoCD; }
	public set toolsNoCD(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_toolsNoCD,
				this._toolsNoCD, value
			)
		) this._toolsNoCD = value;
	}

	//====End&Victory====//
	public static readonly name_allowTeamVictory: key = pushNReturn(this.ALL_RULE_KEYS, 'allowTeamVictory');
	protected static readonly d_allowTeamVictory: boolean = true;
	protected _allowTeamVictory: boolean = GameRule_V1.d_allowTeamVictory;
	public get allowTeamVictory(): boolean { return this._allowTeamVictory; }
	public set allowTeamVictory(value: boolean) {
		if (
			GameRule_V1.preUpdateVariable(
				this, GameRule_V1.name_allowTeamVictory,
				this._allowTeamVictory, value
			)
		) this._allowTeamVictory = value;
	}

	//========Preview========//

	/** 默认的模板常量 */
	public static readonly TEMPLATE: GameRule_V1 = new GameRule_V1();

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
		rule.defaultTool = undefined; // 完全随机
		rule.remainLivesPlayer = -1;
		rule.remainLivesAI = -1;
		return rule;
	}

	//============Static Getter And Setter============//

	//============Static Functions============//

	/**
	 * 重新加载玩家队伍
	 * 
	 * TODO: 是否还有「特地造个类」的必要？
	 */
	protected static initPlayerTeams(parent: PlayerTeam[], coloredTeamCount: uint, grayscaleTeamCount: uint): PlayerTeam[] {
		// let parent: PlayerTeam[] = new Array<PlayerTeam>();
		clearArray(parent);

		let h: uint, s: number, v: number, color: uint;
		let i: uint;
		// Grayscale Team
		h = 0;
		s = 0;
		for (i = 0; i < grayscaleTeamCount; i++) {
			v = i / (grayscaleTeamCount - 1) * 100;
			color = HSVtoHEX(h, s, v);
			parent.push(new PlayerTeam(color));
		}
		h = 0;
		s = 100;
		v = 100;
		// Colored Team
		for (i = 0; i < coloredTeamCount; i++) {
			h = 360 * i / coloredTeamCount;
			color = HSVtoHEX(h, s, v);
			parent.push(new PlayerTeam(color));
		}
		return parent;
	}

	/**
	 * 实现：遍历所有键值对，逐个存入
	 * 
	 * TODO: 对Map的存取问题
	 * 
	 * TODO: 通用的方法提取
	 */
	public dumpToObject(target: JSObject = {}): JSObject {
		// filter
		let k: key, v: any, v2: any;
		for (k of this.allKeys) {
			v = this.getRule(k);
			// Make sure the property instanceof writable
			switch (typeof v) {
				// 原始类型
				case 'number':
				case 'bigint':
				case "string":
				case "boolean":
				case "symbol":
					// target[k] = v; // ! 保持原有值，后面会写入
					break;
				case "undefined":
					console.error(this, k, v)
					throw new Error('暂不支持将undefined打包成对象！')
				// 特殊对象
				case "object":
					// TODO: 分类打包，通用化
					// 尝试优先调用toObject方法，若没有（undefined），则合并为本身
					v = (v as IBatrJSobject<any>)?.dumpToObject?.() ?? v
					break;
				case "function":
					console.error(this, k, v)
					throw new Error('暂不支持将函数打包成对象！')
			}
			target[k] = v;
			console.log('Saving data', k, '=', target[k], '(' + v + ')');
		}
		return target;
	}

	public static fromJSON(obj: JSObject): GameRule_V1 {
		let r: GameRule_V1 = new GameRule_V1();
		r.copyFromObject(obj);
		return r;
	}

	public copyFromObject(obj: JSObject): IGameRule {
		let v: any;
		for (let k in obj) {
			if (!contains(this.allKeys, k)) {
				console.log('Unknown key:', k, '=', obj[k]);
				continue;
			}
			// 取对象&检查类型
			v = safeMerge(this.getRule(k), obj[k]);
			// 处理正负无穷
			if (v === 'Infinity')
				this.setRule(k, Infinity);
			else if (v === '-Infinity')
				this.setRule(k, -Infinity);
			else
				this.setRule(k, v);
			console.log('Loaded data', k, '=', obj[k], '=>', this.getRule(k));
		}
		return this;
	}

	//============Constructor & Destructor============//
	public constructor() {
		// this.loadAsDefault(); // ! 现在直接使用属性默认值了
	}

	public destructor(): void {
		this._bonusTypePotentials.clear(); // ! 清除所有引用
		this._mapRandomPotentials.clear(); // ! 清除所有引用
		clearArray(this._enabledTools);
		clearArray(this._temp_playerTeams);
	}

	public get allKeys(): key[] {
		return GameRule_V1.ALL_RULE_KEYS;
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

	// Rule Random About
	public get randomToolEnable(): Tool {
		return randomIn(this._enabledTools);
	}

	public getRandomMap(): IMap {
		return randomInWeightMap(this._mapRandomPotentials);
	}

	/** 缓存的「新映射」变量 */
	protected _temp_filterBonusType: Map<BonusType, number> = new Map<BonusType, number>();
	/**
	 * 根据规则过滤奖励类型
	 * 
	 * 过滤列表：
	 * * 是否锁定队伍⇒排除关闭所有「能改变玩家队伍的奖励类型」
	 * 
	 * ! 返回一个新映射，但不会深拷贝
	 */
	protected filterBonusType(m: Map<BonusType, number>): Map<BonusType, number> {
		// 先清除
		this._temp_filterBonusType.clear();
		// 开始添加
		m.forEach((weight: number, type: BonusType): void => {
			// 过滤1：「锁定队伍」
			if (
				type == NativeBonusTypes.RANDOM_CHANGE_TEAM ||
				type == NativeBonusTypes.UNITE_PLAYER ||
				type == NativeBonusTypes.UNITE_AI
			) return;
			// 添加
			this._temp_filterBonusType.set(type, weight);
		})
		// 返回
		return this._temp_filterBonusType;
	}

	/**
	 * 随机获取奖励类型
	 * 
	 * ! 非接口实现
	 * 
	 * ! 会被某些规则预过滤
	 * 
	 * @returns 随机出来的奖励类型
	 */
	public randomBonusType(): BonusType {
		return randomInWeightMap(
			this.filterBonusType(this._bonusTypePotentials)
		);
	}

	public get randomTeam(): PlayerTeam {
		return randomIn(this._temp_playerTeams);
	}

	//============Instance Functions============//
	public reloadDefault(): void {
		// ? 考虑完善copyFrom方法
		this.copyFromObject(GameRule_V1.TEMPLATE.dumpToObject());
		// this.copyFrom(GameRule_V1.TEMPLATE)
	}

	public onVariableUpdate(key: key, oldValue: any, newValue: any): void {
		// TODO: 等待事件机制完善
		// this.dispatchEvent(
		// 	new GameRuleEvent(GameRuleEvent.VARIABLE_UPDATE, oldValue, newValue)
		// );
	}
}

console.log(
	new GameRule_V1(),
	GameRule_V1.TEMPLATE,
	GameRule_V1.TEMPLATE.dumpToObject(),
	new GameRule_V1().copyFromObject(GameRule_V1.TEMPLATE.dumpToObject()),
)