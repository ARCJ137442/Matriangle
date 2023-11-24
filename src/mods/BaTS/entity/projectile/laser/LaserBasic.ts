import { uint } from 'matriangle-legacy/AS3Legacy'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { iPoint } from 'matriangle-common/geometricTools'
import Laser from './Laser'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { typeID } from 'matriangle-api'

/**
 * 「基础激光」
 * * - 需要充能
 * * + 充能后瞬间造成伤害
 * * + 完全充能的「基础激光」伤害在所有同类激光中最高
 */
export default class LaserBasic extends Laser {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'LaserBasic'

	public static readonly LIFE: number = FIXED_TPS // ! 默认存活时间：1s

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: number,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		chargePercent: number = 1
	) {
		super(
			LaserBasic.ID,
			owner,
			position,
			direction,
			length,
			LaserBasic.LIFE,
			attackerDamage,
			extraDamageCoefficient,
			chargePercent
		)
		// !【2023-11-24 10:30:08】不再需要做显示更新，这些已被父类`Laser`全线承包
	}

	//============World Mechanics============//
	/** @override 覆盖：没有伤害过玩家，就触发母体计算伤害 */
	override onTick(host: IMatrix): void {
		// 使用默认的「伤害玩家」逻辑
		if (!this.hasDamaged) this.hurtPlayers(host)
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}
}
