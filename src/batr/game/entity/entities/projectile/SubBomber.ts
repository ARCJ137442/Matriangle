
// import batr.general.*;

import { uint, int } from "../../../../legacy/AS3Legacy";
import Game from "../../../main/Game.1";
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

export default class SubBomber extends BulletBasic {
	//============Static Variables============//
	public static readonly SIZE: number = PosTransform.localPosToRealPos(2 / 5);
	public static readonly DEFAULT_SPEED: number = 12 / GlobalGameVariables.FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffcc00;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 2;
	public static readonly MAX_BOMB_TICK: uint = GlobalGameVariables.FIXED_TPS * 0.125;

	//============Instance Variables============//
	protected _bombTick: uint;

	protected _maxBombTick: uint;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, owner: Player, chargePercent: number, fuel: int = 100) {
		let scalePercent: number = (0.25 + chargePercent * 0.75);
		super(host, x, y, owner, DEFAULT_SPEED, DEFAULT_EXPLODE_RADIUS);
		this._currentTool = ToolType.SUB_BOMBER;
		this.damage = this._currentTool.defaultDamage;
		this._maxBombTick = MAX_BOMB_TICK * (1.5 - scalePercent);
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.SUB_BOMBER;
	}

	//============Instance Functions============//
	override explode(): void {
		this.bomb();
		this._host.entitySystem.removeProjectile(this);
	}

	override onBulletTick(): void {
		if ((this._bombTick--) == 0) {
			this.bomb();
			this._bombTick = this._maxBombTick;
		}
	}

	protected bomb(): void {
		this._host.toolCreateExplode(this.entityX, this.entityY, this.finalExplodeRadius, this.damage, this, DEFAULT_EXPLODE_COLOR);
	}

	//====Graphics Functions====//
	override drawShape(): void {
		super.drawShape();
		this.drawBomberSign();
		this.scaleX = this.scaleY = SubBomber.SIZE / BulletBasic.SIZE;
	}

	protected drawBomberSign(): void {
		let realRadius: number = BulletBasic.SIZE * 0.15;
		graphics.beginFill(this.ownerLineColor);
		graphics.moveTo(-realRadius, -realRadius);
		graphics.lineTo(realRadius, 0);
		graphics.lineTo(-realRadius, realRadius);
		graphics.lineTo(-realRadius, -realRadius);
		graphics.endFill();
	}
}