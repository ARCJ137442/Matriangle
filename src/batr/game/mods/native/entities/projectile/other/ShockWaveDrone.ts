

import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import { BlockType } from "../../../../../api/block/Block";
import Game from "../../../../../main/Game";
import EntityType from "../../../../../api/entity/EntityType";
import Tool from "../../../registry/Tool";
import Player from "../../player/Player";
import Projectile from "../Projectile";

export default class ShockWaveDrone extends Projectile {
	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE / 2;

	public static readonly MOVING_INTERVAL: uint = GlobalGameVariables.FIXED_TPS * 0.0625;

	//============Instance Variables============//
	public lastBlockType: BlockType = BlockType.NULL;
	public nowBlockType: BlockType = BlockType.NULL;

	protected _tool: Tool;
	protected _toolChargePercent: number;

	protected _toolRot: uint;
	protected _moveDuration: uint = 0;

	//============Constructor & Destructor============//
	public constructor(position: fPoint, owner: Player | null, tool: Tool, toolRot: uint, toolChargePercent: number) {
		super(position, owner);
		this.ownerTool = Tool.SHOCKWAVE_ALPHA;
		this._tool = tool;
		this._toolChargePercent = toolChargePercent;
		this._toolRot = toolRot;
		this.shapeInit(shape: IBatrShape);
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		this._tool = null;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.SHOCKWAVE_LASER_DRONE;
	}

	//============Instance Functions============//

	//====Tick Function====//
	override onTick(host: IBatrGame): void {
		super.onTick(host);
		if (this._host == null)
			return;
		// Ticking
		if (this._moveDuration > 0)
			this._moveDuration--;
		else {
			this._moveDuration = ShockWaveDrone.MOVING_INTERVAL;
			// Moving
			this.moveForwardInt(1);
			let ex: number = this.entityX;
			let ey: number = this.entityY;
			if (_host.isOutOfMap(ex, ey) || !this._host.testCanPass(ex, ey, false, true, false)) {
				// Gone
				this._host.entitySystem.removeProjectile(this);
			}
			// Use Tool
			else
				this.host.playerUseToolAt(this.owner, this._tool,
					ex + GlobalRot.towardIntX(this._toolRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE),
					ey + GlobalRot.towardIntY(this._toolRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE),
					this._toolRot, this._toolChargePercent, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
		}
	}

	//====Graphics Functions====//
	override shapeInit(shape: IBatrShape): void {
		shape.graphics.beginFill(this.ownerColor, 0.5);
		shape.graphics.drawRect(-BLOCK_RADIUS, -BLOCK_RADIUS, BLOCK_RADIUS * 2, BLOCK_RADIUS * 2);
		shape.graphics.drawRect(-BLOCK_RADIUS / 2, -BLOCK_RADIUS / 2, BLOCK_RADIUS, BLOCK_RADIUS);
		shape.graphics.endFill();
	}
}
