import {
	DictionaryLikeObject,
	OptionalRecursive2,
} from 'matriangle-common/utils'
import { uint, int } from 'matriangle-legacy/AS3Legacy'
import { Frame } from 'zimjs/ts-src/typings/zim'
import { ZimDisplayerMap } from './zim/DisplayInterfacesClient_Zim'
import { IDisplayDataMatrix } from 'matriangle-api/display/RemoteDisplayAPI'
import { JSObject } from 'matriangle-common'

/**
 * 第一代可视化的canvas数据
 * * 同步自`src\mods\visualization\logic\canvasVisualizations.ts`
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
		[pos: string]: int | undefined
	}

	/**
	 * TODO: 实体显示
	 */
	entities: DictionaryLikeObject[]
}

/**
 * 第一代画板可视化
 *
 * @param canvas 浏览器环境的画板元素
 * @param message 用于控制画板的显示信息
 */
export function canvasVisualize_V1(
	// canvas: HTMLCanvasElement,
	frame: Frame,
	mapDisplayer: ZimDisplayerMap,
	message: string
	// gridSize_px: number = 15
): void {
	// console.log('canvas可视化！', /* canvas,  */ frame, message)
	// TODO: 处理传回来的数据
	// 解析数据：过滤掉不合法的地方
	try {
		const data = JSON.parse(message) as JSObject
		// TODO: 需要考虑「在显示端形成一个『JSON数据镜像』」如「对象更新函数」
		visualize_Matrix(data, mapDisplayer)
	} catch (e) {
		console.error('canvas可视化失败！', e)
	}
}

// 各个层次的「显示数据更新」 //

export function visualize_Matrix(
	data: OptionalRecursive2<IDisplayDataMatrix>,
	mapDisplayer: ZimDisplayerMap
): void {
	console.log('母体可视化！', data, mapDisplayer)
	// 更新地图
	if (data?.map !== undefined) mapDisplayer.shapeRefresh(data.map)
	// TODO: 更新实体
}

// ! @deprecated ↓旧代码
// if (size && blocks && entities) {
// 	// 调整尺寸
// 	canvas.width = size[0] * gridSize_px
// 	canvas.height = size[1] * gridSize_px
// 	// 绘制画板
// 	const ctx = canvas.getContext('2d')
// 	if (ctx) {
// 		// 绘制背景
// 		ctx.fillStyle = '#000'
// 		ctx.fillRect(0, 0, canvas.width, canvas.height)
// 		// 绘制方块
// 		for (const [pos, color] of Object.entries(blocks)) {
// 			//  空⇒跳过
// 			if (color === undefined) continue
// 			else {
// 				// 暂时还只是二维的 // TODO: 多维平铺 & 分离功能
// 				const [x, y] = pos.split('_').map(v => parseInt(v))
// 				ctx.fillStyle = '#' + color.toString(16) // 也就一个井号
// 				ctx.fillRect(
// 					x * gridSize_px,
// 					y * gridSize_px,
// 					gridSize_px,
// 					gridSize_px
// 				)
// 			}
// 		}
// 		// 绘制实体
// 		/* for (const entity of entities) {
// 			if (entity) {
// 				const { x, y, width, height, color } = entity
// 				ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
// 				ctx.fillRect(x, y, width, height)
// 			}
// 		} */
// 	}
// }
