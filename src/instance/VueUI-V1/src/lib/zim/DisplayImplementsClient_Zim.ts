/**
 * Zim绘制部分
 * * 包含诸多绘图函数
 */
import { DisplayObject, Frame, Shape } from 'zimjs'
import {
	formatHEX,
	formatHEX_A,
	halfBrightnessTo,
	turnBrightnessTo,
} from 'matriangle-common/color'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import { NativeBlockIDs } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import BSColored from 'matriangle-mod-native/block/BSColored'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import BSBiColored from 'matriangle-mod-bats/block/BSBiColored'
import BSGate from 'matriangle-mod-bats/block/BSGate'
import {
	center_drags,
	drawDiamond,
	drawSquareAndDiamond,
	drawSquareFrameOrigin,
	fillSquareBiColored,
	graphicsLineStyle,
} from './zimUtils'
import {
	BatrBlockIDs,
	BatrBlockPrototypes,
} from 'matriangle-mod-bats/registry/BlockRegistry_Batr'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { ZimDisplayerMap } from './DisplayInterfacesClient_Zim'
import Block from 'matriangle-api/server/block/Block'
import { IDisplayDataBlock } from 'matriangle-api/display/remoteDisplayAPI'
import IMap from 'matriangle-api/server/map/IMap'
import { BatrDefaultMaps } from 'matriangle-mod-bats/registry/MapRegistry'
import { generateArray, randomIn } from 'matriangle-common'
import { stackMaps } from './../../../../V1/stackedMaps'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'

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
 *
 * @param
 */
export function drawPlayerShape(
	shape: Shape,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor),
	size: number = PlayerBatr.SIZE,
	lineSize: number = PlayerBatr.LINE_SIZE
): Shape {
	// 新 //
	const fillColor2 = turnBrightnessTo(fillColor, 0.75)
	// 先前逻辑复刻 //
	const realRadiusX: number = (size - lineSize) / 2
	const realRadiusY: number = (size - lineSize) / 2
	shape.graphics.clear()
	// shape.graphics.lineStyle(lineSize, lineColor) // ! 有一些地方还是不一致的
	graphicsLineStyle(shape.graphics, lineSize, lineColor) // lineColor
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
			[1 / 4, 1], // 亮度(比例)渐变：1/4~1
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
	return shape
}

/**
 * 所有方块的绘制函数
 * * 可能「一个显示状态，一个方块状态」会让程序更有效率，但从工程上这不一定是个节省时间和精力的好方案
 */

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
	drawSquareFrameOrigin(shape, DEFAULT_SIZE, lineSize)
		.graphics.endFill()
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
		drawSquareFrameOrigin(shape, DEFAULT_SIZE, lineSizeBorder)
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
		shape,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 2) / 12
	)
	drawDiamond(
		shape,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 3) / 12
	)
	drawDiamond(
		shape,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		(DEFAULT_SIZE * 4) / 12
	)
	// 中心点
	shape.graphics
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
		shape,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2,
		DEFAULT_SIZE / 2
	)
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

// 绘制实体 //

// TODO: 有待实现

/*
? 实体的绘图方法似乎被限制在其自身中，并且很多地方都需要抽象出一个「实体状态」以避免直接的数据传输
  * 不同于方块，实体的数据量相对较大，不适合高速更新显示流

* 因此，有可能：
  * 逻辑端：挑选特定的一些（影响显示的状态）形成「实体状态代理」，以便通过JSON传输给客户端
  * 显示端：通过这些指定的「实体状态代理」JSON对象，结合**自身一套**「显示逻辑」，将状态展开成「要显示的Shape对象」

! 这可能导致：
  * 需要对原先基于Flash的「显示端逻辑」（`shapeXXX`方法）进行重构，将「逻辑处理」和「显示呈现」完全剥离（只剩下一个「显示状态代理」）
  * 需要搭建一个「完全键值对（所有必要的键值对都有）初始化，部分键值对用于更新」的「动态更新系统」（并且「位置」这类信息，也需要一个绑定）
  * 亟待构思好「响应式更新」的总体逻辑（何时调用更新，这些更新又该如何收集并传递给显示端）
*/

/**
 * 根据方块ID进行绘制映射的绘图函数 @ 原生
 */
