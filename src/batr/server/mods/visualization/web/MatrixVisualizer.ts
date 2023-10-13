import { int, uint } from "../../../../legacy/AS3Legacy";
import IMatrix from "../../../main/IMatrix";
import { SPMAVCV单点母体所有视角截面可视化, entityLV实体列表可视化, matrixV母体可视化 } from "../textVisualizations";
import { MatrixProgramLabel } from "../../../api/control/MatrixProgram";
import Visualizer from "./Visualizer";
import IPlayer, { isPlayer } from "../../native/entities/player/IPlayer";
import Entity from "../../../api/entity/Entity";

/**
 * 返回的类型标识
 */
type TypeFlag = uint | string;

/**
 * 「母体可视化者」是
 * * 用于传递母体的可视化信号的
 * 可视化者
 * 
 * TODO: 或许需要把「实体列表」独立出来，并且封装出一个可用的「服务器对象」以便复用WS服务
 */
export default class MatrixVisualizer extends Visualizer {

	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = "Visualizer:Matrix";

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IMatrix | null = null
	) {
		super(MatrixVisualizer.LABEL);
	}

	// 母体可视化部分 //

	/**
	 * 解析「类型标签」
	 */
	public static parseTypeFlag(messageStr: string): TypeFlag {
		this._tempFlag = +messageStr;
		if (isFinite(this._tempFlag)) return uint(this._tempFlag);
		else return messageStr;
	}
	protected static _tempFlag: TypeFlag = 0;

	/**
	 * （静态）获取某个母体的视野信号（文本）
	 * @param mapBlockStringLen 显示母体地图每一格的字符串长度
	 * @param typeFlag 整数时是「地图每一格字符串长度」，字符串时回传其它特定信号
	 */
	public static getVisionSignal(matrix: IMatrix, typeFlag: TypeFlag): string {
		switch (typeFlag) {
			case 'entities':
				return entityLV实体列表可视化(matrix.entities);
			default:
				// 数值⇒地图可视化
				if (typeof typeFlag === 'number')
					return matrixV母体可视化(matrix.map.storage, matrix.entities, typeFlag);
				// player前缀⇒玩家可视化
				if (typeFlag.startsWith('player')) {
					try {
						const atPosition: int = typeFlag.lastIndexOf('@');
						const string_l: int = parseInt(typeFlag.slice(6, atPosition));
						const playerName: string = typeFlag.slice(atPosition + 1); // 截取`@`后部分作为玩家名称，亦作为筛选条件
						const player: IPlayer | undefined = matrix.entities.find(
							(entity: Entity): boolean => isPlayer(entity)
								&& entity.customName === playerName
						) as IPlayer | undefined;
						if (player === undefined)
							return `未找到玩家${playerName}`;
						else return SPMAVCV单点母体所有视角截面可视化(
							matrix,
							player.position,
							string_l
						);
					} catch (e) {
						console.error(`「${typeFlag}」格式不正确！正确格式应为「player6@p2」`, e);
						return '';
					}
				}
				else {
					console.warn('无效的类型标签！');
					return '';
				}
		}
	}

	/**
	 * 获取母体可视化的信号
	 * * 未连接母体⇒空字串
	 */
	getSignal(message: string): string {
		if (this.linkedMatrix === null) return '';
		return MatrixVisualizer.getVisionSignal(this.linkedMatrix, MatrixVisualizer.parseTypeFlag(message));
	}

}