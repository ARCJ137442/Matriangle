// 绘制实体 //
import { OptionalRecursive2 } from 'matriangle-common/utils'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { logical2Real } from 'matriangle-api/display/PosTransform'
import { NativeEntityTypes } from 'matriangle-mod-native/registry/EntityRegistry_Native'
import { IDisplayDataEntityStatePlayerBatr } from 'matriangle-mod-bats/entity/player/PlayerBatr'
import { IDisplayDataEntityStatePlayerV1 } from 'matriangle-mod-native/entities/player/Player_V1'
import { BatrEntityTypes } from 'matriangle-mod-bats/registry/EntityRegistry_Batr'
import { ZimDisplayerEntity } from '../interfaces/zim_client_entities'
import { IDisplayDataEntityState } from 'matriangle-api/display/RemoteDisplayAPI'
import {
	drawRoundRectBox,
	drawTriangleRight,
	drawTriangleRightGradient,
	graphicsLineStyle,
} from '../zimUtils'
import { IDisplayDataEntityStateBullet } from 'matriangle-mod-bats/entity/projectile/bullet/Bullet'
import { formatHEX, formatHEX_A } from 'matriangle-common'
import { IDisplayDataEntityStateBonusBox } from 'matriangle-mod-bats/entity/item/BonusBox'
import { NativeBonusTypes as BonusTypes_Batr } from 'matriangle-mod-bats/registry/BonusRegistry'
import { uint } from 'matriangle-legacy/AS3Legacy'

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

/**
 * 通用的「实体状态」参数更新——所有实体的共有参数
 *
 * @param inGrid 是否为「格点实体」（若是，则其坐标会特别对齐到网格中央）
 * @returns 呈现者自身
 */
export function commonUpdate_all<ESType extends IDisplayDataEntityState>(
	displayer: ZimDisplayerEntity<ESType>,
	state: OptionalRecursive2<IDisplayDataEntityState>,
	inGrid: boolean
): ZimDisplayerEntity<ESType> {
	// 更新坐标
	commonUpdate_position(displayer, state, inGrid)
	// 更新角度
	commonUpdate_direction(displayer, state)
	// 更新可见性、不透明度、缩放比例
	commonUpdate_AVS(displayer, state)
	// 返回自身
	return displayer
}

/**
 * 通用实体参数更新（仅坐标）
 *
 * @param inGrid 是否为「格点实体」（若是，则其坐标会特别对齐到网格中央）
 * @returns 呈现者自身
 */
export function commonUpdate_position<ESType extends IDisplayDataEntityState>(
	displayer: ZimDisplayerEntity<ESType>,
	state: OptionalRecursive2<IDisplayDataEntityState>,
	inGrid: boolean
): ZimDisplayerEntity<ESType> {
	if (state?.position !== undefined) {
		// 直接投影到屏幕上，并以自身中心为中心
		;[displayer.x, displayer.y] = inGrid
			? // 格点实体若不进行「中央对齐」，则其坐标会落在格点上（而非「便于使用旋转转向」的中央位置）
			  displayer.host.map.projectTo2D_display_center(state.position)
			: // 非格点实体真实反映了其坐标，其「方块坐标」到「显示坐标」只有一个倍数的关系
			  displayer.host.map.projectTo2D_display(state.position)
		// !【2023-11-19 22:24:31】不要使用`pos`方法
	}
	// 返回自身
	return displayer
}

/** 通用实体参数更新（仅方向） */
export function commonUpdate_direction<ESType extends IDisplayDataEntityState>(
	displayer: ZimDisplayerEntity<ESType>,
	state: OptionalRecursive2<IDisplayDataEntityState>
): ZimDisplayerEntity<ESType> {
	if (state?.direction !== undefined)
		if (state.direction < 4)
			// ! 只有0~3的「xOy」方向可显示
			displayer.rot(
				// * 0~3范围内的mRot→90°角转换
				(state.direction & 1) * 180 + (state.direction >> 1) * 90
			)
	// 返回自身
	return displayer
}

