import {
	formatHEX,
	formatHEX_A,
	halfBrightnessTo,
	turnBrightnessTo,
} from 'matriangle-common'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { Shape } from 'zimjs'

/** 有关「绘图上下文」的类 */
export type CreateGraphics = createjs.Graphics

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
 * * 用于绘制方块的边界：基于(0,0)开始的绘制起点
 *
 * ! 只含`draw`函数，颜色需要预先指定
 *
 * @param graphics 待绘制的绘图上下文
 * @param a 边长
 * @param border_width 边框宽度
 * @returns 图形本身
 */
export function drawSquareFrameOrigin(
	graphics: CreateGraphics,
	a: number,
	border_width: number
): CreateGraphics {
	return graphics
		.drawRect(0, 0, a, border_width)
		.drawRect(0, a - border_width, a, border_width)
		.drawRect(0, border_width, border_width, a - 2 * border_width)
		.drawRect(
			a - border_width,
			border_width,
			border_width,
			a - 2 * border_width
		)
}

/**
 * 绘制一个有指定内外径的正方形框
 * ! 只含`draw`函数，颜色需要预先指定
 *
 * @param graphics 待绘制的绘图上下文
 * @param r 半径（边长/2）
 * @param border_width 边框宽度
 * @returns 图形本身
 */
export function drawSquareFrameCenter(
	graphics: CreateGraphics,
	r: number,
	border_width: number
): CreateGraphics {
	return (
		graphics
			// ↑
			.drawRect(-r, -r, r * 2, border_width)
			// ↓
			.drawRect(-r, r - border_width, r * 2, border_width)
			// ←
			.drawRect(
				-r,
				border_width - r,
				border_width,
				(r - border_width) * 2
			)
			// →
			.drawRect(
				r - border_width,
				border_width - r,
				border_width,
				(r - border_width) * 2
			)
	)
}

/**
 * 绘制一个中心在原点、边长为r、倾角为rot的正n边形
 * * 初始点即`(r cos rot, r sin rot)`
 *
 * ! 只包含绘制函数
 *
 * @param graphics 绘图上下文
 * @param r 半径
 * @param rot_arc 倾角（弧度制）
 * @param n 边数（默认为4「正方形」）
 *
 * @returns 上下文自身
 */
export function drawSingleCenteredSquareWithRotation(
	graphics: CreateGraphics,
	r: number,
	rot_arc: number,
	n: uint = 4
): CreateGraphics {
	graphics.moveTo(r * Math.cos(rot_arc), r * Math.sin(rot_arc))
	for (let i = 0; i < n; i++) {
		graphics.lineTo(
			r * Math.cos(rot_arc + i * ((2 * Math.PI) / n)),
			r * Math.sin(rot_arc + i * ((2 * Math.PI) / n))
		)
	}
	return graphics
}

/**
 * 绘制菱形
 * @param graphics 绘图上下文
 * @param cX 中心X
 * @param cY 中心Y
 * @param radius 半径（中心点到四角的距离）
 */
export function drawDiamond(
	graphics: CreateGraphics,
	cX: number,
	cY: number,
	radius: number
): CreateGraphics {
	return graphics
		.moveTo(cX - radius, cY)
		.lineTo(cX, cY + radius)
		.lineTo(cX + radius, cY)
		.lineTo(cX, cY - radius)
		.lineTo(cX - radius, cY)
}

/**
 * 绘制一个边长为a的正方形，并叠加以一个边长相等的菱形（45°夹角）
 *
 * @param graphics 绘图上下文
 * @param cX 中心x坐标
 * @param cY 中心y坐标
 * @param a 边长
 */
export function drawSquareAndDiamond(
	graphics: CreateGraphics,
	cX: number,
	cY: number,
	a: number
): CreateGraphics {
	return drawDiamond(
		// 先绘制方形
		graphics.drawRect(cX - a / 2, cY - a / 2, a, a),
		cX,
		cY,
		a * Math.SQRT1_2
	)
}
/**
 * 绘制一个向右（默认方向）的三角形
 * * 不包含填充控制代码
 * * 摘自旧AS3代码 @ src\mods\BaTS\entity\player\PlayerBatr.ts
 */
