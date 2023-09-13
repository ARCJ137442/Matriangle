

import { fPoint, iPoint } from "../../../common/geometricTools";
import { intRot } from "../../../general/GlobalRot";
import { uint, int } from "../../../legacy/AS3Legacy";
import EntityCommon from "../../entity/EntityCommon";
import Player from "../../entity/entities/player/Player";
import BlockAttributes from "../BlockAttributes";
import IMapStorage from "./IMapStorage";


/**
 * 定义地图的「逻辑层」，定义地图的逻辑结构
 * * 用于对接游戏机制
 *   * 提供一系列与地图有关的「工具函数」，供游戏本身调用
 *   * 提供对「存储结构」的访问，以便声明其「与『存储结构』的链接」
 *     * 在响应游戏机制时，一般从链接的「存储结构」中访问
 *     * 例：存储结构需要导出，而逻辑结构无需导出
 * ! 旧时一些AS3版本在`Game`类的函数，也会在此处作为接口
 * 
 * ! 【20230912 8:04:12】现在在此处不再提供「二维专用」版本，全面改用「任意维通用」版本
 * * 性能注意点：一定要用「缓存技术」，不能频繁new对象
 * * 这里一切「获取/设置」有关位置信息的函数，都会使用**从别的地方创建而来的引用**，所以不得改变
 * 
 * ! 不得改变函数中类型为`xPoint`的参数，否则可能会收到意想不到的后果
 * 
 * * 性能测试之证：使用「对象缓存」的性能稍微比「二维专用」的性能差，但也比「频繁new」的性能好上十几倍
 * ```
 * 开始测试 0 ~ 100000
 * 2d: 3.365s
 * point_new: 1:05.299 (m:ss.mmm)
 * point_cached: 4.571s
 * ```
 */
export default interface IMapLogic {
	//============Interface Functions============//
	/**
	 * 【对接显示】获取（经国际化的）地图的显示名称
	 */
	get name(): string;

	/**
	 * 用于获取其链接的「存储结构」
	 */
	get storage(): IMapStorage;

	/**
	 * 【对接游戏】获取「是否」为「竞技场地图」
	 * * 定义：「竞技场地图」中，除了指定种类的方块外，不允许对大多数方块进行更改
	 * ? TODO: 或许日后通过「方块修改权限」机制做到「非特殊化」
	 */
	get isArenaMap(): boolean;

	//============Game Mechanics============//

	/**
	 * 获取地图中方块对玩家的伤害值
	 * 
	 * 
	 * @param p 方块坐标
	 */
	getBlockPlayerDamage(p: iPoint): int

	/**
	 * 获取地图中方块「是否为死亡区」
	 * @param x 方块x坐标
	 * @param y 方块y坐标
	 */
	isKillZone(p: iPoint): boolean

	/**
	 * 测试一个坐标「是否在地图之内」
	 * * 用于地图中对实体坐标的限制、有限无界机制等
	 * 
	 * @param p 浮点坐标
	 */
	isInMap_F(p: fPoint): boolean

	/**
	 * 测试一个整数坐标「是否在地图之内」
	 * @param p 被测试的坐标整体
	 */
	isInMap_I(p: iPoint): boolean

	// TODO: 更多「2d/通用」分离

	/**
	 * 从某位置向某方向「前进」，获取「前进到的坐标」
	 * 
	 * ! 这里使用的是「任意维整数角」，二维呈现上是「右左下上」而非先前的「右下左上」
	 * 
	 * * 地图底层逻辑，与「逻辑结构」有关，但与「游戏整体机制」分离
	 *   * 例如：实现「有限无界」逻辑，不能只是在「存储结构」中做事
	 * 
	 * @param p 前进前所在的点
	 * @param rot 任意维整数角
	 * @param step 前进的步长（浮点）
	 */
	towardWithRot_F(p: fPoint, rot: intRot, step?: number/* = 1*/): fPoint

	/**
	 * （整形优化版本）从某位置向某方向「前进」，获取「前进到的坐标」
	 * 
	 * ! 这里使用的是「任意维整数角」，二维呈现上是「右左下上」而非先前的「右下左上」
	 * 
	 * * 地图底层逻辑，与「逻辑结构」有关，但与「游戏整体机制」分离
	 *   * 例如：实现「有限无界」逻辑，不能只是在「存储结构」中做事
	 * 
	 * @param p 前进前所在的点
	 * @param rot 任意维整数角
	 * @param step 前进的步长（整数）
	 */
	towardWithRot_I(p: iPoint, rot: intRot, step?: int/* = 1*/): iPoint

	// TODO: 有待移植

	/**
	 * 判断一个地方「是否可通过」
	 * 
	 * ! 不要在地图边界外使用这个
	 * 
	 * @param p 要判断的坐标（浮点）
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括（其它）玩家
	 * @param avoidHurting 避免伤害（主要用于AI）
	 */
	testCanPass_F(p: fPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean

	/**
	 * 判断一个「整数位置」是否「可通过」
	 * 
	 * ! 不要在地图边界外使用这个
	 * 
	 * @param p 要判断的坐标（整数）
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括其它玩家
	 * @param avoidHurting 避免伤害（主要用于AI）
	 */
	testCanPass_I(p: iPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean

	/**
	 * （快捷封装）用于判断「实体前方的位置是否可以通过」
	 * * 不考虑「移动前的点」
	 * 
	 * @param entity 要判断的实体
	 * @param distance 要前进的距离
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括其他玩家
	 * @param avoidHurt 避免伤害（主要用于AI）
	 */
	testFrontCanPass(entity: EntityCommon, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidHurt?: boolean/* = false*/): boolean

	/**
	 * 判断一个位置是否「可放置奖励箱」
	 * @param p 位置
	 */
	testBonusBoxCanPlaceAt(p: iPoint): boolean

	/**
	 * 用于判断「玩家是否可当前位置移动到另一位置」
	 * * 会用到「玩家自身的坐标」作为「移动前坐标」
	 * 
	 * TODO: 日后细化「试题类型」的时候，还会分「有碰撞箱」与「无碰撞箱」来具体决定
	 * 
	 * @param player 要判断的玩家
	 * @param p 位置
	 * @param includePlayer 是否包括其他玩家
	 * @param avoidHurt 避免伤害（主要用于AI）
	 */
	testPlayerCanGo(player: Player, p: iPoint, includePlayer?: boolean/* = true*/, avoidHurt?: boolean/* = false*/): boolean

	/**
	 * （快捷封装）用于判断「玩家是否可向前移动（一格）」
	 * @param player 要判断的玩家（整数坐标）
	 * @param rotatedAsRot 是否采用「特定方向」覆盖「使用玩家方向」
	 * @param includePlayer 是否包括其他玩家
	 * @param avoidHurt 避免伤害（主要用于AI）
	 */
	testPlayerCanGoForward(player: Player, rotatedAsRot?: uint/* = 5*/, includePlayer?: boolean/* = true*/, avoidHurt?: boolean/* = false*/): boolean

	/**
	 * 判断一个方块（属性）是否「可搬动」
	 * * 会受到地图「竞技场属性」的影响
	 * 
	 * @param blockAtt 方块属性
	 */
	isCarriable(blockAtt: BlockAttributes): boolean

	/**
	 * 判断一个方块（属性）是否「可破坏」
	 * 
	 * ? 后续是否要引入「方块硬度」的概念
	 * @param blockAtt 方块属性
	 */
	isBreakable(blockAtt: BlockAttributes): boolean

}
