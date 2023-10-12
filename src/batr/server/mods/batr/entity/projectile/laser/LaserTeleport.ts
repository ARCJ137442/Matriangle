import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Laser from "./Laser";
import IMatrix from "../../../../../main/IMatrix";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import { iPoint } from "../../../../../../common/geometricTools";
import LaserBasic from "./LaserBasic";
import { IShape } from "../../../../../../display/api/DisplayInterfaces";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../../../native/entities/player/IPlayer";

/**
 * 「传送激光」
 * * + 无需充能
 * * + 高频伤害处于其上的可伤害实体
 * * + 传送处于其上的「非所有者实体」到地图随机地点
 */
export default class LaserTeleport extends Laser {

	//============Static Variables============//
	public static readonly LIFE: number = FIXED_TPS * 0.5;
	public static readonly SIZE: number = DEFAULT_SIZE / 4;

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint, direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		length: uint = LaserBasic.LENGTH
	) {
		super(
			owner,
			position, direction,
			length, LaserTeleport.LIFE,
			attackerDamage, extraDamageCoefficient
		);
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//
	override onTick(host: IMatrix): void {
		if ((this.life & 3) == 0) console.warn('LaserTeleport: laserHurtPlayers(host, this, (host,victim) => {}) WIP!')//laserHurtPlayers(host, this);
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}

	//============Display Implements============//
	override shapeInit(shape: IShape): void {
		// Middle
		this.drawOwnerLine(
			shape.graphics,
			-LaserTeleport.SIZE / 2,
			LaserTeleport.SIZE / 2, 0.25
		);
		// Side
		this.drawOwnerLine(
			shape.graphics,
			-LaserTeleport.SIZE / 2,
			-LaserTeleport.SIZE / 4, 0.6
		);
		this.drawOwnerLine(
			shape.graphics,
			LaserTeleport.SIZE / 4,
			LaserTeleport.SIZE / 2, 0.6
		);
		super.shapeInit(shape);
	}

	public shapeRefresh(shape: IShape): void {
		shape.alpha = (this.life & 3) < 2 ? 0.75 : 1;
		if (this.life < 1 / 4 * LaserTeleport.LIFE)
			shape.scaleY = (1 / 4 * LaserTeleport.LIFE - this.life) / (1 / 4 * LaserTeleport.LIFE);
		super.shapeRefresh(shape);
	}
}