import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../registry/EntityRegistry";
import Player from "../../player/Player";
import Laser from "./Laser";
import IBatrGame from "../../../../../main/IBatrGame";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { iPoint } from "../../../../../../common/geometricTools";
import LaserBasic from "./LaserBasic";
import { NativeTools } from "../../../registry/ToolRegistry";
import Weapon from "../../../tool/Weapon";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";

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

	// 类型注册 //
	override get type(): EntityType { return EntityType.LASER_TELEPORT; }
	override readonly ownerTool: Weapon = NativeTools.WEAPON_TELEPORT_LASER;

	//============Constructor & Destructor============//
	public constructor(position: iPoint, owner: Player | null, length: uint = LaserBasic.LENGTH) {
		super(
			position, owner,
			length, LaserTeleport.LIFE,
			NativeTools.WEAPON_TELEPORT_LASER.defaultDamage
		);
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//
	override onTick(host: IBatrGame): void {
		if ((this._life & 3) == 0)
			host.laserHurtPlayers(this);
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}

	//============Display Implements============//
	override shapeInit(shape: IBatrShape): void {
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

	public shapeRefresh(shape: IBatrShape): void {
		shape.alpha = (this._life & 3) < 2 ? 0.75 : 1;
		if (this._life < 1 / 4 * LaserTeleport.LIFE)
			shape.scaleY = (1 / 4 * LaserTeleport.LIFE - this._life) / (1 / 4 * LaserTeleport.LIFE);
		super.shapeRefresh(shape);
	}
}