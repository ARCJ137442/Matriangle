import IMatrix from 'matriangle-api/server/main/IMatrix'
import { entityLV实体列表可视化 } from '../logic/textVisualizations'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import MatrixVisualizer, {
	NativeVisualizationTypeFlag,
} from './MatrixVisualizer'
import { typeID } from 'matriangle-api'
import MatrixVisualizerText from './MatrixVisualizerText'

/**
 * 「文本母体可视化者」是
 * * 用于传递母体的可视化信号的
 * * 以「canvas指令」形式传递母体信号的
 * 可视化者
 *
 * TODO: 或许需要把「实体列表」独立出来，并且封装出一个可用的「服务器对象」以便复用WS服务
 */
export default class MatrixVisualizerCanvas extends MatrixVisualizer {
	/** ID */
	public static readonly ID: typeID = 'MatrixVisualizerCanvas'
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel =
		'Visualizer:Matrix@canvas'

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IMatrix | null = null
	) {
		super(MatrixVisualizerCanvas.ID, MatrixVisualizerCanvas.LABEL)
	}

	// 母体可视化部分 //
	/**
	 * （静态）根据「类型标签」获取母体的可视化信号
	 *
	 */
	public static getVisionSignalMatrix(
		matrix: IMatrix,
		typeFlag: string
	): string {
		let JSONDisplayData: unknown
		switch (typeFlag) {
			case NativeVisualizationTypeFlag.OTHER_INFORMATION:
				// （保留）以纯文本方式返回「实体列表」
				return entityLV实体列表可视化(matrix.entities)
			// * 全新的「显示数据传递」
			case NativeVisualizationTypeFlag.INIT:
				// 转换为JSON
				JSONDisplayData = matrix.getDisplayDataInit()
				return JSON.stringify(JSONDisplayData)
			case NativeVisualizationTypeFlag.REFRESH:
				// 转换为JSON
				JSONDisplayData = matrix.getDisplayDataRefresh()
				return JSON.stringify(JSONDisplayData)
			default:
				console.warn(
					`[${MatrixVisualizerCanvas.ID}] 未知的可视化类型「${typeFlag}」，已自动fallback到「文本可视化」中`
				)
				// 调用「文本母体可视化者」的「获取可视化信号」
				return MatrixVisualizerText.getVisionSignalMatrix(
					matrix,
					typeFlag
				)
		}
	}

	/**
	 * 获取母体可视化的信号
	 * * 未连接母体⇒空字串
	 */
	getSignal(message: string): string {
		return this.linkedMatrix === null
			? ''
			: MatrixVisualizerCanvas.getVisionSignalMatrix(
					this.linkedMatrix,
					message
			  )
	}
}
