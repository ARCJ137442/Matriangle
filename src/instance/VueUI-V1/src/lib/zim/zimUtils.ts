import {
	formatHEX,
	formatHEX_A,
	halfBrightnessTo,
	turnBrightnessTo,
} from 'matriangle-common'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { Shape } from 'zimjs'

/** 中心化+可拖动 */
export const center_drag = (shape: Shape): Shape =>
	randomMove(shape.center()).drag()

export const center_drags = (...shapes: Shape[]): Shape[] =>
	shapes.map(center_drag)

export function randomMove(shape: Shape, range: number = 400): Shape {
	return shape
		.pos(
			(shape.x += Math.random() * range - range / 2),
			(shape.y += Math.random() * range - range / 2)
		)
		.rot(Math.random() * 360)
}

// 绘图相关 //

/**
 * 用于从Flash快速迁移的lineStyle
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function graphicsLineStyle<T>(
	graphics: T,
	size: number,
	colorHEX: uint,
	colorAlpha?: number
): T {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
	;(graphics as any).setStrokeStyle(size)
	// lineColor
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
	;(graphics as any).beginStroke(
		colorAlpha === undefined
			? formatHEX(colorHEX)
			: formatHEX_A(colorHEX, colorAlpha)
	)
	return graphics
}

/**
 * 填充
 * * 以原点为起始点的
 * * 全不透明的
 * * 里外两种颜色嵌套的
 * 正方形框
 */
export function fillSquareBiColored(
	shape: Shape,
	lineColor: uint,
	fillColor: uint,
	a: number,
	lineSize: number
): Shape {
	shape.graphics
		// Line
		.beginFill(formatHEX(lineColor))
		.drawRect(0, 0, a, a)
		.endFill()
		// Fill
		.beginFill(formatHEX(fillColor))
		.drawRect(lineSize, lineSize, a - lineSize * 2, a - lineSize * 2)
		.endFill()
	return shape
}

/**
 * 绘制一个有指定内外径的正方形框
 * ! 只含`draw`函数，颜色需要预先指定
 *
 * @param shape 待绘制的图形
 * @param a 边长
 * @param border_width 边框宽度
 * @returns 图形本身
 */
export function drawSquareFrameOrigin(
	shape: Shape,
	a: number,
	border_width: number
): Shape {
	shape.graphics
		.drawRect(0, 0, a, border_width)
		.drawRect(0, a - border_width, a, border_width)
		.drawRect(0, border_width, border_width, a - 2 * border_width)
		.drawRect(
			a - border_width,
			border_width,
			border_width,
			a - 2 * border_width
		)
	return shape
}

/**
 * 绘制菱形
 * @param shape 图形
 * @param cX 中心X
 * @param cY 中心Y
 * @param radius 半径（中心点到四角的距离）
 */
export function drawDiamond(
	shape: Shape,
	cX: number,
	cY: number,
	radius: number
): void {
	shape.graphics
		.moveTo(cX - radius, cY)
		.lineTo(cX, cY + radius)
		.lineTo(cX + radius, cY)
		.lineTo(cX, cY - radius)
		.lineTo(cX - radius, cY)
}

/**
 * 绘制一个边长为a的正方形，并叠加以一个边长相等的菱形（45°夹角）
 *
 * @param shape 图形
 * @param cX 中心x坐标
 * @param cY 中心y坐标
 * @param a 边长
 */
export function drawSquareAndDiamond(
	shape: Shape,
	cX: number,
	cY: number,
	a: number
): void {
	shape.graphics.drawRect(cX - a / 2, cY - a / 2, a, a)
	drawDiamond(shape, cX, cY, a * Math.SQRT1_2)
}
/**
 * 绘制一个向右（默认方向）的三角形
 * * 不包含填充控制代码
 * * 摘自旧AS3代码 @ src\mods\BaTS\entity\player\PlayerBatr.ts
 */
export function drawTriangleRight<S extends Shape>(
	shape: S,
	size: number,
	lineSize: number,
	// 先前逻辑复刻
	realRadiusX: number = (size - lineSize) / 2,
	realRadiusY: number = (size - lineSize) / 2
): S {
	// 绘图即可
	shape.graphics
		.moveTo(-realRadiusX, -realRadiusY)
		.lineTo(realRadiusX, 0)
		.lineTo(-realRadiusX, realRadiusY)
		.lineTo(-realRadiusX, -realRadiusY)
	// 返回自身
	return shape
}

/**
 * 绘制一个向右（默认方向）的带渐变填充三角形
 * * 摘自旧AS3代码 @ src\mods\BaTS\entity\player\PlayerBatr.ts
 */
export function drawPlayerGradient<S extends Shape>(
	shape: S,
	/** 使用回调函数把「填充」与「绘图」分开 */
	drawCallback: (
		shape: S,
		size: number,
		lineSize: number,
		realRadiusX: number,
		realRadiusY: number
	) => void,
	size: number,
	lineSize: number,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor)
): S {
	// 新 //
	const fillColor2 = turnBrightnessTo(fillColor, 0.75),
		realRadiusX: number = (size - lineSize) / 2,
		realRadiusY: number = (size - lineSize) / 2
	// 准备绘制
	graphicsLineStyle(shape.graphics, lineSize, lineColor) // 从旧有Flash API迁移
		.beginFill(formatHEX(fillColor))
		.beginLinearGradientFill(
			[formatHEX(fillColor), formatHEX(fillColor2)],
			// [1.0, 1.0], // 透明度完全填充
			[1 / 4, 1], // 亮度(比例)渐变：1/4~1
			-realRadiusX / 2,
			0,
			realRadiusX,
			0
			/* m,
		SpreadMethod.PAD,
		InterpolationMethod.RGB */
		)
	// 绘制图形
	drawCallback(shape, size, lineSize, realRadiusX, realRadiusY)
	// drawTriangleRight(shape, size, lineSize, realRadiusX, realRadiusY)
	// 结束绘制
	shape.graphics
		// shape.graphics.drawCircle(0,0,10);
		.endFill()
		.endStroke()
	return shape
}

/**
 * 绘制一个圆角矩形盒子
 * * 参考自旧AS3代码 @ `BattleTriangle-Gamma\batr\game\entity\entities\BonusBox.as`
 *
 * @param shape 要绘制的图形
 * @param blockSize 作为参照的「方块」大小
 * @param boxSize 盒子大小
 * @param boxLineSize 盒子外边界线粗细
 * @param boxRoundSize 盒子圆角尺寸
 * @param lineColor 盒子线条颜色
 * @param fillColor 盒子填充颜色
 * @returns 图形自身
 */
export function drawRoundRectBox<S extends Shape>(
	shape: S,
	boxSize: number,
	boxLineSize: number,
	boxRoundSize: number,
	lineColor: uint,
	fillColor: uint
): S {
	// Line
	shape.graphics.beginFill(formatHEX(lineColor))
	shape.graphics.drawRoundRect(
		-boxSize / 2,
		-boxSize / 2,
		boxSize,
		boxSize,
		boxRoundSize // !【2023-11-19 23:52:20】Zim.js只需要一个半径
		// boxRoundSize
	)
	shape.graphics.endFill()
	// Fill
	shape.graphics.beginFill(formatHEX(fillColor))
	shape.graphics.drawRoundRect(
		boxLineSize - boxSize / 2,
		boxLineSize - boxSize / 2,
		boxSize - 2 * boxLineSize,
		boxSize - 2 * boxLineSize,
		boxRoundSize // !【2023-11-19 23:52:20】Zim.js只需要一个半径
		// boxRoundSize
	)
	shape.graphics.endFill()
	// 返回自身
	return shape
}
