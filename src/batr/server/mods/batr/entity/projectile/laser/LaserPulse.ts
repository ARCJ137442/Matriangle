import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Laser from "./Laser";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import { iPoint } from "../../../../../../common/geometricTools";
import LaserBasic from "./LaserBasic";
import IMatrix from "../../../../../main/IMatrix";
import { IShape } from "../../../../../../display/api/DisplayInterfaces";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../../../native/entities/player/IPlayer";

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

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	/** 决定这个激光是「回拽激光」还是「前推激光」 */
	public isPull: boolean = false;

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint, direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		chargePercent: number = 1,
		length: uint = LaserBasic.LENGTH,
	) {
		super(
			owner,
			position, direction,
			length, LaserPulse.LIFE,
			attackerDamage, extraDamageCoefficient,
			1 // ! 「充能百分比」仅用于「决定子类型」而不用于决定伤害/生命周期
		);
		this.isPull = chargePercent != 1;
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//
	override onTick(host: IMatrix): void {
		if (!this.hasDamaged) console.warn('LaserPulse: laserHurtPlayers(host, this) WIP!')//laserHurtPlayers(host, this);
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}


	//============Display Implements============//
	/**
	 * 实现：
	 * @param shape 绘制的目标
	 */
	override shapeInit(shape: IShape): void {
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
	override shapeRefresh(shape: IShape): void {
		super.shapeRefresh(shape);
		if (this.isPull) {
			shape.scaleY = 1 + this.life / LaserPulse.LIFE;
			shape.alpha = (2 - shape.scaleY) * LaserPulse.ALPHA;
		}
		else {
			shape.scaleY = 2 - (this.life / LaserPulse.LIFE);
			shape.alpha = (2 - shape.scaleY) * LaserPulse.ALPHA;
		}
	}
}
