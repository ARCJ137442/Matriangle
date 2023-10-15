import EffectTeleport from '../../entity/effect/EffectTeleport'
import {
	BonusType,
	NativeBonusTypes,
} from '../../registry/BonusRegistry'
import { uint } from '../../../../legacy/AS3Legacy'
import {
	IDisplayable,
	IGraphicContext,
	IShape,
} from '../../../../api/display/DisplayInterfaces'
import { DEFAULT_SIZE } from '../../../../api/display/GlobalDisplayVariables'

/**
 * 奖励箱图形
 * * 用于根据类型统一管理各类奖励箱上的标识
 */
export default class BonusBoxSymbol implements IDisplayable {
	//============Static Variables============//
	// General
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 5

	// HHL
	public static readonly HP_COLOR: uint = 0xff0000 //PlayerGUI.HP_COLOR;

	// Tool
	public static readonly TOOL_COLOR: uint = 0x555555
	public static readonly TOOL_LINE_SIZE: uint = 4

	// Attributes
	public static readonly ATTRIBUTES_LINE_SIZE: uint = 4
	public static readonly ATTRIBUTES_FILL_ALPHA: number = 3 / 4

	public static readonly EXPERIENCE_COLOR: uint = 0xcc88ff

	public static readonly BUFF_RANDOM_COLOR: uint = 0x7f7f7f
	/** 伤害加成：红buff */
	public static readonly BUFF_DAMAGE_COLOR: uint = 0xff6666
	/** 冷却减免⇒蓝buff */
	public static readonly BUFF_CD_COLOR: uint = 0x6666ff
	/** 抗性提升：绿buff */
	public static readonly BUFF_RESISTANCE_COLOR: uint = 0x66ff66
	/** 范围提升：黄buff */
	public static readonly BUFF_RADIUS_COLOR: uint = 0xffff66

	// Team
	public static readonly TEAM_LINE_SIZE: uint = 4

	public static readonly RANDOM_CHANGE_TEAM_LINE_COLOR: uint = 0x555555

	public static readonly UNITE_PLAYER_LINE_COLOR: uint = 0x6666ff

	public static readonly UNITE_AI_LINE_COLOR: uint = 0x66ff66

	//============Static Functions============//

	//============Instance Variables============//
	protected _type: BonusType

	//============Constructor & Destructor============//
	public constructor(type: BonusType) {
		this._type = type
		// this.shapeInit(shape: IBatrShape);
	}

	public destructor(): void {
		// this._type = null; // ! 因为这里是「对常量的引用」，所以无需清除
	}

	public get type(): BonusType {
		return this._type
	}

	public set type(value: BonusType) {
		if (this._type == value) return
		this._type = value
		// this.shapeInit(shape: IBatrShape); // TODO: 请求图形更新
	}

	//============Display Implements============//
	public readonly i_displayable = true as const

	/** 实现：绘制图形 */
	public shapeInit(shape: IShape): void {
		this.drawSymbol(shape.graphics)
	}

	/** 实现：刷新=重绘 */
	public shapeRefresh(shape: IShape): void {
		this.shapeDestruct(shape)
		this.shapeInit(shape)
	}

