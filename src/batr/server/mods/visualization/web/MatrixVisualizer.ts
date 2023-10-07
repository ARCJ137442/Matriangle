import { uint } from "../../../../legacy/AS3Legacy";
import IBatrMatrix from "../../../main/IBatrMatrix";
import { 实体列表可视化, 母体可视化 } from "../visualizations";
import { MatrixProgramLabel } from "../../../api/control/MatrixProgram";
import WorldVisualizer from "./Visualizer";

/**
 * 「母体可视化者」是
 * * 用于传递母体的可视化信号的
 * 可视化者
 */
export default class MatrixVisualizer extends WorldVisualizer {

	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = "Visualizer:Matrix";

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IBatrMatrix | null = null
	) {
		super(MatrixVisualizer.LABEL);
	}

	// 母体可视化部分 //

	/**
	 * （静态）获取某个母体的可视化信号（文本）
	 * @param mapBlockStringLen 显示母体地图每一格的字符串长度
	 */
	public static getVisionSignal(matrix: IBatrMatrix, mapBlockStringLen: uint = 7): string {
		return ( // ! 注意：字符串不能使用前缀加号
			母体可视化(matrix.map.storage, matrix.entities, mapBlockStringLen) +
			'\n\n' +
			实体列表可视化(matrix.entities)
		);
	}

	/**
	 * 获取母体可视化的信号
	 * * 未连接母体⇒空字串
	 */
	public getSignal(blockWidth: uint = 7): string {
		if (this.linkedMatrix === null) return '';
		return MatrixVisualizer.getVisionSignal(this.linkedMatrix, blockWidth);
	}

}