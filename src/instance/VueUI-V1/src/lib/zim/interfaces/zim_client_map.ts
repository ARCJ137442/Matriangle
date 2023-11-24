import {
	DEFAULT_SIZE,
	DISPLAY_GRIDS,
	DISPLAY_SIZE,
} from 'matriangle-api/display/GlobalDisplayVariables'
import {
	IDisplayDataBlock,
	IStateDisplayer,
	IDisplayDataMap,
	IDisplayDataMapBlocks,
	locationStrToPoint,
	pointToLocationStr,
} from 'matriangle-api/display/RemoteDisplayAPI'
import {
	OptionalRecursive2,
	mergeObject,
	formatHEX,
	iPoint,
	unfoldProject2D,
	iPointVal,
	iPointRef,
	unfoldProjectPadBlockLength,
	inplaceMapIn,
} from 'matriangle-common'
import { uint, int } from 'matriangle-legacy'
import { Shape, Container, MovieClip } from 'zimjs'
import { ZimShapeDisplayer } from './zim_client_common'
import { graphicsLineStyle } from '../zimUtils'
import {
	typeID,
	typeIDMap,
} from 'matriangle-api/server/registry/IWorldRegistry'
import { IDisplayDataBlockState } from 'matriangle-api/server/block/BlockState'
import { ZimDisplayerMatrix } from './zim_client_matrix'
import { alignToGridCenter } from 'matriangle-api/server/general/PosTransform'

/**
 * 「根据『方块数据』绘制方块」的函数
 */
export type ZimDrawF_Block = <
	BS extends IDisplayDataBlockState | null = IDisplayDataBlockState | null,
>(
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
	BSType extends
		IDisplayDataBlockState | null = IDisplayDataBlockState | null,
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
	protected _currentState: BSType | null = undefined as unknown as BSType

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

	/**
	 * @implements 更新ID和状态，并绘制图形
	 *
	 * ? `drawF`的设置，真的合理吗
	 */
	override shapeInit(data: IDisplayDataBlock<BSType>): void {
		super.shapeInit(data)
		// 赋值ID
		this._currentId = data.id
		// 赋值状态（新旧这可能是不同类型）
		this._currentState = data.state
		// 调用「绘图函数」
		this.initShape()
	}

	override shapeRefresh(
		data: OptionalRecursive2<IDisplayDataBlock<BSType>>
	): void {
		// ID
		if (data?.id !== undefined) this._currentId = data.id
		// 状态
		if (data?.state !== undefined)
			if (this._currentState === null || data.state === null)
				// 任一为空⇒直接赋值
				this._currentState = data.state as unknown as BSType | null
			// 二者皆非空⇒合并对象
			// !【2023-11-15 21:26:54】将「方块状态显示数据」看作object，用以模拟「有状态⇒设置状态」「无状态⇒不更改」的「软更新」
			else mergeObject(data.state, this._currentState) // * 从`data.state`到`this._currentState`
		/* this._currentState = {
			...this._currentState,
			// * 然后用新的数据直接覆盖
			...data.state,
		} */

		// 根据ID、状态重绘图形
		this.shapeDestruct() // 先销毁
		this.initShape()
	}

	override shapeDestruct(): void {
		// 清除绘图
		this.graphics.clear()
	}

	/**
	 * 根据自身ID、状态绘制图形
	 */
	protected initShape(): void {
		// * 利用方法本身返回`Shape`的特性，判断是否失败
		console.log(
			'方块初始化！',
			this,
			this._currentId,
			this._currentState,
			this.blockDrawDict
		)
		if (
			this.blockDrawDict?.[this._currentId]?.(
				this,
				this._currentState
			) === undefined
		) {
			console.warn(
				'图形初始化失败：',
				this._currentId,
				this._currentState,
				this.blockDrawDict
			)
		}
	}
}

/**
 * 地图背景
 * * 承继自AS3版本`BattleTriangle-Gamma\batr\main\BackGround.as`
 * * （默认不包括）地图的「底座」
 * * 包括特别颜色的边线（Flash版本遗留）
 */
class ZimDisplayerMapBackground extends Shape {
	// 常量池（从Flash版本复刻） //
	public static readonly BACKGROUND_COLOR: uint = 0xdddddd
	public static readonly GRID_COLOR: uint = 0xd6d6d6
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 32
	public static readonly DEFAULT_DISPLAY_GRIDS: uint = DISPLAY_GRIDS
	public static readonly GRID_SPREAD: uint = 0
	public static readonly FRAME_LINE_COLOR: uint = 0x88ffff
	public static readonly FRAME_LINE_SIZE: number = DEFAULT_SIZE / 8

