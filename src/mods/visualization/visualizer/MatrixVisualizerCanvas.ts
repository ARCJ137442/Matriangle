import IMatrix from 'matriangle-api/server/main/IMatrix'
import { entityLV实体列表可视化 } from '../logic/textVisualizations'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import MatrixVisualizer from './MatrixVisualizer'
import {
	NativeVisualizationTypeFlag,
	VisualizationOutputMessagePrefix,
	packDisplayData,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { typeID } from 'matriangle-api'
import MatrixVisualizerText from './MatrixVisualizerText'
import { JSObject, trimmedEmptyObjIn } from 'matriangle-common/JSObjectify'

/**
 * 「文本母体可视化者」是
 * * 用于传递母体的可视化信号的
 * * 以「canvas指令」形式传递母体信号的
 * 可视化者
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
	 * @returns {[string,string]} [可视化信号类型, 可视化信号]
	 */
	public static getVisionSignalMatrix(
		matrix: IMatrix,
		typeFlag: string
	): [VisualizationOutputMessagePrefix, string] {
		let JSONDisplayData: string
		switch (typeFlag) {
			case NativeVisualizationTypeFlag.OTHER_INFORMATION:
				// （保留）以纯文本方式返回「实体列表」
				return [
					VisualizationOutputMessagePrefix.OTHER_INFORMATION,
					entityLV实体列表可视化(matrix.entities),
				]
			// * 全新的「显示数据传递」
			case NativeVisualizationTypeFlag.INIT:
				// 转换为JSON
				JSONDisplayData = JSON.stringify(
					trimmedEmptyObjIn(matrix.getDisplayDataInit())
				)
				// 刷新已更新数据
				matrix.flushDisplayData()
				// 返回
				return [
					VisualizationOutputMessagePrefix.CANVAS_DATA,
					JSONDisplayData,
				]
			case NativeVisualizationTypeFlag.REFRESH:
				// 转换为JSON
				JSONDisplayData = JSON.stringify(
					// ! 下面这个仍然是合理的：`undefined`会被后面的`stringify`忽略掉
					trimmedEmptyObjIn(
						matrix.getDisplayDataRefresh() as JSObject
					)
				)
				// 刷新已更新数据
				matrix.flushDisplayData()
				// 返回
				return [
					VisualizationOutputMessagePrefix.CANVAS_DATA,
					JSONDisplayData,
				]
			default:
				console.warn(
					`[${MatrixVisualizerCanvas.ID}] 未知的可视化类型「${typeFlag}」，已自动fallback到「文本可视化」中`
				)
				// 调用「文本母体可视化者」的「获取可视化信号」
				return MatrixVisualizerText.getVisionSignal(
					matrix,
					MatrixVisualizerText.parseTypeFlag(typeFlag)
				)
		}
	}

	getSignal(message: string): string {
		return this.linkedMatrix === null
			? ''
			: packDisplayData(
					...MatrixVisualizerCanvas.getVisionSignalMatrix(
						this.linkedMatrix,
						message
					)
			  )
	}
}
