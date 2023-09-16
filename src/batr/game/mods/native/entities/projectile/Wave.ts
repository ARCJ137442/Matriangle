import { uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Game from "../../../../main/Game";
import EntityType from "../../../../../api/entity/EntityType";
import ToolType from "../../../registry/ToolType";
import Player from "../player/Player";
import Projectile from "./Projectile";

// import batr.general.*;

// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.entity.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.*;
// import flash.geom.*;

export default class Wave extends Projectile {
	//============Static Variables============//
	public static readonly SIZE: number = DEFAULT_SIZE;
	public static readonly ALPHA: number = 0.64;
	public static readonly DEFAULT_SPEED: number = 24 / GlobalGameVariables.FIXED_TPS;
	public static readonly MAX_SCALE: number = 4;
	public static readonly MIN_SCALE: number = 1 / 4;
	public static readonly LIFE: uint = GlobalGameVariables.FIXED_TPS * 4;
	public static readonly DAMAGE_DELAY: uint = GlobalGameVariables.FIXED_TPS / 12;

	//============Instance Variables============//
	public speed: number = DEFAULT_SPEED;

	public tempScale: number;

	protected life: uint = LIFE;

	protected _finalScale: number;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, chargePercent: number) {
		super(host, x, y, owner);
		this.ownerTool = ToolType.WAVE;
		dealCharge(chargePercent);
		this.drawShape();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.WAVE;
	}

	override destructor(): void {
		shape.graphics.clear();
	}

	public get finalScale(): number {
		return this._finalScale;
	}

	public set finalScale(value: number) {
		this._finalScale = this.scaleX = this.scaleY = value;
	}

	//============Instance Functions============//
	public dealCharge(percent: number): void {
		this.tempScale = Wave.MIN_SCALE + (Wave.MAX_SCALE - Wave.MIN_SCALE) * percent;
		this.finalScale = this._owner == null ? tempScale : (1 + this._owner.computeFinalRadius(this.tempScale) / 2);
		this.damage = this.ownerTool.defaultDamage * tempScale / Wave.MAX_SCALE;
	}

	//====Graphics Functions====//
	override drawShape(): void {
		let realRadius: number = SIZE / 2;

		graphics.clear();
		graphics.beginFill(this.ownerColor, ALPHA);
		// That's right but that create a double wave
		/*graphics.drawEllipse(-3*realRadius,-realRadius,realRadius*4,realRadius*2)
		graphics.drawCircle(-realRadius,0,realRadius)*/
		// That use two half-circle
		/*graphics.drawRect(-realRadius,-realRadius,realRadius,2*realRadius)
		graphics.drawRoundRectComplex(-realRadius*2,-realRadius,realRadius*2,realRadius*2,
									  0,realRadius,0,realRadius)
		graphics.drawRoundRectComplex(-realRadius,-realRadius,realRadius*2,realRadius*2,
									  0,realRadius,0,realRadius)
		graphics.drawRect(-realRadius*2,-realRadius,2*realRadius,2*realRadius)*/
		// That use four bezier curve
		/*graphics.moveTo(-realRadius,realRadius)
		graphics.curveTo(realRadius,realRadius,realRadius,0)
		graphics.moveTo(-realRadius,-realRadius)
		graphics.curveTo(realRadius,-realRadius,realRadius,0)
		graphics.moveTo(-realRadius,realRadius)
		graphics.curveTo(0,realRadius,0,0)
		graphics.moveTo(-realRadius,-realRadius)
		graphics.curveTo(0,-realRadius,0,0)*/
		// Final:At last use three bezier curve
		graphics.moveTo(-realRadius, realRadius);

		graphics.curveTo(realRadius, realRadius, realRadius, 0);

		graphics.curveTo(realRadius, -realRadius, -realRadius, -realRadius);
		graphics.cubicCurveTo(realRadius / 2, -realRadius, realRadius / 2, realRadius, -realRadius, realRadius);
		graphics.endFill();
	}

	//====Tick Function====//
	override onProjectileTick(): void {
		this.moveForward(this.speed);

		if (this.life % DAMAGE_DELAY == 0) {
			this._host.waveHurtPlayers(this);
		}
		dealLife();
	}

	protected dealLife(): void {
		if (this.life > 0)
			this.life--;

		else {
			this._host.entitySystem.removeProjectile(this);
		}
	}
}