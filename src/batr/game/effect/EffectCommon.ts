package batr.game.effect {

	import batr.general.*;

	import batr.game.main.*;

	import flash.display.*;

	export default class EffectCommon extends MovieClip {
		//============Static Variables============//
		protected static const DEFAULE_MAX_LIFE: uint = GlobalGameVariables.TPS;
		protected static var _NEXT_UUID: uint = 0;

		//============Static Functions============//
		public static function inValidUUID(effect: EffectCommon): boolean {
			return effect._uuid == 0;
		}

		//============Instance Variables============//
		protected _uuid: uint;
		protected _host: Game;
		protected _isActive: boolean;
		protected life: uint;
		protected LIFE: uint;

		//============Constructor Function============//
		public EffectCommon(host: Game, x: number, y: number, maxLife: uint = DEFAULE_MAX_LIFE, active: boolean = true): void {
			super();
			// Init ID
			this._uuid = _NEXT_UUID;
			_NEXT_UUID++;
			// Init Host
			this._host = host;
			// Set Life
			this.LIFE = maxLife;
			this.life = LIFE;
			// Init Positions
			this.setPositions(x, y);
			// Active
			this.isActive = active;
		}

		//============Destructor Function============//
		public destructor(): void {
			this.graphics.clear();
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

		public set isActive(value: boolean): void {
			if (value == this._isActive)
				return;
			this._isActive = value;
		}

		public get rot(): number {
			return GlobalRot.fromRealRot(this.rotation);
		}

		public set rot(value: number): void {
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

		//============Instance Functions============//
		public onEffectTick(): void {

		}

		protected dealLife(): void {
			if (this.life > 0)
				this.life--;
			else
				_host.effectSystem.removeEffect(this);
		}

		public drawShape(): void {

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
}
