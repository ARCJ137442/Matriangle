
// import batr.common.*;
// import batr.general.*;

// import batr.game.main.*;

// import flash.display.Sprite;

/**
 * ABSTRACT
 * @author ARCJ137442
 */
export default class EntityCommon extends Sprite {
	//============Static Variables============//

	//============Static Functions============//

	//============Instance Variables============//
	protected _host: IBatrGame;
	protected _isActive: boolean;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame,
		x: number, y: number,
		initActive: boolean = true): void {
		super();
		// Init Host
		this._host = host;
		// Init Positions
		this.setXY(x, y);
		// Be Active
		if (initActive)
			this.isActive = true;
	}

	//============Destructor Function============//
	public destructor(): void {
		this.isActive = false;
		this._host = null;
	}

	//============Instance Getters And Setters============//
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
		return GlobalRot.lockToStandard(GlobalRot.fromRealRot(this.rotation));
	}

	public set rot(value: number) {
		if (value != this.rot)
			this.rotation = GlobalRot.toRealRot(GlobalRot.lockToStandard(value));
		this.onRotationUpdate(this.rot);
		this.onPositionUpdate(this.entityX, this.entityY, this.rot);
	}

	public get type(): EntityType {
		return EntityType.ABSTRACT;
	}

	public get entityX(): number {
		return this.getX();
	}

	public get entityY(): number {
		return this.getY();
	}

	/**
	 * Return a Integer than entityX
	 */
	public get gridX(): int {
		return PosTransform.alignToGrid(this.getX());
	}

	/**
	 * Return a Integer than entityY
	 */
	public get gridY(): int {
		return PosTransform.alignToGrid(this.getY());
	}

	/**
	 * Return a Point Contains gridX,gridY
	 */
	public get gridPoint(): iPoint {
		return new iPoint(this.gridX, this.gridY);
	}

	public get lockedEntityX(): number {
		return this._host.lockPosInMap(this.entityX, true);
	}

	public get lockedEntityY(): number {
		return this._host.lockPosInMap(this.entityY, false);
	}

	public get lockedGridX(): number {
		return this._host.lockPosInMap(this.gridX, true);
	}

	public get lockedGridY(): number {
		return this._host.lockPosInMap(this.gridY, false);
	}

	//============Instance Functions============//
	//====Tick Functions====//
	public tickFunction(): void {
	}

	//====Position Functions====//
	public getX(): number {
		return PosTransform.realPosToLocalPos(this.x);
	}

	public getY(): number {
		return PosTransform.realPosToLocalPos(this.y);
	}

	public setX(value: number, update: boolean = true): void {
		// if(value==this.getX()) return;
		if (update)
			this.preLocationUpdate(this.entityX, this.entityY);
		this.x = PosTransform.localPosToRealPos(value);
		if (!update)
			return;
		this.onLocationUpdate(value, this.entityY);
		this.onPositionUpdate(value, this.entityY, this.rot);
	}

	public setY(value: number, update: boolean = true): void {
		// if(value==this.getY()) return;
		if (update)
			this.preLocationUpdate(this.entityX, this.entityY);
		this.y = PosTransform.localPosToRealPos(value);
		if (!update)
			return;
		this.onLocationUpdate(this.entityX, value);
		this.onPositionUpdate(this.entityX, value, this.rot);
	}

	public addX(value: number): void {
		this.setX(this.getX() + value);
	}

	public addY(value: number): void {
		this.setY(this.getY() + value);
	}

	public setXY(x: number, y: number, update: boolean = true): void {
		if (update)
			this.preLocationUpdate(this.entityX, this.entityY);
		this.setX(x, false);
		this.setY(y, false);
		if (!update)
			return;
		this.onLocationUpdate(x, y);
		this.onPositionUpdate(x, y, this.rot);
	}

	public addXY(x: number, y: number, update: boolean = true): void {
		this.setXY(this.getX() + x, this.getY() + y, update);
	}

	public setPositions(x: number, y: number, rot: number): void {
		this.preLocationUpdate(this.entityX, this.entityY);
		this.setXY(x, y, false);
		if (GlobalRot.isValidRot(rot))
			this.rot = rot;
		this.onLocationUpdate(x, y);
		this.onPositionUpdate(x, y, rot);
	}

	public addPositions(x: number, y: number, rot: number = NaN): void {
		this.preLocationUpdate(this.entityX, this.entityY);
		this.addXY(x, y, false);
		if (!isNaN(rot))
			this.rot = GlobalRot.rotate(this.rot, rot);
		this.onLocationUpdate(x, y);
		this.onPositionUpdate(x, y, rot);
	}

	public getFrontX(distance: number = 1): number {
		return this.getX() + GlobalRot.towardX(this.rot);
	}

	public getFrontY(distance: number = 1): number {
		return this.getY() + GlobalRot.towardY(this.rot);
	}

	public getFrontAsRotX(asRot: number, distance: number = 1): number {
		return this.getX() + GlobalRot.towardX(asRot, distance);
	}

	public getFrontAsRotY(asRot: number, distance: number = 1): number {
		return this.getY() + GlobalRot.towardY(asRot, distance);
	}

	public getFrontIntX(distance: number = 1, rotatedAsRot: uint = 5): number {
		return this.getX() + GlobalRot.towardIntX(rotatedAsRot > 4 ? this.rot : rotatedAsRot, distance);
	}

	public getFrontIntY(distance: number = 1, rotatedAsRot: uint = 5): number {
		return this.getY() + GlobalRot.towardIntY(rotatedAsRot > 4 ? this.rot : rotatedAsRot, distance);
	}

	public getFrontXInt(distance: int = 1, rotatedAsRot: uint = 5): int {
		return this.getX() + GlobalRot.towardXInt(rotatedAsRot > 4 ? this.rot : rotatedAsRot, distance);
	}

	public getFrontYInt(distance: int = 1, rotatedAsRot: uint = 5): int {
		return this.getY() + GlobalRot.towardYInt(rotatedAsRot > 4 ? this.rot : rotatedAsRot, distance);
	}

	public moveForward(distance: number = 1): void {
		this.addXY(GlobalRot.towardX(this.rot, distance), GlobalRot.towardY(this.rot, distance));
	}

	public moveIntForward(distance: number = 1): void {
		this.addXY(GlobalRot.towardIntX(this.rot, distance),
			GlobalRot.towardIntY(this.rot, distance));
	}

	public moveForwardInt(distance: int = 1): void {
		this.addXY(GlobalRot.towardXInt(this.rot, distance),
			GlobalRot.towardYInt(this.rot, distance));
	}

	// Hook Functions
	public onPositionUpdate(newX: number, newY: number, newRot: number): void {
	}

	public onLocationUpdate(newX: number, newY: number): void {
	}

	public preLocationUpdate(oldX: number, oldY: number): void {
	}

	public onRotationUpdate(newRot: number): void {
	}
}
