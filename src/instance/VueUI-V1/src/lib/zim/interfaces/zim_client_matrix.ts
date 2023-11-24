import {
	IStateDisplayer,
	IDisplayDataMatrix,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { OptionalRecursive2 } from 'matriangle-common'
import { Container, DisplayObject, Frame, Stage } from 'zimjs'
import { ZimDisplayerEntities } from './zim_client_entities'
import { ZimDisplayerMap } from './zim_client_map'
import {
	ENTITY_DRAW_DICT_BATR,
	ENTITY_DRAW_DICT_NARS,
	ENTITY_DRAW_DICT_NATIVE,
	EntityDrawDict,
} from '../implements/zim_client_entity'
import {
	BLOCK_DRAW_DICT_BATR,
	BLOCK_DRAW_DICT_NARS,
	BLOCK_DRAW_DICT_NATIVE,
	BlockDrawDict,
} from '../implements/zim_client_block'

/**
 * 总体的「母体呈现者」入口
 */
export class ZimDisplayerMatrix
	extends Container
	implements IStateDisplayer<IDisplayDataMatrix>
{
	/** 地图呈现者 */
	public readonly map: ZimDisplayerMap
	/** 实体系统呈现者 */
	public readonly entities: ZimDisplayerEntities

	public constructor(
		/**
		 * 存储对「真正的舞台」的引用
		 */
		public readonly realStage: Stage,
		/** 方块绘图字典 */
		blockDrawDict: BlockDrawDict,
		/** 实体绘图字典 */
		entityDrawDict: EntityDrawDict
	) {
		// 初始化this
		super()
		// 初始化子元素
		this.map = new ZimDisplayerMap(this, blockDrawDict)
		this.entities = new ZimDisplayerEntities(this, entityDrawDict)
		// 添加子元素 // ! 强制转换成「容器」加入
		this.addChildAt(this.map as unknown as DisplayObject, 0)
		// TODO: 实体暂时在方块之上
		this.addChildAt(this.entities as unknown as DisplayObject, 1)
	}

	// 实现接口 //
	shapeInit(data: IDisplayDataMatrix): void {
		console.log('母体初始化！', data, this)
		// 更新地图
		if (data?.map !== undefined) this.map.shapeInit(data.map)
		// 更新实体
		if (data.entities !== undefined) this.entities.shapeInit(data.entities)
	}
	shapeRefresh(data: OptionalRecursive2<IDisplayDataMatrix>): void {
		console.log('母体更新！', data, this)
		// 更新地图
		if (data?.map !== undefined) this.map.shapeRefresh(data.map)
		// 更新实体
		if (data?.entities !== undefined)
			this.entities.shapeRefresh(data.entities)
	}
	shapeDestruct(): void {
		// 通知地图、实体系统
		this.map.shapeDestruct()
		this.entities.shapeDestruct()
		// 删除所有子元素
		this.removeAllChildren()
	}

	/**
	 * 在「舞台」中进行「重定位」
	 * * 呈现效果：将自身通过「适度缩放&平移」置于「帧」中央
	 */
	public relocateInFrame(stage: Stage = this.realStage): this {
		if (stage === null) throw new Error('居然是空的舞台！')

		// ! 下面是基于地图做的更新 ! //

		const [actualW, actualH] = this.map.unfoldedDisplaySize2D
		// * 尺寸为零⇒缩放无意义
		if (actualW == 0 || actualH == 0) return this
		// * 尺寸为NaN⇒缩放非法
		else if (isNaN(actualW) || isNaN(actualH)) {
			console.error(
				'尺寸非法！',
				[actualW, actualH],
				stage,
				this.map.size,
				this.map.blocks
			)
			return this
		}

		// this.fit(0, 0, stage.width, stage.height, true)
		// this.scaleTo(stage)
		// 保持纵横比的缩放
		this.scaleX = this.scaleY = Math.min(
			stage.height / actualH,
			stage.width / actualW
		)
		// 居中（适应边框） // * 要点：地图以左上角为原点
		this.x = (stage.width - actualW * this.scaleX) / 2
		this.y = (stage.height - actualH * this.scaleY) / 2
		console.debug(
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

/**
 * 添加一个空的「母体呈现者」
 *
 * @param frame 所属帧
 * @returns 新构造出来的「母体呈现者」
 */
export function addEmptyMatrixDisplayer(
	frame: Frame,
	blockDrawDict: BlockDrawDict,
	entityDrawDict: EntityDrawDict
): ZimDisplayerMatrix {
	const displayer = new ZimDisplayerMatrix(
		frame.stage,
		blockDrawDict,
		entityDrawDict
	)
	// 添加进舞台 // ! 这里因为Zim.js和Create.js方法的不兼容，需要手动转换成「显示对象」
	frame.stage.addChild(displayer as unknown as DisplayObject)
	// 返回
	return displayer
}

/**
 * 默认的「大全集」显示配置
 * * 🎯把「UI呈现文件」和「UI逻辑文件」更彻底地分离
 */
export const DEFAULT_DRAW_MAPS: [BlockDrawDict, EntityDrawDict] = [
	{
		...BLOCK_DRAW_DICT_NATIVE,
		...BLOCK_DRAW_DICT_BATR,
		...BLOCK_DRAW_DICT_NARS,
	},
	{
		...ENTITY_DRAW_DICT_NATIVE,
		...ENTITY_DRAW_DICT_BATR,
		...ENTITY_DRAW_DICT_NARS,
	},
]