/** 通用实体参数更新（可见性、不透明度、缩放比例） */
export function commonUpdate_AVS<ESType extends IDisplayDataEntityState>(
	displayer: ZimDisplayerEntity<ESType>,
	state: OptionalRecursive2<IDisplayDataEntityState>
): ZimDisplayerEntity<ESType> {
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
	SIZE: logical2Real(1),
	LINE_SIZE: logical2Real(1 / 96),
}

// 子弹 //

/** 临时定义的「子弹大小（半径）」 */
const BULLET_DRAW_DATAS = {
	/** 所有子弹共用的线条粗细 */
	globalLineSize: logical2Real(1 / 80),
	// 所有类型
	basic: {
		radius: logical2Real(3 / 8),
	},
	nuke: {
		radius: logical2Real(1 / 2),
		radiusDecoration: logical2Real(1 / 8),
	},
	bomber: {
		radius: logical2Real(2 / 5),
		radiusDecoration: logical2Real(1 / 8),
	},
	tracking: {
		radius: logical2Real(3 / 8),
		radiusDecoration: logical2Real(3 / 20),
	},
	commonDrawFs: {
		/** 所有子弹共用的绘制函数 */
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityState>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate_all(displayer, state, false /* 非格点实体 */),
	},
}

// 特效 //

const EFFECT_DRAW_DATAS = {
	spawn: {
		DEFAULT_COLOR: 0x6666ff,
		LINE_ALPHA: 0.6,
		FILL_ALPHA: 0.5,
		LINE_SIZE: logical2Real(1 / 25),
		SIZE: uint(logical2Real(1.6)),
		SCALE: 1,
		STAGE_1_START_TIME: uint(FIXED_TPS * (3 / 4)),
		STAGE_2_START_TIME: uint(FIXED_TPS / 4),
	},
	teleport: {
		DEFAULT_COLOR: 0x44ff44,
		LINE_ALPHA: 0.6,
		FILL_ALPHA: 0.5,
		LINE_SIZE: logical2Real(1 / 25),
	},
}

// 奖励箱 //
const BONUS_BOX_DRAW_DATAS = {
	// 奖励箱本身
	lineColor: 0x777777,
	fillColor: 0xdddddd,
	boxSize: logical2Real(4 / 5),
	boxLineSize: logical2Real(1 / 20),
	boxRoundSize: logical2Real(1 / 16),
	/** 奖励箱标识 */ // * 摘自`BONUS_BOX_DRAW_DATAS.symbol.ts`
	symbol: {
		// General
		GRID_SIZE: logical2Real(1 / 5),

		// HHL
		HP_COLOR: 0xff0000, //PlayerGUI.HP_COLOR;

		// Tool
		TOOL_COLOR: 0x555555,
		TOOL_LINE_SIZE: 4,

		// Attributes
		ATTRIBUTES_LINE_SIZE: 4,
		ATTRIBUTES_FILL_ALPHA: 3 / 4,

		EXPERIENCE_COLOR: 0xcc88ff,

		BUFF_RANDOM_COLOR: 0x7f7f7f,
		/** 伤害加成：红buff */
		BUFF_DAMAGE_COLOR: 0xff6666,
		/** 冷却减免⇒蓝buff */
		BUFF_CD_COLOR: 0x6666ff,
		/** 抗性提升：绿buff */
		BUFF_RESISTANCE_COLOR: 0x66ff66,
		/** 范围提升：黄buff */
		BUFF_RADIUS_COLOR: 0xffff66,

		// Team
		TEAM_LINE_SIZE: 4,

		RANDOM_CHANGE_TEAM_LINE_COLOR: 0x555555,

		UNITE_PLAYER_LINE_COLOR: 0x6666ff,

		UNITE_AI_LINE_COLOR: 0x66ff66,
	},
}

