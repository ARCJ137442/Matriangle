// 绘制实体 //
import { OptionalRecursive2 } from 'matriangle-common/utils'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { logical2Real } from 'matriangle-api/display/PosTransform'
import { NativeEntityTypes } from 'matriangle-mod-native/registry/EntityRegistry_Native'
import { IDisplayDataEntityStatePlayerV1 } from 'matriangle-mod-native/entities/player/Player_V1'
import { BatrEntityTypes } from 'matriangle-mod-bats/registry/EntityRegistry_Batr'
import { ZimDisplayerEntity } from '../interfaces/zim_client_entities'
import { IDisplayDataEntityState } from 'matriangle-api/display/RemoteDisplayAPI'
import {
	drawRoundRectBox,
	drawTriangleRight,
	drawPlayerGradient,
	graphicsLineStyle,
	drawSquareFrameCenter,
	CreateGraphics,
	drawSingleCenteredSquareWithRotation,
} from '../zimUtils'
import { IDisplayDataEntityStateBullet } from 'matriangle-mod-bats/entity/projectile/bullet/Bullet'
import { formatHEX, formatHEX_A } from 'matriangle-common'
import { IDisplayDataEntityStateBonusBox } from 'matriangle-mod-bats/entity/item/BonusBox'
import { NativeBonusTypes as BonusTypes_Batr } from 'matriangle-mod-bats/registry/BonusRegistry'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { IDisplayDataStateEffectExplode } from 'matriangle-mod-bats/entity/effect/EffectExplode'
import { NativeDecorationLabel } from 'matriangle-mod-native/entities/player/DecorationLabels'
import { IDisplayDataStateEffectPlayerShape } from 'matriangle-mod-bats/entity/effect/EffectPlayerShape'
import { IDisplayDataEntityStateLaser } from 'matriangle-mod-bats/entity/projectile/laser/Laser'
import { IDisplayDataEntityStateLaserPulse } from 'matriangle-mod-bats/entity/projectile/laser/LaserPulse'
import { IDisplayDataStateEffectBlockLight } from 'matriangle-mod-bats/entity/effect/EffectBlockLight'
import { IDisplayDataEntityStateThrownBlock } from 'matriangle-mod-bats/entity/projectile/other/ThrownBlock'

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
		// * 状态の维数 < 地图の维数：隐形 | 如：零维点在二维空间是隐形的
		if (state.position.length < displayer.host.map.size.length) {
			displayer.visible = false
			// 直接返回
			return displayer
		}
		// * 否则直接显示
		else {
			displayer.visible = true
		}
		// * 直接投影到屏幕上，并以自身中心为中心
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
 * 玩家显示数据
 */
const PLAYER_DRAW_DATAS = {
	SIZE: logical2Real(1),
	LINE_SIZE: logical2Real(1 / 96),
	DECORATION_SIZE: logical2Real(1 / 10),
}

