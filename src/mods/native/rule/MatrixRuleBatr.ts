/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { uint, int } from '../../../legacy/AS3Legacy'
import IMap from '../../../api/server/map/IMap'
import PlayerTeam from '../../BaTS/entity/player/team/PlayerTeam'
import { TPS } from '../../../api/server/main/GlobalWorldVariables'
import { clearArray, identity, key } from '../../../common/utils'
import { BonusType } from '../../BaTS/registry/BonusRegistry'
import Tool from '../../BaTS/tool/Tool'
import { iPoint } from '../../../common/geometricTools'
import {
	JSObject,
	JSObjectValue,
	JSObjectifyMap,
	fastAddJSObjectifyMapProperty_dash,
	fastAddJSObjectifyMapProperty_dash2,
	fastAddJSObjectifyMapProperty_dashP,
	loadRecursiveCriterion_false,
	mapLoadJSObject,
	mapSaveJSObject,
	uniLoadJSObject,
	uniSaveJSObject,
} from '../../../common/JSObjectify'
import { loadRecursiveCriterion_true } from '../../../common/JSObjectify'
import Map_V1 from '../maps/Map_V1'
import MapStorageSparse from '../maps/MapStorageSparse'
import MatrixRule_V1 from './MatrixRule_V1'

/**
 * 存储一系列与世界相关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * TODO: 「事件系统」有待完善
 */
export default class MatrixRuleBatr extends MatrixRule_V1 {
	/**
	 * 格式：
	 * * 默认值：d_属性名
	 * * 对象化键：key_属性名
	 * * 实例属性：_规则名
	 * * getter&setter
	 */
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	/** @override 现在导向自身类的静态常量 */
	override get objectifyMap(): JSObjectifyMap {
		return MatrixRuleBatr.OBJECTIFY_MAP
	}

	//========Rules========//

