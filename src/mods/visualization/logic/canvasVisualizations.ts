import IMatrix from 'matriangle-api/server/main/IMatrix'
import { DictionaryLikeObject, iPoint, iPointRef } from 'matriangle-common'
import { uint } from 'matriangle-legacy/AS3Legacy'

/**
 * 第一代可视化的canvas数据
 *
 * @example
 * 📌Canvas可视化方案【2023-11-11 01:14:55】
 * - 一个是用「objects」以「XX地方有XX图形」的方式显示数据
 *   - 这可能带来的显示自由度不那么好
 * - 一个是用「blocks」「entities」等方式显示数据
 *   - 这有可能让显示端有更发挥的机会
 *   - 📌目前推荐是这里：只暴露必要的「显示用信息」给显示端，让显示端根据「传递过去的状态」自行更新
 *   - 但麻烦就麻烦在：
 *     - 需要很多类型如「方块」「实体」的表征，每种实体几乎都要写一个（难以利用现存的AS3绘图命令）
 *     - 显示端同样需要承担「计算」「更新」的工作
 */
export interface CanvasData_V1 {
	/**
	 * 地图呈现的相对尺寸
	 * * 至于后续「高维地图」如何铺开：交给「canvas显示端」处理
	 */
	size: uint[]

	/**
	 * 填充方块（像素颜色）
	 * * 坐标格式：`x_y` 如 `1_2` `23_-1`
	 * * `undefined`表示「空地」（不会被填充）
	 *
	 * TODO: 是否要落实「显示层级」？
	 */
	blocks: {
		/**
		 * 坐标⇒颜色（24位）|未定义
		 */
		[pos: string]: uint | undefined
	}

	/**
	 * TODO: 实体显示
	 */
	entities: DictionaryLikeObject[]
}

/**
 * 可视化母体，返回与canvas有关的指令集合
 * * 返回的是母体的「展开图」
 *
 * TODO: 是否要开发一种「中间语言」
 *
 * @param host 待可视化的母体
 * @returns 用于控制canvas的中间语言
 */
export function canvasV母体数据可视化_全局(host: IMatrix): string {
	const canvasInf: CanvasData_V1 = {
		// 确保是数组
		size: [...host.map.storage.size],
		blocks: {},
		entities: [],
	} as CanvasData_V1
	// 开始填充数据
	host.map.storage.forEachValidPositions((pos: iPointRef): void => {
		canvasInf.blocks[pos.join('_')] =
			host.map.storage.getBlockAttributes(pos)?.defaultPixelColor
	})
	// TODO: 填充实体显示
	// 返回
	console.log('canvasV母体数据可视化_全局 数据：', canvasInf)
	return JSON.stringify(canvasInf)
}

/**
 * 可视化母体，返回与canvas有关的指令集合
 * * 返回的是母体在某个格点上的「视角图」
 *
 * TODO: 是否要开发一种「中间语言」
 *
 * @param host 待可视化的母体
 * @returns 用于控制canvas的中间语言
 */
export function canvasV母体数据可视化_视角(
	host: IMatrix,
	viewpoint: iPoint
): string {
	throw new Error('方法尚未实现！')
}