export function drawBonusBox(
	shape: ZimDisplayerEntity,
	state: IDisplayDataEntityStateBonusBox
): ZimDisplayerEntity {
	console.warn('奖励箱初始化！', shape, state)
	// * 绘制盒子 * //
	drawRoundRectBox(
		shape,
		BONUS_BOX_DRAW_DATAS.boxSize,
		BONUS_BOX_DRAW_DATAS.boxLineSize,
		BONUS_BOX_DRAW_DATAS.boxRoundSize,
		BONUS_BOX_DRAW_DATAS.lineColor,
		BONUS_BOX_DRAW_DATAS.fillColor
	)
	// * 绘制标识 * // // 返回自身
	return drawBonusBoxSymbol(shape, state)
}

/**
 * 绘制奖励箱标识
 */
export function drawBonusBoxSymbol(
	shape: ZimDisplayerEntity,
	state: IDisplayDataEntityStateBonusBox
): ZimDisplayerEntity {
	switch (state.bonusType) {
		// HHL(HP,Heal&Life)
		case BonusTypes_Batr.ADD_HP:
			drawHPSymbol(shape)
			break
		case BonusTypes_Batr.ADD_HEAL:
			drawHealSymbol(shape)
			break
		case BonusTypes_Batr.ADD_LIFE:
			drawLifeSymbol(shape)
			break
		// Tool
		case BonusTypes_Batr.RANDOM_TOOL:
			drawToolSymbol(shape)
			break
		// Attributes
		case BonusTypes_Batr.BUFF_RANDOM:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RANDOM_COLOR
			)
			break
		case BonusTypes_Batr.BUFF_DAMAGE:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_DAMAGE_COLOR
			)
			break
		case BonusTypes_Batr.BUFF_CD:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_CD_COLOR
			)
			break
		case BonusTypes_Batr.BUFF_RESISTANCE:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RESISTANCE_COLOR
			)
			break
		case BonusTypes_Batr.BUFF_RADIUS:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RADIUS_COLOR
			)
			break
		case BonusTypes_Batr.ADD_EXPERIENCE:
			drawAttributesSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.EXPERIENCE_COLOR
			)
			break
		// Team
		case BonusTypes_Batr.RANDOM_CHANGE_TEAM:
			drawTeamSymbol(
				shape,
				BONUS_BOX_DRAW_DATAS.symbol.RANDOM_CHANGE_TEAM_LINE_COLOR
			)
			break
		// case NativeBonusTypes.UNITE_PLAYER:
		// 	drawTeamSymbol(shape, BONUS_BOX_DRAW_DATAS.symbol.UNITE_PLAYER_LINE_COLOR);
		// 	break;
		// case NativeBonusTypes.UNITE_AI:
		// 	drawTeamSymbol(shape, BONUS_BOX_DRAW_DATAS.symbol.UNITE_AI_LINE_COLOR);
		// 	break;
		// Other
		case BonusTypes_Batr.RANDOM_TELEPORT:
			drawRandomTeleportSymbol(shape)
			break
	}
	// 返回自身
	return shape
}

//====HHL====//
export function drawHPSymbol(shape: ZimDisplayerEntity): void {
	// V
	shape.graphics
		.beginFill(formatHEX(BONUS_BOX_DRAW_DATAS.symbol.HP_COLOR))
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 3
		)
		.endFill()
		// H
		.beginFill(formatHEX(BONUS_BOX_DRAW_DATAS.symbol.HP_COLOR))
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 3,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.endFill()
}

export function drawHealSymbol(shape: ZimDisplayerEntity): void {
	// V
	shape.graphics
		.beginFill(formatHEX(BONUS_BOX_DRAW_DATAS.symbol.HP_COLOR))
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 3
		)
		// H
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 3,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.endFill()
}

export function drawLifeSymbol(shape: ZimDisplayerEntity): void {
	// L
	shape.graphics
		.beginFill(formatHEX(BONUS_BOX_DRAW_DATAS.symbol.HP_COLOR))
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 2
		)
		.endFill()
		.beginFill(formatHEX(BONUS_BOX_DRAW_DATAS.symbol.HP_COLOR))
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 3,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.endFill()
}

