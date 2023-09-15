
import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import EntityType from "../../../registry/EntityRegistry";
import Player from "../../player/Player";
import Projectile from "../Projectile";

/**
 * TODO: 【2023-09-16 3:49:55】重构从这里开始
 * 一切激光抛射体的基类
 * 
 */
export default class LaserBasic extends Projectile {
	//============Static Variables============//
	public static readonly LIFE: number = GlobalGameVariables.FIXED_TPS;
	public static readonly SIZE: number = DEFAULT_SIZE / 2;
	public static readonly LENGTH: uint = 32; // EntityPos

	//============Instance Variables============//
	protected _life: uint = LIFE;
	public isDamaged: boolean = false;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player | null, length: number = LENGTH, chargePercent: number = 1) {
		super(host, x, y, owner);
		this.ownerTool = ToolType.LASER;
		this.damage = this.ownerTool.defaultDamage;
		this.scaleX = length;
		this.dealCharge(chargePercent);
		this.drawShape();
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.LASER_BASIC;
	}

	public get length(): number {
		return this.scaleX;
	}

	public get life(): uint {
		return this._life;
	}

	//============Instance Functions============//
	override drawShape(): void {
		shape.graphics.clear();
		for (let i: uint = 0; i < 3; i++) { // 0,1,2
			this.drawOwnerLine(-SIZE / Math.pow(2, i + 1), SIZE / Math.pow(2, i + 1), i * 0.1 + 0.5);
		}
	}

	protected dealCharge(percent: number): void {
		if (percent == 1)
			return;
		this.damage *= percent;
		this._life = LIFE * percent;
	}

	public dealLife(): void {
		if (this._life > 0)
			this._life--;
		else
			this._host.entitySystem.removeProjectile(this);
	}

	public onLaserCommonTick(): void {
		dealLife();
	}

	public onLaserTick(): void {
		if (!this.isDamaged)
			this._host.laserHurtPlayers(this);
		this.scaleY = _life / LIFE;
	}

	override onProjectileTick(): void {
		onLaserTick(); // Unrotatable
		onLaserCommonTick(); // Unrotatable
	}

	protected drawLine(y1: number, y2: number,
		color: uint = 0xffffff,
		alpha: number = 1): void {
		let yStart: number = Math.min(y1, y2);
		shape.graphics.beginFill(color, alpha);
		shape.graphics.drawRect(0, yStart,
			DEFAULT_SIZE,
			Math.max(y1, y2) - yStart);
		shape.graphics.endFill();
	}

	protected drawOwnerLine(y1: number, y2: number,
		alpha: number = 1): void {
		let yStart: number = Math.min(y1, y2);
		shape.graphics.beginFill(this.ownerColor, alpha);
		shape.graphics.drawRect(0, yStart,
			DEFAULT_SIZE,
			Math.max(y1, y2) - yStart);
		shape.graphics.endFill();
	}
}