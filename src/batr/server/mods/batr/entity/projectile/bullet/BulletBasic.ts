import { fPoint } from "../../../../../../common/geometricTools";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { mRot } from "../../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import IMatrix from "../../../../../main/IMatrix";
import { toolCreateExplode } from "../../../mechanics/BatrMatrixMechanics";
import IPlayer from "../../../../native/entities/player/IPlayer";
import Bullet from "./Bullet";

/**
 * 普通子弹
 */
export default class BulletBasic extends Bullet {

	/** 默认的子弹飞行速度（格/秒） */
	public static readonly DEFAULT_SPEED: number = 16 / FIXED_TPS;
	/** 默认的子弹爆炸半径（格） */
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 1;

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	/**
	 * 构造函数
	 * @param owner 所有者
	 * @param position 位置（浮点）
	 * @param direction 方向（任意维整数角）
	 * @param attackerDamage 攻击者伤害
	 * @param extraDamageCoefficient 附加伤害系数
	 * @param speed 速度
	 * @param finalExplodeRadius 最终爆炸半径（从玩家处计算得来）
	 */
	public constructor(
		owner: IPlayer | null,
		position: fPoint, direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		speed: number = BulletBasic.DEFAULT_SPEED,
		finalExplodeRadius: number = BulletBasic.DEFAULT_EXPLODE_RADIUS,
	) {
		super(owner, position, direction, attackerDamage, extraDamageCoefficient, speed, finalExplodeRadius)
	}

	/** 覆盖：通知母体创建爆炸 */
	override explode(host: IMatrix): void {
		toolCreateExplode(
			host, this._owner,
			this._position, this.finalExplodeRadius,
			this._attackerDamage, this._extraResistanceCoefficient,
			this.canHurtSelf, this.canHurtEnemy, this.canHurtAlly,
			0xffff00,
			1 // 边缘百分比，表示「各个地方伤害都一样」
		);
		// 超类逻辑：移除自身
		super.explode(host);
	}

}
