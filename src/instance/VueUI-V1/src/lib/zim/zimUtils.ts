import { formatHEX } from 'matriangle-common'
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
	colorHEX: uint
): T {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
	;(graphics as any).setStrokeStyle(size)
	// lineColor
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
	;(graphics as any).beginStroke(formatHEX(colorHEX))
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
 *
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
