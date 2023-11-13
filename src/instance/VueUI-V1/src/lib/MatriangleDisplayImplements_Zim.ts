import { Container, Shape } from 'zimjs/ts-src/typings/zim'
import {
	IDisplayStateData,
	IStateDisplayer,
} from 'matriangle-api/display/remoteDisplayAPI'
import BlockState from 'matriangle-api/server/block/BlockState'
import {
	iPoint,
	iPointRef,
	unfoldProject2D,
} from 'matriangle-common/geometricTools'
import { OptionalRecursive2 } from 'matriangle-common/utils'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { blockDisplayInitDict } from './canvasVisualizeBrowser'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'

/**
 * 方块状态数据（全有）
 */
export interface ZimDisplayDataBlock<
	StateType extends BlockState | null = BlockState | null,
> extends IDisplayStateData {
	// ! 这里所有的变量都是「全可选」或「全必选」的
	blockID: typeID
	blockState: StateType
}

/**
 * 所有需要接收「更新信息」的图形都继承该类
 */
export abstract class ZimShapeDisplayer<StateDataT extends IDisplayStateData>
	extends Shape
	implements IStateDisplayer<StateDataT>
{
	// ! 这下面仨函数对应着「可显示对象」的「初始化」「刷新」「销毁」的方法 ! //
	shapeInit(_data: StateDataT): void {
		// console.log('ZimDisplayShape.shapeInit', data)
	}

	/**
	 * @implements （部分化）刷新图形
	 * * 即便基于「完整数据」可以很方便地「销毁再初始化」，但这应该是子类需要做的事情
	 *
	 * @abstract 作为一个抽象方法，因为并非总是「完整数据」
	 * @param data 更新用的「数据补丁」
	 */
	abstract shapeRefresh(data: OptionalRecursive2<StateDataT>): void

	/**
	 * 图形销毁
	 */
	shapeDestruct(): void {
		this.graphics.clear()
	}
}

/**
 * 所有方块的对接呈现，作为一个`Shape`接受来自`BlockDisplayData`的更新
 */
export class ZimBlockDisplayer<
	BSType extends BlockState | null = BlockState | null,
> extends ZimShapeDisplayer<ZimDisplayDataBlock<BSType>> {
	/**
	 * 存储「当前方块id」
	 */
	protected _currentId: typeID = undefined as unknown as typeID
	/**
	 * 存储的「当前方块状态」
	 *
	 * !【2023-11-13 00:31:16】 目前强制需要统一，因为会在构造函数中间接设置
	 */
	protected _currentState: BSType = undefined as unknown as BSType

	public constructor(data: ZimDisplayDataBlock<BSType>) {
		super()
		// 设置当前状态
		this.shapeInit(data)
	}

	// 接口属性对接
	get blockID(): string {
		return this._currentId
	}
	get blockState(): BSType {
		return this._currentState
	}

	override shapeInit(data: ZimDisplayDataBlock<BSType>): void {
		super.shapeInit(data)
		this._currentState = data.blockState
	}

	override shapeRefresh(
		data: OptionalRecursive2<ZimDisplayDataBlock<BSType>>
	): void {
		// ID
		if (data?.blockID !== undefined) this._currentId = data.blockID
		// 状态
		if (data?.blockState !== undefined)
			this._currentState?.updateFrom(data.blockState)
		// 根据ID、状态重绘图形 // TODO: 目前还是使用硬编码进的字典，后续可能会使用更统一的管理方式
		blockDisplayInitDict[this._currentId]?.(this, this._currentState)
	}
}

/**
 * 存储其中的「位置-方块数据」键值对
 */
export type ZimDisplayDataMapBlocks = {
	[location: string]: ZimDisplayDataBlock
}

/**
 * 地图的「显示数据」
 */
export interface ZimDisplayDataMap extends IDisplayStateData {
	/**
	 * 尺寸：整数数组
	 * * 用于显示时调整「地图大小」
	 *
	 * ! 并非实际呈现时的尺寸
	 */
	size: uint[]

	/**
	 * 方块数据：依据'x,y'字符串为索引存储的数据
	 * * 用于更新方块
	 */
	blocks: ZimDisplayDataMapBlocks
}

/**
 * 总的「地图方块容器」对象
 *
 * TODO: 用于显示「一整个地图」，容纳方块并批量管理方块
 */
