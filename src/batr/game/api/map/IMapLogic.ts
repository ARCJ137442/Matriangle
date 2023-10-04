import { fPoint, fPointRef, iPoint, iPointRef } from "../../../common/geometricTools";
import { mRot } from "../../general/GlobalRot";
import { uint, int } from "../../../legacy/AS3Legacy";
import Entity from "../entity/Entity";
import Player from "../../mods/native/entities/player/Player";
import BlockAttributes from "../block/BlockAttributes";
import IMapStorage from "./IMapStorage";
import { IEntityInGrid, IEntityOutGrid } from "../entity/EntityInterfaces";
import IPlayer from "../../mods/native/entities/player/IPlayer";


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
export default interface IMapLogic { // !【逻辑结构无需单独可对象化】
	//============Interface Functions============//
	/** 【对接显示】获取（经国际化的）地图的显示名称 */
	get name(): string;

	/** 用于获取其链接的「存储结构」 */
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
	getBlockPlayerDamage(p: iPointRef): int

	/**
	 * 获取地图中方块「是否为死亡区」
	 * @param x 方块x坐标
	 * @param y 方块y坐标
	 */
	isKillZone(p: iPointRef): boolean

	/**
	 * 测试一个坐标「是否在地图之内」
	 * * 用于地图中对实体坐标的限制、有限无界机制等
	 * 
	 * @param p 浮点坐标
	 */
	isInMap_F(p: fPointRef): boolean

	/**
	 * 测试一个整数坐标「是否在地图之内」
	 * @param p 被测试的坐标整体
	 */
	isInMap_I(p: iPointRef): boolean

	// TODO: 更多「2d/通用」分离

	/**
	 * 从某位置向某方向「前进」，获取「前进到的坐标」
	 * 
	 * ! 注意：对`p`是破坏性操作——会改变`p`的值
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
	towardWithRot_FF(p: fPointRef, rot: mRot, step?: number/* = 1*/): fPoint

	/**
	 * （整形优化版本）从某位置向某方向「前进」，获取「前进到的坐标」
	 * 
	 * ! 注意：对`p`是破坏性操作——会改变`p`的值
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
	towardWithRot_II(p: iPointRef, rot: mRot, step?: int/* = 1*/): iPoint

	// TODO: 有待移植

	/**
	 * 判断一个地方「是否可通过」
	 * * 原`Game.as/testCanPass`
	 * 
	 * ! 不要在地图边界外使用这个
	 * 
	 * ! 不考虑其它实体（如玩家）
	 * 
	 * @param p 要判断的坐标（浮点）
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括（其它）玩家
	 * @param avoidHurting 避免伤害（主要用于AI）
	 * @param players 所涉及的玩家
	 */
	testCanPass_F(p: fPointRef,
		asPlayer: boolean,
		asBullet: boolean,
		asLaser: boolean,
		includePlayer?: boolean/* = true*/,
		avoidHurting?: boolean/* = false*/,
		players?: IPlayer[]/* = [] */,
	): boolean

	/**
	 * 判断一个「整数位置」是否「可通过」
	 * * 原`Game.as/testIntCanPass`
	 * 
	 * ! 不要在地图边界外使用这个
	 * 
	 * @param p 要判断的坐标（整数）
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param avoidOthers 是否避开其它格点实体
	 * @param others 所涉及的格点实体列表
	 */
	testCanPass_I(p: iPointRef,
		asPlayer: boolean,
		asBullet: boolean,
		asLaser: boolean,
		avoidHurt?: boolean/* = false*/,
		avoidOthers?: boolean/* = true*/,
		others?: IEntityInGrid[]/* = [] */,
	): boolean

	/**
	 * （快捷封装）用于判断「实体前方的位置是否可以通过」
	 * * 原`Game.as/testFrontCanPass`
	 * * 不考虑「移动前的点」
	 * 
	 * @param entity 要判断的实体
	 * @param distance 要前进的距离
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param avoidHurt 避免伤害（主要用于AI）
	 * @param avoidOthers 是否避开其它格点实体
	 * @param others 所涉及的格点实体列表
	 */
	testFrontCanPass_FF(
		entity: IEntityOutGrid, distance: number,
		asPlayer: boolean, asBullet: boolean, asLaser: boolean,
		avoidOthers?: boolean/* = true*/,
		avoidHurt?: boolean/* = false*/,
		others?: IEntityInGrid[]/* = [] */,
	): boolean;

	/**
	 * 判断一个位置是否「可放置奖励箱」
	 * * 逻辑：使用「玩家可通过」「不接触所有玩家」
	 * @param p 位置
	 * @param avoids 避开的格点实体列表（一般是「玩家列表」）
	 * 
	 * ?【2023-10-04 09:17:47】这些涉及「实体」的函数，到底要不要放在这儿？
	 */
	testBonusBoxCanPlaceAt(p: iPoint, avoids: IEntityInGrid[]): boolean

	// !【2023-09-30 12:13:45】现在把「testPlayer」系列函数（都使用了玩家的实例，且更多与玩家相关）放在了Player类中

	/**
	 * 判断一个位置的方块「是否能被拿起」
	 * * 应用：在玩家尝试使用「方块投掷器」拾取方块时，判断「是否能拿起方块」
	 *   * 同样用于AI判断中
	 * 
	 * * 会受到地图本身的特性影响，所以移到「逻辑」部分
	 * 
	 * TODO: 或许以后会用「方块硬度」的机制「通用化」
	 * 
	 * @param position 判断的位置
	 * @param defaultWhenNotFound 在「方块属性未找到」时使用的默认值
	 * @returns 这个位置的方块「是否能被拿起」
	 */
	isBlockCarriable(position: iPointRef, defaultWhenNotFound: BlockAttributes): boolean

	/**
	 * 判断一个位置的方块「是否能破坏」
	 * * 应用：在「掷出的方块」被方块化时，用于判断「当前位置的方块是否可被覆盖掉」
	 * 
	 * ! 【2023-09-22 21:22:00】现在使用位置而非方块属性
	 * * 💭真不知道当时自己是怎么想的
	 * 
	 * * 会受到地图本身的特性影响，所以移到「逻辑」部分
	 * 
	 * TODO: 或许以后会用「方块硬度」的机制「通用化」
	 * 
	 * @param position 判断的位置
	 * @param defaultWhenNotFound 在「方块属性未找到」时使用的默认值
	 * @returns 这个位置的方块「是否能破坏」
	 */
	isBlockBreakable(position: iPointRef, defaultWhenNotFound: BlockAttributes): boolean

}
