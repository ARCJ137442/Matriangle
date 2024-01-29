import { fPoint, iPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import EffectPlayerShape from './EffectPlayerShape'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import { TriangleAgentDecorationLabel } from 'matriangle-api/display/implements/triangleAgent/DecorationLabels'

/**
 * 玩家死亡淡出
 * * 呈现一个线性淡出的纯色三角形
 * * 用于提示「先前有玩家死亡过」
 */
export default class EffectPlayerDeathFadeout extends EffectPlayerShape {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectPlayerDeathFadeout'

	public static readonly ALPHA: number = 0.8
	public static readonly MAX_LIFE: uint = TPS

	//============Static Functions============//
	public static fromPlayer(
		position: fPoint | iPoint,
		player: IPlayer,
		reverse: boolean = false
	): EffectPlayerDeathFadeout {
		return EffectPlayerShape.alignToCenter(
			new EffectPlayerDeathFadeout(
				position,
				player.direction,
				player.fillColor,
				player.decorationLabel, // player instanceof AIPlayer ? (player as AIPlayer).decorationLabel : null,
				reverse
			)
		)
	}

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		rot: uint = 0,
		color: uint = 0xffffff,
		decorationLabel: TriangleAgentDecorationLabel = TriangleAgentDecorationLabel.EMPTY,
		reverse: boolean = false,
		life: uint = EffectPlayerShape.MAX_LIFE
	) {
		super(
			EffectPlayerDeathFadeout.ID,
			position,
			rot,
			color,
			decorationLabel,
			reverse,
			life
		)
	}

	//============Display Implements============//
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	/* public displayInit(shape: IShape): void {
		// 先绘制形状
		shape.graphics.beginFill(this._color, EffectPlayerDeathFadeout.ALPHA)
		EffectPlayerLike.moveToPlayerShape(shape.graphics) // 尺寸用默认值
		// 然后绘制玩家标记
		this.drawDecoration(shape)
		// 这时才停止
		shape.graphics.endFill()
	} */
}