	/**
	 * 构造函数
	 */
	public constructor(
		/** 方块宽度（横向方块数） */
		protected _blockWidth: uint,
		/** 方块高度（纵向方块数） */
		protected _blockHeight: uint,
		/** 是否显示「地面」（即背景版） */
		protected _showGround: boolean = true, // !【2023-11-14 01:32:21】目前默认关闭
		/** 是否显示（内部）网格 */
		protected _showGrid: boolean = true,
		/** 是否显示网格边界线 */
		protected _showBorder: boolean = true
	) {
		super()
	}

	// getter & setter
	/**
	 * 是否显示「地面」
	 * * 即背景版
	 */
	public get showGround(): boolean {
		return this._showGround
	}
	public set showGround(value: boolean) {
		this._showGround = value
		// 更新
		this.update()
	}

	/** 是否显示「网格」 */
	public get showGrid(): boolean {
		return this._showGrid
	}
	public set showGrid(value: boolean) {
		this._showGrid = value
		// 更新
		this.update()
	}

	/** 是否显示「网格边界线」 */
	public get showGridBoundary(): boolean {
		return this._showBorder
	}
	public set showGridBoundary(value: boolean) {
		this._showBorder = value
		// 更新
		this.update()
	}

	/**
	 * 初始化：绘制指定整数尺寸的网格
	 * * 连接格点而非格内
	 * * 包括边线
	 */
	public initWithWH(width: uint, height: uint): void {
		this.updateWithWH(width, height)
	}

	/**
	 * 更新
	 *
	 * @param width 更新的长
	 * @param height 更新的宽
	 */
	public updateWithWH(width: uint, height: uint): void {
		this._blockWidth = width
		this._blockHeight = height
		this.update()
	}

	/**
	 * 更新
	 *
	 * @param width 更新的长
	 * @param height 更新的宽
	 */
	public update(): void {
		this.graphics.clear()
		this._showGround && this.drawGround(this._blockWidth, this._blockHeight)
		this._showGrid && this.drawGrid(this._blockWidth, this._blockHeight)
		this._showBorder && this.drawBorder(this._blockWidth, this._blockHeight)
	}

	/**
	 * 清空
	 */
	public clear(): void {
		this.graphics.clear()
	}

	// * 旧AS3绘图函数（迁移） * //

	/**
	 * Draws the ground with the specified width and height.
	 *
	 * @param {uint} width - The width of the ground.
	 * @param {uint} height - The height of the ground.
	 * @return {void} This function does not return anything.
	 */
	protected drawGround(width: uint, height: uint): void {
		this.graphics.beginFill(
			formatHEX(ZimDisplayerMapBackground.BACKGROUND_COLOR)
		)
		this.graphics.drawRect(
			0,
			0,
			width * DEFAULT_SIZE,
			height * DEFAULT_SIZE
		)
	}

	/**
	 * Draws a grid on the canvas.
	 *
	 * @param {uint} width - The width of the grid.
	 * @param {uint} height - The height of the grid.
	 * @param {int} beginX - The starting X coordinate of the grid.
	 * @param {int} beginY - The starting Y coordinate of the grid.
	 * @return {void} This function does not return anything.
	 */
	protected drawGrid(
		width: uint,
		height: uint,
		beginX: int = 0,
		beginY: int = 0
	): void {
		let dx: int = beginX,
			dy: int = beginY
		const mx: int = beginX + width,
			my: int = beginY + height
		graphicsLineStyle(
			this.graphics,
			ZimDisplayerMapBackground.GRID_SIZE,
			ZimDisplayerMapBackground.GRID_COLOR
		)
		// V
		while (dx <= mx) {
			this.drawLineInBlockGrid(dx, beginY, dx, my)
			dx++
		}
		// H
		while (dy <= my) {
			this.drawLineInBlockGrid(beginX, dy, mx, dy)
			dy++
		}
	}

