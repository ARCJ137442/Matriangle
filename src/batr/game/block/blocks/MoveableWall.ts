import { int, uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";
import Wall from "./Wall";
import BlockWall from "./Wall";
import IBatrGame from "../../main/IBatrGame";
import ThrownBlock from "../../entity/entities/projectile/ThrownBlock";
import { getRandom } from "../../../general/GlobalRot";
import { iPoint } from "../../../common/intPoint";
import { alignToEntity } from "../../../general/PosTransform";

// Move as thrown block.
export default class BlockMoveableWall extends BlockWall {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x889988;
	public static readonly FILL_COLOR: uint = 0xbbccbb;

	public static readonly LINE_SIZE: uint = Wall.LINE_SIZE;

	//============Instance Variables============//
	protected _virus: boolean;

	//============Constructor & Destructor============//
	public constructor(virus: boolean = false) {
		super(BlockMoveableWall.LINE_COLOR, BlockMoveableWall.FILL_COLOR);
		this._virus = virus;
		this._attributes = NativeBlockAttributes.MOVEABLE_WALL;
	}

	override clone(): BlockCommon {
		return new BlockMoveableWall(this._virus);
	}

	public get virus(): boolean {
		return this._virus;
	}

	public override onRandomTick(host: IBatrGame, sourceX: int, sourceY: int): void {
		let randomRot: uint, tPoint: iPoint;
		let rotX: number, rotY: number, laserLength: number;
		// add laser by owner=null
		let p: ThrownBlock;
		let i: uint = 0;
		do {
			randomRot = getRandom();
			tPoint = host.map.logic.towardWithRot(sourceX, sourceY, randomRot);
			rotX = tPoint.x;
			rotY = tPoint.y;
			if (host.map.logic.isIntOutOfMap(rotX, rotY) || !host.map.logic.testIntCanPass(rotX, rotY, false, true, false, false))
				continue;
			p = new ThrownBlock(
				host,
				alignToEntity(sourceX), alignToEntity(sourceY),
				null,
				this.clone(),
				randomRot,
				Math.random()
			);
			host.map.storage.setVoid(sourceX, sourceY); // TODO: 建议统一管理
			host.entitySystem.registerProjectile(p);
			// TODO: 推荐 host.entitySystem.addProjectile(p); // 坐标存储在实体自身中
			// host.map.logic._projectileContainer.addChild(p);
			// trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
			if (this.virus)
				break;
		}
		while (++i < 0x10);
	}


	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(BlockMoveableWall.LINE_SIZE, BlockMoveableWall.LINE_SIZE, DEFAULT_SIZE - Wall.LINE_SIZE * 2, DEFAULT_SIZE - BlockMoveableWall.LINE_SIZE * 2);
		// Circle
		shape.graphics.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE / 8);
		shape.graphics.endFill();
	}
}