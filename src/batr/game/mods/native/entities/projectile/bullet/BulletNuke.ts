import { fPoint } from "../../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { logical2Real } from "../../../../../../display/api/PosTransform";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrMatrix from "../../../../../main/IBatrMatrix";
import BulletBasic from "./BulletBasic";
import Bullet from "./Bullet";
import { mRot } from "../../../../../general/GlobalRot";
import IPlayer from "../../player/IPlayer";
import { toolCreateExplode } from "../../../registry/NativeMatrixMechanics";

/**
 * 「核弹」
 * * - 飞行速度
 * * + 爆炸范围
 * * + 爆炸伤害
 */
export default class BulletNuke extends Bullet {

	//============Static Variables============//
	public static readonly SIZE: number = logical2Real(1 / 2);
	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 6.4;

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给游戏母体提供的）

	//============Constructor & Destructor============//
	/**
	 * 
	 * @param position 位置
	 * @param owner 所有者
	 * @param attackerDamage 攻击者伤害（仅在构造时「受武器影响」）
	 * @param chargePercent 充能百分比（仅影响运作逻辑，不影响伤害计算）
	 */
	public constructor(
		owner: IPlayer | null,
		position: fPoint, direction: mRot,
		attackerDamage: uint, extraDamageCoefficient: uint,
		chargePercent: number
	) {
		let scalePercent: number = (0.25 + chargePercent * 0.75);
		super(
			owner,
			position, direction,
			attackerDamage, extraDamageCoefficient,
			BulletNuke.DEFAULT_SPEED * (2 - scalePercent),
			BulletNuke.DEFAULT_EXPLODE_RADIUS * (2 * scalePercent)
		);
	}

	//============Instance Functions============//
	/** 覆盖：通知「游戏母体」创建爆炸 */
	override explode(host: IBatrMatrix): void {
		toolCreateExplode(
			host, this.owner,
			this._position, this.finalExplodeRadius,
			this._attackerDamage, this.extraDamageCoefficient,
			this.canHurtSelf, this.canHurtEnemy, this.canHurtAlly,
			BulletNuke.DEFAULT_EXPLODE_COLOR,
			0.5 // 边缘百分比
		);
		// 超类逻辑：移除自身
		super.explode(host);
	}

	//============Display Implements============//
	/** 先绘制基本轮廓，再绘制特殊标记 */
	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		this.drawNukeMark(shape.graphics);
		shape.scaleX = shape.scaleY = BulletNuke.SIZE / BulletBasic.SIZE;
	}

	protected drawNukeMark(graphics: IBatrGraphicContext): void {
		graphics.beginFill(this.ownerLineColor);
		graphics.drawCircle(0, 0, BulletBasic.SIZE * 0.125);
		graphics.endFill();
	}
}
