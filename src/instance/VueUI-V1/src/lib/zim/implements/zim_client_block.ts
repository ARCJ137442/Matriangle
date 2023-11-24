/**
 * 所有方块的绘制函数
 * * 可能「一个显示状态，一个方块状态」会让程序更有效率，但从工程上这不一定是个节省时间和精力的好方案
 *
 * !【2023-11-19 12:06:04】下面的函数**只管绘制不管清除**
 * * 也就是说需要另外（从「方块呈现者」）调用`graphics.clear`
 *
 * !【2023-11-19 11:51:11】不知为何，直接从`matriangle-api`导入的`DEFAULT_SIZE`是`undefined`
 */
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import { formatHEX, formatHEX_A } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import BSBiColored from 'matriangle-mod-bats/block/BSBiColored'
import BSGate from 'matriangle-mod-bats/block/BSGate'
import {
	BatrBlockPrototypes,
	BatrBlockIDs,
} from 'matriangle-mod-bats/registry/BlockRegistry_Batr'
import BSColored from 'matriangle-mod-native/block/BSColored'
import { NativeBlockIDs } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import { Shape } from 'zimjs/ts-src/typings/zim'
import {
	fillSquareBiColored,
	drawSquareFrameOrigin,
	drawDiamond,
	drawSquareAndDiamond,
} from '../zimUtils'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/** 颜色方块 */
export function drawColoredBlock(shape: Shape, state: BSColored): Shape {
	shape.graphics
		.beginFill(formatHEX(state.color))
		.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE)
		.endFill()
	return shape
}

/** 水（半透明颜色方块） */
export function drawWater(
	shape: Shape,
	state: BSColored,
	alpha: number = 0.4
): Shape {
	shape.graphics
		.beginFill(formatHEX_A(state.color, alpha))
		.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE)
		.endFill()
	return shape
}

/** 墙（内外方形嵌套方块） */
export function drawWall(
	shape: Shape,
	state: BSBiColored,
	lineSize: number = DEFAULT_SIZE / 20
): Shape {
	fillSquareBiColored(
		shape,
		state.lineColor,
		state.color,
		DEFAULT_SIZE,
		lineSize
	)
	return shape
}

/** 金属（内部方形图案方块） */
export function drawMetal(
	shape: Shape,
	state: BSBiColored,
	lineSize: number = DEFAULT_SIZE / 20
): Shape {
	drawWall(shape, state, lineSize)
		.graphics.beginFill(formatHEX(state.lineColor))
		.drawRect(
			DEFAULT_SIZE / 4,
			DEFAULT_SIZE / 4,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2
		)
		.endFill()
	return shape
}

/** 可移动墙（内部圆点图案方块） */
export function drawMoveableWall(
	shape: Shape,
	state: BSBiColored,
	centerRadius: number = DEFAULT_SIZE / 8,
	lineSize: number = DEFAULT_SIZE / 20
): Shape {
	// * 基座
	drawWall(shape, state, lineSize)
		.graphics // 中心圈
		.beginFill(formatHEX(state.lineColor))
		.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, centerRadius)
		.endFill()
	return shape
}

/** 玻璃（可透明方形嵌套方块） */
export function drawGlass(
	shape: Shape,
	state: BSBiColored,
	lineAlpha: number = 0.6,
	fillAlpha: number = 0.2,
	lineSize: number = DEFAULT_SIZE / 20
): Shape {
	shape.graphics
		// 外框
		.beginFill(formatHEX_A(state.lineColor, lineAlpha))
	drawSquareFrameOrigin(shape.graphics, DEFAULT_SIZE, lineSize)
		.endFill()
		// !【2023-11-12 16:02:56】Create.js不再能像Flash那样「重复覆盖区域⇒擦除已绘制区域」
		// 填充
		.beginFill(formatHEX_A(state.color, fillAlpha))
		.drawRect(
			lineSize,
			lineSize,
			DEFAULT_SIZE - lineSize * 2,
			DEFAULT_SIZE - lineSize * 2
		)
		.endFill()
	return shape
}

/** 门（两种形态） */
export function drawGate(
	shape: Shape,
	state: BSGate,
	lineColor: uint = BatrBlockPrototypes.WALL.state.lineColor,
	fillColor: uint = BatrBlockPrototypes.WALL.state.color,
	centerColor: uint = 0x666666,
	lineSizeBorder: number = DEFAULT_SIZE / 20
): Shape {
	// * 状态：开
	if (state.open) {
		// Line
		shape.graphics.beginFill(formatHEX(lineColor))
		drawSquareFrameOrigin(shape.graphics, DEFAULT_SIZE, lineSizeBorder)
		shape.graphics.endFill()
	}
	// * 状态：关
	else {
		// * 底座
		fillSquareBiColored(
			shape,
			lineColor,
			fillColor,
			DEFAULT_SIZE,
			lineSizeBorder
		)
			.graphics //
			// * 中心
			.beginFill(formatHEX(centerColor))
			.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE / 3)
			.endFill()
			// ! 现在需要覆盖而非「擦除」
			.beginFill(formatHEX(fillColor))
			.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE / 4)
			.endFill()
	}
	return shape
}

