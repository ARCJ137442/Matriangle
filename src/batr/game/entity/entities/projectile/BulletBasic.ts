
// import batr.general.*;
// import batr.common.*;

import { DEFAULT_SIZE } from "../../../../display/GlobalDisplayVariables";
import { BlockType } from "../../../block/BlockCommon";
import Game from "../../../main/Game";
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

export default class BulletBasic extends ProjectileCommon {
	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 80;
	public static readonly SIZE: number = PosTransform.localPosToRealPos(3 / 8);
	public static readonly DEFAULT_SPEED: number = 16 / GlobalGameVariables.FIXED_TPS;
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 1;

	//============Instance Variables============//
	public speed: number;
	public finalExplodeRadius: number;
	// Entity Pos

	public lastBlockType: BlockType = BlockType.NULL;
	public nowBlockType: BlockType = BlockType.NULL;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number,
		owner: Player,
		speed: number = DEFAULT_SPEED,
		defaultExplodeRadius: number = DEFAULT_EXPLODE_RADIUS): void {
		super(host, x, y, owner);
		this.speed = speed;

		this.finalExplodeRadius = owner == null ? defaultExplodeRadius : owner.computeFinalRadius(defaultExplodeRadius);
		this._currentTool = ToolType.BULLET;

		this.damage = this._currentTool.defaultDamage;
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.BULLET_BASIC;
	}

	//============Instance Functions============//

	//====Tick Function====//
	override onProjectileTick(): void {
		this.onBulletTick();

		this.onBulletCommonTick();
	}

	public onBulletCommonTick(): void {
		// Move
		// Detect
		if (this._host == null)
			return;
		this.nowBlockType = this._host.getBlockType(this.gridX, this.gridY);
		if (this.lastBlockType != this.nowBlockType) {
			// Random rotate
			if (this.nowBlockType != null &&
				this.nowBlockType.currentAttributes.rotateWhenMoveIn) {
				this.rot += exMath.random1();
			}
		}
		this.moveForward(this.speed);

		if (!_host.isOutOfMap(this.entityX, this.entityY) &&
			this._host.testCanPass(this.entityX, this.entityY, false, true, false)) {
			this.lastBlockType = this.nowBlockType;
		}
		else {
			this.explode();
		}
	}

	public onBulletTick(): void {
	}

	protected explode(): void {
		this._host.toolCreateExplode(this.entityX, this.entityY, this.finalExplodeRadius, this.damage, this, 0xffff00, 1);
		this._host.entitySystem.removeProjectile(this);
	}

	//====Graphics Functions====//
	override drawShape(): void {
		let realRadiusX: number = SIZE / 2;

		let realRadiusY: number = SIZE / 2;

		with (shape.graphics) {
			clear();
			lineStyle(LINE_SIZE, this.ownerLineColor);
			beginFill(this.ownerColor);
			/* GRADIENT-FILL REMOVED
			let m:Matrix=new Matrix()
			m.createGradientBox(SIZE,
								SIZE,0,-realRadiusX,-realRadiusX)
			beginGradientFill(GradientType.LINEAR,
			[this.ownerColor,ownerLineColor],
			[1,1],
			[63,255],
			m,
			SpreadMethod.PAD,
			InterpolationMethod.RGB,
			1)
			*/
			moveTo(-realRadiusX, -realRadiusY);
			lineTo(realRadiusX, 0);
			lineTo(-realRadiusX, realRadiusY);
			lineTo(-realRadiusX, -realRadiusY);
			endFill();
		}
	}
}
