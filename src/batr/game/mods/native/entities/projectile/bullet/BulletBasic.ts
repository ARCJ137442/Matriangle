import { fPoint } from "../../../../../../common/geometricTools";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { mRot } from "../../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrMatrix from "../../../../../main/IBatrMatrix";
import { toolCreateExplode } from "../../../registry/NativeGameMechanics";
import IPlayer from "../../player/IPlayer";
import Bullet from "./Bullet";

/**
 * 普通子弹
 */
export default class BulletBasic extends Bullet {

	/** 默认的子弹飞行速度（格/秒） */
	public static readonly DEFAULT_SPEED: number = 16 / FIXED_TPS;
	/** 默认的子弹爆炸半径（格） */
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 1;

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给游戏母体提供的）

	public constructor(
		owner: IPlayer | null,
		position: fPoint, direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		speed: number = BulletBasic.DEFAULT_SPEED,
		defaultExplodeRadius: number = BulletBasic.DEFAULT_EXPLODE_RADIUS,
	) {
		super(owner, position, direction, attackerDamage, extraDamageCoefficient, speed, defaultExplodeRadius)
	}

	/** 覆盖：通知「游戏母体」创建爆炸 */
	override explode(host: IBatrMatrix): void {
		toolCreateExplode(
			host, this.owner,
			this._position, this.finalExplodeRadius,
			this._attackerDamage, this.extraDamageCoefficient,
			this.canHurtSelf, this.canHurtEnemy, this.canHurtAlly,
			0xffff00,
			1 // 边缘百分比，表示「各个地方伤害都一样」
		);
		// 超类逻辑：移除自身
		super.explode(host);
	}

}
