import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { toolCreateExplode } from '../../../mechanics/BatrMatrixMechanics'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import Bullet from './Bullet'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/**
 * 「轰炸机子弹」 // ? 命名待定
 * * - 飞行速度
 * * + 飞行途中产生一系列爆炸，但自身不会消失
 */
export default class BulletBomber extends Bullet {
	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */ // !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）
	/** ID */
	public static readonly ID: typeID = 'BulletBomber'

	//============Static Variables============//
	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 2
	public static readonly MAX_BOMB_TICK: uint = FIXED_TPS * 0.125
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00

	//============Instance Variables============//

	/** 产生爆炸的计时器 */
	protected _bombTick: uint
	/** 产生一次爆炸的周期 */
	protected _maxBombTick: uint

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		speed: number,
		finalExplodeRadius: number,
		maxBombTick: uint
	) {
		super(
			BulletBomber.ID,
			owner,
			position,
			direction,
			attackerDamage,
			extraDamageCoefficient,
			speed,
			finalExplodeRadius
		)
		this._maxBombTick = maxBombTick
		this._bombTick = this._maxBombTick
	}

	//============Instance Functions============//
	override explode(host: IMatrix): void {
		this.setBomb(host)
		super.explode(host) // ! 超类逻辑：移除自身
	}

	override onTick(host: IMatrix): void {
		if (this._bombTick-- == 0) {
			this.setBomb(host)
			this._bombTick = this._maxBombTick
		}
		super.onTick(host) // ! 超类逻辑：飞行&爆炸
	}

	protected setBomb(host: IMatrix): void {
		toolCreateExplode(
			host,
			this._owner,
			this._position,
			this.finalExplodeRadius,
			this._attackerDamage,
			this._extraResistanceCoefficient,
			this.canHurtSelf,
			this.canHurtEnemy,
			this.canHurtAlly,
			BulletBomber.DEFAULT_EXPLODE_COLOR,
			1 // 边缘百分比
		)
	}
}
