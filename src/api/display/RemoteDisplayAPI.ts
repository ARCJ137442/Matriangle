/**
 * 用于「远程交换信息」的显示
 * * 只用于「统一规定『方块呈现要什么数据』『实体呈现要什么数据』」
 * * 不用于规定「具体的『呈现者』对象」
 *
 * !【2023-11-15 18:16:30】梳理后的「本质思路」：
 * * 📍核心思想：整个「逻辑端显示数据」和「显示端显示数据」作为一个大object进行同步
 *   * 📌核心假设：显示端根据「显示端显示数据」就可以完全绘制出「环境图形」
 * * 每次「初始化」时，「逻辑端」向「显示端」发送完整的「显示数据」，作为「初始化数据」
 *   * 并且，只有「显示端」向「逻辑端」发送请求时，逻辑端才会回传相应的「显示数据」
 *     * 📌此即「响应式更新」的思想核心
 * * 在「初始化」后，对「显示端」的「刷新/更新」请求，「逻辑端」只会发送「已经更新而未同步的数据」
 *   * 此时「显示端」会根据这些「可选数据」进行「部分化更新」
 *     * 📌此即「部分化更新」的思想核心
 *   * 💡在处理「多显示端」的时候，或许可以通过以下方案解决「这边刷新了数据，后边就以为『没刷新』」的问题
 *     * 根据连接克隆多个「面向不同地址进行不同更新」的「逻辑端显示数据」
 *     * 这些「逻辑端显示数据」以「一对一」的关系，分别与各处「显示端显示数据」进行同步
 *     * ✨这样就无需再纠结「何时刷新掉『待更新数据』以便反映『数据已更新，后续可能无需再更新』」了
 *
 * @example
 *
 * 一个（逻辑端）node服务器（在从消息服务接收到消息后）要
 * 1. 把（母体的）方块/实体抽象为「图形显示の数据」
 * 2. 以JSON为载体传递「图形更新信息」
 *
 * 然后（显示端）浏览器客户端要
 * 1. 接收解析服务器信息
 * 2. 解析要更新哪些图形对象
 * 3. 推导要更新对象的哪些属性
 * 4. 具体去更改图形对象的属性（部分地，比如「透明度不变就不用更新」）
 *
 * ? 或许需要`DisplayInterfaces.ts`整合
 */

import { JSObject } from 'matriangle-common/JSObjectify'
import { OptionalRecursive2 } from 'matriangle-common/utils'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import { IDisplayDataBlockState } from '../server/block/BlockState'
import { typeID } from '../server/registry/IWorldRegistry'

// * 通用显示接口 * //

/**
 * 显示状态数据
 * * 一切「用于初始化、更新图形呈现的数据」的基类
 * * 用于存储一个Shape通用的东西
 *   * 目前对于「位置」还不知道要如何处理
 *
 * !【2023-11-15 23:20:57】目前对于「{[k:string]: XXX}」的继承，不会引发歧义（是泛型函数出了问题）
 */
export interface IDisplayData extends JSObject {}

/**
 * 所有「数据呈现者」的统一接口
 * * 拥有「初始化」「更新」「销毁」三个主要功能
 *   * 分别对应「初始化」「更新」「销毁」三个阶段
 *   * 同时与显示API相互对接
 */
export interface IStateDisplayer<StateDataT extends IDisplayData> {
	/**
	 * （图形）初始化
	 * * 使用完整的「显示数据」
	 */
	shapeInit(data: StateDataT, ...otherArgs: any[]): void
	/**
	 * 图形更新
	 * * 使用部分的「显示数据」（补丁形式）
	 * @param data 需要更新的「显示数据补丁」
	 */
	shapeRefresh(
		data: OptionalRecursive2<StateDataT>,
		...otherArgs: any[]
	): void
	/**
	 * 图形销毁
	 * * 不使用任何「显示数据」
	 */
	shapeDestruct(...otherArgs: any[]): void
}

// * 地图/方块显示 * //

/** 作为常量的「坐标分隔符」 */
export const LOCATION_COORD_SEPARATOR: string = ' '

/**
 * 点⇒坐标字串
 * * 原理：即`join`方法
 */
export function pointToLocationStr(point: int[]): string {
	return point.join(LOCATION_COORD_SEPARATOR)
}

/**
 * 坐标字串⇒点
 * * 实际上可以是任何支持「数字索引」的对象
 */
export function locationStrToPoint<T extends int[] = int[]>(
	locationStr: string,
	target: T
): T {
	locationStr
		.split(LOCATION_COORD_SEPARATOR)
		.forEach((str: string, i: uint): void => {
			// ! target作为自由变量，无法分离以脱离闭包（提取为一个const）
			target[i] = parseInt(str)
		})
	return target
}

