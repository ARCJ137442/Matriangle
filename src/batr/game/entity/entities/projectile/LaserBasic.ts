package batr.game.entity.entity.projectile {

	import batr.general.*;

	import batr.game.entity.*;
	import batr.game.entity.entity.player.*;
	import batr.game.model.*;
	import batr.game.main.*;

	export default class LaserBasic extends ProjectileCommon {
		//============Static Variables============//
		public static const LIFE: number = GlobalGameVariables.FIXED_TPS;
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 2;
		public static const LENGTH: uint = 32; // EntityPos

		//============Instance Variables============//
		protected _life: uint = LIFE;
		public isDamaged: boolean = false;

		//============Constructor Function============//
		public LaserBasic(host: Game, x: number, y: number, owner: Player, length: number = LENGTH, chargePercent: number = 1): void {
			super(host, x, y, owner);
			this._currentWeapon = WeaponType.LASER;
			this.damage = this._currentWeapon.defaultDamage;
			this.scaleX = length;
			this.dealCharge(chargePercent);
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this.graphics.clear();
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.LASER_BASIC;
		}

		public get length(): number {
			return this.scaleX;
		}

		public get life(): uint {
			return this._life;
		}

		//============Instance Functions============//
		public override function drawShape(): void {
			this.graphics.clear();
			for (var i: uint = 0; i < 3; i++) { // 0,1,2
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

		public override function onProjectileTick(): void {
			onLaserTick(); // Unturnable
			onLaserCommonTick(); // Unturnable
		}

		protected drawLine(y1: number, y2: number,
			color: uint = 0xffffff,
			alpha: number = 1): void {
			var yStart: number = Math.min(y1, y2);
			this.graphics.beginFill(color, alpha);
			this.graphics.drawRect(0, yStart,
				GlobalGameVariables.DEFAULT_SIZE,
				Math.max(y1, y2) - yStart);
			this.graphics.endFill();
		}

		protected drawOwnerLine(y1: number, y2: number,
			alpha: number = 1): void {
			var yStart: number = Math.min(y1, y2);
			this.graphics.beginFill(this.ownerColor, alpha);
			this.graphics.drawRect(0, yStart,
				GlobalGameVariables.DEFAULT_SIZE,
				Math.max(y1, y2) - yStart);
			this.graphics.endFill();
		}
	}
}