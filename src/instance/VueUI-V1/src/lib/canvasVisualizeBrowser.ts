import { DictionaryLikeObject } from 'matriangle-common/utils'
import { uint, int } from 'matriangle-legacy/AS3Legacy'

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
 * @param inf 用于控制画板的显示信息
 * @param gridSize_px 格子大小（像素）
 */
export function canvasVisualize_V1(
	canvas: HTMLCanvasElement,
	inf: string,
	gridSize_px: number = 15
): void {
	console.log('canvas可视化！', canvas, inf, gridSize_px)
	// 解析数据：过滤掉不合法的地方
	try {
		const data = JSON.parse(inf) as CanvasData_V1
		const { size, blocks, entities } = data
		if (size && blocks && entities) {
			// 调整尺寸
			canvas.width = size[0] * gridSize_px
			canvas.height = size[1] * gridSize_px
			// 绘制画板
			const ctx = canvas.getContext('2d')
			if (ctx) {
				// 绘制背景
				ctx.fillStyle = '#000'
				ctx.fillRect(0, 0, canvas.width, canvas.height)
				// 绘制方块
				for (const [pos, color] of Object.entries(blocks)) {
					//  空⇒跳过
					if (color === undefined) continue
					else {
						// 暂时还只是二维的 // TODO: 多维平铺 & 分离功能
						const [x, y] = pos.split('_').map(v => parseInt(v))
						ctx.fillStyle = '#' + color.toString(16) // 也就一个井号
						ctx.fillRect(
							x * gridSize_px,
							y * gridSize_px,
							gridSize_px,
							gridSize_px
						)
					}
				}
				// 绘制实体
				/* for (const entity of entities) {
					if (entity) {
						const { x, y, width, height, color } = entity
						ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
						ctx.fillRect(x, y, width, height)
					}
				} */
			}
		}
	} catch (e) {
		console.error('canvas可视化失败！', e)
	}
}

/**
 * Zim测试部分
 */
import * as Zim from 'zimjs'
import { halfBrightnessTo } from 'matriangle-common/color'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'

/**
 * 临时定义的「Player」常量
 * * 用于测试「玩家显示」复原
 */
const PlayerBatr = {
	SIZE: 1 * DEFAULT_SIZE,
	LINE_SIZE: DEFAULT_SIZE / 96,
}

/**
 * 测试：绘制玩家形状
 * * 摘自旧AS3代码 @ src\mods\BaTS\entity\player\PlayerBatr.ts
 */
export function drawPlayerShape(
	shape: Zim.Shape,
	lineColor: uint = 0x888888,
	fillColor: uint = 0xffffff
): void {
	// 新
	const fillColor2 = halfBrightnessTo(fillColor)
	// 先前逻辑复刻
	const realRadiusX: number = (PlayerBatr.SIZE - PlayerBatr.LINE_SIZE) / 2
	const realRadiusY: number = (PlayerBatr.SIZE - PlayerBatr.LINE_SIZE) / 2
	shape.graphics.clear()
	// shape.graphics.lineStyle(PlayerBatr.LINE_SIZE, lineColor) // ! 有一些地方还是不一致的
	shape.graphics.setStrokeStyle(PlayerBatr.LINE_SIZE) // lineColor
	shape.graphics.beginStroke('#' + lineColor.toString(16))
	// shape.graphics.beginFill(fillColor, 1.0)
	/* let m: Matrix = new Matrix() // 📌Zim不再需要矩阵！
	m.createGradientBox(
		DEFAULT_SIZE,
		DEFAULT_SIZE,
		0,
		-realRadiusX,
		-realRadiusX
	)
	shape.graphics.beginGradientFill(
		GradientType.LINEAR,
		[fillColor, fillColor2],
		[1.0, 1.0], // 透明度完全填充
		[63, 255], // 亮度渐变：1/4~1
		m,
		SpreadMethod.PAD,
		InterpolationMethod.RGB,
		1
	) */
	shape.graphics
		.beginFill('#' + fillColor.toString(16))
		.beginLinearGradientFill(
			[`#${fillColor.toString(16)}`, `#${fillColor2.toString(16)}`],
			// [1.0, 1.0], // 透明度完全填充
			[0x40 / 0x100, 0x100 / 0x100], // 亮度(比例)渐变：1/4~1
			-realRadiusX / 2,
			0,
			realRadiusX,
			0
			/* m,
		SpreadMethod.PAD,
		InterpolationMethod.RGB */
		)
		.moveTo(-realRadiusX, -realRadiusY)
		.lineTo(realRadiusX, 0)
		.lineTo(-realRadiusX, realRadiusY)
		.lineTo(-realRadiusX, -realRadiusY)
		// shape.graphics.drawCircle(0,0,10);
		.endFill()
		.endStroke()
}
