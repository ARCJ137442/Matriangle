
// import batr.common.*;
// import batr.general.*;

import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Game from "../../../../../main/Game";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../../player/Player";
import LaserBasic from "./LaserBasic";

// import batr.game.entity.entity.player.*;
// import batr.game.entity.*;
// import batr.game.model.*;
// import batr.game.main.*;

export default class LaserPulse extends LaserBasic {
	//============Static Variables============//
	public static readonly LIFE: number = GlobalGameVariables.FIXED_TPS * 0.25;
	public static readonly SIZE: number = DEFAULT_SIZE / 4;
	public static readonly ALPHA: number = 1 / 0.75;

	//============Instance Variables============//
	public isPull: boolean = false;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, length: uint = LENGTH, chargePercent: number = 1) {
		super(host, x, y, owner, length, chargePercent);
		this._ownerTool = ToolType.PULSE_LASER;
		this._life = LaserPulse.LIFE;
		this.damage = this._ownerTool.defaultDamage;
		this.dealCharge(chargePercent);
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.LASER_PULSE;
	}

	//============Instance Functions============//
	override onLaserTick(): void {
		if (!this.isDamaged)
			this._host.laserHurtPlayers(this);
		if (this.isPull) {
			this.scaleY = 1 + this._life / LaserPulse.LIFE;
			this.alpha = (2 - this.scaleY) * ALPHA;
		}
		else {
			this.scaleY = 2 - (this._life / LaserPulse.LIFE);
			this.alpha = (2 - this.scaleY) * ALPHA;
		}
	}

	override dealCharge(percent: number): void {
		if (percent != 1)
			this.isPull = true;
	}

	override drawShape(): void {
		shape.graphics.clear();
		for (let i: uint = 0; i < 2; i++) { // 0,1
			this.drawOwnerLine(-SIZE / Math.pow(2, i + 1),
				SIZE / Math.pow(2, i + 1),
				i * 0.1 + 0.2);
		}
	}
}