//====Tool====//
export function drawToolSymbol(shape: ZimDisplayerEntity): void {
	// Circle
	graphicsLineStyle(
		shape.graphics,
		BONUS_BOX_DRAW_DATAS.symbol.TOOL_LINE_SIZE,
		BONUS_BOX_DRAW_DATAS.symbol.TOOL_COLOR
	)
		.drawCircle(0, 0, BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE)
		.endStroke()
}

//====Attributes====//
export function drawAttributesSymbol(
	shape: ZimDisplayerEntity,
	color: uint
): void {
	// Colored Rectangle
	/*graphics.lineStyle(ATTRIBUTES_LINE_SIZE,color);
		graphics.beginFill(color,ATTRIBUTES_FILL_ALPHA);
		graphics.drawRect(-GRID_SIZE*7/8,-GRID_SIZE*7/8,GRID_SIZE*7/4,GRID_SIZE*7/4);
		graphics.endFill();*/
	// Colored Arrow
	// Top
	graphicsLineStyle(
		shape.graphics,
		BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
		color
	)
		.beginFill(
			formatHEX_A(
				color,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA
			)
		)
		.moveTo(0, -BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5) // T1
		.lineTo(BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5, 0) // T2
		.lineTo(BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2, 0)
		// B1
		.lineTo(
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5
		)
		// B2
		.lineTo(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5
		)
		// B3
		.lineTo(-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE / 2, 0)
		// B4
		.lineTo(-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5, 0) // T3
		.lineTo(0, -BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 1.5) // T1
		.endFill()
		.endStroke()
	// Bottom
}

