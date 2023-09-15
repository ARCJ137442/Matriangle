
// import batr.general.*;

import { uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Game from "../../../../main/Game";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import LaserBasic from "./LaserBasic";
import IBatrGame from "../../../../main/IBatrGame";

// import batr.game.entity.entity.player.*;
// import batr.game.entity.*;
// import batr.game.model.*;
// import batr.game.main.*;

export default class LaserTeleport extends LaserBasic {
	//============Static Variables============//
	public static readonly LIFE: number = GlobalGameVariables.FIXED_TPS * 0.5;
	public static readonly SIZE: number = DEFAULT_SIZE / 4;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, length: uint = LENGTH) {
		super(host, x, y, owner, length);
		this._ownerTool = ToolType.TELEPORT_LASER;
		this.damage = this._ownerTool.defaultDamage;
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.LASER_TELEPORT;
	}

	//============Instance Functions============//
	override onLaserTick(): void {
		this.alpha = (this._life & 3) < 2 ? 0.75 : 1;
		if (_life < 1 / 4 * LIFE)
			this.scaleY = (1 / 4 * LIFE - _life) / (1 / 4 * LIFE);
		else if ((this._life & 3) == 0)
			this._host.laserHurtPlayers(this);
	}

	override drawShape(): void {
		graphics.clear();

		// Middle
		drawOwnerLine(-SIZE / 2, SIZE / 2, 0.25);
		// Side
		drawOwnerLine(-SIZE / 2, -SIZE / 4, 0.6);
		drawOwnerLine(SIZE / 4, SIZE / 2, 0.6);
	}
}