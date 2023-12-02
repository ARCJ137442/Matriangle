import { fPoint, iPoint } from 'matriangle-common/geometricTools'
import { NativeDecorationLabel } from 'matriangle-mod-native/entities/player/DecorationLabels'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import EffectPlayerShape from './EffectPlayerShape'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/**
 * 玩家受伤害
 * * 呈现一个覆盖在玩家之上、方向一致但位置滞留的、快速淡出的红色三角形
 * * 用于提示玩家受到伤害
 */
export default class EffectPlayerHurt extends EffectPlayerShape {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'EffectPlayerHurt'
	/** 默认颜色：红色 */
	public static readonly DEFAULT_COLOR: uint = 0xff0000
	/** 生命周期时长：0.25秒 */
	public static readonly LIFE: uint = FIXED_TPS * 0.25

	//============Static Functions============//
	public static fromPlayer(
		position: fPoint | iPoint,
		player: IPlayer,
		reverse: boolean = false
	): EffectPlayerHurt {
		return EffectPlayerShape.alignToCenter(
			new EffectPlayerHurt(
				position,
				player.direction,
				player.decorationLabel, // player instanceof AIPlayer ? (player as AIPlayer).decorationLabel : null,
				reverse
			)
		)
	}

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		rot: uint = 0,
		decorationLabel: NativeDecorationLabel = NativeDecorationLabel.EMPTY,
		reverse: boolean = false,
		life: uint = EffectPlayerHurt.LIFE
	) {
		super(
			EffectPlayerHurt.ID,
			position,
			rot,
			EffectPlayerHurt.DEFAULT_COLOR,
			decorationLabel,
			reverse,
			life
		)
	}

	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	/* public displayInit(shape: IShape): void {
		// 先绘制形状
		shape.graphics.beginFill(this._color)
		EffectPlayerLike.moveToPlayerShape(shape.graphics)
		// 然后绘制标记
		this.drawDecoration(shape)
		// 停止绘制
		shape.graphics.endFill()
	} */
}
