import { uint } from '../../../../../../legacy/AS3Legacy'
import { DEFAULT_SIZE } from '../../../../../../display/api/GlobalDisplayVariables'
import { FIXED_TPS } from '../../../../../main/GlobalWorldVariables'
import { iPoint } from '../../../../../../common/geometricTools'
import { IShape } from '../../../../../../display/api/DisplayInterfaces'
import Laser from './Laser'
import IMatrix from '../../../../../main/IMatrix'
import { mRot } from '../../../../../general/GlobalRot'
import IPlayer from '../../../../native/entities/player/IPlayer'

/**
 * 「基础激光」
 * * - 需要充能
 * * + 充能后瞬间造成伤害
 * * + 完全充能的「基础激光」伤害在所有同类激光中最高
 */
export default class LaserBasic extends Laser {
	//============Static Variables============//
	public static readonly LIFE: number = FIXED_TPS // ! 默认存活时间：1s
	public static readonly WIDTH: number = DEFAULT_SIZE / 2 // ! 默认宽度：半格
	public static readonly LENGTH: uint = 32 // ! 默认长度：32格

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		chargePercent: number = 1,
		length: number = LaserBasic.LENGTH
	) {
		super(
			owner,
			position,
			direction,
			length,
			LaserBasic.LIFE,
			attackerDamage,
			extraDamageCoefficient,
			chargePercent
		)
	}

	//============Instance Functions============//

	/** 覆盖：没有伤害过玩家，就触发母体计算伤害 */
	override onTick(host: IMatrix): void {
		if (!this.hasDamaged) console.warn('LaserBasic: laserHurtPlayers(host, this) WIP!') //laserHurtPlayers(host, this);
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}

	//============Display Implements============//
	/** 覆盖：先绘制，再拉伸 */
	override shapeInit(shape: IShape): void {
		// 先绘制
		for (let i: uint = 0; i < 3; i++) {
			// 0,1,2
			this.drawOwnerLine(
				shape.graphics,
				-LaserBasic.WIDTH / Math.pow(2, i + 1),
				LaserBasic.WIDTH / Math.pow(2, i + 1),
				i * 0.1 + 0.5
			)
		}
		// 再拉伸
		super.shapeInit(shape)
	}

	/**
	 * 覆盖：按照自身「生命周期百分比」压缩短轴长
	 * * 模拟「光束变窄然后消失」的效果
	 *
	 * ? 无需重绘图形：无需考虑玩家颜色
	 */
	override shapeRefresh(shape: IShape): void {
		super.shapeRefresh(shape)
		shape.scaleY = this.lifePercent
	}
}
