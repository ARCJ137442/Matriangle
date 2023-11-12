import { typeID } from 'matriangle-api'
import BlockState from 'matriangle-api/server/block/BlockState'
import { Optional } from 'matriangle-common'

/**
 * 状态数据
 * * 用于存储一个Shape通用的东西
 *   * 目前对于「位置」还不知道要如何处理
 */
export interface DisplayStateData {}

/**
 * 方块状态数据（全有）
 */
export interface BlockDisplayData<
	StateType extends BlockState | null = BlockState | null,
> extends DisplayStateData {
	// ! 这里所有的变量都是「全可选」或「全必选」的
	blockID: typeID
	blockState: StateType
}

/**
 * 显示状态加载包
 * * 其中的「显示状态数据」都是「必选的」，以实现「显示状态初始化」
 */
export interface DisplayStateInitPackage extends DisplayStateData {
	[proxyID: string]: DisplayStateData
}

/**
 * 显示状态更新包
 * * 其中的「显示状态数据」都是「可选的」，以实现「部分更新」机制
 * * 这样也不用「为每个状态都写一个对应的『更新包』类型」了
 */
export interface DisplayStateRefreshPackage extends DisplayStateData {
	[proxyID: string]: Optional<DisplayStateData>
}
