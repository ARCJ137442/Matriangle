import { uint } from 'matriangle-legacy/AS3Legacy'
import { DEFAULT_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import Laser from './Laser'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { iPoint } from 'matriangle-common/geometricTools'
import LaserBasic from './LaserBasic'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { spreadPlayer } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { typeID } from 'matriangle-api'

/**
 * 「传送激光」
 * * + 无需充能
 * * + 高频伤害处于其上的可伤害实体
 * * + 传送处于其上的「非所有者实体」到地图随机地点
 */
export default class LaserTeleport extends Laser {
	/** ID */
	public static readonly ID: typeID = 'LaserTeleport'

	public static readonly LIFE: number = FIXED_TPS * 0.5
	public static readonly SIZE: number = DEFAULT_SIZE / 4

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

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
			LaserTeleport.ID,
			owner,
			position,
			direction,
			length,
			LaserTeleport.LIFE,
			attackerDamage,
			extraDamageCoefficient
		)
	}

	//============Instance Getter And Setter============//

	//============World Mechanics============//
	override onTick(host: IMatrix): void {
		if ((this.life & 7) === 0) this.hurtPlayers(host)
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}

	/** @override 在非致死伤害时传送玩家 */
	override hitAPlayer(
		host: IMatrix,
		player: IPlayer,
		canHurt: boolean,
		finalDamage: number
	): void {
		// 先伤害
		super.hitAPlayer(host, player, canHurt, finalDamage)
		// 再尝试传送
		if (
			canHurt /* 不会传送自身 */ &&
			!player.isRespawning /* 不会传送已死亡玩家 */
		)
			spreadPlayer(host, player)
	}

	//============Display Implements============//
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// override displayInit(shape: IShape): void {
	// 	// Middle
	// 	this.drawOwnerLine(
	// 		shape.graphics,
	// 		-LaserTeleport.SIZE / 2,
	// 		LaserTeleport.SIZE / 2,
	// 		0.25
	// 	)
	// 	// Side
	// 	this.drawOwnerLine(
	// 		shape.graphics,
	// 		-LaserTeleport.SIZE / 2,
	// 		-LaserTeleport.SIZE / 4,
	// 		0.6
	// 	)
	// 	this.drawOwnerLine(
	// 		shape.graphics,
	// 		LaserTeleport.SIZE / 4,
	// 		LaserTeleport.SIZE / 2,
	// 		0.6
	// 	)
	// 	super.displayInit(shape)
	// }

	// public shapeRefresh(shape: IShape): void {
	// 	shape.alpha = (this.life & 7) < 2 ? 0.75 : 1
	// 	if (this.life < (1 / 4) * LaserTeleport.LIFE)
	// 		shape.scaleY =
	// 			((1 / 4) * LaserTeleport.LIFE - this.life) /
	// 			((1 / 4) * LaserTeleport.LIFE)
	// 	super.shapeRefresh(shape)
	// }
}
