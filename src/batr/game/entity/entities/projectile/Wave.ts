package batr.game.entity.entity.projectile {

	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.entity.entity.projectile.*;
	import batr.game.entity.*;
	import batr.game.model.*;
	import batr.game.main.*;

	import flash.display.*;
	import flash.geom.*;

	export default class Wave extends ProjectileCommon {
		//============Static Variables============//
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE;
		public static const ALPHA: number = 0.64;
		public static const DEFAULT_SPEED: number = 24 / GlobalGameVariables.FIXED_TPS;
		public static const MAX_SCALE: number = 4;
		public static const MIN_SCALE: number = 1 / 4;
		public static const LIFE: uint = GlobalGameVariables.FIXED_TPS * 4;
		public static const DAMAGE_DELAY: uint = GlobalGameVariables.FIXED_TPS / 12;

		//============Instance Variables============//
		public speed: number = DEFAULT_SPEED;

		public tempScale: number;

		protected life: uint = LIFE;

		protected _finalScale: number;

		//============Constructor Function============//
		public Wave(host: Game, x: number, y: number, owner: Player, chargePercent: number): void {
			super(host, x, y, owner);
			this._currentWeapon = WeaponType.WAVE;
			dealCharge(chargePercent);
			this.drawShape();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.WAVE;
		}

		public override function destructor(): void {
			this.graphics.clear();
		}

		public get finalScale(): number {
			return this._finalScale;
		}

		public set finalScale(value: number): void {
			this._finalScale = this.scaleX = this.scaleY = value;
		}

		//============Instance Functions============//
		public dealCharge(percent: number): void {
			this.tempScale = Wave.MIN_SCALE + (Wave.MAX_SCALE - Wave.MIN_SCALE) * percent;
			this.finalScale = this._owner == null ? tempScale : (1 + this._owner.computeFinalRadius(this.tempScale) / 2);
			this.damage = this._currentWeapon.defaultDamage * tempScale / Wave.MAX_SCALE;
		}

		//====Graphics Functions====//
		public override function drawShape(): void {
			var realRadius: number = SIZE / 2;

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
		public override function onProjectileTick(): void {
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