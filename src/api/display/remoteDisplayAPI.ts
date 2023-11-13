/**
 * 用于「远程WS交换信息」的显示
 * * 只用于「统一规定『方块呈现要什么数据』『实体呈现要什么数据』」
 * * 不用于规定「具体的『呈现者』对象」
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
 * TODO: 有待和`DisplayInterfaces.ts`整合
 */

import { OptionalRecursive2 } from 'matriangle-common'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import BlockState from '../server/block/BlockState'
import { typeID } from '../server/registry/IWorldRegistry'

/**
 * 状态数据 / 显示数据
 * * 一切「用于初始化、更新图形呈现的数据」的基类
 * * 用于存储一个Shape通用的东西
 *   * 目前对于「位置」还不知道要如何处理
 */
export interface IDisplayStateData {}

/**
 * 显示状态加载包
 * * 其中的「显示状态数据」都是「必选的」，以实现「显示状态初始化」
 */
export interface DisplayStateInitPackage extends IDisplayStateData {
	[proxyID: string]: IDisplayStateData
}

/**
 * 显示状态更新包
 * * 其中的所有「显示状态数据」都是「可选的」，以实现「部分更新」机制
 *   * 这种「可选性」是**递归**的，不受「键层次」的影响
 *   * 故每次更新时，都需要进行「非空判断」
 * * 这样也不用「为每个状态都写一个对应的『更新包』类型」了
 */
export interface DisplayStateRefreshPackage extends IDisplayStateData {
	[proxyID: string]: OptionalRecursive2<IDisplayStateData>
}

/**
 * 所有「数据呈现者」的统一接口
 * * 拥有「初始化」「更新」「销毁」三个主要功能
 *   * 分别对应「初始化」「更新」「销毁」三个阶段
 *   * 同时与显示API相互对接
 */
export interface IStateDisplayer<StateDataT extends IDisplayStateData> {
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
	StateType extends BlockState | null = BlockState | null,
> extends IDisplayStateData {
	// ! 这里所有的变量都是「全可选」或「全必选」的
	blockID: typeID
	blockState: StateType
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
export interface IDisplayDataMap extends IDisplayStateData {
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
