
// import batr.general.*;
// import batr.game.model.*;
// import batr.game.main.*;

import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Game from "../../../../../main/Game";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../../player/Player";
import LaserBasic from "./LaserBasic";
import IBatrGame from "../../../../../main/IBatrGame";

// import batr.game.entity.entity.player.*;
// import batr.game.entity.*;

export default class LaserAbsorption extends LaserBasic {
	//============Static Variables============//
	public static readonly LIFE: number = GlobalGameVariables.TPS;
	public static readonly SIZE: number = DEFAULT_SIZE / 4;
	public static readonly SCALE_V: number = 1 / 4;

	//============Instance Variables============//
	protected scaleReverse: boolean = true;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, length: uint = LENGTH) {
		super(host, x, y, owner, length);
		this._ownerTool = ToolType.ABSORPTION_LASER;
		this.damage = this._ownerTool.defaultDamage;
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.LASER_ABSORPTION;
	}

	//============Instance Functions============//
	override onLaserTick(): void {
		this.scaleY += SCALE_V * (scaleReverse ? -1 : 1);
		if (this.scaleY >= 1) {
			scaleReverse = true;

			this._host.laserHurtPlayers(this);
		}
		else if (this.scaleY <= -1)
			scaleReverse = false;
	}

	override drawShape(): void {
		graphics.clear();

		// Left
		drawOwnerLine(-SIZE / 2, -SIZE / 4, 0.6);
		drawOwnerLine(-SIZE / 2, -SIZE / 8, 0.5);
		// Right
		drawOwnerLine(SIZE / 4, SIZE / 2, 0.6);

		drawOwnerLine(SIZE / 8, SIZE / 2, 0.5);
	}
}