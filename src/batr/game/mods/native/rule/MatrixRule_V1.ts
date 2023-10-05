import { uint, int } from "../../../../legacy/AS3Legacy";
import IMap from "../../../api/map/IMap";
import PlayerTeam from "../entities/player/team/PlayerTeam";
// import GameRuleEvent from "../../../api/rule/GameRuleEvent"; // TODO: 待事件系统移植后
import { TPS } from "../../../main/GlobalGameVariables";
import IMatrixRule from "../../../rule/IMatrixRule";
import { clearArray, identity, key, randomIn } from "../../../../common/utils";
import { BonusType, NativeBonusTypes } from "../registry/BonusRegistry";
import Tool from "../tool/Tool";
import { randomInWeightMap } from "../../../../common/utils";
import { iPoint } from "../../../../common/geometricTools";
import { JSObject, JSObjectValue, JSObjectifyMap, fastAddJSObjectifyMapProperty_dash, fastAddJSObjectifyMapProperty_dash2, fastAddJSObjectifyMapProperty_dashP, loadRecursiveCriterion_false, mapLoadJSObject, mapSaveJSObject, uniLoadJSObject, uniSaveJSObject } from "../../../../common/JSObjectify";
import { loadRecursiveCriterion_true } from '../../../../common/JSObjectify';
import Map_V1 from "../maps/Map_V1";
import MapStorageSparse from "../maps/MapStorageSparse";

/**
 * 存储一系列与游戏相关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * TODO: 「事件系统」有待完善
 */
export default class MatrixRule_V1 implements IMatrixRule {

	protected static preUpdateVariable<T>(rule: MatrixRule_V1, k: key, oldV: T, newV: T): boolean {
		if (oldV == newV) return false;
		rule.onVariableUpdate(k, oldV, newV);
		return true
	}

	/** 实现： */
	public get allKeys(): key[] {
		return MatrixRule_V1.ALL_RULE_KEYS
	}

	//============Static Variables============//
	//========Rules========//
	/**
	 * 格式：属性名/默认值/实例属性
	 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	public get objectifyMap(): JSObjectifyMap { return MatrixRule_V1.OBJECTIFY_MAP }

	//====Player====//
	protected static readonly d_playerCount: uint = 1;
	public static readonly key_playerCount: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'playerCount', MatrixRule_V1.d_playerCount,
	);
	protected _playerCount: uint = MatrixRule_V1.d_playerCount;
	public get playerCount(): uint { return this._playerCount; }
	public set playerCount(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_playerCount,
				this._playerCount, value
			)
		) this._playerCount = value;
	}

	protected static readonly d_AICount: uint = 3;
	public static readonly key_AICount: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'AICount',
		MatrixRule_V1.d_AICount,
	);
	protected _AICount: uint = MatrixRule_V1.d_AICount;
	public get AICount(): uint { return this._AICount; }
	public set AICount(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_AICount,
				this._AICount, value
			)
		) this._AICount = value;
	}

	//====Team====//
	/*
	 ! 【2023-09-24 11:43:13】已彻底移除此功能——不再从内部生成默认值
	 * 现在将「根据固定数量的『彩色队伍』『黑白队伍』生成『玩家队伍序列』」的行为迁移至「原生游戏机制」中
	 */

	// ! 【2023-09-24 11:22:44】现在「所有玩家队伍」成为一个「正式规则量」
	protected static readonly d_playerTeams: PlayerTeam[] = [];
	public static readonly key_playerTeams: key = fastAddJSObjectifyMapProperty_dash(
		this.OBJECTIFY_MAP,
		'playerTeams',
		Array<PlayerTeam>,
		// * 保存玩家数组：一一映射存储
		(arr: PlayerTeam[]): JSObject[] => arr.map(
			(pt: PlayerTeam): JSObject => uniSaveJSObject(
				pt, {}
			)
		),
		// * 加载玩家数组：一一映射加载
		(arr: JSObjectValue): PlayerTeam[] => {
			if (!Array.isArray(arr)) {
				console.error(`玩家队伍参数「${arr}」不是数组！`);
				return []
			}
			// 函数内对每个「玩家队伍的JS对象」都进行转换
			return arr.map(
				(value: JSObject): PlayerTeam => (
					value instanceof PlayerTeam ?
						value : // （没搞清楚是为何转换完成的）如果已经是转换后的对象，就不要再转换了
						uniLoadJSObject<PlayerTeam>(
							new PlayerTeam(),
							value
						)
				)
			)
		},
		loadRecursiveCriterion_false // ! 【2023-09-24 11:44:41】现在直接设置就行了，因为里边数据都已预处理完成
	);
	protected _playerTeams: PlayerTeam[] = MatrixRule_V1.d_playerTeams.slice();
	public get playerTeams(): PlayerTeam[] { return this._playerTeams; }

