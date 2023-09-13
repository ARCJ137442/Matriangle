import { uint, int } from "../../../legacy/AS3Legacy";
import { IBatrDisplayable, IBatrShape } from "../../../display/api/BatrDisplayInterfaces";
import Game from "../main/Game.1";
import EffectType from "../registry/EffectRegistry";

export default class EffectCommon implements IBatrDisplayable {
	//============Static Variables============//
	protected static readonly DEFAULT_MAX_LIFE: uint = GlobalGameVariables.TPS;
	protected static _NEXT_UUID: uint = 0;

	//============Static Functions============//
	public static inValidUUID(effect: EffectCommon): boolean {
		return effect._uuid == 0;
	}

	//============Instance Variables============//
	protected _uuid: uint;
	protected _host: IBatrGame;
	protected _isActive: boolean;
	protected life: uint;
	protected LIFE: uint;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, maxLife: uint = EffectCommon.DEFAULT_MAX_LIFE, active: boolean = true) {
		// Init ID
		this._uuid = EffectCommon._NEXT_UUID++;
		// Init Host
		this._host = host;
		// Set Life
		this.LIFE = maxLife;
		this.life = this.LIFE;
		// Init Positions
		this.setPositions(x, y);
		// Active
		this.isActive = active;
	}
	shapeRefresh(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	shapeDestruct(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}

	public destructor(): void {
		shape.graphics.clear();
		this._uuid = 0;
		this.isActive = false;
		this.life = this.LIFE = 0;
		this._host = null;
	}

	//============Instance Getters And Setters============//
	public get uuid(): uint {
		return this._uuid;
	}

	public get host(): Game {
		return this._host;
	}

	public get isActive(): boolean {
		return this._isActive;
	}

	public set isActive(value: boolean) {
		if (value == this._isActive)
			return;
		this._isActive = value;
	}

	public get rot(): number {
		return GlobalRot.fromRealRot(this.rotation);
	}

	public set rot(value: number) {
		if (value == this.rot)
			return;
		this.rotation = GlobalRot.toRealRot(value);
	}

	public get type(): EffectType {
		return EffectType.ABSTRACT;
	}

	public get layer(): int {
		return this.type.effectLayer;
	}

	//============Display Implements============//
	public onEffectTick(): void {
	}

	protected dealLife(): void {
		if (this.life > 0)
			this.life--;
		else
			this._host.effectSystem.removeEffect(this);
	}

	public shapeInit(shape: IBatrShape): void {
	}

	//====Position Functions====//
	public getX(): number {
		return PosTransform.realPosToLocalPos(this.x);
	}

	public getY(): number {
		return PosTransform.realPosToLocalPos(this.y);
	}

	public setX(value: number): void {
		this.x = PosTransform.localPosToRealPos(value);
	}

	public setY(value: number): void {
		this.y = PosTransform.localPosToRealPos(value);
	}

	public addX(value: number): void {
		this.setX(this.getX() + value);
	}

	public addY(value: number): void {
		this.setY(this.getY() + value);
	}

	public setXY(x: number, y: number): void {
		this.setX(x);

		this.setY(y);
	}

	public addXY(x: number, y: number): void {
		this.addX(x);

		this.addY(y);
	}

	public setPositions(x: number, y: number, rot: number = NaN): void {
		this.setXY(x, y);

		if (!isNaN(rot))
			this.rot = rot;
	}

	public addPositions(x: number, y: number, rot: number = NaN): void {
		this.addXY(x, y);

		if (!isNaN(rot))
			this.rot += rot;
	}
}