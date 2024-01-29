import { uint } from 'matriangle-legacy'
import { IDisplayDataEntityState } from '../RemoteDisplayAPI'
import { TriangleAgentDecorationLabel } from './triangleAgent/DecorationLabels'

/**
 * 统一存储所有「通用可显示图形」的「显示ID」
 * *【2024-01-29 22:15:16】现在开始「显示端」在「实体」上不再【直接】依赖各模组的「实体ID」进行呈现
 * * 其中的「图形显示ID」用于「显示端」的方法分派
 *   *【2024-01-29 22:22:01】过度策略：部分实体仍然使用「自身实体ID」作为其「显示ID」
 *     * 如BaTS中的各类「子弹」「激光」
 *   * 首先支持与「实体ID」分离：多个实体可以共用一个「图形显示ID」
 */
export enum CommonDisplayIDs {
	/**
	 * 「简单双色矩形」
	 * * 📌应用：「砖块」「挡板」
	 */
	RECTANGLE_BICOLOR = 'RectangleBicolor',

	/**
	 * 「三角智能体」
	 * * 📌应用：「玩家」
	 */
	TRIANGLE_AGENT = 'TriangleAgent',
}

/**
 * 有关「简单双色矩形」的「自定义显示数据」
 */
export interface IDisplayDataEntityStateRectangleBiColor
	extends IDisplayDataEntityState {
	/** 宽度（逻辑端格） */
	width: number

	/** 高度（逻辑端格） */
	height: number

	/** 填充颜色 */
	fillColor: uint

	/** 边框颜色 */
	lineColor: uint

	/** 边框线宽 */
	lineSize: uint
}

/**
 * 有关「三角智能体」的「自定义显示数据」
 * * 🔗抽象自先前的「玩家」
 *
 * !【2023-11-15 20:45:57】注意：其本质无需继承`IDisplayDataEntity`接口
 * * 简略缘由：其内属性被极度泛化，导致「字符串键取值约束」失效
 * * 详见方法{@link IDisplayProxyEntity.storeState}
 *
 * ?【2023-11-15 20:49:20】似乎若后续显示端要用到（通过「玩家显示数据」更新玩家Shape）的话，可能需要将其独立在一个地方以避免全部导入
 * *【2024-01-29 22:52:41】↑现在已经将其抽象为「三角智能体」并以此独立✓
 */
export interface IDisplayDataEntityStateTriangleAgent
	extends IDisplayDataEntityState {
	/** （后续用于呈现）自定义名称 */
	customName: string
	/** 填充颜色 */
	fillColor: uint
	/** 线条颜色 */
	lineColor: uint
	/** 类型装饰标记（先前用以区分「玩家/AI」） */
	decorationLabel: TriangleAgentDecorationLabel
}
