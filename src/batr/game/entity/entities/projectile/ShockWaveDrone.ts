
// import batr.general.*;
// import batr.common.*;

import { uint } from "../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../display/GlobalRenderVariables";
import { BlockType } from "../../../block/BlockCommon";
import Game from "../../../main/Game.1";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import ProjectileCommon from "./ProjectileCommon";

// import batr.game.block.*;
// import batr.game.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.*;
// import flash.geom.*;

export default class ShockWaveDrone extends ProjectileCommon {
	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly BLOCK_RADIUS: number = DEFAULT_SIZE / 2;

	public static readonly MOVING_INTERVAL: uint = GlobalGameVariables.FIXED_TPS * 0.0625;

	//============Instance Variables============//
	public lastBlockType: BlockType = BlockType.NULL;
	public nowBlockType: BlockType = BlockType.NULL;

	protected _tool: ToolType;
	protected _toolChargePercent: number;

	protected _toolRot: uint;
	protected _moveDuration: uint = 0;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, owner: Player, tool: ToolType, toolRot: uint, toolChargePercent: number) {
		super(host, x, y, owner);
		this._currentTool = ToolType.SHOCKWAVE_ALPHA;
		this._tool = tool;
		this._toolChargePercent = toolChargePercent;
		this._toolRot = toolRot;
		this.drawShape();
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
	override onProjectileTick(): void {
		if (this._host == null)
			return;
		// Ticking
		if (this._moveDuration > 0)
			this._moveDuration--;
		else {
			this._moveDuration = ShockWaveDrone.MOVING_INTERVAL;
			// Moving
			this.moveForwardInt(1);
			var ex: number = this.entityX;
			var ey: number = this.entityY;
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
	override drawShape(): void {
		shape.graphics.beginFill(this.ownerColor, 0.5);
		shape.graphics.drawRect(-BLOCK_RADIUS, -BLOCK_RADIUS, BLOCK_RADIUS * 2, BLOCK_RADIUS * 2);
		shape.graphics.drawRect(-BLOCK_RADIUS / 2, -BLOCK_RADIUS / 2, BLOCK_RADIUS, BLOCK_RADIUS);
		shape.graphics.endFill();
	}
}
