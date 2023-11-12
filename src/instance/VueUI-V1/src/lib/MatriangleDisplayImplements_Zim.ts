import { Container, Shape } from 'zimjs/ts-src/typings/zim'
import { BlockDisplayData } from './zimDisplayAPI'
import BlockState from 'matriangle-api/server/block/BlockState'
import { Optional, iPoint, iPointRef } from 'matriangle-common'
import { typeID } from 'matriangle-api'
import { blockDisplayInitDict } from './canvasVisualizeBrowser'
import { int } from 'matriangle-legacy/AS3Legacy'

/**
 * 所有需要接收「更新信息」的图形都继承该类
 */
export abstract class ZimDisplayShape<StateDataT> extends Shape {
	// ! 这下面仨函数对应着「可显示对象」的「初始化」「刷新」「销毁」的方法 ! //
	/**
	 * 图形初始化
	 */
	public shapeInit(_data: StateDataT): void {
		// console.log('ZimDisplayShape.shapeInit', data)
	}

	/**
	 * （部分化）刷新图形
	 *
	 * @abstract 作为一个抽象方法，因为并非总是「完整数据」
	 * * 即便基于「完整数据」可以很方便地「销毁再初始化」，但这应该是子类需要做的事情
	 * @param data 更新用的「数据补丁」
	 */
	public abstract shapeRefresh(data: Optional<StateDataT>): void

	/**
	 * 图形销毁
	 */
	public shapeDestruct(): void {
		this.graphics.clear()
	}
}

/**
 * 所有方块的对接呈现，作为一个`Shape`接受来自`BlockDisplayData`的更新
 */
export class ZimDisplayShapeBlock<
	BSType extends BlockState | null = BlockState | null,
> extends ZimDisplayShape<BlockDisplayData<BSType>> {
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

	public constructor(data: BlockDisplayData<BSType>) {
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

	shapeInit(data: BlockDisplayData<BSType>): void {
		super.shapeInit(data)
		this._currentState = data.blockState
	}

	shapeRefresh(data: Optional<BlockDisplayData<BSType>>): void {
		// 更新数据
		if (data?.blockID !== undefined) this._currentId = data.blockID
		if (data?.blockState !== undefined) this._currentState = data.blockState
		// 根据ID、状态重绘图形 // TODO: 目前还是使用硬编码进的字典，后续可能会使用更统一的管理方式
		blockDisplayInitDict[this._currentId]?.(this, this._currentState)
	}
}

/**
 * 总的「地图方块容器」对象
 *
 * TODO: 用于显示「一整个地图」，容纳方块并批量管理方块
 */
export class ZimMapBlockContainer extends Container {
	/**
	 * 将高维坐标投影到二维
	 */
	public static projectTo2D(pos: iPoint): [int, int] {
		// TODO: 就像「文字可视化器」那样
		return [0, 0]
	}

	/**
	 * 存储「位置——方块」的字典
	 */
	public readonly blocks: {
		[pos: string]: ZimDisplayShapeBlock
	} = {}

	/**
	 * 存储「地图的位置大小」
	 * @example iPoint[4,4,4] = 4x4x4方块
	 */

	/**
	 * 构造函数
	 */
	public constructor() {
		super()
	}

	/**
	 * 获取「是否有『方块显示图形』」
	 */
	public hasBlock(pos: iPointRef): boolean {
		return this.blocks[pos.toString()] !== undefined
	}

	/**
	 * 获取指定位置的「方块显示图形」
	 */
	public getBlock(pos: iPointRef): ZimDisplayShapeBlock | null {
		return this.blocks[pos.toString()] ?? null
	}

	/**
	 * 软设置方块
	 * * 无「方块显示图形」⇒创建
	 * * 有「方块显示图形」⇒更新
	 */
	public setBlockSoft(pos: iPointRef, blockData: BlockDisplayData): void {
		this._temp_pos_index = pos.toString()
		// 有⇒更新
		if (this._temp_pos_index in this.blocks)
			this.blocks[this._temp_pos_index].shapeRefresh(blockData)

		// 无⇒创建
	}
	protected _temp_pos_index: string = ''

	/**
	 * 硬设置方块
	 * * 总是根据「方块显示状态」创建「方块显示图形」并加入
	 * * 不会管「上一次创建过的图形」
	 *
	 * TODO: 实现
	 */
	public setBlock(pos: iPoint, blockData: BlockDisplayData): void {}
}