export class ZimMapDisplayer
	// 作为「承载『方块图形』的容器」
	extends Container
	// 作为「地图数据」的显示器
	implements IStateDisplayer<ZimDisplayDataMap>
{
	/**
	 * 点⇒坐标字串
	 *
	 * @static 统一的静态方法
	 */
	public static pointToCoordStr(point: int[]): string {
		return point.join(',')
	}

	/**
	 * 坐标字串⇒点
	 *
	 * @static 统一的静态方法
	 */
	public static coordStrToPoint<T extends int[] = int[]>(
		coordStr: string,
		target: T
	): T {
		coordStr.split(',').forEach((str: string, i: uint): void => {
			target[i] = parseInt(str)
		})
		return target
	}
	/**
	 * 将高维坐标投影到二维
	 * * 参考的是「几何工具」中的函数
	 */
	public projectTo2D(
		pos: iPoint,
		result: [int, int],
		padAxis: uint
	): [int, int] {
		return unfoldProject2D(this.size, pos, padAxis, result)
	}

	/**
	 * 存储「位置——方块」的字典
	 */
	public readonly blocks: {
		[pos: string]: ZimBlockDisplayer
	} = {}

	/**
	 * 存储「地图的位置大小」
	 * @example iPoint[4,4,4] = 4x4x4方块
	 */
	public readonly size: iPoint = new iPoint()

	/**
	 * 构造函数
	 */
	public constructor() {
		super()
	}

	// 实现接口 //
	shapeInit(data: ZimDisplayDataMap): void {
		// 尺寸
		this.size.copyFrom(data.size)
		// 方块
		this.initBlocks(data.blocks)
	}

	protected initBlocks(data: ZimDisplayDataMapBlocks): void {
		/** 每个位置的方块数据 */
		let blockData: ZimDisplayDataBlock
		/** 复用的「当前位置」指针 */
		const locationPointer: iPoint = new iPoint()
		for (const locationStr in data) {
			blockData = data[locationStr]
			this.setBlockSoft(
				ZimMapDisplayer.coordStrToPoint(locationStr, locationPointer),
				blockData
			)
		}
	}

	shapeRefresh(data: OptionalRecursive2<ZimDisplayDataMap>): void {
		// 尺寸
		if (data.size !== undefined) this.size.copyFrom(data.size)
	}

	shapeDestruct(): void {
		// 销毁所有子对象
		for (const blockDisplayer of Object.values(this.blocks)) {
			// 销毁子对象
			blockDisplayer.shapeDestruct()
			// 移除子对象
			this.removeChild(blockDisplayer)
		}
		// 清除所有键
		for (const key in this.blocks) delete this.blocks[key]
		// 清除`this.size`的元素
		this.size.clear()
	}

	/**
	 * 获取「是否有『方块显示者』」
	 */
	public hasBlock(pos: iPointRef): boolean {
		return this.blocks[pos.toString()] !== undefined
	}

	/**
	 * 获取指定位置的「方块显示者」
	 */
	public getBlockDisplayerAt(pos: iPointRef): ZimBlockDisplayer | null {
		return this.blocks[pos.toString()] ?? null
	}

	/**
	 * 软设置方块
	 * * 无「方块显示者」⇒创建
	 * * 有「方块显示者」⇒更新
	 *
	 * @param pos 要设置的方块的位置
	 * @param blockData 要设置的方块的数据
	 */
	public setBlockSoft(pos: iPointRef, blockData: ZimDisplayDataBlock): void {
		this._temp_pos_index = pos.toString()
		// 有⇒更新
		if (this._temp_pos_index in this.blocks)
			this.blocks[this._temp_pos_index].shapeRefresh(blockData)
		// 无⇒创建
		else this.setBlockHard(pos, blockData)
	}
	protected _temp_pos_index: string = ''

	/**
	 * 硬设置方块
	 * * 总是根据「方块显示状态」创建「方块显示者」并加入
	 * * 不会管「上一次创建过的图形」
	 *
	 * @param pos 要设置的方块的位置
	 * @param blockData 要设置的方块的数据
	 */
	public setBlockHard(pos: iPointRef, blockData: ZimDisplayDataBlock): void {
		/** 创建新的「方块显示器」 */
		const block: ZimBlockDisplayer = new ZimBlockDisplayer(blockData)
		/** 把高维坐标投影到两个「地图坐标」 */
		const [x, y] = this.projectTo2D(pos, [0, 0], 1 /* 暂且用y轴 */)
		// !【2023-11-13 17:51:37】暂时直接乘以「默认尺寸」
		block.pos(x * DEFAULT_SIZE, y * DEFAULT_SIZE)
	}

	/**
	 * 更新某个位置的方块
	 * * 位置无方块⇒
	 *
	 * @returns 更新是否起效
	 */
	public updateBlock(
		pos: iPointRef,
		blockData: OptionalRecursive2<ZimDisplayDataBlock>
	): boolean {
		/** 尝试获取方块 */
		const block: ZimBlockDisplayer | null = this.getBlockDisplayerAt(pos)
		// * 无方块⇒返回「失败」
		if (block === null) return false
		// * 有方块
		else {
			// 刷新方块
			block.shapeRefresh(blockData)
			// 返回「成功」
			return true
		}
	}
}
