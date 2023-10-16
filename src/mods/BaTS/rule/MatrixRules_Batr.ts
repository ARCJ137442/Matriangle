import { uint, int } from '../../../legacy/AS3Legacy'
import PlayerTeam from '../entity/player/team/PlayerTeam'
import { TPS } from '../../../api/server/main/GlobalWorldVariables'
import { identity, key } from '../../../common/utils'
import { BonusType } from '../registry/BonusRegistry'
import Tool from '../tool/Tool'
import {
	JSObject,
	JSObjectValue,
	JSObjectifyMap,
	fastAddJSObjectifyMapProperty_dash,
	fastAddJSObjectifyMapProperty_dashP,
	loadRecursiveCriterion_false,
	mapLoadJSObject,
	mapSaveJSObject,
	uniLoadJSObject,
	uniSaveJSObject,
} from '../../../common/JSObjectify'
import { loadRecursiveCriterion_true } from '../../../common/JSObjectify'
import { RuleDefaultValueMap } from '../../../api/server/rule/IMatrixRule'

/**
 * 存储与「原生机制」有关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * * 【2023-10-16 21:54:36】目前把「所有规则名」当作一个类似「配置文件常量池」的容器
 *   * 不再因「使用实例属性」绑定键值
 */
export namespace MatrixRules_Batr {
	/**
	 * 格式：
	 * * 默认值：d_属性名
	 * * 对象化键：key_属性名
	 * * 实例属性：_规则名
	 * * getter&setter
	 */
	export const OBJECTIFY_MAP: JSObjectifyMap = {}
	/**
	 * （暂定的）「默认值映射」
	 * *【2023-10-16 22:56:50】用于在「不直接依赖实例变量」的情况下「自动加载默认值」
	 */
	export const DEFAULT_VALUE_MAP: RuleDefaultValueMap = new Map()

	//========Rules========//

	//====Player====//
	export const d_playerTeams: PlayerTeam[] = []
	/**
	 * 存储的玩家队伍
	 * ! 【2023-09-24 11:43:13】已彻底移除此功能——不再从内部生成默认值
	 * * 现在将「根据固定数量的『彩色队伍』『黑白队伍』生成『玩家队伍序列』」的行为迁移至「原生世界机制」中
	 *
	 * ! 【2023-09-24 11:22:44】现在「所有玩家队伍」成为一个「正式规则量」
	 */
	export const key_playerTeams: key = fastAddJSObjectifyMapProperty_dash(
		OBJECTIFY_MAP,
		'playerTeams',
		Array<PlayerTeam>,
		// * 保存玩家数组：一一映射存储
		(arr: PlayerTeam[]): JSObject[] =>
			arr.map((pt: PlayerTeam): JSObject => uniSaveJSObject(pt, {})),
		// * 加载玩家数组：一一映射加载
		(arr: JSObjectValue): PlayerTeam[] => {
			if (!Array.isArray(arr)) {
				console.error(`玩家队伍参数「${arr?.toString()}」不是数组！`)
				return []
			}
			// 函数内对每个「玩家队伍的JS对象」都进行转换
			return arr.map(
				(value: JSObject): PlayerTeam =>
					value instanceof PlayerTeam
						? value // （没搞清楚是为何转换完成的）如果已经是转换后的对象，就不要再转换了
						: uniLoadJSObject<PlayerTeam>(new PlayerTeam(), value)
			)
		},
		loadRecursiveCriterion_false // ! 【2023-09-24 11:44:41】现在直接设置就行了，因为里边数据都已预处理完成
	)
	DEFAULT_VALUE_MAP.set(key_playerTeams, d_playerTeams)