	/**
	 * Draws a border around the specified width and height.
	 *
	 * @param {uint} width - The width of the border.
	 * @param {uint} height - The height of the border.
	 * @return {void}
	 */
	protected drawBorder(width: uint, height: uint): void {
		graphicsLineStyle(
			this.graphics,
			ZimDisplayerMapBackground.FRAME_LINE_SIZE,
			ZimDisplayerMapBackground.FRAME_LINE_COLOR
		)
		// * 新版重在「不要溢出地图的方块本身」
		const halfLineSize = ZimDisplayerMapBackground.FRAME_LINE_SIZE / 2,
			halfLineSizeMax_W = width * DEFAULT_SIZE - halfLineSize,
			halfLineSizeMax_H = height * DEFAULT_SIZE - halfLineSize
		// V
		this.drawLine(
			halfLineSize,
			halfLineSize,
			halfLineSize,
			halfLineSizeMax_H
		)
		this.drawLine(
			halfLineSizeMax_W,
			halfLineSizeMax_H,
			halfLineSize,
			halfLineSizeMax_H
		)
		// H
		this.drawLine(
			halfLineSize,
			halfLineSize,
			halfLineSizeMax_W,
			halfLineSize
		)
		this.drawLine(
			halfLineSizeMax_W,
			halfLineSizeMax_H,
			halfLineSizeMax_W,
			halfLineSize
		)
	}

	protected drawLineInBlockGrid(x1: int, y1: int, x2: int, y2: int): void {
		this.drawLine(
			DEFAULT_SIZE * x1,
			DEFAULT_SIZE * y1,
			DEFAULT_SIZE * x2,
			DEFAULT_SIZE * y2
		)
	}

	protected drawLine(x1: int, y1: int, x2: int, y2: int): void {
		this.graphics.moveTo(x1, y1)
		this.graphics.lineTo(x2, y2)
	}
}