	/** 实现：清空绘图内容 */
	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear()
	}

	/** 因为这个是嵌套在奖励箱中实现的，所以「显示堆叠层级」不是很重要 */
	protected _zIndex: uint = 0
	public get zIndex(): number {
		return this._zIndex
	}
	public set zIndex(value: number) {
		this._zIndex = value
	}

	/** 工具函数：绘制图形 */
	public drawSymbol(graphics: IGraphicContext): void {
		switch (this._type) {
			// HHL(HP,Heal&Life)
			case NativeBonusTypes.ADD_HP:
				this.drawHPSymbol(graphics)
				break
			case NativeBonusTypes.ADD_HEAL:
				this.drawHealSymbol(graphics)
				break
			case NativeBonusTypes.ADD_LIFE:
				this.drawLifeSymbol(graphics)
				break
			// Tool
			case NativeBonusTypes.RANDOM_TOOL:
				this.drawToolSymbol(graphics)
				break
			// Attributes
			case NativeBonusTypes.BUFF_RANDOM:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.BUFF_RANDOM_COLOR
				)
				break
			case NativeBonusTypes.BUFF_DAMAGE:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.BUFF_DAMAGE_COLOR
				)
				break
			case NativeBonusTypes.BUFF_CD:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.BUFF_CD_COLOR
				)
				break
			case NativeBonusTypes.BUFF_RESISTANCE:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.BUFF_RESISTANCE_COLOR
				)
				break
			case NativeBonusTypes.BUFF_RADIUS:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.BUFF_RADIUS_COLOR
				)
				break
			case NativeBonusTypes.ADD_EXPERIENCE:
				this.drawAttributesSymbol(
					graphics,
					BonusBoxSymbol.EXPERIENCE_COLOR
				)
				break
			// Team
			case NativeBonusTypes.RANDOM_CHANGE_TEAM:
				this.drawTeamSymbol(
					graphics,
					BonusBoxSymbol.RANDOM_CHANGE_TEAM_LINE_COLOR
				)
				break
			// case NativeBonusTypes.UNITE_PLAYER:
			// 	this.drawTeamSymbol(graphics, BonusBoxSymbol.UNITE_PLAYER_LINE_COLOR);
			// 	break;
			// case NativeBonusTypes.UNITE_AI:
			// 	this.drawTeamSymbol(graphics, BonusBoxSymbol.UNITE_AI_LINE_COLOR);
			// 	break;
			// Other
			case NativeBonusTypes.RANDOM_TELEPORT:
				this.drawRandomTeleportSymbol(graphics)
				break
		}
	}

	//====HHL====//
	protected drawHPSymbol(graphics: IGraphicContext): void {
		// V
		graphics.beginFill(BonusBoxSymbol.HP_COLOR)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE / 2,
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			BonusBoxSymbol.GRID_SIZE,
			BonusBoxSymbol.GRID_SIZE * 3
		)
		graphics.endFill()
		// H
		graphics.beginFill(BonusBoxSymbol.HP_COLOR)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			-BonusBoxSymbol.GRID_SIZE / 2,
			BonusBoxSymbol.GRID_SIZE * 3,
			BonusBoxSymbol.GRID_SIZE
		)
		graphics.endFill()
	}

	protected drawHealSymbol(graphics: IGraphicContext): void {
		// V
		graphics.beginFill(BonusBoxSymbol.HP_COLOR)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE / 2,
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			BonusBoxSymbol.GRID_SIZE,
			BonusBoxSymbol.GRID_SIZE * 3
		)
		// H
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			-BonusBoxSymbol.GRID_SIZE / 2,
			BonusBoxSymbol.GRID_SIZE * 3,
			BonusBoxSymbol.GRID_SIZE
		)
		graphics.endFill()
	}

	protected drawLifeSymbol(graphics: IGraphicContext): void {
		// L
		graphics.beginFill(BonusBoxSymbol.HP_COLOR)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			BonusBoxSymbol.GRID_SIZE,
			BonusBoxSymbol.GRID_SIZE * 2
		)
		graphics.endFill()
		graphics.beginFill(BonusBoxSymbol.HP_COLOR)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE * 1.5,
			BonusBoxSymbol.GRID_SIZE / 2,
			BonusBoxSymbol.GRID_SIZE * 3,
			BonusBoxSymbol.GRID_SIZE
		)
		graphics.endFill()
	}

	//====Tool====//
	protected drawToolSymbol(graphics: IGraphicContext): void {
		// Circle
		graphics.lineStyle(
			BonusBoxSymbol.TOOL_LINE_SIZE,
			BonusBoxSymbol.TOOL_COLOR
		)
		graphics.drawCircle(0, 0, BonusBoxSymbol.GRID_SIZE)
	}

	//====Attributes====//
	protected drawAttributesSymbol(
		graphics: IGraphicContext,
		color: uint
	): void {
		// Colored Rectangle
		/*graphics.lineStyle(ATTRIBUTES_LINE_SIZE,color);
		graphics.beginFill(color,ATTRIBUTES_FILL_ALPHA);
		graphics.drawRect(-GRID_SIZE*7/8,-GRID_SIZE*7/8,GRID_SIZE*7/4,GRID_SIZE*7/4);
		graphics.endFill();*/
		// Colored Arrow
		// Top
		graphics.lineStyle(BonusBoxSymbol.ATTRIBUTES_LINE_SIZE, color)
		graphics.beginFill(color, BonusBoxSymbol.ATTRIBUTES_FILL_ALPHA)
		graphics.moveTo(0, -BonusBoxSymbol.GRID_SIZE * 1.5) // T1
		graphics.lineTo(BonusBoxSymbol.GRID_SIZE * 1.5, 0) // T2
		graphics.lineTo(BonusBoxSymbol.GRID_SIZE / 2, 0)
		// B1
		graphics.lineTo(
			BonusBoxSymbol.GRID_SIZE / 2,
			BonusBoxSymbol.GRID_SIZE * 1.5
		)
		// B2
		graphics.lineTo(
			-BonusBoxSymbol.GRID_SIZE / 2,
			BonusBoxSymbol.GRID_SIZE * 1.5
		)
		// B3
		graphics.lineTo(-BonusBoxSymbol.GRID_SIZE / 2, 0)
		// B4
		graphics.lineTo(-BonusBoxSymbol.GRID_SIZE * 1.5, 0) // T3
		graphics.lineTo(0, -BonusBoxSymbol.GRID_SIZE * 1.5) // T1
		graphics.endFill()
		// Bottom
	}

	//====Team====//
	protected drawTeamSymbol(graphics: IGraphicContext, color: uint): void {
		graphics.lineStyle(BonusBoxSymbol.TEAM_LINE_SIZE, color)
		graphics.moveTo(-BonusBoxSymbol.GRID_SIZE, -BonusBoxSymbol.GRID_SIZE)
		graphics.lineTo(BonusBoxSymbol.GRID_SIZE, 0)
		graphics.lineTo(-BonusBoxSymbol.GRID_SIZE, BonusBoxSymbol.GRID_SIZE)
		graphics.lineTo(-BonusBoxSymbol.GRID_SIZE, -BonusBoxSymbol.GRID_SIZE)
	}

	//====Other====//
	protected drawRandomTeleportSymbol(graphics: IGraphicContext): void {
		// Teleport Effect
		// 1
		graphics.lineStyle(
			EffectTeleport.LINE_SIZE,
			EffectTeleport.DEFAULT_COLOR,
			EffectTeleport.LINE_ALPHA
		)
		graphics.beginFill(
			EffectTeleport.DEFAULT_COLOR,
			EffectTeleport.FILL_ALPHA
		)
		graphics.drawRect(
			-BonusBoxSymbol.GRID_SIZE,
			-BonusBoxSymbol.GRID_SIZE,
			BonusBoxSymbol.GRID_SIZE * 2,
			BonusBoxSymbol.GRID_SIZE * 2
		)
		graphics.endFill()
		// 2
		graphics.lineStyle(
			EffectTeleport.LINE_SIZE,
			EffectTeleport.DEFAULT_COLOR,
			EffectTeleport.LINE_ALPHA
		)
		graphics.beginFill(
			EffectTeleport.DEFAULT_COLOR,
			EffectTeleport.FILL_ALPHA
		)
		graphics.moveTo(0, -BonusBoxSymbol.GRID_SIZE * Math.SQRT2)
		graphics.lineTo(BonusBoxSymbol.GRID_SIZE * Math.SQRT2, 0)
		graphics.lineTo(0, BonusBoxSymbol.GRID_SIZE * Math.SQRT2)
		graphics.lineTo(-BonusBoxSymbol.GRID_SIZE * Math.SQRT2, 0)
		graphics.lineTo(0, -BonusBoxSymbol.GRID_SIZE * Math.SQRT2)
		graphics.endFill()
	}
}
