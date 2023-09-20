import { fPoint } from "../../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { logical2Real } from "../../../../../../display/api/PosTransform";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import BulletBasic from "./BulletBasic";
import Weapon from "../../../tool/Weapon";
import { NativeTools } from './../../../registry/ToolRegistry';
import Bullet from "./Bullet";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";

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

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */
	override get type(): EntityType { return NativeEntityTypes.BULLET_NUKE; }
	override readonly ownerTool: Weapon = NativeTools.WEAPON_BULLET_NUKE;

	//============Constructor & Destructor============//
	/**
	 * 
	 * @param position 位置
	 * @param owner 所有者
	 * @param attackerDamage 攻击者伤害（仅在构造时「受武器影响」）
	 * @param chargePercent 充能百分比（仅影响运作逻辑，不影响伤害计算）
	 */
	public constructor(
		position: fPoint,
		owner: Player | null, attackerDamage: uint,
		chargePercent: number
	) {
		let scalePercent: number = (0.25 + chargePercent * 0.75);
		super(
			position,
			owner, attackerDamage,
			BulletNuke.DEFAULT_SPEED * (2 - scalePercent),
			BulletNuke.DEFAULT_EXPLODE_RADIUS * (2 * scalePercent)
		);
	}

	//============Instance Functions============//
	/** 覆盖：通知「游戏主体」创建爆炸 */
	override explode(host: IBatrGame): void {
		// TODO: 等待「游戏逻辑」完善
		// host.toolCreateExplode(this.position, this.finalExplodeRadius, this.damage, this, BulletNuke.DEFAULT_EXPLODE_COLOR, 0.5);
		// 超类逻辑：移除自身
		super.explode(host);
	}

	//====Graphics Functions====//
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
