
// import batr.common.*;
// import batr.general.*;

import { uint, int } from "../../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../../api/block/BlockAttributes";
import BlockCommon from "../../../../api/block/BlockCommon";
import Game from "../../../../main/Game";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import ProjectileCommon from "./ProjectileCommon";

// import batr.game.block.*;
// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.entity.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.*;
// import flash.geom.*;

export default class ThrownBlock extends ProjectileCommon {
	//============Static Variables============//
	public static readonly MAX_SPEED: number = 15 / GlobalGameVariables.FIXED_TPS;
	public static readonly MIN_SPEED: number = 1 / 3 * MAX_SPEED;

	//============Instance Variables============//
	public xSpeed: number;
	public ySpeed: number;
	protected _carriedBlock: BlockCommon;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number,
		owner: Player | null, block: BlockCommon,
		rot: uint, chargePercent: number = 1) {
		super(host, x, y, owner);
		this._carriedBlock = block;

		this._currentTool = ToolType.BLOCK_THROWER;
		this.xSpeed = GlobalRot.towardIntX(rot) * (MIN_SPEED + (MAX_SPEED - MIN_SPEED) * chargePercent);
		this.ySpeed = GlobalRot.towardIntY(rot) * (MIN_SPEED + (MAX_SPEED - MIN_SPEED) * chargePercent);
		this.damage = exMath.getDistance2(GlobalRot.towardIntX(rot, chargePercent), GlobalRot.towardIntY(rot, chargePercent)) * this._currentTool.defaultDamage;
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		Utils.removeChildIfContains(this, this._carriedBlock);

		this._carriedBlock = null;

		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.THROWN_BLOCK;
	}

	public get carriedBlock(): BlockCommon {
		return this._carriedBlock;
	}

	//============Instance Functions============//
	//====Tick Function====//
	override onProjectileTick(): void {
		if (!this._host.isOutOfMap(this.entityX, this.entityY) &&
			this._host.testCanPass(
				this.lockedEntityX, this.lockedEntityY,
				false, true, false, false
			) && !this._host.isHitAnyPlayer(this.gridX, this.gridY)) {
			this.addXY(this.xSpeed, this.ySpeed);
		}
		else {
			if (Game.debugMode)
				trace('Block Hit:', this.getX(), this.getY());
			if (!this._host.isHitAnyPlayer(this.gridX, this.gridY))
				this.addXY(-this.xSpeed, -this.ySpeed);
			this.onBlockHit();
		}
	}

	protected onBlockHit(): void {
		// Locate
		let lx: int = this.lockedGridX, ly: int = this.lockedGridY;
		// Detect
		let lba: BlockAttributes = this.host.getBlockAttributes(lx, ly);
		// Hurt
		this._host.thrownBlockHurtPlayer(this);
		if (this.host.testBreakableWithMap(lba, this.host.map)) {
			// Place
			this._host.setBlock(lx, ly, this._carriedBlock);
			// Effect
			this.host.addBlockLightEffect2(
				PosTransform.alignToEntity(lx),
				PosTransform.alignToEntity(ly),
				this.carriedBlock, false
			);
		}
		else {
			// Effect
			this.host.addBlockLightEffect2(
				this.entityX, this.entityY,
				this.carriedBlock, false
			);
		}
		// Remove
		this._host.entitySystem.removeProjectile(this);
	}

	//====Graphics Functions====//
	override drawShape(): void {
		if (this._carriedBlock != null) {
			this._carriedBlock.x = -this._carriedBlock.width / 2;

			this._carriedBlock.y = -this._carriedBlock.height / 2;

			this.addChild(this._carriedBlock);
		}
	}
}