// * 具体针对「地图」「方块」「实体」的「显示数据类型」对接 * //

/**
 * 方块状态数据（全有）
 */
export interface IDisplayDataBlock<
	StateType extends
		IDisplayDataBlockState | null = IDisplayDataBlockState | null,
> extends IDisplayData {
	// ! 这里所有的变量都是「全可选」或「全必选」的
	id: typeID
	// 方块状态中「是JS对象一部分」的属性（排除了其中的「非JS对象部分」如函数）
	state: StateType
}

/**
 * 存储其中的「位置-方块数据」键值对
 */
export interface IDisplayDataMapBlocks {
	[location: string]: IDisplayDataBlock
}

/**
 * 地图的「显示数据」
 */
export interface IDisplayDataMap extends IDisplayData {
	/**
	 * 尺寸：整数数组
	 * * 用于显示时调整「地图大小」
	 *
	 * ! 并非实际呈现时的尺寸
	 */
	size: uint[]

	/**
	 * 方块数据：依据类似'x,y'的字符串为索引存储的数据
	 * * 用于更新方块
	 */
	blocks: IDisplayDataMapBlocks
}

// * 实体显示 * //

/**
 * 存储「所有需要更新的实体」的数据
 * * 使用`id: IDisplayDataEntity`
 *   * 理由：`id`在更新时是绝对不能省略的，这相当于指针地址
 *
 * @argument id 记录实体用于更新的「唯一识别码」
 * * 用于在「逻辑端实体」和「显示端实体」间建立连接
 *   * 如：指派「哪个『实体呈现者』需要被更新」
 */
export interface IDisplayDataEntities {
	// ! 这里因「实体类型」的不同而不同
	[uuid: string | uint]: IDisplayDataEntity<IDisplayDataEntityState> | null
}

/**
 * 实体的「显示数据」
 * * 【2023-11-14 19:50:31】目前实体的情况：
 *   * 有一些像「方块坐标」「朝向」「xy缩放尺寸」的「基本属性」，但对「特殊属性」的需求比「方块」大
 *   * 可能需要通过「显示代理」传递「显示数据」
 * * 当下的处理思路：类似「多继承」的思想，但需要和一类「显示代理」绑定
 *   * 使用「显示代理」的getter/setter，将「修改属性」转换成「更新数据」
 *   * 这里「显示代理」类似一种「待更新数据缓冲区」的角色
 *
 * !【2023-11-15 18:15:39】这里的`id`应该作为「地址」而不应该作为「数据」
 */
export interface IDisplayDataEntity<
	EntityStateT extends IDisplayDataEntityState,
> extends IDisplayData {
	/**
	 * 记录实体的「类型」
	 * * 用于显示端结合状态进行绘图
	 *   * 如：「id=玩家」⇒绘制玩家图形，「id=奖励箱」⇒绘制奖励箱图形
	 */
	id: typeID

	/**
	 * 记录实体的「附加状态」
	 * * 这个「附加状态」是可自定义的
	 */
	state: EntityStateT
}

/**
 * 所有实体通用的「实体状态」类型
 * * 此处的「实体状态」直接作为数据进行传输
 * * 目前该类型作为一个通用类型
 *
 * @example 想法笔记
 * 实体将使用一个uuid作为其标识符，并且这不由「实体」本身存储——实体自身的「实体状态」，即为「实体」这个「具有能动的方法的类」本身存储，
 * 类似 entities: {
 *     [id: string|uint]: {
 *         type: string
 *         state: {scaleX: XXX, scaleY: XXX, ...}
 *     }
 * }
 */
export interface IDisplayDataEntityState extends JSObject {
	// [stateName: key]: JSObjectValue // !【2023-11-15 22:28:22】与其说「作为一个『any类型』」，倒不如禁用它作为一个基类（以兼容基本的`scaleX`、`scaleY`这些）
	// * 下面这些似乎是作为一个「有位置实体」才需要操作的，但实际上只要「可显示」就必须这么做
	scaleX: number
	scaleY: number
	isVisible: boolean
	position: number[]
	direction: number /* mRot */
	alpha: number
}

// * 整体显示对象 * //

/**
 * 总体环境的「显示数据」对象
 * * 定义了「逻辑端」和「显示端」之间需要同步的对象类型
 */
export interface IDisplayDataMatrix extends IDisplayData {
	/**
	 * 地图数据
	 * * 存储所有方块的显示状态，以及地图自身的状态数据
	 *
	 * ! 只会存储「影响显示呈现」的部分
	 * * 其它「纯逻辑数据」如「地图破坏等级」不会也无需存储
	 */
	map: IDisplayDataMap

	/**
	 * 实体数据
	 * * 以「UUID」为索引，存储所有被追踪的实体
	 */
	entities: IDisplayDataEntities
}
