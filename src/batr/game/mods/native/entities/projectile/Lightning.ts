
// import batr.common.*;
// import batr.general.*;
// import batr.game.model.ToolType;

import { iPoint } from "../../../../../common/geometricTools";
import { uint, int } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import BlockAttributes from "../../../../api/block/BlockAttributes";
import Game from "../../../../main/Game";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import Projectile from "./Projectile";

// import batr.game.block.*;
// import batr.game.entity.entity.player.*;
// import batr.game.main.*;

/**
 * ...
 * @author ARCJ137442
 */
export default class Lightning extends Projectile {
	//============Static Variables============//
	public static readonly LIGHT_ALPHA: number = 0.5;
	public static readonly LIGHT_BLOCK_WIDTH: number = 0.2;
	public static readonly LIFE: uint = GlobalGameVariables.TPS / 2;

	//============Static Functions============//

	//============Instance Variables============//
	protected _life: uint = LIFE;
	public isDamaged: boolean = false;

	protected _energy: int;
	protected _initialEnergy: int;

	protected _wayPoints: iPoint[] = new Array<iPoint>();
	protected _hurtPlayers: Player[] = new Array<Player>();
	protected _hurtDefaultDamage: uint[] = new array<uint>();

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, rot: uint, owner: Player | null, energy: int) {
		super(host, x, y, owner);
		this.rot = rot;
		this._initialEnergy = this._energy = energy;
		this._ownerTool = ToolType.LIGHTNING;
	}

	//============Destructor Function============//
	override destructor(): void {
	}

	//============Instance Getter And Setter============//
	public get energyPercent(): number {
		return this._energy / this._initialEnergy;
	}

	//============Instance Functions============//
	public dealTick(): void {
		if (!this.isDamaged) {
			this.isDamaged = true;
			this.lightningWays();
			this.host.lightningHurtPlayers(this, this._hurtPlayers, this._hurtDefaultDamage);
		}
		this.alpha = this._life / Lightning.LIFE;
		if (this._life > 0)
			this._life--;
		else
			this._host.entitySystem.removeProjectile(this);
	}

	/** Init the way of lightning */
	protected lightningWays(): void {
		// Draw in location in this
		let head: iPoint = new iPoint(this.gridX, this.gridY);
		let ownerTool: ToolType = this.currentTool;
		let vx: int, vy: int;
		let cost: int = 0;
		let player: Player = null;
		let tRot: uint = this.owner.rot;
		let nRot: uint = 0;
		// Loop to run
		this._wayPoints.push(new iPoint(0, 0));
		while (true) {
			// trace('initWay in '+head,nRot,tRot,cost);
			// Cost and hit
			cost = operateCost(head.x, head.y);
			if ((this._energy -= cost) < 0)
				break;
			player = this.host.getHitPlayerAt(head.x, head.y);
			if (player != null && this.owner.canUseToolHurtPlayer(player, ownerTool)) {
				this._hurtPlayers.push(player);
				this._hurtDefaultDamage.push(ownerTool.defaultDamage * this.energyPercent);
			}
			// Update Rot
			nRot = this.getLeastWeightRot(head.x, head.y, tRot);
			if (GlobalRot.isValidRot(nRot)) {
				tRot = nRot;
				this.addWayPoint(head.x, head.y);
			}
			vx = GlobalRot.towardXInt(tRot);
			vy = GlobalRot.towardYInt(tRot);
			// Move
			head.x += vx;
			head.y += vy;
		}
		this.addWayPoint(head.x, head.y);
		// Draw
		this.rot = 0;
		this.drawLightning();
		// trace(this.entityX,this.entityY);
	}

	protected addWayPoint(hostX: int, hostY: int): void {
		this._wayPoints.push(new iPoint(hostX - this.gridX, hostY - this.gridY));
	}

	protected getLeastWeightRot(x: int, y: int, nowRot: uint): uint {
		let cx: int, cy: int;
		let leastCost: int = operateCost(x + GlobalRot.towardXInt(nowRot), y + GlobalRot.towardYInt(nowRot));
		let cost: int;
		let result: uint = GlobalRot.NULL;
		nowRot = GlobalRot.lockIntToStandard(nowRot + exMath.random1());
		for (let r: int = nowRot; r < nowRot + 4; r += 2) {
			cx = x + GlobalRot.towardXInt(r);
			cy = y + GlobalRot.towardYInt(r);
			cost = operateCost(cx, cy);
			if (cost < leastCost) {
				leastCost = cost;
				result = GlobalRot.lockIntToStandard(r);
			}
		}
		return result;
	}

	protected operateCost(x: int, y: int): int {
		if (this.host.isHitAnyPlayer(x, y))
			return 5; // The electricResistance of player
		if (this.host.isIntOutOfMap(x, y))
			return int.MAX_VALUE; // The electricResistance out of world
		let attributes: BlockAttributes = this.host.getBlockAttributes(x, y);
		if (attributes != null)
			return attributes.electricResistance;
		return 0;
	}

	override onProjectileTick(): void {
		this.dealTick();
	}

	override drawShape(): void {
	}

	protected drawLightning(): void {
		// These points uses local grid,for example the initial point is (0,0)
		let point: iPoint = null, pointH: iPoint = null;
		// drawLines
		for (let i: uint = 0; i < this._wayPoints.length; i++) {
			point = pointH;
			pointH = this._wayPoints[i];
			if (point != null && pointH != null) { // Head
				shape.graphics.beginFill(this.ownerColor, LIGHT_ALPHA);
				shape.graphics.drawRect(
					DEFAULT_SIZE * (exMath.intMin(point.x, pointH.x) - LIGHT_BLOCK_WIDTH),
					DEFAULT_SIZE * (exMath.intMin(point.y, pointH.y) - LIGHT_BLOCK_WIDTH),
					DEFAULT_SIZE * (exMath.intAbs(point.x - pointH.x) + LIGHT_BLOCK_WIDTH * 2),
					DEFAULT_SIZE * (exMath.intAbs(point.y - pointH.y) + LIGHT_BLOCK_WIDTH * 2)
				);
				shape.graphics.endFill();
				// trace('drawPoint at ',point,pointH);
			}
		}
		// drawPoints
		// this.
	}
}