/** 绘制玩家的装饰图案 */
export function drawPlayerDecoration(
	graphics: CreateGraphics,
	label: string,
	decorationRadius: number = PLAYER_DRAW_DATAS.DECORATION_SIZE
): CreateGraphics {
	// console.warn('shape.graphics.', label) // !【2023-11-23 00:35:08】正常了，TODO: 但无法在填充时镂空
	switch (label) {
		case NativeDecorationLabel.EMPTY:
			return graphics
		case NativeDecorationLabel.CIRCLE:
			return graphics.drawCircle(0, 0, decorationRadius)
		case NativeDecorationLabel.SQUARE:
			return graphics.drawRect(
				-decorationRadius,
				-decorationRadius,
				decorationRadius * 2,
				decorationRadius * 2
			)
		case NativeDecorationLabel.TRIANGLE:
			return graphics
				.moveTo(-decorationRadius, -decorationRadius)
				.lineTo(decorationRadius, 0)
				.lineTo(-decorationRadius, decorationRadius)
				.lineTo(-decorationRadius, -decorationRadius)
		case NativeDecorationLabel.DIAMOND:
			return graphics
				.moveTo(-decorationRadius, 0)
				.lineTo(0, decorationRadius)
				.lineTo(decorationRadius, 0)
				.lineTo(0, -decorationRadius)
				.lineTo(-decorationRadius, -0)
		default:
			console.warn('未知的装饰符号：', label)
			return graphics
	}
	// graphics.endFill();
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
		radiusDecoration: logical2Real(1 / 10),
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

// 激光 //

const LASER_DRAW_DATAS = {
	/** 所有激光共用的绘制数据 */
	common: {
		/**
		 * 通用逻辑：拉伸，回缩
		 * * 初始化更新通用
		 */
		update(
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStateLaser>
		): void {
			// 通用更新
			commonUpdate_all(
				displayer,
				state,
				true // 格点实体
			)
			// 长度
			if (state?.length !== undefined) displayer.scaleX = state.length
			// 半格回缩
			LASER_DRAW_DATAS.common.halfBlockShrink(displayer)
		},
		/**
		 * 通用逻辑：「半格回缩」
		 * * 🎯核心目的：作为格点实体，匹配方块边缘
		 */
		halfBlockShrink(displayer: ZimDisplayerEntity): void {
			displayer.x -=
				Math.cos((displayer.rotation / 180) * Math.PI) *
				logical2Real(0.5)
			displayer.y -=
				Math.sin((displayer.rotation / 180) * Math.PI) *
				logical2Real(0.5)
		},
	},
	/** 基础激光绘制数据 */
	basic: {
		/**
		 *  默认宽度：0.75格
		 *
		 * !【2023-11-24 11:28:36】现在改成0.75格，并且绘图上也更细致
		 */
		WIDTH: logical2Real(0.75),
	},
	/** 传送激光绘制数据 */
	teleport: {
		/**
		 * 默认宽度：1/2格
		 *
		 * !【2023-11-24 11:38:11】现在全部增大了一倍
		 */
		WIDTH: logical2Real(1 / 2),
	},
	/** 吸收激光绘制数据 */
	absorption: {
		/**
		 * 默认宽度：1/2格
		 *
		 * !【2023-11-24 11:38:11】现在全部增大了一倍
		 */
		WIDTH: logical2Real(1 / 2),
		/**
		 * 伤害周期
		 * * 用于复现AS3版本中「伤害、动画与周期高度相关」的逻辑
		 * * AS3の约定：在动画到「宽度回满」时造成伤害
		 */
		DAMAGE_PERIOD: FIXED_TPS >> 3,
	},
	/** 脉冲激光绘制数据 */
	pulse: {
		/**
		 * 默认宽度：1/2格
		 *
		 * !【2023-11-24 11:38:11】现在全部增大了一倍
		 */
		WIDTH: logical2Real(1 / 2),
		/** 默认不透明度：0.75 */
		ALPHA: 0.75,
	},
}

/**
 * 绘制一个「Beam」
 * @param graphics 绘画上下文
 * @param y1 以x轴为横轴的「起始垂直坐标」
 * @param y2 以x轴为横轴的「终止垂直坐标」
 * @param color 绘制的颜色
 * @param alpha 绘制的不透明度
 */
function drawLaserLine(
	graphics: CreateGraphics,
	y1: number,
	y2: number,
	color: uint,
	alpha: number = 1
): void {
	// console.log('drawLaserLine', y1, y2, color, alpha)
	/** 以最小值作为起始点 */
	const yStart: number = Math.min(y1, y2)
	graphics
		.beginFill(formatHEX_A(color, alpha))
		.drawRect(
			// ! ↓这里需要「退后半格」以从「网格中心」对齐玩家前方
			// -logical2Real(0.5),
			0,
			yStart,
			// ! ↓下面只绘制激光在一格中的大小
			logical2Real(1),
			Math.max(y1, y2) - yStart
		)
		.endFill()
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
		ATTRIBUTES_LINE_ALPHA: 1,
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
	// * 绘制盒子 * //
	drawRoundRectBox(
		shape.graphics,
		BONUS_BOX_DRAW_DATAS.boxSize,
		BONUS_BOX_DRAW_DATAS.boxLineSize,
		BONUS_BOX_DRAW_DATAS.boxRoundSize,
		BONUS_BOX_DRAW_DATAS.lineColor,
		BONUS_BOX_DRAW_DATAS.fillColor
	)
	// * 绘制标识 * // // 返回自身
	return drawBonusBoxSymbol(shape, state)
}

// 特效 //

/** 所有特效的「公用绘图数据库」 */
const EFFECT_DRAW_DATAS = {
	/** 「重生」「传送」的共用数据 */
	block2: {
		LINE_ALPHA: 0.6,
		FILL_ALPHA: 0.5,
		LINE_SIZE: logical2Real(1 / 25),
		SIZE: uint(logical2Real(1.6)),
	},
	spawn: {
		DEFAULT_COLOR: 0x6666ff,
		STAGE_1_START_TIME: uint(FIXED_TPS * (3 / 4)),
		STAGE_2_START_TIME: uint(FIXED_TPS / 4),
	},
	teleport: {
		DEFAULT_COLOR: 0x44ff44,
	},
	explode: {
		LINE_ALPHA: 5 / 8,
		FILL_ALPHA: 2 / 5,
		LINE_SIZE: logical2Real(1 / 25),
	},
	playerShape: {
		SIZE: logical2Real(1),
		LINE_SIZE: logical2Real(1 / 16),
	},
	playerHurt: {
		/** 颜色：固定红色 */
		FILL_COLOR: 0xff0000,
	},
	playerDeathLight: {
		/** 尺寸过渡的最大值 */
		MAX_SCALE: 2,
		/** 尺寸过渡的最小值 */
		MIN_SCALE: 1,
	},
	playerLevelup: {
		LINE_ALPHA: 0.8,
		FILL_ALPHA: 0.75,
		LINE_SIZE: logical2Real(1 / 25),
		GRID_SIZE: logical2Real(3 / 16),
	},
	blockLight: {
		/** 尺寸1时的大小 */
		SIZE: logical2Real(1),
		LINE_SIZE: logical2Real(1 / 25),
		MAX_SCALE: 2,
		MIN_SCALE: 1,
	},
}

/** 爆炸特效：简单的圆 */
export function drawEffectExplode(
	shape: ZimDisplayerEntity,
	state: IDisplayDataStateEffectExplode
): ZimDisplayerEntity {
	// shape.graphics.clear()
	graphicsLineStyle(
		shape.graphics,
		EFFECT_DRAW_DATAS.explode.LINE_SIZE,
		state.color,
		EFFECT_DRAW_DATAS.explode.LINE_ALPHA
	)
		.beginFill(
			formatHEX_A(state.color, EFFECT_DRAW_DATAS.explode.FILL_ALPHA)
		)
		.drawCircle(0, 0, logical2Real(state.radius))
		.endFill()
	return shape
}

/**
 * 重生/传送 特效：两个以一定角度交叠的方块
 *
 * @param shape 图形绘制上下文
 * @param color 总颜色
 * @param a 边长
 * @param rotation1 第一个方块的倾角（默认0°）
 * @param rotation2 第二个方块的倾角（默认45°）
 */
export function draw2BlockEffect(
	graphics: CreateGraphics,
	color: uint,
	a: number = EFFECT_DRAW_DATAS.block2.SIZE,
	rotation1: number = 0,
	rotation2: number = Math.PI / 4
): CreateGraphics {
	// 1
	drawSingleCenteredSquareWithRotation(
		graphicsLineStyle(
			graphics,
			EFFECT_DRAW_DATAS.block2.LINE_SIZE,
			color,
			EFFECT_DRAW_DATAS.block2.LINE_ALPHA
		).beginFill(formatHEX_A(color, EFFECT_DRAW_DATAS.block2.FILL_ALPHA)),
		a * Math.SQRT1_2,
		rotation1
	)
		.endFill()
		.endStroke()
	// 2
	drawSingleCenteredSquareWithRotation(
		graphicsLineStyle(
			graphics,
			EFFECT_DRAW_DATAS.block2.LINE_SIZE,
			color,
			EFFECT_DRAW_DATAS.block2.LINE_ALPHA
		).beginFill(formatHEX_A(color, EFFECT_DRAW_DATAS.block2.FILL_ALPHA)),
		a * Math.SQRT1_2,
		rotation2
	)
		.endFill()
		.endStroke()
	return graphics
}

/** 特效：绘制上箭头（用于「玩家升级」/奖励箱符号） */
export function drawUpArrow(
	graphics: CreateGraphics,
	color: uint,
	alpha: number = EFFECT_DRAW_DATAS.playerLevelup.FILL_ALPHA,
	lineSize: number = EFFECT_DRAW_DATAS.playerLevelup.LINE_SIZE,
	lineAlpha: number = EFFECT_DRAW_DATAS.playerLevelup.LINE_ALPHA,
	gridSize: number = EFFECT_DRAW_DATAS.playerLevelup.GRID_SIZE
): CreateGraphics {
	// Colored Rectangle
	/*graphics.lineStyle(ATTRIBUTES_LINE_SIZE,color);
		graphics.beginFill(color,ATTRIBUTES_FILL_ALPHA);
		graphics.drawRect(-GRID_SIZE*7/8,-GRID_SIZE*7/8,GRID_SIZE*7/4,GRID_SIZE*7/4);
		graphics.endFill();*/
	// Colored Arrow
	// Top
	return (
		graphicsLineStyle(graphics, lineSize, color, lineAlpha)
			.beginFill(formatHEX_A(color, alpha))
			.moveTo(0, -gridSize * 1.5) // T1
			.lineTo(gridSize * 1.5, 0) // T2
			.lineTo(gridSize / 2, 0)
			// B1
			.lineTo(gridSize / 2, gridSize * 1.5)
			// B2
			.lineTo(-gridSize / 2, gridSize * 1.5)
			// B3
			.lineTo(-gridSize / 2, 0)
			// B4
			.lineTo(-gridSize * 1.5, 0) // T3
			.lineTo(0, -gridSize * 1.5) // T1
			.endFill()
			.endStroke()
	)
	// Bottom
}

// 奖励箱 //

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
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RANDOM_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
			)
			break
		case BonusTypes_Batr.BUFF_DAMAGE:
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_DAMAGE_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
			)
			break
		case BonusTypes_Batr.BUFF_CD:
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_CD_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
			)
			break
		case BonusTypes_Batr.BUFF_RESISTANCE:
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RESISTANCE_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
			)
			break
		case BonusTypes_Batr.BUFF_RADIUS:
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.BUFF_RADIUS_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
			)
			break
		case BonusTypes_Batr.ADD_EXPERIENCE:
			drawUpArrow(
				shape.graphics,
				BONUS_BOX_DRAW_DATAS.symbol.EXPERIENCE_COLOR,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_FILL_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_SIZE,
				BONUS_BOX_DRAW_DATAS.symbol.ATTRIBUTES_LINE_ALPHA,
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE
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
			draw2BlockEffect(
				shape.graphics,
				EFFECT_DRAW_DATAS.teleport.DEFAULT_COLOR,
				// 两倍尺寸
				BONUS_BOX_DRAW_DATAS.symbol.GRID_SIZE * 2
			)
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
// ! 参见

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

// 注册表 //
export type EntityDrawDict = {
	// !【2023-11-19 17:17:19】同`BLOCK_DRAW_DICT_NATIVE`，无法使用`typeIDMap<ZimDrawF_Entity>`
	[key: typeID]: {
		/**
		 * 实体初始化时的绘图
		 * * 一般包括矢量图绘制
		 */
		init: (
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			displayer: ZimDisplayerEntity<any>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			state: any
		) => ZimDisplayerEntity
		/**
		 * 实体更新时的绘图
		 * * 一般无需绘制矢量图
		 * * 可能没有
		 */
		refresh: (
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			displayer: ZimDisplayerEntity<any>,
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
		): ZimDisplayerEntity => {
			drawPlayerGradient(
				displayer.graphics,
				function (
					graphics: CreateGraphics,
					size: number,
					lineSize: number,
					realRadiusX: number,
					realRadiusY: number
				): void {
					// * 绘制底座
					drawTriangleRight(
						graphics,
						size,
						lineSize,
						realRadiusX,
						realRadiusY
					)
						// 线条断续
						.endStroke()
						.endFill()
						.beginFill(formatHEX(state.lineColor))
						.beginStroke(formatHEX(state.lineColor))
					// * 绘制装饰
					drawPlayerDecoration(
						displayer.graphics,
						state.decorationLabel
					)
				},
				PLAYER_DRAW_DATAS.SIZE,
				PLAYER_DRAW_DATAS.LINE_SIZE,
				state.fillColor,
				state.lineColor
			)
			// 填充颜色&粗细
			return commonUpdate_all(
				displayer,
				state,
				true // 格点实体
			)
		},
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
	[BatrEntityTypes.PLAYER_BATR.id]:
		ENTITY_DRAW_DICT_NATIVE[NativeEntityTypes.PLAYER.id],
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
				displayer.graphics,
				BULLET_DRAW_DATAS.basic.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
				.endFill()
				.endStroke()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
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
				displayer.graphics,
				BULLET_DRAW_DATAS.nuke.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
				// 停止填充
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
				displayer.graphics,
				BULLET_DRAW_DATAS.bomber.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
				// 停止填充
				.endFill()
				.endStroke()
				// 绘制标识
				.beginFill(formatHEX(state.lineColor))
			drawTriangleRight(
				displayer.graphics,
				BULLET_DRAW_DATAS.bomber.radiusDecoration,
				BULLET_DRAW_DATAS.globalLineSize,
				BULLET_DRAW_DATAS.bomber.radiusDecoration,
				BULLET_DRAW_DATAS.bomber.radiusDecoration
			).endFill()
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
				displayer.graphics,
				BULLET_DRAW_DATAS.tracking.radius,
				BULLET_DRAW_DATAS.globalLineSize
			)
				// 停止填充
				.endFill()
				.endStroke()
				// 绘制标识
				.beginFill(formatHEX(state.lineColor))
			drawTriangleRight(
				displayer.graphics,
				BULLET_DRAW_DATAS.tracking.radiusDecoration,
				BULLET_DRAW_DATAS.globalLineSize,
				BULLET_DRAW_DATAS.tracking.radiusDecoration,
				BULLET_DRAW_DATAS.tracking.radiusDecoration
			).endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
	},
	// 激光 //
	/** 基础激光 */
	[BatrEntityTypes.LASER_BASIC.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateLaser
		): ZimDisplayerEntity => {
			// * 绘制函数
			for (let i: uint = 0; i < 5; i++) {
				// 0,1,2,3,4
				drawLaserLine(
					displayer.graphics,
					-LASER_DRAW_DATAS.basic.WIDTH / (2 << i), // ! 2的幂次可转换成移位，源代码为`Math.pow(2, i + 1)`
					LASER_DRAW_DATAS.basic.WIDTH / (2 << i), // ! 2的幂次可转换成移位，源代码为`Math.pow(2, i + 1)`
					state.color,
					i * 0.1 + 0.2
				)
			}
			// 通用逻辑
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 返回
			return displayer
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataEntityStateLaser>,
			state: OptionalRecursive2<IDisplayDataEntityStateLaser>
		): ZimDisplayerEntity => {
			// 激光通用
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 专用：宽度渐小
			if (state?.life !== undefined)
				displayer.scaleY = state.life / displayer.currentState.LIFE
			// 返回
			return displayer
		},
	},
	/** 传送激光 */
	[BatrEntityTypes.LASER_TELEPORT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateLaser
		): ZimDisplayerEntity => {
			// * 绘制函数
			drawLaserLine(
				displayer.graphics,
				-LASER_DRAW_DATAS.teleport.WIDTH / 2,
				LASER_DRAW_DATAS.teleport.WIDTH / 2,
				state.color,
				0.25
			)
			// Side
			drawLaserLine(
				displayer.graphics,
				-LASER_DRAW_DATAS.teleport.WIDTH / 2,
				-LASER_DRAW_DATAS.teleport.WIDTH / 4,
				state.color,
				0.6
			)
			drawLaserLine(
				displayer.graphics,
				LASER_DRAW_DATAS.teleport.WIDTH / 4,
				LASER_DRAW_DATAS.teleport.WIDTH / 2,
				state.color,
				0.6
			)
			// 通用逻辑
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 返回
			return displayer
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataEntityStateLaser>,
			state: OptionalRecursive2<IDisplayDataEntityStateLaser>
		): ZimDisplayerEntity => {
			// 激光通用
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 专用：闪烁3/4周期，然后渐小
			if (state?.life !== undefined) {
				displayer.alpha = (state.life & 7) < 2 ? 0.75 : 1
				if (
					state.life <
					displayer.currentState.LIFE >> 2 // ! 除以2的幂次，可以使用移位运算
				)
					displayer.scaleY =
						1 - state.life / (displayer.currentState.LIFE >> 2) // ! 除以2的幂次，可以使用移位运算
			}
			// 返回
			return displayer
		},
	},
	/** 吸收激光 */
	[BatrEntityTypes.LASER_ABSORPTION.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateLaser
		): ZimDisplayerEntity => {
			// * 绘制函数
			// 左右相隔的两臂
			for (const i of [-1, 1]) {
				// 外侧
				drawLaserLine(
					displayer.graphics,
					(i * LASER_DRAW_DATAS.absorption.WIDTH) / 2,
					(i * LASER_DRAW_DATAS.absorption.WIDTH) / 4,
					state.color,
					0.75
				)
				// 内侧
				drawLaserLine(
					displayer.graphics,
					(i * LASER_DRAW_DATAS.absorption.WIDTH) / 4,
					(i * LASER_DRAW_DATAS.absorption.WIDTH) / 8,
					state.color,
					0.5
				)
			}
			// 通用逻辑
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 返回
			return displayer
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataEntityStateLaser>
		): ZimDisplayerEntity => {
			// 激光通用
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 专用：以周期为由转圈圈
			if (state?.life !== undefined) {
				state.scaleY = Math.abs(
					// ! ↓使用cos而非sin，是为了尺寸从1开始
					Math.cos(
						// 一个周期转半圈
						(state.life /
							LASER_DRAW_DATAS.absorption.DAMAGE_PERIOD) *
							Math.PI
					)
				)
			}
			// 返回
			return displayer
		},
	},
	/** 脉冲激光 */
	[BatrEntityTypes.LASER_PULSE.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataEntityStateLaser
		): ZimDisplayerEntity => {
			// * 绘制函数
			for (let i: uint = 0; i < 3; i++) {
				// 0,1,2
				drawLaserLine(
					displayer.graphics,
					-LASER_DRAW_DATAS.pulse.WIDTH / (2 << i), // 原：`Math.pow(2, i + 1)`
					LASER_DRAW_DATAS.pulse.WIDTH / (2 << i), // 原：`Math.pow(2, i + 1)`
					state.color,
					i * 0.1 + 0.3
				)
			}
			// 通用逻辑
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 返回
			return displayer
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataEntityStateLaserPulse>,
			state: OptionalRecursive2<IDisplayDataEntityStateLaserPulse>
		): ZimDisplayerEntity => {
			// 激光通用
			LASER_DRAW_DATAS.common.update(displayer, state)
			// 专用：以周期为由转圈圈
			if (state?.life !== undefined) {
				if (displayer.currentState.isPull) {
					displayer.scaleY =
						1 + state.life / displayer.currentState.LIFE
					displayer.alpha =
						(2 - displayer.scaleY) * LASER_DRAW_DATAS.pulse.ALPHA
				} else {
					displayer.scaleY =
						2 - state.life / displayer.currentState.LIFE
					displayer.alpha =
						(2 - displayer.scaleY) * LASER_DRAW_DATAS.pulse.ALPHA
				}
			}
			// 返回
			return displayer
		},
	},
	/** 掷出的方块 */
	[BatrEntityTypes.THROWN_BLOCK.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataEntityStateThrownBlock>,
			state: IDisplayDataEntityStateThrownBlock
		): ZimDisplayerEntity => {
			// * 绘制函数
			displayer.host.map.blockDrawDict[state.block.id]?.(
				displayer,
				state.block.state
			)
			// 通用逻辑
			commonUpdate_position(displayer, state, false)
			commonUpdate_AVS(displayer, state)
			// 旋转不变性
			displayer.rotation = 0
			// 返回
			return displayer
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataEntityStateLaserPulse>,
			state: OptionalRecursive2<IDisplayDataEntityStateLaserPulse>
		): ZimDisplayerEntity => {
			// 通用逻辑
			commonUpdate_position(displayer, state, false)
			commonUpdate_AVS(displayer, state)
			// 旋转不变性
			displayer.rotation = 0
			// 返回自身
			return displayer
		},
	},
	// 静物 //
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
	// 特效 //
	/** 爆炸 */
	[BatrEntityTypes.EFFECT_EXPLODE.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity,
			state: IDisplayDataStateEffectExplode
		): ZimDisplayerEntity =>
			// 填充颜色&粗细
			commonUpdate_all(
				drawEffectExplode(displayer, state),
				state,
				false // 非格点实体
			),
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity,
			state: OptionalRecursive2<IDisplayDataStateEffectExplode>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 更新透明度
			if (state?.lifePercent !== undefined)
				displayer.alpha = state.lifePercent
			// 返回自身
			return displayer
		},
	},
	/** 伤害 */
	[BatrEntityTypes.EFFECT_PLAYER_HURT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			displayer.graphics.beginFill(formatHEX(state.color))
			drawTriangleRight(
				displayer.graphics,
				PLAYER_DRAW_DATAS.SIZE,
				PLAYER_DRAW_DATAS.LINE_SIZE
			)
			drawPlayerDecoration(
				displayer.graphics,
				displayer.currentState.decorationLabel
			).endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: OptionalRecursive2<IDisplayDataStateEffectPlayerShape>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 更新透明度
			if (state?.lifePercent !== undefined)
				displayer.alpha = displayer.currentState?.reverse
					? 1 - state.lifePercent
					: state.lifePercent
			// 返回自身
			return displayer
		},
	},
	/** 死亡淡出：共用 */
	[BatrEntityTypes.EFFECT_PLAYER_DEATH_FADEOUT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// 填充颜色&粗细
			displayer.graphics.beginFill(formatHEX(state.color))
			drawTriangleRight(
				displayer.graphics,
				PLAYER_DRAW_DATAS.SIZE,
				PLAYER_DRAW_DATAS.LINE_SIZE
			)
			drawPlayerDecoration(
				displayer.graphics,
				displayer.currentState.decorationLabel
			).endFill()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: OptionalRecursive2<IDisplayDataStateEffectPlayerShape>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 更新透明度
			if (state?.lifePercent !== undefined)
				displayer.alpha = displayer.currentState?.reverse
					? 1 - state.lifePercent
					: state.lifePercent
			// 返回自身
			return displayer
		},
	},
	/** 玩家升级 */
	[BatrEntityTypes.EFFECT_PLAYER_LEVELUP.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// * 绘制中央上箭头
			drawUpArrow(displayer.graphics, state.color)
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: OptionalRecursive2<IDisplayDataStateEffectPlayerShape>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」，但不包括坐标、朝向（本身特效无甚朝向）
			commonUpdate_AVS(displayer, state)
			// * 淡出+移动坐标
			if (state?.lifePercent !== undefined) {
				displayer.alpha = state.lifePercent
				displayer.y -=
					(EFFECT_DRAW_DATAS.playerLevelup.GRID_SIZE / 4) *
					(1 - state.lifePercent)
			}
			// 返回自身
			return displayer
		},
	},
	/** 死亡光效：描边 */
	[BatrEntityTypes.EFFECT_PLAYER_DEATH_LIGHT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// * 绘制框架
			graphicsLineStyle(
				displayer.graphics,
				EFFECT_DRAW_DATAS.playerShape.LINE_SIZE,
				state.color
			)
			drawTriangleRight(
				displayer.graphics,
				PLAYER_DRAW_DATAS.SIZE,
				PLAYER_DRAW_DATAS.LINE_SIZE
			)
				// * 绘制装饰
				.endStroke()
			graphicsLineStyle(
				displayer.graphics,
				EFFECT_DRAW_DATAS.playerShape.LINE_SIZE,
				state.color
			)
			drawPlayerDecoration(
				displayer.graphics,
				displayer.currentState.decorationLabel
			).endStroke()
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: OptionalRecursive2<IDisplayDataStateEffectPlayerShape>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 更新透明度&尺寸
			if (state?.lifePercent !== undefined) {
				displayer.alpha = displayer.currentState?.reverse
					? 1 - state.lifePercent
					: state.lifePercent
				displayer.scaleX = displayer.scaleY =
					EFFECT_DRAW_DATAS.playerDeathLight.MIN_SCALE +
					(EFFECT_DRAW_DATAS.playerDeathLight.MAX_SCALE -
						EFFECT_DRAW_DATAS.playerDeathLight.MIN_SCALE) *
						(displayer.currentState?.reverse
							? state.lifePercent
							: 1 - state.lifePercent)
			}
			// 返回自身
			return displayer
		},
	},
	/** 方块光效 */
	[BatrEntityTypes.EFFECT_BLOCK_LIGHT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// * 绘制方框
			drawSquareFrameCenter(
				// * 设置颜色
				displayer.graphics.beginFill(
					formatHEX_A(state.color, state.alpha)
				),
				EFFECT_DRAW_DATAS.blockLight.SIZE / 2,
				EFFECT_DRAW_DATAS.blockLight.LINE_SIZE
			).endFill()
			// 通用设置，返回
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectBlockLight>,
			state: OptionalRecursive2<IDisplayDataStateEffectBlockLight>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 更新透明度&尺寸
			if (state?.lifePercent !== undefined) {
				displayer.alpha = displayer.currentState?.reverse
					? 1 - state.lifePercent
					: state.lifePercent
				displayer.scaleX = displayer.scaleY =
					EFFECT_DRAW_DATAS.blockLight.MIN_SCALE +
					(EFFECT_DRAW_DATAS.blockLight.MAX_SCALE -
						EFFECT_DRAW_DATAS.blockLight.MIN_SCALE) *
						(displayer.currentState?.reverse
							? state.lifePercent
							: 1 - state.lifePercent)
			}
			// 返回自身
			return displayer
		},
	},
	/** 传送 */
	[BatrEntityTypes.EFFECT_TELEPORT.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// * 绘制方块（双交叠）
			draw2BlockEffect(displayer.graphics, state.color)
			// 通用设置，返回
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectBlockLight>,
			state: OptionalRecursive2<IDisplayDataStateEffectBlockLight>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 旋转&缩小
			if (state?.lifePercent !== undefined) {
				displayer.scaleX = displayer.scaleY = state.lifePercent
				displayer.rotation = (1 - state.lifePercent) * 360
			}
			// 返回自身
			return displayer
		},
	},
	/** 重生 */
	[BatrEntityTypes.EFFECT_SPAWN.id]: {
		// 初始化
		init: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectPlayerShape>,
			state: IDisplayDataStateEffectPlayerShape
		): ZimDisplayerEntity => {
			// * 绘制方块（双交叠）
			draw2BlockEffect(displayer.graphics, state.color)
			// * 尺寸设置为0（后续会渐渐放大）
			displayer.scaleX = displayer.scaleY = 0
			// 通用设置，返回
			return commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
		},
		// 更新
		refresh: (
			displayer: ZimDisplayerEntity<IDisplayDataStateEffectBlockLight>,
			state: OptionalRecursive2<IDisplayDataStateEffectBlockLight>
		): ZimDisplayerEntity => {
			// 直接调用「通用更新」
			commonUpdate_all(
				displayer,
				state,
				false // 非格点实体
			)
			// * 分阶段：放大⇒内交错旋转⇒缩小
			if (state?.lifePercent !== undefined) {
				// !【2023-11-24 18:14:09】这里直接偷了个懒，使用「1/3周期」作为分界
				switch (uint(state.lifePercent * 3)) {
					// * 阶段1：放大
					case 2:
						displayer.scaleX = displayer.scaleY =
							// 1~2/3 → 0~1
							3 * (1 - state.lifePercent)
						break
					// * 阶段2：内交错旋转
					case 1:
						// 不断重绘
						displayer.graphics.clear()
						draw2BlockEffect(
							displayer.graphics,
							displayer.currentState.color,
							EFFECT_DRAW_DATAS.block2.SIZE,
							// 2/3~1/3 → 0~Math.PI/4
							(2 - state.lifePercent * 3) * (Math.PI / 4),
							// 2/3~1/3 → Math.PI/4~0
							(state.lifePercent * 3 - 1) * (Math.PI / 4)
						)
						// 正常尺寸
						// displayer.scaleX = displayer.scaleY = 1
						break
					// * 阶段3：缩小
					case 0:
						displayer.scaleX = displayer.scaleY =
							// 1/3~0 → 1~0
							3 * state.lifePercent
						break
				}
			}
			// 返回自身
			return displayer
		},
	},
}
