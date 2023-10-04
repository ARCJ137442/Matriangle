import { fPoint } from "../../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { mRot } from "../../../../../general/GlobalRot";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrMatrix from "../../../../../main/IBatrMatrix";
import { toolCreateExplode } from "../../../registry/NativeGameMechanics";
import IPlayer from "../../player/IPlayer";
import Bullet from "./Bullet";
import BulletBasic from "./BulletBasic";

/**
 * 「轰炸机子弹」 // ? 命名待定
 * * - 飞行速度
 * * + 飞行途中产生一系列爆炸，但自身不会消失
 */
export default class BulletBomber extends Bullet {

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给游戏母体提供的）

	//============Static Variables============//
	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 2;
	public static readonly MAX_BOMB_TICK: uint = FIXED_TPS * 0.125;

	//============Instance Variables============//

	/** 产生爆炸的计时器 */
	protected _bombTick: uint;
	/** 产生一次爆炸的周期 */
	protected _maxBombTick: uint;

	//============Constructor & Destructor============//
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
			BulletBomber.DEFAULT_SPEED,
			BulletBomber.DEFAULT_EXPLODE_RADIUS
		);
		this._maxBombTick = BulletBomber.MAX_BOMB_TICK * (1.5 - scalePercent);
		this._bombTick = this._maxBombTick;
	}

	//============Instance Functions============//
	override explode(host: IBatrMatrix): void {
		this.setBomb(host);
		super.explode(host); // ! 超类逻辑：移除自身
	}

	override onTick(host: IBatrMatrix): void {
		if ((this._bombTick--) == 0) {
			this.setBomb(host);
			this._bombTick = this._maxBombTick;
		}
		super.onTick(host); // ! 超类逻辑：飞行&爆炸
	}

	protected setBomb(host: IBatrMatrix): void {
		toolCreateExplode(
			host, this.owner,
			this._position, this.finalExplodeRadius,
			this._attackerDamage, this.extraDamageCoefficient,
			this.canHurtSelf, this.canHurtEnemy, this.canHurtAlly,
			BulletBomber.DEFAULT_EXPLODE_COLOR,
			1 // 边缘百分比
		);
	}

	//============Display Implements============//
	public static readonly SIZE: number = 0.4 * DEFAULT_SIZE;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		this.drawBomberSign(shape.graphics);
		shape.scaleX = shape.scaleY = BulletBomber.SIZE / BulletBasic.SIZE;
	}

	protected drawBomberSign(graphics: IBatrGraphicContext): void {
		let realRadius: number = BulletBasic.SIZE * 0.15;
		graphics.beginFill(this.ownerLineColor);
		graphics.moveTo(-realRadius, -realRadius);
		graphics.lineTo(realRadius, 0);
		graphics.lineTo(-realRadius, realRadius);
		graphics.lineTo(-realRadius, -realRadius);
		graphics.endFill();
	}
}