import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import Bullet from './Bullet'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { toolCreateExplode } from '../../../mechanics/BatrMatrixMechanics'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/**
 * 「核弹」
 * * - 飞行速度
 * * + 爆炸范围
 * * + 爆炸伤害
 */
export default class BulletNuke extends Bullet {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'BulletNuke'

	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 6.4

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */ // !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * * 子弹系「属性受充能百分比影响」的机制现统一迁移至构造侧
	 */
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		speed: number,
		finalExplodeRadius: number
	) {
		super(
			BulletNuke.ID,
			owner,
			position,
			direction,
			attackerDamage,
			extraDamageCoefficient,
			speed,
			finalExplodeRadius
		)
	}

	//============Instance Functions============//
	/** 覆盖：通知母体创建爆炸 */
	override explode(host: IMatrix): void {
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
			BulletNuke.DEFAULT_EXPLODE_COLOR,
			0.5 // 边缘百分比
		)
		// 超类逻辑：移除自身
		super.explode(host)
	}
}