/** 特殊图形：激光陷阱 */
export function drawLaserTrap(
	shape: Shape,
	lineColor: uint = BatrBlockPrototypes.WALL.state.lineColor,
	fillColor: uint = BatrBlockPrototypes.WALL.state.color,
	centerColor: uint = 0x444444,
	lineSize: number = DEFAULT_SIZE / 20,
	lineSizeCenter: number = DEFAULT_SIZE / 32
): Shape {
	// * 底座
	fillSquareBiColored(shape, lineColor, fillColor, DEFAULT_SIZE, lineSize)
	// * 图案：Rhombus | Diamond
	shape.graphics
		.beginStroke(formatHEX(centerColor)) // ! 替代Flash中的`graphics.lineStyle`
		.setStrokeStyle(lineSizeCenter)
	drawDiamond(
		shape.graphics,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 2) / 12
	)
	drawDiamond(
		shape.graphics,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 3) / 12
	)
	drawDiamond(
		shape.graphics,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 4) / 12
	)
		// 中心点
		.beginFill(formatHEX(centerColor))
		.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE / 16)
		.endFill()
	return shape
}

/** 特殊形状：颜色生成器 */
export function drawColorSpawner(
	shape: Shape,
	lineColor: uint = BatrBlockPrototypes.WALL.state.lineColor,
	fillColor: uint = BatrBlockPrototypes.WALL.state.color,
	centerColor: uint = 0x444444,
	lineSize: number = DEFAULT_SIZE / 20,
	lineSizeCenter: number = DEFAULT_SIZE / 32
): Shape {
	// * 底座
	fillSquareBiColored(shape, lineColor, fillColor, DEFAULT_SIZE, lineSize)
	// * 图案
	shape.graphics
		.setStrokeStyle(lineSizeCenter) // ! 替代Flash中的`graphics.lineStyle`
		.beginStroke(formatHEX(centerColor))
		.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE * 0.25)
		.endStroke()
		.beginStroke(formatHEX(centerColor))
		.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE * 0.325)
		.endStroke()
		.beginStroke(formatHEX(centerColor))
		.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE * 0.175)
		.endStroke()
	return shape
}

/** 特殊标记：重生点 */
export function drawSpawnPointMark(
	shape: Shape,
	backgroundAlpha: number = 1 / 4,
	centerColor: uint = 0x8000ff,
	// lineSize: number = DEFAULT_SIZE / 20,
	lineSizeCenter: number = DEFAULT_SIZE / 32
): Shape {
	// !【2023-11-12 17:10:35】相较AS3版本更新：不再需要基座，且只需要一个「中心标记」
	/* // * 基座
	drawWall(shape, state, lineSize) */
	shape.graphics
		.beginFill(formatHEX_A(0xffffff, backgroundAlpha))
		.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE)
		.endFill()
	// * 图案（正方形+菱形 边框）
	shape.graphics
		.beginStroke(formatHEX(centerColor)) // ! 替代Flash中的`graphics.lineStyle`
		.setStrokeStyle(lineSizeCenter)
	drawSquareAndDiamond(
		shape.graphics,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2
	)
		.endFill()
		.endStroke()
	return shape
}

/** 特殊标记：供应点 */
export function drawSupplyPoint(
	shape: Shape,
	backgroundAlpha: number = 1 / 4,
	centerColor: uint = 0x00ff00,
	crossLength: number = DEFAULT_SIZE * (6 / 8),
	crossWidth: number = DEFAULT_SIZE * (2 / 8)
): Shape {
	// !【2023-11-12 17:10:35】相较AS3版本更新：不再需要基座，且只需要一个「中心标记」
	/* // * 基座
	drawWall(shape, state, lineSize) */
	shape.graphics
		.beginFill(formatHEX_A(0xffffff, backgroundAlpha))
		.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE)
		.endFill()
	// * 图案（十字）
	// 横着的
	shape.graphics.beginFill(formatHEX(centerColor))
	shape.graphics.drawRect(
		(DEFAULT_SIZE - crossLength) / 2,
		(DEFAULT_SIZE - crossWidth) / 2,
		crossLength,
		crossWidth
	)
	shape.graphics.endFill()
	// 竖着的
	shape.graphics.beginFill(formatHEX(centerColor))
	shape.graphics.drawRect(
		(DEFAULT_SIZE - crossWidth) / 2,
		(DEFAULT_SIZE - crossLength) / 2,
		crossWidth,
		crossLength
	)
	shape.graphics.endFill()
	return shape
}

