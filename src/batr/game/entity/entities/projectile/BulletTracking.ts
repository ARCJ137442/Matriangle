
// import batr.general.*;

import { uint, int } from "../../../../legacy/AS3Legacy";
import Game from "../../../main/Game";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import BulletBasic from "./BulletBasic";

// import batr.game.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.*;
// import flash.geom.*;

export default class BulletTracking extends BulletBasic {
	//============Static Variables============//
	public static readonly SIZE: number = PosTransform.localPosToRealPos(3 / 8);
	public static readonly DEFAULT_SPEED: number = 12 / GlobalGameVariables.FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffff00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 0.625;

	//============Instance Variables============//
	protected _target: Player = null;
	protected _trackingFunction: Function = getTargetRot; // not the criterion
	protected _scalePercent: number = 1;
	protected _cachedTargets: Player[] = new Array<Player>();

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, chargePercent: number) {
		this._scalePercent = (1 + chargePercent * 0.5);
		if (chargePercent >= 1)
			this._trackingFunction = this.getTargetRotWidely;
		super(host, x, y, owner, DEFAULT_SPEED, DEFAULT_EXPLODE_RADIUS);
		this._currentTool = ToolType.TRACKING_BULLET;
		this.cacheTargets();
		this.drawShape();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.BULLET_TRACKING;
	}

	//============Instance Functions============//

	/**
	 * Cached some static properties, during the short lifespan of the bullet
	 */
	protected cacheTargets(): void {
		for (let player of _host.entitySystem.players) {
			if (player != null && // not null
				(this._owner == null || this._owner.canUseToolHurtPlayer(player, this._currentTool)) // should can use it to hurt
			)
				this._cachedTargets.push(player);
		}
	}

	override onBulletTick(): void {
		let tempRot: int;
		if (this._target == null) {
			let player: Player;
			for (let i: int = this._cachedTargets.length - 1; i >= 0; i--) {
				player = this._cachedTargets[i];
				// check valid
				if (this.checkTargetInvalid(player)) {
					this._cachedTargets.splice(i, 1);
					continue;
				};
				// tracking
				if ((tempRot = this.getTargetRot(player)) >= 0) {
					this._target = player;
					this.rot = tempRot;
					this.speed = DEFAULT_SPEED * this._scalePercent;
					break;
				}
			}
		}
		// if lost target
		else if (this.checkTargetInvalid(this._target) || (tempRot = this._trackingFunction(this._target)) < 0) {
			this._target = null;
		}
		else {
			// tracking
			this.rot = tempRot;
		}
	}

	protected checkTargetInvalid(player: Player): boolean {
		return (
			player == null || // not null
			player.isRespawning || // not respawning
			(this._owner != null && !this._owner.canUseToolHurtPlayer(player, this._currentTool)) // should can use it to hurt
		);
	}

	protected getTargetRot(player: Player): int {
		if (this.gridX == player.gridX) {
			return this.gridY > player.gridY ? GlobalRot.UP : GlobalRot.DOWN; // from left top
		}
		else if (this.gridY == player.gridY) {
			return this.gridX > player.gridX ? GlobalRot.LEFT : GlobalRot.RIGHT;
		}
		return -1;
	}

	protected getTargetRotWidely(player: Player): int {
		let xDistance: int = this.gridX - player.gridX;
		let yDistance: int = this.gridY - player.gridY;
		if (Math.abs(xDistance) > Math.abs(yDistance)) {
			return this.gridX > player.gridX ? GlobalRot.LEFT : GlobalRot.RIGHT;
		}
		else {
			return this.gridY > player.gridY ? GlobalRot.UP : GlobalRot.DOWN; // from left top
		}
	}

	//====Graphics Functions====//
	override drawShape(): void {
		super.drawShape();
		this.drawTrackingSign();
		this.scaleX = this.scaleY = BulletTracking.SIZE / BulletBasic.SIZE;
	}

	protected drawTrackingSign(): void {
		graphics.beginFill(this.ownerLineColor);
		let radius: number = BulletTracking.SIZE * 0.125;
		graphics.moveTo(-radius, -radius);
		graphics.lineTo(radius, 0);
		graphics.lineTo(-radius, radius);
		graphics.lineTo(-radius, -radius);
		graphics.endFill();
	}
}