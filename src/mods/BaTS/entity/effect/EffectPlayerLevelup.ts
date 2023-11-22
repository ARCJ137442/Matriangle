import { uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { fPoint } from 'matriangle-common/geometricTools'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { typeID } from 'matriangle-api'

/** 专用的显示状态数据 */
interface IDisplayDataStateEffectPlayerLevelup extends IDisplayDataStateEffect {
	/**
	 * 爆炸的颜色（十六进制整数值）
	 */
	color: uint
}
/**
 * 玩家升级
 * * 呈现一个特定颜色的、加速上升并迅速淡出的（向上）箭头
 * * 用于提示玩家属性（Buff）的提升
 */
export default class EffectPlayerLevelup extends Effect<IDisplayDataStateEffectPlayerLevelup> {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectPlayerLevelup'

	public static readonly DEFAULT_COLOR: uint = 0x000000
	public static readonly LINE_ALPHA: number = 0.8
	public static readonly FILL_ALPHA: number = 0.75
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 5
	public static readonly LIFE: number = TPS

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		color: uint = EffectPlayerLevelup.DEFAULT_COLOR
		// LIFE: uint = EffectPlayerLevelup.LIFE
	) {
		super(EffectPlayerLevelup.ID, position, EffectPlayerLevelup.LIFE)
		this._color = color
		this._proxy.storeState('color', color)
	}

	//============Display Implements============//
	protected _color: uint = EffectPlayerLevelup.DEFAULT_COLOR
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// /**
	//  * 实现：淡出+移动坐标
	//  *
	//  * ! 【2023-09-17 0:25:38】现在「向上移动」仅作用于显示端，逻辑端不会移动
	//  */
	// public shapeRefresh(shape: IShape): void {
	// 	shape.alpha = this.lifePercent
	// 	shape.y -= (EffectPlayerLevelup.GRID_SIZE / 4) * (1 - this.lifePercent)
	// }

	// public displayInit(shape: IShape): void {
	// 	// 设置颜色
	// 	shape.graphics.lineStyle(
	// 		EffectPlayerLevelup.LINE_SIZE,
	// 		this._color,
	// 		EffectPlayerLevelup.LINE_ALPHA
	// 	)
	// 	shape.graphics.beginFill(this._color, EffectPlayerLevelup.FILL_ALPHA)
	// 	// 移动绘制
	// 	shape.graphics.moveTo(0, -EffectPlayerLevelup.GRID_SIZE * 1.5) // T1
	// 	shape.graphics.lineTo(EffectPlayerLevelup.GRID_SIZE * 1.5, 0) // T2
	// 	shape.graphics.lineTo(EffectPlayerLevelup.GRID_SIZE / 2, 0) // B1
	// 	shape.graphics.lineTo(
	// 		EffectPlayerLevelup.GRID_SIZE / 2,
	// 		EffectPlayerLevelup.GRID_SIZE * 1.5
	// 	) // B2
	// 	shape.graphics.lineTo(
	// 		-EffectPlayerLevelup.GRID_SIZE / 2,
	// 		EffectPlayerLevelup.GRID_SIZE * 1.5
	// 	) // B3
	// 	shape.graphics.lineTo(-EffectPlayerLevelup.GRID_SIZE / 2, 0) // B4
	// 	shape.graphics.lineTo(-EffectPlayerLevelup.GRID_SIZE * 1.5, 0) // T3
	// 	shape.graphics.lineTo(0, -EffectPlayerLevelup.GRID_SIZE * 1.5) // T1
	// 	// 结束绘制
	// 	shape.graphics.endFill()
	// }
}