	//====Player====//
	protected static readonly d_playerCount: uint = 1
	public static readonly key_playerCount: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'playerCount',
			MatrixRuleBatr.d_playerCount
		)
	protected _playerCount: uint = MatrixRuleBatr.d_playerCount
	/**
	 * 总玩家数量
	 * * （旧AS3遗留）在世界加载时预置的玩家数量
	 *
	 * !【2023-10-10 17:02:04】目前情况：无用，意义待重新考量
	 */
	public get playerCount(): uint {
		return this._playerCount
	}
	public set playerCount(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_playerCount,
				this._playerCount,
				value
			)
		)
			this._playerCount = value
	}

	protected static readonly d_AICount: uint = 3
	public static readonly key_AICount: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'AICount',
			MatrixRuleBatr.d_AICount
		)
	/**
	 * 总AI数量
	 * * （旧AS3遗留）在世界加载时预置的AI数量
	 *
	 * !【2023-10-10 17:02:04】目前情况：无用，意义待重新考量
	 */
	protected _AICount: uint = MatrixRuleBatr.d_AICount
	public get AICount(): uint {
		return this._AICount
	}
	public set AICount(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_AICount,
				this._AICount,
				value
			)
		)
			this._AICount = value
	}

	//====Team====//
	protected static readonly d_playerTeams: PlayerTeam[] = []
	public static readonly key_playerTeams: key =
		fastAddJSObjectifyMapProperty_dash(
			this.OBJECTIFY_MAP,
			'playerTeams',
			Array<PlayerTeam>,
			// * 保存玩家数组：一一映射存储
			(arr: PlayerTeam[]): JSObject[] =>
				arr.map((pt: PlayerTeam): JSObject => uniSaveJSObject(pt, {})),
			// * 加载玩家数组：一一映射加载
			(arr: JSObjectValue): PlayerTeam[] => {
				if (!Array.isArray(arr)) {
					console.error(`玩家队伍参数「${arr}」不是数组！`)
					return []
				}
				// 函数内对每个「玩家队伍的JS对象」都进行转换
				return arr.map(
					(value: JSObject): PlayerTeam =>
						value instanceof PlayerTeam
							? value // （没搞清楚是为何转换完成的）如果已经是转换后的对象，就不要再转换了
							: uniLoadJSObject<PlayerTeam>(
									new PlayerTeam(),
									value
							  )
				)
			},
			loadRecursiveCriterion_false // ! 【2023-09-24 11:44:41】现在直接设置就行了，因为里边数据都已预处理完成
		)
	protected _playerTeams: PlayerTeam[] = MatrixRuleBatr.d_playerTeams.slice()
	/**
	 * 存储的玩家队伍
	 * ! 【2023-09-24 11:43:13】已彻底移除此功能——不再从内部生成默认值
	 * * 现在将「根据固定数量的『彩色队伍』『黑白队伍』生成『玩家队伍序列』」的行为迁移至「原生世界机制」中
	 * ! 【2023-09-24 11:22:44】现在「所有玩家队伍」成为一个「正式规则量」
	 */
	public get playerTeams(): PlayerTeam[] {
		return this._playerTeams
	}

	protected static readonly d_allowPlayerChangeTeam: boolean = true
	public static readonly key_allowPlayerChangeTeam: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'allowPlayerChangeTeam',
			MatrixRuleBatr.d_allowPlayerChangeTeam
		)
	protected _allowPlayerChangeTeam: boolean =
		MatrixRuleBatr.d_allowPlayerChangeTeam
	/**
	 * 是否允许玩家（使用一般方式）改变其队伍
	 */
	public get allowPlayerChangeTeam(): boolean {
		return this._allowPlayerChangeTeam
	}
	public set allowPlayerChangeTeam(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_allowPlayerChangeTeam,
				this._allowPlayerChangeTeam,
				value
			)
		)
			this._allowPlayerChangeTeam = value
	}

	//====World====//
	protected static readonly d_defaultHP: uint = 100
	public static readonly key_defaultHP: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'defaultHP',
			MatrixRuleBatr.d_defaultHP
		)
	protected _defaultHP: uint = MatrixRuleBatr.d_defaultHP
	/**
	 * 玩家的默认生命值
	 */
	public get defaultHP(): uint {
		return this._defaultHP
	}
	public set defaultHP(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_defaultHP,
				this._defaultHP,
				value
			)
		)
			this._defaultHP = value
	}

	protected static readonly d_defaultMaxHP: uint = 100
	public static readonly key_defaultMaxHP: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'defaultMaxHP',
			MatrixRuleBatr.d_defaultMaxHP
		)
	protected _defaultMaxHP: uint = MatrixRuleBatr.d_defaultMaxHP
	/**
	 * 玩家的默认最大生命值
	 */
	public get defaultMaxHP(): uint {
		return this._defaultMaxHP
	}
	public set defaultMaxHP(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_defaultMaxHP,
				this._defaultMaxHP,
				value
			)
		)
			this._defaultMaxHP = value
	}

	/** Use as a int with negative numbers means infinity */
	protected static readonly d_remainLivesPlayer: int = -1
	public static readonly key_remainLivesPlayer: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'remainLivesPlayer',
			MatrixRuleBatr.d_remainLivesPlayer
		)
	protected _remainLivesPlayer: int = MatrixRuleBatr.d_remainLivesPlayer
	/**
	 * 玩家默认拥有的「生命数」
	 */
	public get remainLivesPlayer(): int {
		return this._remainLivesPlayer
	}
	public set remainLivesPlayer(value: int) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_remainLivesPlayer,
				this._remainLivesPlayer,
				value
			)
		)
			this._remainLivesPlayer = value
	}

	protected static readonly d_remainLivesAI: int = -1
	public static readonly key_remainLivesAI: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'remainLivesAI',
			MatrixRuleBatr.d_remainLivesAI
		)
	protected _remainLivesAI: int = MatrixRuleBatr.d_remainLivesAI
	/**
	 * （AS3版本遗留）AI玩家默认的「剩余生命数」
	 */
	public get remainLivesAI(): int {
		return this._remainLivesAI
	}
	public set remainLivesAI(value: int) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_remainLivesAI,
				this._remainLivesAI,
				value
			)
		)
			this._remainLivesAI = value
	}

	protected static readonly d_defaultRespawnTime: uint = 3 * TPS // tick
	public static readonly key_defaultRespawnTime: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'defaultRespawnTime',
			MatrixRuleBatr.d_defaultRespawnTime
		)
	protected _defaultRespawnTime: uint = MatrixRuleBatr.d_defaultRespawnTime
	/**
	 * 玩家默认的重生时长
	 */
	public get defaultRespawnTime(): uint {
		return this._defaultRespawnTime
	}
	public set defaultRespawnTime(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_defaultRespawnTime,
				this._defaultRespawnTime,
				value
			)
		)
			this._defaultRespawnTime = value
	}

	protected static readonly d_deadPlayerMoveTo: iPoint = new iPoint() // !【2023-10-10 17:07:51】现在不默认其为二维了
	public static readonly key_deadPlayerMoveTo: key =
		fastAddJSObjectifyMapProperty_dash2(
			this.OBJECTIFY_MAP,
			'deadPlayerMoveTo',
			this.d_deadPlayerMoveTo,
			identity,
			identity,
			loadRecursiveCriterion_true,
			(): iPoint => new iPoint()
		)
	protected readonly _deadPlayerMoveTo: iPoint =
		MatrixRuleBatr.d_deadPlayerMoveTo.copy()
	/**
	 * 玩家死亡后移动到的地点
	 */
	public get deadPlayerMoveTo(): iPoint {
		return this._deadPlayerMoveTo
	}
	public set deadPlayerMoveTo(value: iPoint) {
		if (this._deadPlayerMoveTo.isEqual(value)) return
		this.onVariableUpdate(
			MatrixRuleBatr.key_deadPlayerMoveTo,
			this._deadPlayerMoveTo.copy(),
			value
		)
		this._deadPlayerMoveTo.copyFrom(value)
	}

	protected static readonly d_recordPlayerStats: boolean = true
	public static readonly key_recordPlayerStats: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'recordPlayerStats',
			MatrixRuleBatr.d_recordPlayerStats
		)
	protected _recordPlayerStats: boolean = MatrixRuleBatr.d_recordPlayerStats
	/**
	 * 是否记录玩家统计
	 */
	public get recordPlayerStats(): boolean {
		return this._recordPlayerStats
	}
	public set recordPlayerStats(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_recordPlayerStats,
				this._recordPlayerStats,
				value
			)
		)
			this._recordPlayerStats = value
	}

	protected static readonly d_playerAsphyxiaDamage: int = -15
	public static readonly key_playerAsphyxiaDamage: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'playerAsphyxiaDamage',
			MatrixRuleBatr.d_playerAsphyxiaDamage
		)
	protected _playerAsphyxiaDamage: int = MatrixRuleBatr.d_playerAsphyxiaDamage
	/**
	 * 记录玩家「身处『不能通过的方块』」（即「窒息」）时的惩罚伤害（整数）
	 * * 参见「原生世界机制」的`computeFinalBlockDamage`
	 *
	 * ! 这里的「窒息伤害」无视玩家护甲（机制使然）
	 */
	public get playerAsphyxiaDamage(): int {
		return this._playerAsphyxiaDamage
	}
	public set playerAsphyxiaDamage(value: int) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_playerAsphyxiaDamage,
				this._playerAsphyxiaDamage,
				value
			)
		)
			this._playerAsphyxiaDamage = value
	}

	//====Bonus====//

	protected static readonly d_bonusBoxMaxCount: int = 8
	public static readonly key_bonusBoxMaxCount: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bonusBoxMaxCount',
			MatrixRuleBatr.d_bonusBoxMaxCount
		)
	protected _bonusBoxMaxCount: int = MatrixRuleBatr.d_bonusBoxMaxCount
	/**
	 * 世界环境中允许（奖励箱生成器）生成的「最大奖励箱数量」
	 * * 负数⇒无限生成
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	public get bonusBoxMaxCount(): int {
		return this._bonusBoxMaxCount
	}
	public set bonusBoxMaxCount(value: int) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bonusBoxMaxCount,
				this._bonusBoxMaxCount,
				value
			)
		)
			this._bonusBoxMaxCount = value
	}

	protected static readonly d_bonusBoxSpawnChance: number = 1 / TPS / 8
	public static readonly key_bonusBoxSpawnChance: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bonusBoxSpawnChance',
			MatrixRuleBatr.d_bonusBoxSpawnChance
		)
	protected _bonusBoxSpawnChance: number =
		MatrixRuleBatr.d_bonusBoxSpawnChance
	/**
	 * 世界环境中在每个游戏刻尝试生成奖励箱的几率
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	public get bonusBoxSpawnChance(): number {
		return this._bonusBoxSpawnChance
	}
	public set bonusBoxSpawnChance(value: number) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bonusBoxSpawnChance,
				this._bonusBoxSpawnChance,
				value
			)
		)
			this._bonusBoxSpawnChance = value
	}

	protected static readonly d_bonusTypePotentials: Map<BonusType, number> =
		new Map<BonusType, number>()
	public static readonly key_bonusTypePotentials: key =
		fastAddJSObjectifyMapProperty_dash(
			this.OBJECTIFY_MAP,
			'bonusTypePotentials',
			Map,
			(m: Map<BonusType, number>): JSObject =>
				mapSaveJSObject(
					m,
					(
						type: BonusType,
						value: number
					): [JSObjectValue, JSObjectValue] => [type, value]
				),
			(v: JSObjectValue): Map<BonusType, number> => {
				if (v instanceof Map) return v
				return mapLoadJSObject(
					v as JSObject,
					(
						bonusType: unknown,
						weight: unknown
					): [BonusType, number] => [
						String(bonusType),
						Number(weight),
					]
				)
			},
			loadRecursiveCriterion_true
		)
	protected _bonusTypePotentials: Map<BonusType, number> =
		MatrixRuleBatr.d_bonusTypePotentials
	/**
	 * 奖励类型→权重
	 * * 只在「世界加载」阶段被注册使用。不会在这里注入一丝默认值
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	public get bonusTypePotentials(): Map<BonusType, number> {
		return this._bonusTypePotentials
	}
	public set bonusTypePotentials(value: Map<BonusType, number>) {
		this._bonusTypePotentials = value
	}

	protected static readonly d_bonusBoxSpawnAfterPlayerDeath: boolean = true
	public static readonly key_bonusBoxSpawnAfterPlayerDeath: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bonusBoxSpawnAfterPlayerDeath',
			MatrixRuleBatr.d_bonusBoxSpawnAfterPlayerDeath
		)
	protected _bonusBoxSpawnAfterPlayerDeath: boolean =
		MatrixRuleBatr.d_bonusBoxSpawnAfterPlayerDeath
	/** 奖励箱是否在玩家死亡后（在当前位置）生成 */
	public get bonusBoxSpawnAfterPlayerDeath(): boolean {
		return this._bonusBoxSpawnAfterPlayerDeath
	}
	public set bonusBoxSpawnAfterPlayerDeath(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bonusBoxSpawnAfterPlayerDeath,
				this._bonusBoxSpawnAfterPlayerDeath,
				value
			)
		)
			this._bonusBoxSpawnAfterPlayerDeath = value
	}

	//====Bonus's Buff====//

	protected static readonly d_bonusBuffAdditionAmount: uint = 1
	public static readonly key_bonusBuffAdditionAmount: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bonusBuffAdditionAmount',
			MatrixRuleBatr.d_bonusBuffAdditionAmount
		)
	protected _bonusBuffAdditionAmount: uint =
		MatrixRuleBatr.d_bonusBuffAdditionAmount
	/** （AS3遗留）在玩家获得奖励箱后，玩家「加成」受到提升的数量 */
	public get bonusBuffAdditionAmount(): uint {
		return this._bonusBuffAdditionAmount
	}
	public set bonusBuffAdditionAmount(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bonusBuffAdditionAmount,
				this._bonusBuffAdditionAmount,
				value
			)
		)
			this._bonusBuffAdditionAmount = value
	}

	protected static readonly d_bonusMaxHPAdditionAmount: uint = 5
	public static readonly key_bonusMaxHPAdditionAmount: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bonusMaxHPAdditionAmount',
			MatrixRuleBatr.d_bonusMaxHPAdditionAmount
		)
	protected _bonusMaxHPAdditionAmount: uint =
		MatrixRuleBatr.d_bonusMaxHPAdditionAmount
	/** 在玩家获得「增加最大生命值」后，最大生命值提升的数量 */
	public get bonusMaxHPAdditionAmount(): uint {
		return this._bonusMaxHPAdditionAmount
	}
	public set bonusMaxHPAdditionAmount(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bonusMaxHPAdditionAmount,
				this._bonusMaxHPAdditionAmount,
				value
			)
		)
			this._bonusMaxHPAdditionAmount = value
	}

	//====Map====//

	protected static readonly d_mapRandomPotentials: Map<IMap, number> =
		new Map<IMap, number>()
	public static readonly key_mapRandomPotentials: key =
		fastAddJSObjectifyMapProperty_dash2(
			this.OBJECTIFY_MAP,
			'mapRandomPotentials',
			MatrixRuleBatr.d_mapRandomPotentials,
			(m: Map<IMap, number>): JSObject =>
				mapSaveJSObject(
					m,
					(
						map: IMap,
						value: number
					): [JSObjectValue, JSObjectValue] => [
						uniSaveJSObject(map, {}),
						value,
					]
				),
			(v: JSObjectValue): Map<IMap, number> => {
				if (v instanceof Map) return v
				return mapLoadJSObject(
					v as JSObject,
					(mapJSO: JSObject, weight: unknown): [IMap, number] => [
						uniLoadJSObject(
							Map_V1.getBlank(MapStorageSparse.getBlank()), // !【2023-09-24 15:31:16】目前还是使用Map_V1作存取媒介……需要一个统一的格式？
							mapJSO
						),
						Number(weight),
					]
				)
			},
			loadRecursiveCriterion_false
		)
	protected _mapRandomPotentials: Map<IMap, number> =
		MatrixRuleBatr.d_mapRandomPotentials
	/**
	 * 格式：地图→权重
	 * * 只在「世界加载」阶段被注册使用。不会在这里注入一丝默认值
	 * * 默认是空映射
	 *
	 * ! 【2023-09-17 11:41:26】现在一定需要初始化，即便只是「平均分布」
	 */
	public get mapRandomPotentials(): Map<IMap, number> {
		return this._mapRandomPotentials
	}
	public set mapRandomPotentials(value: Map<IMap, number>) {
		this._mapRandomPotentials = value
	}

	// 这些直接存储「地图」的数据，不好量化（或许需要一种「内部引用」的类型，以便「动态选择&绑定」）
	// !【2023-09-24 17:34:34】现在采用「值本位-原型复制」思路，每个地图都不强求使用「引用」，在加载时都「独一无二」
	protected static readonly d_initialMap: IMap | null = null
	public static readonly key_initialMap: key =
		fastAddJSObjectifyMapProperty_dash(
			this.OBJECTIFY_MAP,
			'initialMap',
			undefined /* 使用undefined通配，以避免「检查是否实现接口」 */,
			identity,
			identity, // * 这里只需要设置「白板构造函数」
			(v: JSObjectValue): boolean => v !== null, // 仅在非空时递归解析
			(): IMap => Map_V1.getBlank(MapStorageSparse.getBlank()) // ! 还得靠这个「模板构造」
		)
	protected _initialMap: IMap | null = MatrixRuleBatr.d_initialMap
	public get initialMap(): IMap | null {
		return this._initialMap
	}
	public set initialMap(value: IMap | null) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_initialMap,
				this._initialMap,
				value
			)
		)
			this._initialMap = value
	}

	protected static readonly d_mapTransformTime: uint = 60
	public static readonly key_mapTransformTime: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'mapTransformTime',
			MatrixRuleBatr.d_mapTransformTime
		)
	protected _mapTransformTime: uint = MatrixRuleBatr.d_mapTransformTime
	/**
	 * The time of the map transform loop.
	 * stranded by second.
	 */
	public get mapTransformTime(): uint {
		return this._mapTransformTime
	}
	public set mapTransformTime(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_mapTransformTime,
				this._mapTransformTime,
				value
			)
		)
			this._mapTransformTime = value
	}

	public static readonly d_blockRandomTickDensity: uint = 576
	public static readonly key_blockRandomTickDensity: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'blockRandomTickDensity',
			MatrixRuleBatr.d_blockRandomTickDensity
		)
	protected _blockRandomTickDensity: uint =
		MatrixRuleBatr.d_blockRandomTickDensity
	/**
	 * 母体中「方块随机刻」的密度
	 * * 单位：n个/576个方块
	 *   * 此中之「576」来自AS3版本的默认地图尺寸
	 *
	 * @default 每个游戏刻在每个方块上触发一个「方块随机刻」
	 */
	public get blockRandomTickDensity(): uint {
		return this._blockRandomTickDensity
	}
	public set blockRandomTickDensity(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_blockRandomTickDensity,
				this._blockRandomTickDensity,
				value
			)
		)
			this._blockRandomTickDensity = value
	}

	//====Tools====//
	protected static readonly d_enabledTools: Tool[] = []
	public static readonly key_enabledTools: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'enabledTools',
			MatrixRuleBatr.d_enabledTools
		)
	protected _enabledTools: Tool[] = MatrixRuleBatr.d_enabledTools
	/**
	 * 所有启用的工具（原型对象）
	 */
	public get enabledTools(): Tool[] {
		return this._enabledTools
	}
	public set enabledTools(value: Tool[]) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_enabledTools,
				this._enabledTools,
				value
			)
		)
			this._enabledTools = value
	}
	/** 衍生getter */
	public get enabledToolCount(): int {
		return this._enabledTools.length
	}

	/**
	 * 默认工具
	 * * 只在「世界加载」阶段被注册使用。不会在这里注入一丝默认值
	 *
	 * 特殊值：
	 * * `null`: 统一随机——随机一个工具，然后在加载时装备到所有玩家
	 * * `undefined`: 完全随机——对每个玩家都装备一个随机工具
	 *
	 * ! 现在不使用`null`与`undefined`：难以JS对象化
	 */
	protected static readonly d_defaultTool: Tool | 'u-random' | 'c-random' =
		'c-random' // ? 是否要这样硬编码
	public static readonly key_defaultTool: key =
		fastAddJSObjectifyMapProperty_dash(
			this.OBJECTIFY_MAP,
			'defaultTool',
			Tool,
			identity, // 保存时自动处理
			identity, // 加载时自动处理
			(value: JSObjectValue): boolean => typeof value !== 'string',
			(): Tool => Tool.getBlank()
		)
	protected _defaultTool: Tool | 'u-random' | 'c-random' =
		MatrixRuleBatr.d_defaultTool
	public get defaultTool(): Tool | 'u-random' | 'c-random' {
		return this._defaultTool
	}
	public set defaultTool(value: Tool | 'u-random' | 'c-random') {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_defaultTool,
				this._defaultTool,
				value
			)
		)
			this._defaultTool = value
	}

	protected static readonly d_maxLaserLength: uint = 32
	public static readonly key_maxLaserLength: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'maxLaserLength',
			MatrixRuleBatr.d_maxLaserLength
		)
	protected _maxLaserLength: uint = MatrixRuleBatr.d_maxLaserLength
	/**
	 * 决定世界中生成的激光的「默认长度」
	 */
	public get maxLaserLength(): uint {
		return this._maxLaserLength
	}
	public set maxLaserLength(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_maxLaserLength,
				this._maxLaserLength,
				value
			)
		)
			this._maxLaserLength = value
	}

	protected static readonly d_bulletMaxLife: uint = 3200
	public static readonly key_bulletMaxLife: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'bulletMaxLife',
			MatrixRuleBatr.d_bulletMaxLife
		)
	protected _bulletMaxLife: uint = MatrixRuleBatr.d_bulletMaxLife
	/**
	 * 决定世界中生成的子弹的「默认生命周期」
	 * * 单位：世界刻（100世界刻=1秒）
	 * * 默认值：32秒
	 * * 作用：子弹会在生成后最长「默认生命周期」个世界刻后自行消失
	 *   * 【2023-10-12 16:16:23】添加缘由：避免「不断在有限无界的地图中循环」而产生大量子弹，进而导致卡顿
	 */
	public get bulletMaxLife(): uint {
		return this._bulletMaxLife
	}
	public set bulletMaxLife(value: uint) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_bulletMaxLife,
				this._bulletMaxLife,
				value
			)
		)
			this._bulletMaxLife = value
	}

	protected static readonly d_allowLaserThroughAllBlock: boolean = false
	public static readonly key_allowLaserThroughAllBlock: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'allowLaserThroughAllBlock',
			MatrixRuleBatr.d_allowLaserThroughAllBlock
		)
	protected _allowLaserThroughAllBlock: boolean =
		MatrixRuleBatr.d_allowLaserThroughAllBlock
	public get allowLaserThroughAllBlock(): boolean {
		return this._allowLaserThroughAllBlock
	}
	public set allowLaserThroughAllBlock(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_allowLaserThroughAllBlock,
				this._allowLaserThroughAllBlock,
				value
			)
		)
			this._allowLaserThroughAllBlock = value
	}

	protected static readonly d_toolsNoCD: boolean = false
	public static readonly key_toolsNoCD: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'toolsNoCD',
			MatrixRuleBatr.d_toolsNoCD
		)
	protected _toolsNoCD: boolean = MatrixRuleBatr.d_toolsNoCD
	public get toolsNoCD(): boolean {
		return this._toolsNoCD
	}
	public set toolsNoCD(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_toolsNoCD,
				this._toolsNoCD,
				value
			)
		)
			this._toolsNoCD = value
	}

	//====End&Victory====//
	protected static readonly d_allowTeamVictory: boolean = true
	public static readonly key_allowTeamVictory: key =
		fastAddJSObjectifyMapProperty_dashP(
			this.OBJECTIFY_MAP,
			'allowTeamVictory',
			MatrixRuleBatr.d_allowTeamVictory
		)
	protected _allowTeamVictory: boolean = MatrixRuleBatr.d_allowTeamVictory
	public get allowTeamVictory(): boolean {
		return this._allowTeamVictory
	}
	public set allowTeamVictory(value: boolean) {
		if (
			MatrixRuleBatr.preUpdateVariable(
				this,
				MatrixRuleBatr.key_allowTeamVictory,
				this._allowTeamVictory,
				value
			)
		)
			this._allowTeamVictory = value
	}

	/**
	 * ! 必须在所有属性初始化后再初始化「所有规则名」
	 * * 初衷：避免「规则名」带下划线
	 */
	public static readonly ALL_RULE_KEYS: key[] = Object.getOwnPropertyNames(
		this.OBJECTIFY_MAP
	).map(
		// * 映射到在JS对象中呈现的键
		(key: string): key => this.OBJECTIFY_MAP[key].JSObject_key
	)
	/** @override 覆盖：导向自身静态常量 */
	override get allKeys(): key[] {
		return MatrixRuleBatr.ALL_RULE_KEYS
	}

	//========Preview========//

	/** 默认的模板常量 */
	public static readonly TEMPLATE: MatrixRuleBatr = new MatrixRuleBatr()

	//============Constructor & Destructor============//
	public constructor() {
		super()
		// this.loadAsDefault(); // ! 现在直接使用属性默认值了
	}

	public destructor(): void {
		this._bonusTypePotentials.clear() // ! 清除所有引用
		this._mapRandomPotentials.clear() // ! 清除所有引用
		clearArray(this._enabledTools)
		clearArray(this._playerTeams)
		super.destructor()
	}

	//============Instance Functions============//
	public reloadDefault(): void {
		super.reloadDefault()
		// ? 考虑完善copyFrom方法
		uniLoadJSObject(this, uniSaveJSObject(MatrixRuleBatr.TEMPLATE))
		// this.copyFrom(WorldRule_V1.TEMPLATE);
	}

	public onVariableUpdate(
		key: key,
		oldValue: unknown,
		newValue: unknown
	): void {
		super.onVariableUpdate(key, oldValue, newValue)
		// TODO: 等待事件机制完善
		// this.dispatchEvent(
		// 	new WorldRuleEvent(WorldRuleEvent.VARIABLE_UPDATE, oldValue, newValue)
		// );
	}
}
