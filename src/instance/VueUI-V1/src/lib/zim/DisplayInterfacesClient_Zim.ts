import { Container, Shape, Stage } from 'zimjs'
import {
	IDisplayDataBlock,
	IDisplayDataMap,
	IDisplayStateData,
	IStateDisplayer,
	IDisplayDataMapBlocks,
	locationStrToPoint,
} from 'matriangle-api/display/remoteDisplayAPI'
import BlockState from 'matriangle-api/server/block/BlockState'
import {
	iPoint,
	iPointRef,
	iPointVal,
	unfoldProject2D,
	unfoldProjectPadBlockLength,
} from 'matriangle-common/geometricTools'
import { OptionalRecursive2 } from 'matriangle-common/utils'
import {
	typeID,
	typeIDMap,
} from 'matriangle-api/server/registry/IWorldRegistry'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'

/**
 * 所有需要接收「更新信息」的图形都继承该类
 */
export abstract class ZimShapeDisplayer<StateDataT extends IDisplayStateData>
	extends Shape
	implements IStateDisplayer<StateDataT>
{
	// ! 这下面仨函数对应着「可显示对象」的「初始化」「刷新」「销毁」的方法 ! //
	shapeInit(_data: StateDataT, ..._otherArgs: any[]): void {
		// console.log('ZimDisplayShape.shapeInit', data)
	}

	/**
	 * @implements （部分化）刷新图形
	 * * 即便基于「完整数据」可以很方便地「销毁再初始化」，但这应该是子类需要做的事情
	 *
	 * @abstract 作为一个抽象方法，因为并非总是「完整数据」
	 * @param data 更新用的「数据补丁」
	 */
	abstract shapeRefresh(
		data: OptionalRecursive2<StateDataT>,
		...otherArgs: any[]
	): void

	/**
	 * 图形销毁
	 */
	shapeDestruct(..._otherArgs: any[]): void {
		this.graphics.clear()
	}
}

/**
 * 「根据『方块数据』绘制方块」的函数
 */
export type ZimDrawF_Block = <BS extends BlockState | null = BlockState | null>(
	shape: Shape,
	stateData: BS
) => Shape

/**
 * 「方块呈现者」
 * * 作为一个`Shape`接受来自`BlockDisplayData`的更新
 *
 * @template BSType 内部方块状态的类型
 */
export class ZimDisplayerBlock<
	BSType extends BlockState | null = BlockState | null,
> extends ZimShapeDisplayer<IDisplayDataBlock<BSType>> {
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

	/**
	 * 构造方法
	 */
	public constructor(
		initialData: IDisplayDataBlock<BSType>,
		/**
		 * 存储对「方块绘图字典」的**引用**
		 */
		public blockDrawDict: typeIDMap<ZimDrawF_Block>
	) {
		super()
		// 设置当前状态
		this.shapeInit(initialData)
	}

	// 接口属性对接
	get blockID(): string {
		return this._currentId
	}
	get blockState(): BSType {
		return this._currentState
	}

	/**
	 * @implements 更新ID和状态，并绘制图形
	 *
	 * ? `drawF`的设置，真的合理吗
	 */
	override shapeInit(data: IDisplayDataBlock<BSType>): void {
		super.shapeInit(data)
		// 赋值ID
		this._currentId = data.blockID
		// 赋值状态（新旧这可能是不同类型）
		this._currentState = data.blockState
		// 调用「绘图函数」
		this.initShape()
	}

	override shapeRefresh(
		data: OptionalRecursive2<IDisplayDataBlock<BSType>>
	): void {
		// ID
		if (data?.blockID !== undefined) this._currentId = data.blockID
		// 状态
		if (data?.blockState !== undefined)
			// 使用方块状态的「更新」方法
			this._currentState?.updateFrom(data.blockState)
		// 根据ID、状态重绘图形
		this.shapeDestruct() // 先销毁
		this.initShape()
	}

	override shapeDestruct(..._otherArgs: any[]): void {
		// 清除绘图
		this.graphics.clear()
	}

	/**
	 * 根据自身ID、状态重绘图形
	 */
	protected initShape(): void {
		// * 利用方法本身返回`Shape`的特性，判断是否失败
		if (
			this.blockDrawDict?.[this._currentId]?.(
				this,
				this._currentState
			) === undefined
		) {
			console.log(
				'绘制失败',
				this._currentId,
				this._currentState,
				this.blockDrawDict
			)
		}
	}
}

