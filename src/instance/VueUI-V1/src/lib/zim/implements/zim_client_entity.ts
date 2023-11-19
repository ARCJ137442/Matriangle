// 绘制实体 //

import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import {
	formatHEX,
	halfBrightnessTo,
	turnBrightnessTo,
} from 'matriangle-common/color'
import { OptionalRecursive2 } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy'
import { graphicsLineStyle } from '../zimUtils'
import { typeID } from 'matriangle-api'
import { NativeEntityTypes } from 'matriangle-mod-native/registry/EntityRegistry_Native'
import { IDisplayDataEntityStatePlayerBatr } from 'matriangle-mod-bats/entity/player/PlayerBatr'
import { IDisplayDataEntityStatePlayerV1 } from 'matriangle-mod-native/entities/player/Player_V1'
import { BatrEntityTypes } from 'matriangle-mod-bats/registry/EntityRegistry_Batr'
import { ZimDisplayerEntity } from '../interfaces/zim_client_entities'
import { IDisplayDataEntityState } from 'matriangle-api/display/RemoteDisplayAPI'

// 抽象接口 //

/**
 * 实体显示函数类型
 * * 映射形式：呈现者&状态→呈现者
 */
export type ZimDrawF_Entity = (
	displayer: ZimDisplayerEntity,
	state: IDisplayDataEntityState
) => ZimDisplayerEntity

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

// 通用 //
/** 通用的「实体状态」参数更新 */
export function commonUpdate<ESType extends IDisplayDataEntityState>(
	displayer: ZimDisplayerEntity<ESType>,
	state: OptionalRecursive2<IDisplayDataEntityState>
): ZimDisplayerEntity<ESType> {
	// 更新坐标 // ! 📌难点：坐标投影
	if (state?.position !== undefined) {
		const projectedPosition: [number, number] =
			displayer.host.map.projectTo2D_display_center(
				state.position,
				[0, 0]
			)
		console.warn(
			'投影的坐标：',
			state.position,
			'=>',
			projectedPosition,
			'| state =',
			state
		)
		// 直接投影到屏幕上，并以自身中心为中心
		;[displayer.x, displayer.y] = projectedPosition
		// ! 不要使用`pos`方法
	}
	// 更新角度 // ! 📌难点：任意维整数角
	if (state?.direction !== undefined)
		if (state.direction < 4)
			// ! 只有0~3的「xOy」方向可显示
			displayer.rot(
				// * 0~3范围内的mRot→90°角转换
				(state.direction & 1) * 180 + (state.direction >> 1) * 90
			)
	// 更新不透明度
	if (state?.alpha !== undefined) displayer.alpha = state.alpha
	// 更新可显示性
	if (state?.visible !== undefined) displayer.visible = state.visible
	// 更新缩放比例
	if (state?.scaleX !== undefined) displayer.scaleX = state.scaleX
	if (state?.scaleY !== undefined) displayer.scaleY = state.scaleY
	// 返回自身
	return displayer
}

// 玩家 //

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
export function drawPlayer(
	shape: ZimDisplayerEntity,
	fillColor: uint = 0xffffff,
	lineColor: uint = halfBrightnessTo(fillColor),
	size: number = PlayerBatr.SIZE,
	lineSize: number = PlayerBatr.LINE_SIZE
): ZimDisplayerEntity {
	// 新 //
	const fillColor2 = turnBrightnessTo(fillColor, 0.75)
	// 先前逻辑复刻 //
	const realRadiusX: number = (size - lineSize) / 2
	const realRadiusY: number = (size - lineSize) / 2
	shape.graphics.clear()
	graphicsLineStyle(shape.graphics, lineSize, lineColor) // 从旧有Flash API迁移

	shape.graphics
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
		.moveTo(-realRadiusX, -realRadiusY)
		.lineTo(realRadiusX, 0)
		.lineTo(-realRadiusX, realRadiusY)
		.lineTo(-realRadiusX, -realRadiusY)
		// shape.graphics.drawCircle(0,0,10);
		.endFill()
		.endStroke()
	console.warn(
		'玩家绘图函数被调用！',
		shape,
		realRadiusX,
		realRadiusY,
		// eslint-disable-next-line prefer-rest-params
		arguments
	)
	return shape
}

// 注册表 //
export type EntityDrawDict = {
	// !【2023-11-19 17:17:19】同`BLOCK_DRAW_DICT_NATIVE`，无法使用`typeIDMap<ZimDrawF_Entity>`
	[key: typeID]: {
		/**
		 * 实体初始化时的绘图
		 * * 一般包括矢量图绘制
		 */
		init: (
			displayer: ZimDisplayerEntity,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			state: any
		) => ZimDisplayerEntity
		/**
		 * 实体更新时的绘图
		 * * 一般无需绘制矢量图
		 * * 可能没有
		 */
		refresh: (
			displayer: ZimDisplayerEntity,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			state: OptionalRecursive2<any>
		) => ZimDisplayerEntity
	}
}

/**
 * 根据实体ID、状态进行绘制映射的绘图函数 @ 原生
 */
export const ENTITY_DRAW_DICT_NATIVE: EntityDrawDict = {
	/** 目前只有「初代玩家」 */
	[NativeEntityTypes.PLAYER.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStatePlayerV1
		): ZimDisplayerEntity =>
			// 绘图后再调用「通用更新」
			commonUpdate(
				drawPlayer(displayer, state.fillColor, state.lineColor),
				state
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStatePlayerV1>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate(displayer, state),
	},
}

/**
 * 根据实体ID、状态进行绘制映射的绘图函数 @ BaTr（独有）
 */
export const ENTITY_DRAW_DICT_BATR: EntityDrawDict = {
	/** BaTr玩家 */
	[BatrEntityTypes.PLAYER_BATR.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStatePlayerBatr
		): ZimDisplayerEntity =>
			// 绘图后再调用「通用更新」
			commonUpdate(
				drawPlayer(displayer, state.fillColor, state.lineColor),
				state
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStatePlayerBatr>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate(displayer, state),
	},
}
