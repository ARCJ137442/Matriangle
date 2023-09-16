import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Laser from "./Laser";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { iPoint } from "../../../../../../common/geometricTools";
import LaserBasic from "./LaserBasic";
import { NativeTools } from "../../../registry/ToolRegistry";
import Weapon from "../../../tool/Weapon";
import IBatrGame from "../../../../../main/IBatrGame";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";

/**
 * 「脉冲激光」
 * * + 控制玩家位置「拉/推」
 * * + 分为「回拽激光」与「前推激光」
 *   * 其中「前推激光」可以把受伤害实体一路推到不能推为止，并且**每次前推都会造成伤害**
 */
export default class LaserPulse extends Laser {

	//============Static Variables============//
	public static readonly LIFE: number = FIXED_TPS * 0.25;
	public static readonly SIZE: number = DEFAULT_SIZE / 4;
	public static readonly ALPHA: number = 1 / 0.75;

	//============Instance Variables============//

	// 类型注册 //
	public readonly ownerTool: Weapon = NativeTools.WEAPON_LASER_PULSE;
	override get type(): EntityType { return NativeEntityTypes.LASER_PULSE; }

	/** 决定这个激光是「回拽激光」还是「前推激光」 */
	public isPull: boolean = false;

	//============Constructor & Destructor============//
	public constructor(
		position: iPoint, owner: Player | null,
		length: uint = LaserBasic.LENGTH,
		chargePercent: number = 1
	) {
		super(
			position, owner,
			length, LaserPulse.LIFE,
			NativeTools.WEAPON_LASER_PULSE.defaultDamage,
			1 // ! 「充能百分比」仅用于「决定子类型」而不用于决定伤害/生命周期
		);
		this.isPull = chargePercent != 1;
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//
	override onTick(host: IBatrGame): void {
		if (!this.hasDamaged)
			host.laserHurtPlayers(this);
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}


	//============Display Implements============//
	/**
	 * 实现：
	 * @param shape 绘制的目标
	 */
	override shapeInit(shape: IBatrShape): void {
		for (let i: uint = 0; i < 2; i++) { // 0,1
			this.drawOwnerLine(
				shape.graphics,
				-LaserPulse.SIZE / Math.pow(2, i + 1),
				LaserPulse.SIZE / Math.pow(2, i + 1),
				i * 0.1 + 0.2
			);
		}
		super.shapeInit(shape); // 调用超类，计算长度
	}

	/**
	 * 覆盖：根据自身「y尺寸」调整纵向缩放
	 */
	override shapeRefresh(shape: IBatrShape): void {
		super.shapeRefresh(shape);
		if (this.isPull) {
			shape.scaleY = 1 + this._life / LaserPulse.LIFE;
			shape.alpha = (2 - shape.scaleY) * LaserPulse.ALPHA;
		}
		else {
			shape.scaleY = 2 - (this._life / LaserPulse.LIFE);
			shape.alpha = (2 - shape.scaleY) * LaserPulse.ALPHA;
		}
	}
}