/**
 * 总的「地图方块容器」对象
 * * 用于显示「一整个地图」，容纳方块并批量管理方块
 */
export class ZimDisplayerMap
	// 作为「承载『方块图形』的容器」
	extends Container
	// 作为「地图数据」的显示器
	implements IStateDisplayer<IDisplayDataMap>
{
	// 数据转换 & 几何辅助 //

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
	 * 存储「位置——方块呈现者」的字典
	 * * 这里的「方块呈现者」自身已经包含「方块状态」，因此无需再准备一个「方块状态字典」
	 */
	public readonly blocks: { [location: string]: ZimDisplayerBlock } = {}

	/**
	 * 存储「地图的尺寸大小」
	 * @example iPoint[4,4,4] = 4x4x4方块
	 */
	public readonly size: iPointVal = new iPoint()

	/**
	 * （静态常量）平铺轴
	 * * 决定在「高维地图平铺」时，哪个轴开始（正方向）平铺
	 *   * 0: X轴
	 *   * 1: Y轴
	 */
	public padAxis: uint = 1

	/**
	 * 构造函数
	 */
	public constructor(
		/**
		 * 存储对「方块绘图字典」的**引用**
		 */
		public blockDrawDict: typeIDMap<ZimDrawF_Block>
	) {
		super()
	}

	// 实现接口 //

	/** @implements 分别初始化尺寸和方块 */
	shapeInit(data: IDisplayDataMap): void {
		// 尺寸
		this.refreshSize(data.size)
		// 方块
		this.initBlocks(data.blocks)
	}

	/**
	 * 根据数据初始化「方块呈现者」
	 * * 对其中的每个位置，都会创建一个「方块」
	 *
	 * @param data 方块数据
	 */
	protected initBlocks(data: IDisplayDataMapBlocks): void {
		/** 每个位置的方块数据 */
		let blockData: IDisplayDataBlock
		/** 复用的「当前位置」指针 */
		const locationPointer: iPoint = new iPoint()
		// 遍历所有位置
		for (const locationStr in data) {
			blockData = data[locationStr]
			this.setBlockSoft(
				locationStrToPoint(locationStr, locationPointer),
				blockData
			)
		}
	}

	shapeRefresh(data: OptionalRecursive2<IDisplayDataMap>): void {
		// * 尺寸
		if (data.size !== undefined) this.refreshSize(data.size)
		// * 方块
		if (data.blocks !== undefined) this.refreshBlocks(data.blocks)
	}

	/**
	 * 刷新地图尺寸
	 * * 可能需要在「屏幕尺寸」上下工夫——比如，动态调整画布大小
	 * *
	 *
	 * ! 不会检查这里数组的类型。。。
	 *
	 * @param size 地图尺寸
	 */
	protected refreshSize(size: int[]): void {
		// 尺寸拷贝
		this.size.copyFrom(size)
		// !【2023-11-13 22:52:04】有关「画布大小」的「尺寸控制」现在交给外部进行
		// 绘制网格
	}

	/**
	 * 刷新方块数据
	 * * 遍历其中的所有坐标，通知每个「方块呈现者」进行刷新
	 *
	 * @param blocks 方块数据补丁
	 */
	protected refreshBlocks(
		blocks: OptionalRecursive2<IDisplayDataMapBlocks>
	): void {
		// 临时变量（指针）
		const locationPointer = new iPoint()
		let blockDataPatch: OptionalRecursive2<IDisplayDataBlock>
		// 遍历要更新的每个位置
		for (const location in blocks) {
			blockDataPatch = blocks[location]!
			// 更新方块
			this.updateBlock(
				// 转换坐标
				locationStrToPoint(location, locationPointer),
				blockDataPatch
			)
		}
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

	// 方块显示操纵 //

	/**
	 * 获取「是否有『方块显示者』」
	 */
	public hasBlockDisplayerAt(pos: iPointRef): boolean {
		return this.blocks[pos.toString()] !== undefined
	}

	/**
	 * 获取指定位置的「方块显示者」
	 */
	public getBlockDisplayerAt(pos: iPointRef): ZimDisplayerBlock | null {
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
	public setBlockSoft(pos: iPointRef, blockData: IDisplayDataBlock): void {
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
	public setBlockHard(pos: iPointRef, blockData: IDisplayDataBlock): void {
		/** 创建新的「方块显示器」 */
		const block: ZimDisplayerBlock = new ZimDisplayerBlock(
			blockData,
			this.blockDrawDict
		)
		/** 把高维坐标投影到两个「地图坐标」 */
		const [x, y] = this.projectTo2D(
			pos,
			[0, 0],
			this.padAxis /* 暂且用y轴 */
		)
		// !【2023-11-13 17:51:37】暂时直接乘以「默认尺寸」
		block.pos(x * DEFAULT_SIZE, y * DEFAULT_SIZE)
		// 添加进自身
		this.addChild(block)
	}

	/**
	 * 更新某个位置的方块
	 * * 位置无方块⇒失败
	 * * 位置有方块⇒刷新方块
	 *
	 * @returns 更新是否起效
	 */
	public updateBlock(
		pos: iPointRef,
		blockData: OptionalRecursive2<IDisplayDataBlock>
	): boolean {
		/** 尝试获取方块 */
		const block: ZimDisplayerBlock | null = this.getBlockDisplayerAt(pos)
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

	public get actualSize2D(): [number, number] {
		return this.padAxis === 0
			? // * x方向展开
			  [
					this.size[0] *
						(1 +
							unfoldProjectPadBlockLength(
								this.size,
								this.borderMax
							)) *
						DEFAULT_SIZE,
					this.size[1] * DEFAULT_SIZE,
			  ]
			: // * y方向展开
			  [
					this.size[0] * DEFAULT_SIZE,
					this.size[1] *
						(1 +
							unfoldProjectPadBlockLength(
								this.size,
								this.borderMax
							)) *
						DEFAULT_SIZE,
			  ]
	}

	/**
	 * 获取上边界
	 * * 此「边界」的定义：地图中「合法坐标」的最大值
	 * * 在基于[0 ~ sizeX-1, 0 ~ sizeY-1]的坐标系中，此「边界」的定义：「尺寸」批量减1
	 */
	public get borderMax(): iPointRef {
		return this._temp_borderMax.copyFrom(this.size).addFromSingle(-1)
	}
	protected _temp_borderMax: iPointVal = new iPoint()

	/**
	 * 在一个「帧」（亦或AS3 Flash中的「舞台」）中进行「重定位」
	 * * 呈现效果：将自身通过「适度缩放&平移」置于「帧」中央
	 */
	public relocateInFrame(stage: Stage): this {
		const [actualW, actualH] = this.actualSize2D
		// this.fit(0, 0, stage.width, stage.height, true)
		this.scaleTo(stage)
		// 保持纵横比的缩放
		this.scaleX = this.scaleY = Math.min(
			stage.height / actualH,
			stage.width / actualW
		)
		// 居中（适应边框） // * 要点：地图以左上角为原点
		this.x = (stage.width - actualW * this.scaleX) / 2
		this.y = (stage.height - actualH * this.scaleY) / 2
		console.log(
			'relocateInFrame',
			[stage.width, stage.height],
			[this.width, this.height],
			[actualW, actualH],
			[this.scaleX, this.scaleY],
			[this.x, this.y]
		)
		return this
	}
}