export function drawTriangleRight<G extends CreateGraphics>(
	graphics: G,
	size: number,
	lineSize: number,
	// 先前逻辑复刻
	realRadiusX: number = (size - lineSize) / 2,
	realRadiusY: number = (size - lineSize) / 2
): G {
	// 绘图即可，返回自身
	return graphics
		.moveTo(-realRadiusX, -realRadiusY)
		.lineTo(realRadiusX, 0)
		.lineTo(-realRadiusX, realRadiusY)
		.lineTo(-realRadiusX, -realRadiusY) as G
}

/**
 * 绘制一个向右（默认方向）的带渐变填充三角形
 * * 摘自旧AS3代码 @ src\mods\BaTS\entity\player\PlayerBatr.ts
 */
export function drawPlayerTriangleGradient<G extends CreateGraphics>(
	graphics: G,
	/** 使用回调函数把「填充」与「绘图」分开 */
	drawCallback: (
		graphics: G,
		size: number,
		lineSize: number,
		realRadiusX: number,
		realRadiusY: number
	) => void,
	size: number,
	lineSize: number,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor)
): G {
	// 新 //
	const fillColor2 = turnBrightnessTo(fillColor, 0.75),
		realRadiusX: number = (size - lineSize) / 2,
		realRadiusY: number = (size - lineSize) / 2
	// 准备绘制
	graphicsLineStyle(graphics, lineSize, lineColor) // 从旧有Flash API迁移
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
	drawCallback(graphics, size, lineSize, realRadiusX, realRadiusY)
	// drawTriangleRight(graphics, size, lineSize, realRadiusX, realRadiusY)
	// 结束绘制
	return (
		graphics
			// graphics.drawCircle(0,0,10);
			.endFill()
			.endStroke() as G
	)
}

/**
 * 绘制一个类似`[X]`的矩形盒子
 * * 用于绘制「向上z+」的玩家
 */
export function drawPlayerTopBox(
	graphics: CreateGraphics,
	size: number,
	lineSize: number,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor)
): CreateGraphics {
	return (
		graphicsLineStyle(
			// * 先绘制底座
			drawPlayerBottomBox(graphics, size, lineSize, fillColor, lineColor),
			lineSize,
			lineColor,
			1
		)
			// * 增加个「X」
			.moveTo(-size / 2, -size / 2)
			.lineTo(size / 2, size / 2)
			.moveTo(-size / 2, size / 2)
			.lineTo(size / 2, -size / 2)
			// * 结束
			.endStroke()
	)
}

/**
 * 绘制一个纯正方形盒子
 * * 用于绘制「向下z-」的玩家
 */
export function drawPlayerBottomBox(
	graphics: CreateGraphics,
	size: number,
	lineSize: number,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor)
): CreateGraphics {
	return graphicsLineStyle(graphics, lineSize, lineColor, 1)
		.beginFill(formatHEX(fillColor))
		.drawRect(-size / 2, -size / 2, size, size)
		.endFill()
		.endStroke()
}

/**
 * 绘制一个圆角矩形盒子
 * * 参考自旧AS3代码 @ `BattleTriangle-Gamma\batr\game\entity\entities\BonusBox.as`
 *
 * @param graphics 要绘制的图形
 * @param blockSize 作为参照的「方块」大小
 * @param boxSize 盒子大小
 * @param boxLineSize 盒子外边界线粗细
 * @param boxRoundSize 盒子圆角尺寸
 * @param lineColor 盒子线条颜色
 * @param fillColor 盒子填充颜色
 * @returns 图形自身
 */
export function drawRoundRectBox<G extends CreateGraphics>(
	graphics: G,
	boxSize: number,
	boxLineSize: number,
	boxRoundSize: number,
	lineColor: uint,
	fillColor: uint
): G {
	return (
		graphics
			// Line
			.beginFill(formatHEX(lineColor))
			.drawRoundRect(
				-boxSize / 2,
				-boxSize / 2,
				boxSize,
				boxSize,
				boxRoundSize // !【2023-11-19 23:52:20】Zim.js只需要一个半径
				// boxRoundSize
			)
			.endFill()
			// Fill
			.beginFill(formatHEX(fillColor))
			.drawRoundRect(
				boxLineSize - boxSize / 2,
				boxLineSize - boxSize / 2,
				boxSize - 2 * boxLineSize,
				boxSize - 2 * boxLineSize,
				boxRoundSize // !【2023-11-19 23:52:20】Zim.js只需要一个半径
				// boxRoundSize
			)
			.endFill() as G
	)
}
