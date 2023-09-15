import { fPoint } from "../../../../../../common/geometricTools";
import { IBatrGraphicContext, IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { localPosToRealPos } from "../../../../../../display/api/PosTransform";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import Tool from "../../../tool/Tool";
import EntityType from "../../../registry/EntityRegistry";
import Player from "../../player/Player";
import BulletBasic from "./BulletBasic";

export default class BulletNuke extends BulletBasic {
	//============Static Variables============//
	public static readonly SIZE: number = localPosToRealPos(1 / 2);
	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 6.4;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, owner: Player | null, chargePercent: number) {
		let scalePercent: number = (0.25 + chargePercent * 0.75);
		super(position, owner, BulletNuke.DEFAULT_SPEED * (2 - scalePercent), BulletNuke.DEFAULT_EXPLODE_RADIUS * (2 * scalePercent));
		this._ownerTool = Tool.NUKE;
		this.damage = this._ownerTool.defaultDamage * scalePercent;
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.BULLET_NUKE;
	}

	//============Instance Functions============//
	override explode(host: IBatrGame): void {
		// TODO: 等待「游戏逻辑」完善
		// host.toolCreateExplode(this.position, this.finalExplodeRadius, this.damage, this, BulletNuke.DEFAULT_EXPLODE_COLOR, 0.5);
		// host.entitySystem.removeProjectile(this);
	}

	//====Graphics Functions====//
	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		this.drawNukeSign(shape.graphics);
		shape.scaleX = shape.scaleY = BulletNuke.SIZE / BulletBasic.SIZE;
	}

	protected drawNukeSign(graphics: IBatrGraphicContext): void {
		graphics.beginFill(this.ownerLineColor);
		graphics.drawCircle(0, 0, BulletBasic.SIZE * 0.125);
		graphics.endFill();
	}
}