	export const d_allowPlayerChangeTeam: boolean = true
	/**
	 * 是否允许玩家（使用一般方式）改变其队伍
	 */
	export const key_allowPlayerChangeTeam: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'allowPlayerChangeTeam',
			d_allowPlayerChangeTeam
		)
	DEFAULT_VALUE_MAP.set(key_allowPlayerChangeTeam, d_allowPlayerChangeTeam)

	export const d_recordPlayerStats: boolean = true
	/**
	 * 是否记录玩家统计
	 */
	export const key_recordPlayerStats: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'recordPlayerStats',
			d_recordPlayerStats
		)
	DEFAULT_VALUE_MAP.set(key_recordPlayerStats, d_recordPlayerStats)

	//====Bonus====//

	export const d_bonusBoxMaxCount: int = 8
	/**
	 * 世界环境中允许（奖励箱生成器）生成的「最大奖励箱数量」
	 * * 负数⇒无限生成
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	export const key_bonusBoxMaxCount: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'bonusBoxMaxCount',
			d_bonusBoxMaxCount
		)
	DEFAULT_VALUE_MAP.set(key_bonusBoxMaxCount, d_bonusBoxMaxCount)

	export const d_bonusBoxSpawnChance: number = 1 / TPS / 8
	/**
	 * 世界环境中在每个游戏刻尝试生成奖励箱的几率
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	export const key_bonusBoxSpawnChance: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'bonusBoxSpawnChance',
			d_bonusBoxSpawnChance
		)
	DEFAULT_VALUE_MAP.set(key_bonusBoxSpawnChance, d_bonusBoxSpawnChance)

	export const d_bonusTypePotentials: Map<BonusType, number> = new Map<
		BonusType,
		number
	>()
	/**
	 * 奖励类型→权重
	 * * 只在「世界加载」阶段被注册使用。不会在这里注入一丝默认值
	 *
	 * !【2023-10-11 21:27:31】这些属性会在「加载阶段」被存入「奖励箱生成器」中
	 * * 若有「即刻改变」的需要，建议在更新规则时考虑与对应的实体进行「属性同步」
	 */
	export const key_bonusTypePotentials: key =
		fastAddJSObjectifyMapProperty_dash(
			OBJECTIFY_MAP,
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
	DEFAULT_VALUE_MAP.set(key_bonusTypePotentials, d_bonusTypePotentials)

	export const d_bonusBoxSpawnAfterPlayerDeath: boolean = true
	/** 奖励箱是否在玩家死亡后（在当前位置）生成 */
	export const key_bonusBoxSpawnAfterPlayerDeath: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'bonusBoxSpawnAfterPlayerDeath',
			d_bonusBoxSpawnAfterPlayerDeath
		)
	DEFAULT_VALUE_MAP.set(
		key_bonusBoxSpawnAfterPlayerDeath,
		d_bonusBoxSpawnAfterPlayerDeath
	)

	export const d_bonusBuffAdditionAmount: uint = 1
	/** （AS3遗留）在玩家获得奖励箱后，玩家「加成」受到提升的数量 */
	export const key_bonusBuffAdditionAmount: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'bonusBuffAdditionAmount',
			d_bonusBuffAdditionAmount
		)
	DEFAULT_VALUE_MAP.set(
		key_bonusBuffAdditionAmount,
		d_bonusBuffAdditionAmount
	)

	export const d_bonusMaxHPAdditionAmount: uint = 5
	/** 在玩家获得「增加最大生命值」后，最大生命值提升的数量 */
	export const key_bonusMaxHPAdditionAmount: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'bonusMaxHPAdditionAmount',
			d_bonusMaxHPAdditionAmount
		)
	DEFAULT_VALUE_MAP.set(
		key_bonusMaxHPAdditionAmount,
		d_bonusMaxHPAdditionAmount
	)

	//====BaTr for Programs====//
	export const d_mapTransformTime: uint = 60
	/**
	 * （遗留）地图的「变换周期」
	 * * 【2023-10-16 21:57:38】现在不再需要，因为这个机制已经交给了对应的「地图切换者」实体
	 *
	 * TODO: 拟分离此类关系
	 */
	export const key_mapTransformTime: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'mapTransformTime',
			d_mapTransformTime
		)
	DEFAULT_VALUE_MAP.set(key_mapTransformTime, d_mapTransformTime)

	export const d_blockRandomTickDensity: uint = 576
	/**
	 * 母体中「方块随机刻」的密度
	 * * 单位：n个/576个方块
	 *   * 此中之「576」来自AS3版本的默认地图尺寸
	 *
	 * @default 每个游戏刻在每个方块上触发一个「方块随机刻」
	 */
	export const key_blockRandomTickDensity: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'blockRandomTickDensity',
			d_blockRandomTickDensity
		)
	DEFAULT_VALUE_MAP.set(key_blockRandomTickDensity, d_blockRandomTickDensity)

	//====Tools====//
	export const d_enabledTools: Tool[] = []
	/**
	 * 所有启用的工具（原型对象）
	 */
	export const key_enabledTools: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'enabledTools',
		d_enabledTools
	)
	DEFAULT_VALUE_MAP.set(key_enabledTools, d_enabledTools)

	export const d_defaultTool: Tool | 'u-random' | 'c-random' = 'c-random' // ? 是否要这样硬编码
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
	export const key_defaultTool: key = fastAddJSObjectifyMapProperty_dash(
		OBJECTIFY_MAP,
		'defaultTool',
		Tool, // TODO: 【2023-10-16 22:00:12】这里还是需要针对「联合类型」做优化，或许下面有效，但总觉得运行起来很别扭
		identity, // 保存时自动处理
		identity, // 加载时自动处理
		(value: JSObjectValue): boolean => typeof value !== 'string',
		(): Tool => Tool.getBlank()
	)
	DEFAULT_VALUE_MAP.set(key_defaultTool, d_defaultTool)

	export const d_maxLaserLength: uint = 32
	/**
	 * 决定世界中生成的激光的「默认长度」
	 */
	export const key_maxLaserLength: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'maxLaserLength',
		d_maxLaserLength
	)
	DEFAULT_VALUE_MAP.set(key_maxLaserLength, d_maxLaserLength)

	export const d_bulletMaxLife: uint = 3200
	/**
	 * 决定世界中生成的子弹的「默认生命周期」
	 * * 单位：世界刻（100世界刻=1秒）
	 * * 默认值：32秒
	 * * 作用：子弹会在生成后最长「默认生命周期」个世界刻后自行消失
	 *   * 【2023-10-12 16:16:23】添加缘由：避免「不断在有限无界的地图中循环」而产生大量子弹，进而导致卡顿
	 */
	export const key_bulletMaxLife: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'bulletMaxLife',
		d_bulletMaxLife
	)
	DEFAULT_VALUE_MAP.set(key_bulletMaxLife, d_bulletMaxLife)

	export const d_allowLaserThroughAllBlock: boolean = false
	/**
	 * 是否允许激光穿透所有方块
	 */
	export const key_allowLaserThroughAllBlock: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'allowLaserThroughAllBlock',
			d_allowLaserThroughAllBlock
		)
	DEFAULT_VALUE_MAP.set(
		key_allowLaserThroughAllBlock,
		d_allowLaserThroughAllBlock
	)

	export const d_toolsNoCD: boolean = false
	/**
	 * （遗留）武器是否没有冷却
	 */
	export const key_toolsNoCD: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'toolsNoCD',
		d_toolsNoCD
	)
	DEFAULT_VALUE_MAP.set(key_toolsNoCD, d_toolsNoCD)

	//====End&Victory====//
	export const d_allowTeamVictory: boolean = true
	/**
	 * （遗留）是否允许「团队胜利」
	 *
	 * ? 【2023-10-16 21:52:36】这样的规则似乎应留给一个「胜利の裁判」，然后在某个「加载自规则」的函数中得到「规则同步」
	 */
	export const key_allowTeamVictory: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'allowTeamVictory',
			d_allowTeamVictory
		)
	DEFAULT_VALUE_MAP.set(key_allowTeamVictory, d_allowTeamVictory)

	// ALL KEYS //

	/**
	 * ! 必须在所有属性初始化后再初始化「所有规则名」
	 * * 初衷：避免「规则名」带下划线
	 */
	export const ALL_RULE_KEYS: key[] = Object.getOwnPropertyNames(
		OBJECTIFY_MAP
	).map(
		// * 映射到在JS对象中呈现的键
		(key: string): key => OBJECTIFY_MAP[key].JSObject_key
	)
}
