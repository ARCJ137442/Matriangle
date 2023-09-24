import { fPoint } from "../../../../../../common/geometricTools";
import { uint } from "../../../../../../legacy/AS3Legacy";
import EntityType from "../../../../../api/entity/EntityType";
import { mRot } from "../../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
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

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */
	override get type(): EntityType { return NativeEntityTypes.BULLET_BASIC; }

	public constructor(
		owner: IPlayer | null,
		position: fPoint, direction: mRot,
		attackerDamage: uint,
		speed: number = BulletBasic.DEFAULT_SPEED,
		defaultExplodeRadius: number = BulletBasic.DEFAULT_EXPLODE_RADIUS,
	) {
		super(owner, position, direction, attackerDamage, speed, defaultExplodeRadius)
	}

	/** 覆盖：通知「游戏主体」创建爆炸 */
	override explode(host: IBatrGame): void {
		// TODO: 待完善游戏接口再使用——* 创建爆炸（+效果但不仅仅效果）* 移除自身
		host.toolCreateExplode(
			this._position,
			this.finalExplodeRadius, this._attackerDamage, this,
			0xffff00, 1 // ? 这里的「1」用途何在？
		);
		// 超类逻辑：移除自身
		super.explode(host);
	}

}