	/** Allows players change their teams by general means */
	protected static readonly d_allowPlayerChangeTeam: boolean = true;
	public static readonly key_allowPlayerChangeTeam: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'allowPlayerChangeTeam',
		MatrixRule_V1.d_allowPlayerChangeTeam,
	);
	protected _allowPlayerChangeTeam: boolean = MatrixRule_V1.d_allowPlayerChangeTeam;
	public get allowPlayerChangeTeam(): boolean { return this._allowPlayerChangeTeam; }
	public set allowPlayerChangeTeam(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_allowPlayerChangeTeam,
				this._allowPlayerChangeTeam, value
			)
		) this._allowPlayerChangeTeam = value;
	}

	//====GamePlay====//
	protected static readonly d_defaultHP: uint = 100;
	public static readonly key_defaultHP: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'defaultHP',
		MatrixRule_V1.d_defaultHP,
	);
	protected _defaultHP: uint = MatrixRule_V1.d_defaultHP;
	public get defaultHP(): uint { return this._defaultHP; }
	public set defaultHP(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_defaultHP,
				this._defaultHP, value
			)
		) this._defaultHP = value;
	}

	protected static readonly d_defaultMaxHP: uint = 100;
	public static readonly key_defaultMaxHP: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'defaultMaxHP',
		MatrixRule_V1.d_defaultMaxHP,
	);
	protected _defaultMaxHP: uint = MatrixRule_V1.d_defaultMaxHP;
	public get defaultMaxHP(): uint { return this._defaultMaxHP; }
	public set defaultMaxHP(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_defaultMaxHP,
				this._defaultMaxHP, value
			)
		) this._defaultMaxHP = value;
	}

	/** Use as a int with negative numbers means infinity */
	protected static readonly d_remainLivesPlayer: int = -1;
	public static readonly key_remainLivesPlayer: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'remainLivesPlayer',
		MatrixRule_V1.d_remainLivesPlayer,
	);
	protected _remainLivesPlayer: int = MatrixRule_V1.d_remainLivesPlayer;
	public get remainLivesPlayer(): int { return this._remainLivesPlayer; }
	public set remainLivesPlayer(value: int) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_remainLivesPlayer,
				this._remainLivesPlayer, value
			)
		) this._remainLivesPlayer = value;
	}

	protected static readonly d_remainLivesAI: int = -1;
	public static readonly key_remainLivesAI: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'remainLivesAI',
		MatrixRule_V1.d_remainLivesAI,
	);
	protected _remainLivesAI: int = MatrixRule_V1.d_remainLivesAI;
	public get remainLivesAI(): int { return this._remainLivesAI; }
	public set remainLivesAI(value: int) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_remainLivesAI,
				this._remainLivesAI, value
			)
		) this._remainLivesAI = value;
	}

	protected static readonly d_defaultRespawnTime: uint = 3 * TPS; // tick
	public static readonly key_defaultRespawnTime: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'defaultRespawnTime',
		MatrixRule_V1.d_defaultRespawnTime,
	);
	protected _defaultRespawnTime: uint = MatrixRule_V1.d_defaultRespawnTime;
	public get defaultRespawnTime(): uint { return this._defaultRespawnTime; }
	public set defaultRespawnTime(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_defaultRespawnTime,
				this._defaultRespawnTime, value
			)
		) this._defaultRespawnTime = value;
	}

	protected static readonly d_deadPlayerMoveTo: iPoint = new iPoint(-1, -1);
	public static readonly key_deadPlayerMoveTo: key = fastAddJSObjectifyMapProperty_dash2(
		this.OBJECTIFY_MAP,
		'deadPlayerMoveTo', this.d_deadPlayerMoveTo,
		identity, identity,
		loadRecursiveCriterion_true,
		(): iPoint => new iPoint(),
	);
	protected readonly _deadPlayerMoveTo: iPoint = MatrixRule_V1.d_deadPlayerMoveTo.copy();
	public get deadPlayerMoveTo(): iPoint { return this._deadPlayerMoveTo; }
	public set deadPlayerMoveTo(value: iPoint) {
		if (this._deadPlayerMoveTo.isEqual(value)) return;
		this.onVariableUpdate(MatrixRule_V1.key_deadPlayerMoveTo, this._deadPlayerMoveTo.copy(), value)
		this._deadPlayerMoveTo.copyFrom(value);
	}

	protected static readonly d_recordPlayerStats: boolean = true;
	public static readonly key_recordPlayerStats: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'recordPlayerStats',
		MatrixRule_V1.d_recordPlayerStats,
	);
	protected _recordPlayerStats: boolean = MatrixRule_V1.d_recordPlayerStats;
	public get recordPlayerStats(): boolean { return this._recordPlayerStats; }
	public set recordPlayerStats(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_recordPlayerStats,
				this._recordPlayerStats, value
			)
		) this._recordPlayerStats = value;
	}

	/**
	 * 记录玩家「身处『不能通过的方块』」（即「窒息」）时的惩罚伤害（整数）
	 * * 参见「原生游戏机制」的`computeFinalBlockDamage`
	 * 
	 * ! 这里的「窒息伤害」无视玩家护甲（机制使然）
	 */
	protected static readonly d_playerAsphyxiaDamage: int = - 15;
	public static readonly key_playerAsphyxiaDamage: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'playerAsphyxiaDamage',
		MatrixRule_V1.d_playerAsphyxiaDamage,
	);
	protected _playerAsphyxiaDamage: int = MatrixRule_V1.d_playerAsphyxiaDamage;
	public get playerAsphyxiaDamage(): int { return this._playerAsphyxiaDamage; }
	public set playerAsphyxiaDamage(value: int) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_playerAsphyxiaDamage,
				this._playerAsphyxiaDamage, value
			)
		) this._playerAsphyxiaDamage = value;
	}

	//====Bonus====//

	/** negative number means infinity */
	protected static readonly d_bonusBoxMaxCount: int = 8;
	public static readonly key_bonusBoxMaxCount: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'bonusBoxMaxCount',
		MatrixRule_V1.d_bonusBoxMaxCount,
	);
	protected _bonusBoxMaxCount: int = MatrixRule_V1.d_bonusBoxMaxCount;
	public get bonusBoxMaxCount(): int { return this._bonusBoxMaxCount; }
	public set bonusBoxMaxCount(value: int) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_bonusBoxMaxCount,
				this._bonusBoxMaxCount, value
			)
		) this._bonusBoxMaxCount = value;
	}

	protected static readonly d_bonusBoxSpawnChance: number = 1 / TPS / 8;
	public static readonly key_bonusBoxSpawnChance: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'bonusBoxSpawnChance',
		MatrixRule_V1.d_bonusBoxSpawnChance,
	);
	protected _bonusBoxSpawnChance: number = MatrixRule_V1.d_bonusBoxSpawnChance;
	public get bonusBoxSpawnChance(): number { return this._bonusBoxSpawnChance; }
	public set bonusBoxSpawnChance(value: number) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_bonusBoxSpawnChance,
				this._bonusBoxSpawnChance, value
			)
		) this._bonusBoxSpawnChance = value;
	}

	/**
	 * 奖励类型→权重
	 * * 只在「游戏加载」阶段被注册使用。不会在这里注入一丝默认值
	 */
	protected static readonly d_bonusTypePotentials: Map<BonusType, number> = new Map<BonusType, number>();
	public static readonly key_bonusTypePotentials: key = fastAddJSObjectifyMapProperty_dash(
		this.OBJECTIFY_MAP,
		'bonusTypePotentials', Map,
		(m: Map<BonusType, number>): JSObject => mapSaveJSObject(
			m,
			(type: BonusType, value: number): [JSObjectValue, JSObjectValue] => [
				type,
				value
			]
		),
		(v: JSObjectValue): Map<BonusType, number> => {
			if (v instanceof Map) return v;
			return mapLoadJSObject(
				v as JSObject,
				(bonusType: any, weight: any): [BonusType, number] => [
					String(bonusType), Number(weight)
				]
			)
		},
		loadRecursiveCriterion_true
	);
	protected _bonusTypePotentials: Map<BonusType, number> = MatrixRule_V1.d_bonusTypePotentials
	public get bonusTypePotentials(): Map<BonusType, number> { return this._bonusTypePotentials; }
	public set bonusTypePotentials(value: Map<BonusType, number>) {
		this._bonusTypePotentials = value
	}

	/** null means all type can be spawned and they have same weight */
	protected static readonly d_bonusBoxSpawnAfterPlayerDeath: boolean = true;
	public static readonly key_bonusBoxSpawnAfterPlayerDeath: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'bonusBoxSpawnAfterPlayerDeath',
		MatrixRule_V1.d_bonusBoxSpawnAfterPlayerDeath,
	);
	protected _bonusBoxSpawnAfterPlayerDeath: boolean = MatrixRule_V1.d_bonusBoxSpawnAfterPlayerDeath;
	public get bonusBoxSpawnAfterPlayerDeath(): boolean { return this._bonusBoxSpawnAfterPlayerDeath; }
	public set bonusBoxSpawnAfterPlayerDeath(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_bonusBoxSpawnAfterPlayerDeath,
				this._bonusBoxSpawnAfterPlayerDeath, value
			)
		) this._bonusBoxSpawnAfterPlayerDeath = value;
	}

	//====Bonus's Buff====//

	/** Determines bonus(type=buffs)'s amount of addition */
	protected static readonly d_bonusBuffAdditionAmount: uint = 1;
	public static readonly key_bonusBuffAdditionAmount: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'bonusBuffAdditionAmount',
		MatrixRule_V1.d_bonusBuffAdditionAmount,
	);
	protected _bonusBuffAdditionAmount: uint = MatrixRule_V1.d_bonusBuffAdditionAmount;
	public get bonusBuffAdditionAmount(): uint { return this._bonusBuffAdditionAmount; }
	public set bonusBuffAdditionAmount(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_bonusBuffAdditionAmount,
				this._bonusBuffAdditionAmount, value
			)
		) this._bonusBuffAdditionAmount = value;
	}

	/** Determines bonus(type=ADD_LIFE)'s amount of addition */
	protected static readonly d_bonusMaxHPAdditionAmount: uint = 5;
	public static readonly key_bonusMaxHPAdditionAmount: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'bonusMaxHPAdditionAmount',
		MatrixRule_V1.d_bonusMaxHPAdditionAmount,
	);
	protected _bonusMaxHPAdditionAmount: uint = MatrixRule_V1.d_bonusMaxHPAdditionAmount;
	public get bonusMaxHPAdditionAmount(): uint { return this._bonusMaxHPAdditionAmount; }
	public set bonusMaxHPAdditionAmount(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_bonusMaxHPAdditionAmount,
				this._bonusMaxHPAdditionAmount, value
			)
		) this._bonusMaxHPAdditionAmount = value;
	}

	//====Map====//

	/**
	 * 格式：地图→权重
	 * * 只在「游戏加载」阶段被注册使用。不会在这里注入一丝默认值
	 * * 默认是空映射
	 * 
	 * ! 【2023-09-17 11:41:26】现在一定需要初始化，即便只是「平均分布」
	 */
	protected static readonly d_mapRandomPotentials: Map<IMap, number> = new Map<IMap, number>();
	public static readonly key_mapRandomPotentials: key = fastAddJSObjectifyMapProperty_dash2(
		this.OBJECTIFY_MAP,
		'mapRandomPotentials', MatrixRule_V1.d_mapRandomPotentials,
		(m: Map<IMap, number>): JSObject => mapSaveJSObject(
			m,
			(map: IMap, value: number): [JSObjectValue, JSObjectValue] => [
				uniSaveJSObject(map, {}),
				value
			]
		),
		(v: JSObjectValue): Map<IMap, number> => {
			if (v instanceof Map) return v;
			return mapLoadJSObject(
				v as JSObject,
				(mapJSO: JSObject, weight: any): [IMap, number] => [
					uniLoadJSObject(
						Map_V1.getBlank(MapStorageSparse.getBlank()), // !【2023-09-24 15:31:16】目前还是使用Map_V1作存取媒介……需要一个统一的格式？
						mapJSO
					),
					weight
				]
			)
		},
		loadRecursiveCriterion_false
	);
	protected _mapRandomPotentials: Map<IMap, number> = MatrixRule_V1.d_mapRandomPotentials;
	public get mapRandomPotentials(): Map<IMap, number> { return this._mapRandomPotentials; }
	public set mapRandomPotentials(value: Map<IMap, number>) {
		this._mapRandomPotentials = value;
	}

	// 这些直接存储「地图」的数据，不好量化（或许需要一种「内部引用」的类型，以便「动态选择&绑定」）
	// !【2023-09-24 17:34:34】现在采用「值本位-原型复制」思路，每个地图都不强求使用「引用」，在加载时都「独一无二」
	protected static readonly d_initialMap: IMap | null = null;
	public static readonly key_initialMap: key = fastAddJSObjectifyMapProperty_dash(
		this.OBJECTIFY_MAP,
		'initialMap', undefined /* 使用undefined通配，以避免「检查是否实现接口」 */,
		identity, identity, // * 这里只需要设置「白板构造函数」
		(v: JSObjectValue): boolean => v !== null, // 仅在非空时递归解析
		(): IMap => Map_V1.getBlank(MapStorageSparse.getBlank()), // ! 还得靠这个「模板构造」
	);
	protected _initialMap: IMap | null = MatrixRule_V1.d_initialMap;
	public get initialMap(): IMap | null { return this._initialMap; }
	public set initialMap(value: IMap | null) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_initialMap,
				this._initialMap, value
			)
		) this._initialMap = value;
	}

	/**
	 * The time of the map transform loop.
	 * stranded by second.
	 */
	protected static readonly d_mapTransformTime: uint = 60;
	public static readonly key_mapTransformTime: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'mapTransformTime',
		MatrixRule_V1.d_mapTransformTime,
	);
	protected _mapTransformTime: uint = MatrixRule_V1.d_mapTransformTime;
	public get mapTransformTime(): uint { return this._mapTransformTime; }
	public set mapTransformTime(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_mapTransformTime,
				this._mapTransformTime, value
			)
		) this._mapTransformTime = value;
	}

	//====Tools====//
	protected static readonly d_enabledTools: Tool[] = [];
	public static readonly key_enabledTools: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'enabledTools',
		MatrixRule_V1.d_enabledTools,
	);
	protected _enabledTools: Tool[] = MatrixRule_V1.d_enabledTools;
	public get enabledTools(): Tool[] { return this._enabledTools; }
	public set enabledTools(value: Tool[]) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_enabledTools,
				this._enabledTools, value
			)
		) this._enabledTools = value;
	}
	/** 衍生getter */
	public get enabledToolCount(): int { return this._enabledTools.length; }

	/**
	 * 默认工具
	 * * 只在「游戏加载」阶段被注册使用。不会在这里注入一丝默认值
	 * 
	 * 特殊值：
	 * * `null`: 统一随机——随机一个工具，然后在加载时装备到所有玩家
	 * * `undefined`: 完全随机——对每个玩家都装备一个随机工具
	 * 
	 * ! 现在不使用`null`与`undefined`：难以JS对象化
	 */
	protected static readonly d_defaultTool: Tool | 'u-random' | 'c-random' = 'c-random'; // ? 是否要这样硬编码
	public static readonly key_defaultTool: key = fastAddJSObjectifyMapProperty_dash(
		this.OBJECTIFY_MAP,
		'defaultTool', Tool,
		identity, // 保存时自动处理
		identity, // 加载时自动处理
		(value: JSObjectValue): boolean => typeof value !== 'string',
		(): Tool => Tool.getBlank(),
	);
	protected _defaultTool: Tool | 'u-random' | 'c-random' = MatrixRule_V1.d_defaultTool;
	public get defaultTool(): Tool | 'u-random' | 'c-random' { return this._defaultTool; }
	public set defaultTool(value: Tool | 'u-random' | 'c-random') {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_defaultTool,
				this._defaultTool, value
			)
		) this._defaultTool = value;
	}

	protected static readonly d_maxLaserLength: uint = 32;
	public static readonly key_maxLaserLength: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'maxLaserLength',
		MatrixRule_V1.d_maxLaserLength,
	);
	protected _maxLaserLength: uint = MatrixRule_V1.d_maxLaserLength;
	public get maxLaserLength(): uint { return this._maxLaserLength; }
	public set maxLaserLength(value: uint) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_maxLaserLength,
				this._maxLaserLength, value
			)
		) this._maxLaserLength = value;
	}

	protected static readonly d_allowLaserThroughAllBlock: boolean = false;
	public static readonly key_allowLaserThroughAllBlock: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'allowLaserThroughAllBlock',
		MatrixRule_V1.d_allowLaserThroughAllBlock,
	);
	protected _allowLaserThroughAllBlock: boolean = MatrixRule_V1.d_allowLaserThroughAllBlock;
	public get allowLaserThroughAllBlock(): boolean { return this._allowLaserThroughAllBlock; }
	public set allowLaserThroughAllBlock(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_allowLaserThroughAllBlock,
				this._allowLaserThroughAllBlock, value
			)
		) this._allowLaserThroughAllBlock = value;
	}

	protected static readonly d_toolsNoCD: boolean = false;
	public static readonly key_toolsNoCD: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'toolsNoCD',
		MatrixRule_V1.d_toolsNoCD,
	);
	protected _toolsNoCD: boolean = MatrixRule_V1.d_toolsNoCD;
	public get toolsNoCD(): boolean { return this._toolsNoCD; }
	public set toolsNoCD(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_toolsNoCD,
				this._toolsNoCD, value
			)
		) this._toolsNoCD = value;
	}

	//====End&Victory====//
	protected static readonly d_allowTeamVictory: boolean = true;
	public static readonly key_allowTeamVictory: key = fastAddJSObjectifyMapProperty_dashP(
		this.OBJECTIFY_MAP,
		'allowTeamVictory',
		MatrixRule_V1.d_allowTeamVictory,
	);
	protected _allowTeamVictory: boolean = MatrixRule_V1.d_allowTeamVictory;
	public get allowTeamVictory(): boolean { return this._allowTeamVictory; }
	public set allowTeamVictory(value: boolean) {
		if (
			MatrixRule_V1.preUpdateVariable(
				this, MatrixRule_V1.key_allowTeamVictory,
				this._allowTeamVictory, value
			)
		) this._allowTeamVictory = value;
	}

	/**
	 * ! 必须在所有属性初始化后再初始化「所有规则名」
	 * * 初衷：避免「规则名」带下划线
	 */
	public static readonly ALL_RULE_KEYS: key[] = Object.getOwnPropertyNames(this.OBJECTIFY_MAP).map(
		// * 映射到在JS对象中呈现的键
		(key: string): key => this.OBJECTIFY_MAP[key].JSObject_key
	)

	//========Preview========//

	/** 默认的模板常量 */
	public static readonly TEMPLATE: MatrixRule_V1 = new MatrixRule_V1();

	//============Constructor & Destructor============//
	public constructor() {
		// this.loadAsDefault(); // ! 现在直接使用属性默认值了
	}

	public destructor(): void {
		this._bonusTypePotentials.clear(); // ! 清除所有引用
		this._mapRandomPotentials.clear(); // ! 清除所有引用
		clearArray(this._enabledTools);
		clearArray(this._playerTeams);
	}

	/** 实现：直接访问内部变量 */
	public hasRule(key: key): boolean {
		return this.hasOwnProperty(`_${key}`);
	}

	/** 实现：直接访问内部变量，但使用「非空访问」运算符 */
	public getRule<T>(key: key): T | undefined {
		return (this as any)?.[`_${key}`];
	}

	/** 实现：直接访问内部变量 */
	public safeGetRule<T>(key: key): T {
		if (this.hasRule(key))
			return ((this as any)[`_${key}`] as T);
		throw new Error(`规则「${key}」未找到`);
	}

	/** 实现：直接访问内部变量 */
	public setRule<T>(key: key, value: T): boolean {
		if (!this.hasRule(key)) {
			console.error(`规则「${key}」未找到`);
			return false;
		}
		(this as any)[`_${key}`] = value;
		return true;
	}

	//============Instance Functions============//
	public reloadDefault(): void {
		// ? 考虑完善copyFrom方法
		uniLoadJSObject(this, uniSaveJSObject(MatrixRule_V1.TEMPLATE));
		// this.copyFrom(GameRule_V1.TEMPLATE)
	}

	public onVariableUpdate(key: key, oldValue: any, newValue: any): void {
		// TODO: 等待事件机制完善
		// this.dispatchEvent(
		// 	new GameRuleEvent(GameRuleEvent.VARIABLE_UPDATE, oldValue, newValue)
		// );
	}
}