/** 特殊标记：X陷阱 */
export function drawXTrap(
	shape: Shape,
	/**
	 * @example 参考如下：
	 * protected static readonly COLOR_HURT: uint = 0xff8000
	 * protected static readonly COLOR_KILL: uint = 0xff0000
	 * protected static readonly COLOR_ROTATE: uint = 0x0000ff
	 */
	color: number,
	alphaBack: number = 1 / 4,
	lineSize: number = DEFAULT_SIZE / 20
): Shape {
	// Back
	shape.graphics.beginFill(formatHEX_A(color, alphaBack))
	shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE)
	shape.graphics.endFill()

	// X
	shape.graphics
		.beginStroke(formatHEX(color)) // ! 替代Flash中的`graphics.lineStyle`
		.setStrokeStyle(lineSize)
		// * 开始画线
		.moveTo(lineSize / 2, lineSize / 2)
		.lineTo(DEFAULT_SIZE - lineSize / 2, DEFAULT_SIZE - lineSize / 2)
		.moveTo(lineSize / 2, DEFAULT_SIZE - lineSize / 2)
		.lineTo(DEFAULT_SIZE - lineSize / 2, lineSize / 2)
	return shape
}

// 注册表 //

export type BlockDrawDict = {
	// !【2023-11-12 15:11:11】放弃在这里推导类型，因为「根据ID导出对应的『状态类型』机制不成熟，使用起来非常复杂，且不利于维护」
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: typeID]: (shape: Shape, state: any) => Shape
	// !【2023-11-19 17:07:54】放弃使用`typeIDMap<ZimDrawF_Block>`
}

/**
 * 根据方块ID进行绘制映射的绘图函数 @ 原生
 */
export const BLOCK_DRAW_DICT_NATIVE: BlockDrawDict = {
	/**
	 * 空
	 */
	[NativeBlockIDs.VOID]: (shape: Shape, _state: null): Shape => shape,
	/**
	 * 彩色方块
	 *
	 * !【2023-11-12 15:35:34】📌bug：若上面的对象类型不使用any罩着，这里`state`所对应的类型TS推导不出`BSColored`，只有`never`
	 * * 这一点太废物了
	 * * 另一个现象：若将VOID处的第二参数类型改为`BSColored`，则`state`所对应的类型TS推导出`BSColored`
	 */
	[NativeBlockIDs.COLORED]: drawColoredBlock,
}

/**
 * 根据方块ID进行绘制映射的绘图函数 @ BaTr（独有）
 */
export const BLOCK_DRAW_DICT_BATR: BlockDrawDict = {
	// ! 尽可能不要在这扩展绘图函数，关注「独有的」以便解耦，最后再在使用者处mixin
	/** 使用同样的方法 */
	[BatrBlockIDs.WALL]: drawWall,
	[BatrBlockIDs.WATER]: drawWater,
	[BatrBlockIDs.GLASS]: drawGlass,
	[BatrBlockIDs.BEDROCK]: drawWall,
	[BatrBlockIDs.METAL]: drawMetal,
	[BatrBlockIDs.MOVEABLE_WALL]: drawMoveableWall,
	[BatrBlockIDs.GATE]: drawGate,
	// ! ↓下面这些没有「方块状态」的，需要重定向一下（不然就得用到state:null）占位符
	[BatrBlockIDs.X_TRAP_HURT]: (shape: Shape, _state: null): Shape =>
		drawXTrap(shape, BatrBlockPrototypes.X_TRAP_HURT.pixelColor),
	[BatrBlockIDs.X_TRAP_KILL]: (shape: Shape, _state: null): Shape =>
		drawXTrap(shape, BatrBlockPrototypes.X_TRAP_KILL.pixelColor),
	[BatrBlockIDs.X_TRAP_ROTATE]: (shape: Shape, _state: null): Shape =>
		drawXTrap(shape, BatrBlockPrototypes.X_TRAP_ROTATE.pixelColor),
	[BatrBlockIDs.COLOR_SPAWNER]: (shape: Shape, _state: null): Shape =>
		drawColorSpawner(shape),
	[BatrBlockIDs.LASER_TRAP]: (shape: Shape, _state: null): Shape =>
		drawLaserTrap(shape),
	[BatrBlockIDs.SPAWN_POINT_MARK]: (shape: Shape, _state: null): Shape =>
		drawSpawnPointMark(shape),
	[BatrBlockIDs.SUPPLY_POINT]: (shape: Shape, _state: null): Shape =>
		drawSupplyPoint(shape),
}