export const BLOCK_DRAW_DICT_NATIVE: {
	// !【2023-11-12 15:11:11】放弃在这里推导类型，因为「根据ID导出对应的『状态类型』机制不成熟，使用起来非常复杂，且不利于维护」
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: typeID]: (shape: Shape, stateData: any) => Shape
} = {
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
 * 根据方块ID进行绘制映射的绘图函数 @ BaTr（完整版）
 */
export const BLOCK_DRAW_DICT_BATR: {
	// !【2023-11-12 15:11:11】放弃在这里推导类型，因为「根据ID导出对应的『状态类型』机制不成熟，使用起来非常复杂，且不利于维护」
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: typeID]: (shape: Shape, stateData: any) => Shape
} = {
	/** 扩展自原生 */
	...BLOCK_DRAW_DICT_NATIVE,
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

/**
 * 测试旧BaTr的图形绘制
 */
export function test_draw(shape_constructor: () => Shape): Shape[] {
	return center_drags(
		// 方块 //
		// 颜色方块
		drawColoredBlock(shape_constructor(), new BSColored(0x66ccff)),
		// 水
		drawWater(shape_constructor(), BatrBlockPrototypes.WATER.state),
		// 墙
		drawWall(shape_constructor(), BatrBlockPrototypes.WALL.state),
		// 基岩（特殊颜色的墙）
		drawWall(shape_constructor(), BatrBlockPrototypes.BEDROCK.state),
		// 金属（特殊图案的墙）
		drawMetal(shape_constructor(), BatrBlockPrototypes.METAL.state),
		// 可移动墙（特殊图案的墙）
		drawMoveableWall(
			shape_constructor(),
			BatrBlockPrototypes.MOVEABLE_WALL.state
		),
		// 三种X陷阱
		drawXTrap(shape_constructor(), 0xff8000),
		drawXTrap(shape_constructor(), 0xff0000),
		drawXTrap(shape_constructor(), 0x0000ff),
		// 玻璃（特殊透明度的墙）
		drawGlass(shape_constructor(), BatrBlockPrototypes.GLASS.state),
		// 门
		drawGate(shape_constructor(), BatrBlockPrototypes.GATE_CLOSE.state),
		drawGate(shape_constructor(), BatrBlockPrototypes.GATE_OPEN.state),
		// 激光陷阱
		drawLaserTrap(shape_constructor()),
		// 颜色生成器
		drawColorSpawner(shape_constructor()),
		// 重生点标记
		drawSpawnPointMark(shape_constructor()),
		// 供应点 // ? 标记？
		drawSupplyPoint(shape_constructor()),
		// 实体 //
		// 玩家
		drawPlayerShape(shape_constructor())
	)
}

/** 方块原型⇒初始化「显示状态」 */
export const blockStateFromPrototype = (
	prototype: Block
): IDisplayDataBlock => ({
	blockID: prototype.id,
	blockState: prototype.state,
})
/**
 * 测试新的「地图呈现者」
 */
export function test_mapDisplayer(frame: Frame): ZimDisplayerMap {
	const mapDisplayer = new ZimDisplayerMap(BLOCK_DRAW_DICT_BATR)
	/* mapDisplayer.shapeInit({
		size: [4, 4],
		blocks: {
			[pointToLocationStr([0, 0])]: {
				blockID: NativeBlockIDs.COLORED,
				blockState: new BSColored(0x0000ff),
			},
			[pointToLocationStr([1, 1])]: {
				blockID: NativeBlockIDs.COLORED,
				blockState: new BSColored(0xff0000),
			},
			[pointToLocationStr([1, 2])]: blockStateFromPrototype(
				BatrBlockPrototypes.WALL
			),
		},
	}) */
	const MAP: IMap = new Map_V1(
		'zim_test',
		stackMaps(
			/* generateArray(
				BatrDefaultMaps._ALL_MAPS.length,
				i => BatrDefaultMaps._ALL_MAPS[i].storage as MapStorageSparse
			) */
			generateArray(
				2,
				() =>
					randomIn(BatrDefaultMaps._ALL_MAPS)
						.storage as MapStorageSparse
			)
		)
	)
	// console.log('test_mapDisplayer', MAP.name)
	mapDisplayer.shapeInit(MAP.storage.toDisplayData())
	// .wiggle({ baseAmount: 10, property: 'x' }) /* .center().drag() */
	// 必须添加进舞台
	frame.stage.addChild(mapDisplayer as unknown as DisplayObject)
	// 回传「地图呈现者」
	return mapDisplayer
}
