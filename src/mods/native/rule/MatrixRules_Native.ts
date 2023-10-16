import { uint, int } from 'matriangle-legacy'
import IMap from 'matriangle-api/server/map/IMap'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { identity, key } from 'matriangle-common/utils'
import { iPoint } from 'matriangle-common/geometricTools'
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
} from 'matriangle-common/JSObjectify'
import { loadRecursiveCriterion_true } from 'matriangle-common/JSObjectify'
import Map_V1 from '../map/Map_V1'
import MapStorageSparse from '../map/MapStorageSparse'
import { RuleDefaultValueMap } from 'matriangle-api/server/rule/IMatrixRule'

/**
 * 存储与「原生机制」有关的规则
 * * 【2023-09-17 12:22:15】现在只「纯粹存取数据」，不再「读取一套存储一套」
 * * 【2023-10-16 21:54:36】目前把「所有规则名」当作一个类似「配置文件常量池」的容器
 *   * 不再因「使用实例属性」绑定键值
 */
export namespace MatrixRules_Native {
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

	//====World====//
	export const d_defaultHP: uint = 100
	/**
	 * 玩家的默认生命值
	 */
	export const key_defaultHP: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'defaultHP',
		d_defaultHP
	)
	DEFAULT_VALUE_MAP.set(key_defaultHP, d_defaultHP)

	export const d_defaultMaxHP: uint = 100
	/**
	 * 玩家的默认最大生命值
	 */
	export const key_defaultMaxHP: key = fastAddJSObjectifyMapProperty_dashP(
		OBJECTIFY_MAP,
		'defaultMaxHP',
		d_defaultMaxHP
	)
	DEFAULT_VALUE_MAP.set(key_defaultMaxHP, d_defaultMaxHP)

	export const d_remainLivesPlayer: int = -1
	/**
	 * 玩家默认拥有的「生命数」
	 * * 特殊值：-1⇒无限
	 */
	export const key_remainLivesPlayer: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'remainLivesPlayer',
			d_remainLivesPlayer
		)
	DEFAULT_VALUE_MAP.set(key_remainLivesPlayer, d_remainLivesPlayer)

	export const d_defaultRespawnTime: uint = 3 * TPS // tick
	/**
	 * 玩家默认的重生时长
	 * * 单位：世界刻数
	 */
	export const key_defaultRespawnTime: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'defaultRespawnTime',
			d_defaultRespawnTime
		)
	DEFAULT_VALUE_MAP.set(key_defaultRespawnTime, d_defaultRespawnTime)

	export const d_deadPlayerMoveTo: iPoint = new iPoint()
	/**
	 * 玩家死亡后移动到的地点
	 *
	 * !【2023-10-10 17:07:51】现在仅移动至零维点，不默认其为二维了
	 */
	export const key_deadPlayerMoveTo: key =
		fastAddJSObjectifyMapProperty_dash2(
			OBJECTIFY_MAP,
			'deadPlayerMoveTo',
			d_deadPlayerMoveTo,
			identity,
			identity,
			loadRecursiveCriterion_true,
			(): iPoint => new iPoint()
		)
	DEFAULT_VALUE_MAP.set(key_deadPlayerMoveTo, d_deadPlayerMoveTo)

	export const d_playerAsphyxiaDamage: int = -15
	/**
	 * 记录玩家「身处『不能通过的方块』」（即「窒息」）时的惩罚伤害（整数）
	 * * 参见「原生世界机制」的`computeFinalBlockDamage`
	 *
	 * ! 这里的「窒息伤害」无视玩家护甲（机制使然）
	 */
	export const key_playerAsphyxiaDamage: key =
		fastAddJSObjectifyMapProperty_dashP(
			OBJECTIFY_MAP,
			'playerAsphyxiaDamage',
			d_playerAsphyxiaDamage
		)
	DEFAULT_VALUE_MAP.set(key_playerAsphyxiaDamage, d_playerAsphyxiaDamage)

	//====Map====//
	export const d_mapRandomPotentials: Map<IMap, number> =
		/**
		 * 格式：地图→权重
		 * * 只在「世界加载」阶段被注册使用。不会在这里注入一丝默认值
		 * * 默认是空映射
		 *
		 * ! 【2023-09-17 11:41:26】现在一定需要初始化，即便只是「平均分布」
		 */
		new Map<IMap, number>()
	export const key_mapRandomPotentials: key =
		fastAddJSObjectifyMapProperty_dash2(
			OBJECTIFY_MAP,
			'mapRandomPotentials',
			d_mapRandomPotentials,
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
	DEFAULT_VALUE_MAP.set(key_mapRandomPotentials, d_mapRandomPotentials)

	export const d_initialMap: IMap | null = null
	/**
	 * 母体加载时的「最初地图」
	 *
	 * !【2023-09-24 17:34:34】现在采用「值本位-原型复制」思路，每个地图都不强求使用「引用」，在加载时都「独一无二」
	 *
	 * ? 这些直接存储「地图」的数据，不好量化
	 * * 或许需要一种「内部引用」的类型，以便「动态选择&绑定」
	 *
	 * TODO: 计划迁移至「母体启动配置」
	 */
	export const key_initialMap: key = fastAddJSObjectifyMapProperty_dash(
		OBJECTIFY_MAP,
		'initialMap',
		undefined /* 使用undefined通配，以避免「检查是否实现接口」 */,
		identity,
		identity, // * 这里只需要设置「白板构造函数」
		(v: JSObjectValue): boolean => v !== null, // 仅在非空时递归解析
		(): IMap => Map_V1.getBlank(MapStorageSparse.getBlank()) // ! 还得靠这个「模板构造」
	)
	DEFAULT_VALUE_MAP.set(key_initialMap, d_initialMap)

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
