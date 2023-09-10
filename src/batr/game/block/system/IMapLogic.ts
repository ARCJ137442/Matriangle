

import { iPoint } from "../../../common/intPoint";
import { uint, int } from "../../../legacy/AS3Legacy";
import EntityCommon from "../../entity/EntityCommon";
import Player from "../../entity/entities/player/Player";
import BlockAttributes from "../BlockAttributes";
import IMap from "./IMap";
import IMapStorage from "./IMapStorage";


/**
 * 定义地图的「逻辑层」，定义地图的逻辑结构
 * * 用于对接游戏机制
 *   * 提供一系列与地图有关的「工具函数」，供游戏本身调用
 *   * 提供对「存储结构」的访问，以便声明其「与『存储结构』的链接」
 *     * 在响应游戏机制时，一般从链接的「存储结构」中访问
 *     * 例：存储结构需要导出，而逻辑结构无需导出
 * ! 旧时一些AS3版本在`Game`类的函数，也会在此处作为接口
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
	 * @param x 方块x坐标
	 * @param y 方块y坐标
	 */
	getBlockPlayerDamage(x: int, y: int): int

	/**
	 * 获取地图中方块「是否为死亡区」
	 * @param x 方块x坐标
	 * @param y 方块y坐标
	 */
	isKillZone(x: int, y: int): boolean

	/**
	 * 测试一个坐标是否「出界」
	 * * 用于地图中对实体坐标的限制、有限无界机制等
	 * @param x 被测试的x坐标（浮点）
	 * @param y 被测试的y坐标（浮点）
	 */
	isOutOfMap(x: number, y: number): boolean

	/**
	 * 测试一个整数坐标是否「出界」
	 * @param x x坐标
	 * @param y y坐标
	 */
	isIntOutOfMap(x: int, y: int): boolean


	/**
	 * 从某位置向某方向「前进」，获取「前进到的坐标」
	 * * 地图底层逻辑，与「逻辑结构」有关，但与「游戏整体机制」分离
	 *   * 例如：实现「有限无界」逻辑，不能只是在「存储结构」中做事
	 */
	towardWithRot(x: int, y: int, rot: uint): iPoint

	/**
	 * 测试一个地方「是否通过」
	 * @param x 要测试的x坐标
	 * @param y 要测试的y坐标
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括（其它）玩家
	 * @param avoidHurting 避免伤害（主要用于AI）
	 */
	testCanPass(x: number, y: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean
	testIntCanPass(x: int, y: int, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean
	testFrontCanPass(entity: EntityCommon, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean/* = true*/, avoidTrap?: boolean/* = false*/): boolean
	testBonusBoxCanPlaceAt(x: int, y: int): boolean
	testPlayerCanPass(player: Player, x: int, y: int, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean
	testFullPlayerCanPass(player: Player, x: int, y: int, oldX: int, oldY: int, includePlayer?: boolean/* = true*/, avoidHurting?: boolean/* = false*/): boolean
	testPlayerCanPassToFront(player: Player, rotatedAsRot?: uint/* = 5*/, includePlayer?: boolean/* = true*/, avoidTrap?: boolean/* = false*/): boolean
	testCarriableWithMap(blockAtt: BlockAttributes, map: IMap): boolean
	testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean
}
