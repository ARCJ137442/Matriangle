/**
 * Zim测试部分
 * * 用以测试诸多绘图函数
 */

import { BatrBlockPrototypes } from 'matriangle-mod-bats/registry/BlockRegistry_Batr'
import BSColored from 'matriangle-mod-native/block/BSColored'
import { Shape } from 'zimjs/ts-src/typings/zim'
import {
	drawColoredBlock,
	drawWater,
	drawWall,
	drawMetal,
	drawMoveableWall,
	drawXTrap,
	drawGlass,
	drawGate,
	drawLaserTrap,
	drawColorSpawner,
	drawSpawnPointMark,
	drawSupplyPoint,
} from './implements/zim_client_block'
import { drawPlayerGradient, center_drags, drawTriangleRight } from './zimUtils'
import PlayerBatr from 'matriangle-mod-bats/entity/player/PlayerBatr'

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
		drawPlayerGradient(
			shape_constructor(),
			drawTriangleRight,
			PlayerBatr.SIZE,
			PlayerBatr.LINE_SIZE
		)
		// !【2023-11-20 00:18:50 】后续可能不在更新
	)
}

/** 方块原型⇒初始化「显示状态」 */ // !【2023-11-15 22:00:42】现在移动到「方块」的内部方法中
