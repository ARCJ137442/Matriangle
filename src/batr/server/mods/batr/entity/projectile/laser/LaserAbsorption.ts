import { uint } from '../../../../../../legacy/AS3Legacy'
import { DEFAULT_SIZE } from '../../../../../../display/api/GlobalDisplayVariables'
import Laser from './Laser'
import IMatrix from '../../../../../main/IMatrix'
import { iPoint } from '../../../../../../common/geometricTools'
import { IShape } from '../../../../../../display/api/DisplayInterfaces'
import { FIXED_TPS } from '../../../../../main/GlobalWorldVariables'
import LaserBasic from './LaserBasic'
import { mRot } from '../../../../../general/GlobalRot'
import IPlayer from '../../../../native/entities/player/IPlayer'

/**
 * 「吸收激光」
 * * + 无需充能
 * * + 存活时间长（2s）
 * * + 每1/4秒对其上可伤害实体造成伤害
 *   * 伤害可以被转化为其所有者的「附加生命值」
 */
export default class LaserAbsorption extends Laser {
	//============Static Variables============//
	public static readonly LIFE: number = 2 * FIXED_TPS // 生命周期：2s
	public static readonly SIZE: number = DEFAULT_SIZE / 4
	public static readonly SCALE_V: number = 1 / 4

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Instance Variables============//
	/** 纵轴的「尺寸」（用于控制动画与同步伤害） */
	protected scaleY: number = 1
	/** 用于控制「尺寸」的增速（可负） */
	protected scaleV: number = LaserAbsorption.SCALE_V
	/**
	 * 反转「尺寸」的增长
	 */
	protected scaleReverse: boolean = true

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: uint = LaserBasic.LENGTH,
		attackerDamage: uint,
		extraDamageCoefficient: uint
	) {
		super(
			owner,
			position,
			direction,
			length,
			LaserAbsorption.LIFE,
			attackerDamage,
			extraDamageCoefficient,
			1 /* 始终完全充能 */
		)
	}

	//============World Mechanics============//
	override onTick(host: IMatrix): void {
		this.scaleY += LaserAbsorption.SCALE_V * (this.scaleReverse ? -1 : 1)
		if (this.scaleY >= 1) {
			this.scaleReverse = true
			this.hurtPlayers(host)
		} else if (this.scaleY <= -1) this.scaleReverse = false
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}

	/** @override 将对玩家造成的「最终伤害」转化为所有者的「储备生命值」 */
	override hitAPlayer(host: IMatrix, player: IPlayer, canHurt: boolean, finalDamage: uint): void {
		// 造成伤害
		super.hitAPlayer(host, player, canHurt, finalDamage)
		// 吸收伤害
		if (canHurt && this.owner !== null && !this.owner.isRespawning) this.owner.heal += finalDamage
	}

	//============Display Implements============//
	override shapeInit(shape: IShape): void {
		// Left
		this.drawOwnerLine(shape.graphics, -LaserAbsorption.SIZE / 2, -LaserAbsorption.SIZE / 4, 0.6)
		this.drawOwnerLine(shape.graphics, -LaserAbsorption.SIZE / 2, -LaserAbsorption.SIZE / 8, 0.5)

		// Right
		this.drawOwnerLine(shape.graphics, LaserAbsorption.SIZE / 4, LaserAbsorption.SIZE / 2, 0.6)
		this.drawOwnerLine(shape.graphics, LaserAbsorption.SIZE / 8, LaserAbsorption.SIZE / 2, 0.5)
		super.shapeInit(shape) // ! 超类逻辑：处理形状初始化
	}

	public shapeRefresh(shape: IShape): void {
		shape.scaleY = this.scaleY // ! 同步纵轴缩放
	}
}
