import { uint } from 'matriangle-legacy/AS3Legacy'
import Laser from './Laser'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { iPoint } from 'matriangle-common/geometricTools'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { typeID } from 'matriangle-api'

/**
 * 「吸收激光」
 * * + 无需充能
 * * + 存活时间长（2s）
 * * + 每1/4秒对其上可伤害实体造成伤害
 *   * 伤害可以被转化为其所有者的「附加生命值」
 */
export default class LaserAbsorption extends Laser {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'LaserAbsorption'

	public static readonly LIFE: uint = uint(FIXED_TPS) // 生命周期：2s // !【2023-11-24 12:13:27】从两秒改成一秒，因为当前测试中实际「生命周期长度」变成了两倍（原因不明）
	/**
	 * 每1/4秒对其上可伤害实体造成伤害
	 * * 其动画（自AS3版本参考）将与此高度相关
	 */
	public static readonly DAMAGE_PERIOD: uint = FIXED_TPS >> 3

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: uint,
		attackerDamage: uint,
		extraDamageCoefficient: uint
	) {
		super(
			LaserAbsorption.ID,
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
		// 每个固定周期伤害一次
		if (this._life % LaserAbsorption.DAMAGE_PERIOD == 0)
			this.hurtPlayers(host)
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}

	/** @override 将对玩家造成的「最终伤害」转化为所有者的「储备生命值」 */
	override hitAPlayer(
		host: IMatrix,
		player: IPlayer,
		canHurt: boolean,
		finalDamage: uint
	): void {
		// 造成伤害
		super.hitAPlayer(host, player, canHurt, finalDamage)
		// 吸收伤害
		if (canHurt && this.owner !== null && !this.owner.isRespawning)
			this.owner.heal += finalDamage
	}

	//============Display Implements============//
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// override displayInit(shape: IShape): void {
	// 	super.displayInit(shape) // ! 超类逻辑：处理形状初始化
	// }

	// public shapeRefresh(shape: IShape): void {
	// 	shape.scaleY = this.scaleY // ! 同步纵轴缩放
	// }
}
