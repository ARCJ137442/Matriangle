import { uint } from 'matriangle-legacy/AS3Legacy'
import { OptionalRecursive2, Ref } from 'matriangle-common/utils'
import { JSObject } from 'matriangle-common/JSObjectify'

/**
 * 一个面对逻辑对象的接口，使逻辑对象可以操纵其显示状态
 * * 它将操作一个与自己对应的「显示数据/显示代理」，并负责输出：
 *   * 「完全显示数据」（用于初始化）
 *   * 「待更新显示数据」（用于显示更新）
 *
 * @template DisplayDataT 「显示数据」类型（不是「特殊状态」类型）
 *
 * !【2023-11-15 22:03:43】现在的重定位：不再只输出必要的「显示数据」而不做其它事情
 */
export interface IDisplayable<DisplayDataT extends JSObject> {
	/**
	 * 用于识别「是否实现接口」的标识符
	 * * 留存「接口约定的变量」，判断「实例是否实现接口」
	 */
	readonly i_displayable: true

	/**
	 * 获取「初始化」时所需的「实体数据」即「完全显示数据」
	 * * 这里的数据是一个只读引用
	 *   * 这意味着：当数据本身发生改变时，这个函数返回后的结果也会改变
	 *   * 因此禁止对其返回值进行修改
	 */
	getDisplayDataInit(): Ref<DisplayDataT>

	/**
	 * 获取「初始化」时所需的「实体数据」即「待更新显示数据」
	 * * 这里的「待更新显示数据」是「部分化」的
	 */
	getDisplayDataRefresh(): Ref<OptionalRecursive2<DisplayDataT>>
}

/**
 * 判断一个对象是否为「可显示对象」
 *
 * @param target 判断对象
 * @returns 对象是否为「可显示对象」
 */
export function i_displayable<T extends JSObject>(
	target: unknown
): target is IDisplayable<T> {
	return (target as IDisplayable<T>)?.i_displayable === true
	/*
	* 原先需要下面这样的形式，但现在使用「链式判断」可大大简化
	* 参考：https://es6.ruanyifeng.com/#docs/operator
	(
		typeof target === 'object' &&
		target !== null &&
		'i_displayable' in target &&
		target.i_displayable === true
	) */
}

/** // !【2023-11-15 21:55:21】现在「可显示容器对象」正式退伍
 * 现在「可显示对象」被重新定义：
 * * 不再「直接操纵『呈现者』如`flash.Shape`」
 * * 而是「生成『显示数据』以便将其呈递给『显示端』」
 *
 * ! 同理，`IShape`、`IShapeContainer`和`IGraphicContext`同样退伍
 */

/**
 * 控制全局的「对象显示层级」
 * * 用于「统一管理各方块/实体的前后显示层级」
 * * 用于对「可显示实体/方块」的「zIndex」进行规范
 *
 * !【2023-11-15 21:51:12】现在统一使用**非负整数**表示层级，以对标显示API中用「数组索引」表示的层级
 *
 * 原描述：
 * * GUI,HUD
 * * <Top>: POSITIVE
 * * MapTop,Projectile,MapMiddle,Player
 * * <Middle>: ZERO
 * * BonusBox,MapBottom
 * * <Bottom>: NEGATIVE
 * * Background
 */
export module DisplayLevel {
	/**
	 * 游戏背景所在层
	 *
	 * 典例：
	 * * 方块边界网格
	 */
	export const BACKGROUND: uint = 0

	/**
	 * 底层特效
	 *
	 * 典例：
	 * * 重生
	 * * 传送
	 */
	export const EFFECT_BOTTOM: uint = 2

	/**
	 * 地图中占下层的方块
	 *
	 * 典例：
	 * * 水
	 * * 玩家出生点标记
	 * * X-陷阱
	 * * 随机开启门
	 */
	export const MAP_BOTTOM: uint = 1

	/**
	 * 奖励箱
	 *
	 * 典例：
	 * * 奖励箱
	 */
	export const BONUS_BOX: uint = 3

	/**
	 * 中层特效
	 *
	 * 典例：
	 * * ？
	 */
	export const EFFECT_MIDDLE: uint = 4

	/**
	 * 玩家
	 *
	 * 典例：
	 * * 玩家
	 */
	export const PLAYER: uint = 5

	/**
	 * 中层地图
	 *
	 * 典例：
	 * * 墙
	 * * 基岩
	 */
	export const MAP_MIDDLE: uint = 5

	/**
	 * 抛射物
	 *
	 * 典例：
	 * * 各类抛射物
	 */
	export const PROJECTILE: uint = 6

	/**
	 * 顶层地图
	 *
	 * 典例：
	 * * ？
	 */
	export const MAP_TOP: uint = 7

	/**
	 * 顶层特效
	 *
	 * 典例：
	 * * 爆炸
	 */
	export const EFFECT_TOP: uint = 8

	/**
	 * 玩家GUI
	 *
	 * ? 这一层原本不用来显示方块/实体
	 */
	export const PLAYER_GUI: uint = 9

	/**
	 * 全局GUI
	 *
	 * ? 这一层原本不用于显示实体/方块
	 */
	export const GLOBAL_GUI: uint = 10
}
