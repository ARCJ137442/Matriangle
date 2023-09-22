import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Laser from "./Laser";
import IBatrGame from "../../../../../main/IBatrGame";
import { iPoint } from "../../../../../../common/geometricTools";
import Weapon from "../../../tool/Weapon";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { NativeTools } from "../../../registry/ToolRegistry";
import LaserBasic from "./LaserBasic";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { mRot } from "../../../../../general/GlobalRot";

/**
 * 「吸收激光」
 * * + 无需充能
 * * + 存活时间长（2s）
 * * + 每1/4秒对其上可伤害实体造成伤害
 *   * 伤害可以被转化为其所有者的「附加血量」
 */
export default class LaserAbsorption extends Laser {

	//============Static Variables============//
	public static readonly LIFE: number = 2 * FIXED_TPS; // 生命周期：2s
	public static readonly SIZE: number = DEFAULT_SIZE / 4;
	public static readonly SCALE_V: number = 1 / 4;

	// 类型注册 //
	override get type(): EntityType { return NativeEntityTypes.LASER_ABSORPTION; }

	//============Instance Variables============//
	/** 纵轴的「尺寸」（用于控制动画与同步伤害） */
	protected scaleY: number = LaserAbsorption.LIFE;
	/** 用于控制「尺寸」的增速（可负） */
	protected scaleV: number = LaserAbsorption.SCALE_V;
	/**
	 * 反转「尺寸」的增长
	 */
	protected scaleReverse: boolean = true;

	//============Constructor & Destructor============//
	public constructor(
		owner: Player | null,
		position: iPoint, direction: mRot,
		attackerDamage: uint,
		length: uint = LaserBasic.LENGTH
	) {
		super(
			owner,
			position, direction,
			length, LaserAbsorption.LIFE,
			attackerDamage,
			1 /* 始终完全充能 */
		);
	}

	//============Instance Functions============//
	override onTick(host: IBatrGame): void {
		this.scaleY += LaserAbsorption.SCALE_V * (this.scaleReverse ? -1 : 1);
		if (this.scaleY >= 1) {
			this.scaleReverse = true;
			host.laserHurtPlayers(this);
		}
		else if (this.scaleY <= -1)
			this.scaleReverse = false;
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}

	//============Display Implements============//
	override shapeInit(shape: IBatrShape): void {
		// Left
		this.drawOwnerLine(
			shape.graphics,
			-LaserAbsorption.SIZE / 2,
			-LaserAbsorption.SIZE / 4, 0.6
		);
		this.drawOwnerLine(
			shape.graphics,
			-LaserAbsorption.SIZE / 2,
			-LaserAbsorption.SIZE / 8, 0.5
		);

		// Right
		this.drawOwnerLine(
			shape.graphics,
			LaserAbsorption.SIZE / 4,
			LaserAbsorption.SIZE / 2, 0.6
		);
		this.drawOwnerLine(
			shape.graphics,
			LaserAbsorption.SIZE / 8,
			LaserAbsorption.SIZE / 2, 0.5
		);
		super.shapeInit(shape); // ! 超类逻辑：处理形状初始化
	}

	public shapeRefresh(shape: IBatrShape): void {
		shape.scaleY = this.scaleY; // ! 同步纵轴缩放
	}
}