//====Team====//
export function drawTeamSymbol(shape: ZimDisplayerEntity, color: uint): void {
	graphicsLineStyle(
		shape.graphics,
		BONUS_BOX_DRAW_DATAS.symbol.TEAM_LINE_SIZE,
		color
	)
		.moveTo(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.lineTo(BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE, 0)
		.lineTo(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.lineTo(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
		)
		.endStroke()
}

//====Other====//
export function drawRandomTeleportSymbol(shape: ZimDisplayerEntity): void {
	// Teleport Effect
	// 1
	graphicsLineStyle(
		shape.graphics,
		EFFECT_DRAW_DATAS.teleport.LINE_SIZE,
		EFFECT_DRAW_DATAS.teleport.DEFAULT_COLOR,
		EFFECT_DRAW_DATAS.teleport.LINE_ALPHA
	)
		.beginFill(
			formatHEX_A(
				EFFECT_DRAW_DATAS.teleport.DEFAULT_COLOR,
				EFFECT_DRAW_DATAS.teleport.FILL_ALPHA
			)
		)
		.drawRect(
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 2,
			BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 2
		)
		.endFill()
		.endStroke()
	// 2
	graphicsLineStyle(
		shape.graphics,
		EFFECT_DRAW_DATAS.teleport.LINE_SIZE,
		EFFECT_DRAW_DATAS.teleport.DEFAULT_COLOR,
		EFFECT_DRAW_DATAS.teleport.LINE_ALPHA
	)
		.beginFill(
			formatHEX_A(
				EFFECT_DRAW_DATAS.teleport.DEFAULT_COLOR,
				EFFECT_DRAW_DATAS.teleport.FILL_ALPHA
			)
		)
		.moveTo(0, -BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * Math.SQRT2)
		.lineTo(BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * Math.SQRT2, 0)
		.lineTo(0, BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * Math.SQRT2)
		.lineTo(-BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * Math.SQRT2, 0)
		.lineTo(0, -BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * Math.SQRT2)
		.endFill()
		.endStroke()
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
			// 填充颜色&粗细
			commonUpdate_all(
				drawTriangleRightGradient(
					displayer,
					PlayerBatr.SIZE,
					PlayerBatr.LINE_SIZE,
					state.fillColor,
					state.lineColor
				),
				state,
				true // 格点实体
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStatePlayerV1>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				true // 格点实体
			),
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
			// 填充颜色&粗细
			commonUpdate_all(
				drawTriangleRightGradient(
					displayer,
					PlayerBatr.SIZE,
					PlayerBatr.LINE_SIZE,
					state.fillColor,
					state.lineColor
				),
				state,
				true // 格点实体
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStatePlayerBatr>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				true // 格点实体
			),
	},
	/** 基础子弹 */
	[BatrEntityTypes.BULLET_BASIC.id]: {
		...BULLET_DRAW_DATAS.commonDrawFs,
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateBullet
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			graphicsLineStyle(
				displayer.graphics,
				BULLET_DRAW_DATAS.globalLineSize,
				state.lineColor
			).beginFill(formatHEX(state.fillColor))
			// 绘制形状
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.basic.radius,
				state.lineColor
			)
			displayer.graphics.endFill().endStroke()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityState>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			),
	},
	/** 核弹 */
	[BatrEntityTypes.BULLET_NUKE.id]: {
		...BULLET_DRAW_DATAS.commonDrawFs,
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateBullet
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			graphicsLineStyle(
				displayer.graphics,
				BULLET_DRAW_DATAS.globalLineSize,
				state.lineColor
			).beginFill(formatHEX(state.fillColor))
			// 绘制形状
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.basic.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
			// 停止填充
			displayer.graphics
				.endFill()
				.endStroke()
				// 绘制标识
				.beginFill(formatHEX(state.lineColor))
				.drawCircle(0, 0, BULLET_DRAW_DATAS.nuke.radiusDecoration)
				.endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
	},
	/** 子轰炸机 */
	[BatrEntityTypes.BULLET_BOMBER.id]: {
		...BULLET_DRAW_DATAS.commonDrawFs,
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateBullet
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			graphicsLineStyle(
				displayer.graphics,
				BULLET_DRAW_DATAS.globalLineSize,
				state.lineColor
			).beginFill(formatHEX(state.fillColor))
			// 绘制形状
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.bomber.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
			// 停止填充
			displayer.graphics.endFill().endStroke()
			// 绘制标识
			displayer.graphics.beginFill(formatHEX(state.lineColor))
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.bomber.radiusDecoration,
				BULLET_DRAW_DATAS.globalLineSize,
				BULLET_DRAW_DATAS.bomber.radiusDecoration,
				BULLET_DRAW_DATAS.bomber.radiusDecoration
			)
			displayer.graphics.endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
	},
	/** 跟踪子弹 */
	[BatrEntityTypes.BULLET_TRACKING.id]: {
		...BULLET_DRAW_DATAS.commonDrawFs,
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateBullet
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			graphicsLineStyle(
				displayer.graphics,
				BULLET_DRAW_DATAS.globalLineSize,
				state.lineColor
			).beginFill(formatHEX(state.fillColor))
			// 绘制形状
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.tracking.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
			// 停止填充
			displayer.graphics.endFill().endStroke()
			// 绘制标识
			displayer.graphics.beginFill(formatHEX(state.lineColor))
			drawTriangleRight(
				displayer,
				BULLET_DRAW_DATAS.tracking.radiusDecoration,
				BULLET_DRAW_DATAS.globalLineSize,
				BULLET_DRAW_DATAS.tracking.radiusDecoration,
				BULLET_DRAW_DATAS.tracking.radiusDecoration
			)
			displayer.graphics.endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
	},
	/** 奖励箱 */
	[BatrEntityTypes.BONUS_BOX.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateBonusBox
		): ZimDisplayerEntity =>
			// 填充颜色&粗细
			commonUpdate_all(
				drawBonusBox(displayer, state),
				state,
				true // 格点实体
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStateBonusBox>
		): ZimDisplayerEntity =>
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				true // 格点实体
			),
	},
}
