import IMatrix from 'matriangle-api/server/main/IMatrix'
import { entityLV实体列表可视化 } from '../logic/textVisualizations'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import MatrixVisualizer from './MatrixVisualizer'
import IPlayer, {
	isPlayer,
} from 'matriangle-mod-native/entities/player/IPlayer'
import Entity from 'matriangle-api/server/entity/Entity'
import {
	canvasV母体数据可视化_全局,
	canvasV母体数据可视化_视角,
} from '../logic/canvasVisualizations'

/**
 * 「文本母体可视化者」是
 * * 用于传递母体的可视化信号的
 * * 以「canvas指令」形式传递母体信号的
 * 可视化者
 *
 * TODO: 或许需要把「实体列表」独立出来，并且封装出一个可用的「服务器对象」以便复用WS服务
 */
export default class MatrixVisualizerCanvas extends MatrixVisualizer {
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'Visualizer:Matrix'

	// 用于区分「消息用途」的前缀
	/** 「附加信息」的前缀 */
	public static readonly prefix_otherInf: string = 'i'
	/** 「canvas指令」的前缀 */
	public static readonly prefix_canvas: string = '@'

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IMatrix | null = null
	) {
		super(MatrixVisualizerCanvas.LABEL)
	}

	// 母体可视化部分 //

	protected static readonly showInf_regex: RegExp = /^player\d*@(.+)?$/
	/**
	 * 获取某个母体的视野信号（文本）
	 *
	 * @param mapBlockStringLen 显示母体地图每一格的字符串长度
	 * @param showInf 用于指定是「显示实体列表」「显示整体地图」还是「显示玩家视角」
	 * @returns 可视化信号（以文本形式表征）
	 */
	public getVisionSignal(matrix: IMatrix, showInf: string): string {
		switch (showInf) {
			case 'other-information':
				// （保留）以纯文本方式返回「实体列表」
				return entityLV实体列表可视化(matrix.entities)
			default:
				// player前缀⇒玩家可视化
				if (showInf.startsWith('player')) {
					// * 直接用正则匹配（这个版本里无需比对`@`前的数字）
					const showInf_match: RegExpMatchArray | null =
						MatrixVisualizerCanvas.showInf_regex.exec(showInf)
					// * 未匹配
					if (showInf_match === null) {
						console.warn(`「${showInf}」格式不正确！`)
						return `「${showInf}」格式不正确！`
					}
					// * 已匹配
					else {
						/** 只截取一个参数：玩家名称 */
						const playerName: string = showInf_match[1]
						/** 获取到这名称对应的玩家（使用`customName`判据） */
						const player: IPlayer | undefined =
							matrix.entities.find(
								(entity: Entity): boolean =>
									isPlayer(entity) &&
									entity.customName === playerName
							) as IPlayer | undefined
						// 依据玩家开始可视化
						return player === undefined
							? // * 未找到玩家⇒显示消息
							  `未找到玩家${playerName}`
							: // * 找到了玩家⇒外包逻辑
							  canvasV母体数据可视化_视角(
									matrix,
									player.position
							  )
					}
				}
				// 默认⇒母体可视化
				else {
					return canvasV母体数据可视化_全局(matrix)
				}
		}
	}

	/**
	 * 获取母体可视化的信号
	 * * 未连接母体⇒空字串
	 */
	getSignal(message: string): string {
		if (this.linkedMatrix === null) return ''
		return this.getVisionSignal(
			this.linkedMatrix,
			// 以消息作指令
			message
		)
	}
}