/**
 * 「地图呈现者」
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
	 * * 使用「方块坐标」而非「显示坐标」
	 *
	 * ! 会修改其中的result参数，若无则创建
	 */
	public projectTo2D(
		pos: number[],
		result: [number, number] = [0, 0],
		padAxis: uint = this.padAxis
	): [number, number] {
		return unfoldProject2D(this.size, pos, padAxis, result)
	}

	/**
	 * 将高维坐标投影到二维
	 * * 参考的是「几何工具」中的函数
	 * * 使用「显示坐标」
	 *
	 * ! 会修改其中的result参数，若无则创建
	 */
	public projectTo2D_display(
		pos: number[],
		result: [number, number] = [0, 0],
		padAxis: uint = this.padAxis
	): [number, number] {
		// 投影
		this.projectTo2D(pos, result, padAxis)
		// 倍乘
		result[0] *= DEFAULT_SIZE
		result[1] *= DEFAULT_SIZE
		// 返回
		return result
	}

	/**
	 * 将高维坐标投影到二维，并对齐网格中心
	 * * 参考的是「几何工具」中的函数
	 * * 使用「显示坐标」
	 * * 面向「实体显示」，以便实体使用「rotation」以自身为中心旋转
	 *
	 * ! 会修改其中的result参数，若无则创建
	 */
	public projectTo2D_display_center(
		pos: number[],
		result: [number, number] = [0, 0],
		padAxis: uint = this.padAxis
	): [number, number] {
		// 投影
		this.projectTo2D(pos, result, padAxis)
		// 对齐 // !【2023-11-19 21:25:18】↓下面这个是等于不是增加
		result[0] = alignToGridCenter(result[0])
		result[1] = alignToGridCenter(result[1])
		// 倍乘
		result[0] *= DEFAULT_SIZE
		result[1] *= DEFAULT_SIZE
		// 返回
		return result
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
		 * 存储对「母体呈现者」的引用
		 * * 用于通知「母体呈现者」更新位置
		 */
		public readonly host: ZimDisplayerMatrix,
		/**
		 * 存储对「方块绘图字典」的**引用**
		 */
		public blockDrawDict: typeIDMap<ZimDrawF_Block>,
		/**
		 * 存储用于显示「背景」的图形
		 */
		protected background: ZimDisplayerMapBackground = new ZimDisplayerMapBackground(
			0,
			0 // 两个零当默认值
		),
		/**
		 * 存储用于显示「背景」的图形
		 */
		protected blockContainer: MovieClip = new MovieClip()
	) {
		super()
		// !【2023-11-19 12:10:24】不能设置舞台引用，因为`stage`属性是只读的

		// 添加背景
		this.addChildAt(background, 0)
		// 添加方块容器
		this.addChildAt(blockContainer, 1)
	}

	// 实现接口 //

	/** @implements 分别初始化尺寸和方块 */
	shapeInit(data: IDisplayDataMap): void {
		// 检验合法性
		if (data.size === undefined || data.blocks === undefined)
			throw new Error(
				`ZimDisplayerMap: 数据不合法！${String(data.size)}, ${String(
					data.blocks
				)}`
			)
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
		let blockData: IDisplayDataBlock | null
		/** 复用的「当前位置」指针 */
		const locationPointer: iPoint = new iPoint()
		// 遍历所有位置
		for (const locationStr in data) {
			try {
				blockData = data[locationStr]
				this.setBlockSoft(
					// 包括了`null`的情况
					locationStrToPoint(locationStr, locationPointer),
					blockData
				)
			} catch (e) {
				console.error(
					'初始化方块出现错误！',
					e,
					locationStr,
					data,
					this
				)
			}
		}
	}

	shapeRefresh(data: OptionalRecursive2<IDisplayDataMap>): void {
		// * 尺寸
		if (data?.size !== undefined) this.refreshSize(data.size)
		// * 方块
		if (data?.blocks !== undefined) this.refreshBlocks(data.blocks)
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
		const isSizeEqual = this.size.isEqualWide(size)
		if (isSizeEqual) return console.debug('尺寸相同，不更新')
		// 尺寸拷贝
		this.size.copyFrom(size)
		console.debug('地图尺寸更新！', size, '->', this.size)
		// 绘制网格
		this.background.updateWithWH(...this.unfoldedBlockSize2D)
		// !【2023-11-13 22:52:04】有关「画布大小」的「尺寸控制」现在交给外部进行
		// !【2023-11-19 12:15:27】现在有了舞台的引用，可以试着在内部进行更新
		// 通知母体进行更新
		this.host.relocateInFrame()
	}

	/**
	 * 刷新方块数据
	 * * 遍历其中的所有坐标，通知每个「方块呈现者」进行刷新
	 *
	 * @param data_blocks 方块数据补丁
	 */
	protected refreshBlocks(
		data_blocks: OptionalRecursive2<IDisplayDataMapBlocks>
	): void {
		console.group('更新方块！')
		console.log('blocks =', data_blocks)
		// 临时变量（指针）
		const locationPointer = new iPoint()
		let blockDataPatch: OptionalRecursive2<IDisplayDataBlock> | null
		// 遍历要更新的每个位置
		for (const locationStr in data_blocks) {
			try {
				blockDataPatch = data_blocks[locationStr] ?? null
				// 更新方块
				this.updateBlock(
					// 转换坐标
					locationStrToPoint(locationStr, locationPointer),
					blockDataPatch
				)
				console.log(
					'更新方块！',
					locationStr,
					'=>',
					locationPointer,
					blockDataPatch
				)
			} catch (e) {
				console.error(
					'更新方块出现错误！',
					e,
					locationStr,
					data_blocks,
					this
				)
			}
		}
		console.groupEnd()
	}

	shapeDestruct(): void {
		// 销毁所有子对象
		for (const blockDisplayer of Object.values(this.blocks)) {
			// 销毁子对象
			blockDisplayer.shapeDestruct()
			// 移除子对象
			this.blockContainer.removeChild(blockDisplayer)
		}
		this.removeAllChildren()
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
		return this.blocks[pointToLocationStr(pos)] !== undefined
	}

	/**
	 * 获取指定位置的「方块显示者」
	 */
	public getBlockDisplayerAt(pos: iPointRef): ZimDisplayerBlock | null {
		return this.blocks[pointToLocationStr(pos)] ?? null
	}

	/**
	 * 软设置方块
	 * * 无「方块显示者」⇒创建
	 * * 有「方块显示者」⇒更新
	 *
	 * @param pos 要设置的方块的位置
	 * @param blockData 要设置的方块的数据
	 */
	public setBlockSoft(
		pos: iPointRef,
		blockData: IDisplayDataBlock | null
	): void {
		this._temp_pos_index = pointToLocationStr(pos)
		// null⇒清除
		if (blockData === null) this.removeBlock(pos, this._temp_pos_index)
		else {
			// 有⇒更新
			if (this.hasBlockDisplayerAt(pos))
				// ! 不加上泛型类型「never」容易导致「实例化过深」错误
				this.blocks[this._temp_pos_index].shapeRefresh(
					blockData as IDisplayDataBlock<never>
				)
			// 无⇒创建
			else this.setBlockHard(pos, blockData)
		}
	}
	protected _temp_pos_index: string = ''

	/**
	 * 硬设置方块
	 * * 总是根据「方块显示状态」创建「方块显示者」并加入
	 * * 不会管「上一次创建过的图形」
	 *
	 * @param pos 要设置的方块的位置
	 * @param blockData 要设置的方块的数据
	 * @returns 返回新的呈现者
	 */
	public setBlockHard(
		pos: iPointRef,
		blockData: IDisplayDataBlock
	): ZimDisplayerBlock {
		// 预先检查
		if (pos.checkInvalid())
			throw new Error(`[ZimDisplayer] 无效坐标：${pos.join(',')}`)
		if (!pos.checkType())
			throw new Error(`[ZimDisplayer] 无效类型：${pos.join(',')}`)
		/** 创建新的「方块显示器」 */
		const block: ZimDisplayerBlock = new ZimDisplayerBlock(
			blockData,
			this.blockDrawDict
		)
		/** 把高维坐标投影到两个「显示坐标」 */
		const [dX, dY] = this.projectTo2D_display(
			pos,
			[0, 0],
			this.padAxis /* 暂且用y轴 */
		)

		// !【2023-11-13 17:51:37】暂时直接乘以「默认尺寸」
		block.pos(dX, dY)
		// 添加进容器
		this.blockContainer.addChild(block)

		console.debug(
			'[ZimDisplayer] 硬设置方块！',
			pos,
			'=>',
			[uint(dX / DISPLAY_SIZE), uint(dY / DISPLAY_SIZE)],
			block,
			blockData,
			this.blocks
		)
		// 添加进记忆
		this.blocks[pointToLocationStr(pos)] = block
		// 返回创建的「方块呈现者」
		return block
	}

	/**
	 * 删除某个位置的方块
	 */
	public removeBlock(
		pos: iPointRef,
		_temp_pos_index: string = pointToLocationStr(pos)
	): void {
		// 移出child
		this.blockContainer.removeChild(this.blocks[this._temp_pos_index])
		// 删除索引
		delete this.blocks[this._temp_pos_index]
	}

	/**
	 * 更新某个位置的方块
	 * * 位置无方块⇒是否有`id`属性？创建新的「方块呈现者」：失败
	 * * 位置有方块⇒刷新方块
	 *
	 * @returns 更新是否起效
	 */
	public updateBlock(
		pos: iPointRef,
		blockData: OptionalRecursive2<IDisplayDataBlock> | null
	): boolean {
		/** 尝试获取方块 */
		const block: ZimDisplayerBlock | null =
			this.getBlockDisplayerAt(pos) /* ??
			(blockData?.id === undefined
				? null
				: this.setBlockHard(
						pos,
						blockData as unknown as IDisplayDataBlock
				  )) */
		// * 无方块⇒返回「失败」
		if (block === null) return false
		// * 有方块
		else {
			// * 数据为null⇒删除方块
			if (blockData === null) this.removeBlock(pos)
			// * 否则⇒刷新方块
			else block.shapeRefresh(blockData)
			// 返回「成功」
			return true
		}
	}

	public get unfoldedBlockSize2D(): [uint, uint] {
		return this.padAxis === 0
			? // * x方向展开
			  [
					this.size[0] *
						(1 +
							unfoldProjectPadBlockLength(
								this.size,
								this.borderMax
							)),
					this.size[1],
			  ]
			: // * y方向展开
			  [
					this.size[0],
					this.size[1] *
						(1 +
							unfoldProjectPadBlockLength(
								this.size,
								this.borderMax
							)),
			  ]
	}

	/**
	 * 展开后「理论显示尺寸」
	 * * 等同于「展开后方块尺寸 * 每格『理论显示大小/默认尺寸』」
	 */
	public get unfoldedDisplaySize2D(): [number, number] {
		return inplaceMapIn(
			this.unfoldedBlockSize2D,
			ZimDisplayerMap.times_defaultSize
		) as [number, number]
	}
	public static readonly times_defaultSize = (x: number): number =>
		x * DEFAULT_SIZE

	/**
	 * 获取上边界
	 * * 此「边界」的定义：地图中「合法坐标」的最大值
	 * * 在基于[0 ~ sizeX-1, 0 ~ sizeY-1]的坐标系中，此「边界」的定义：「尺寸」批量减1
	 */
	public get borderMax(): iPointRef {
		return this._temp_borderMax.copyFrom(this.size).addFromSingle(-1)
	}
	protected _temp_borderMax: iPointVal = new iPoint()
}
