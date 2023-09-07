package batr.game.entity.entity.projectile {

	import batr.common.*;
	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.entity.*;
	import batr.game.model.*;
	import batr.game.main.*;

	export default class LaserPulse extends LaserBasic {
		//============Static Variables============//
		public static const LIFE: number = GlobalGameVariables.FIXED_TPS * 0.25;
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 4;
		public static const ALPHA: number = 1 / 0.75;

		//============Instance Variables============//
		public isPull: boolean = false;

		//============Constructor Function============//
		public LaserPulse(host: Game, x: number, y: number, owner: Player, length: uint = LENGTH, chargePercent: number = 1): void {
			super(host, x, y, owner, length, chargePercent);
			this._currentWeapon = WeaponType.PULSE_LASER;
			this._life = LaserPulse.LIFE;
			this.damage = this._currentWeapon.defaultDamage;
			this.dealCharge(chargePercent);
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.LASER_PULSE;
		}

		//============Instance Functions============//
		public override function onLaserTick(): void {
			if (!this.isDamaged)
				this._host.laserHurtPlayers(this);
			if (this.isPull) {
				this.scaleY = 1 + this._life / LaserPulse.LIFE;
				this.alpha = (2 - this.scaleY) * ALPHA;
			}
			else {
				this.scaleY = 2 - (this._life / LaserPulse.LIFE);
				this.alpha = (2 - this.scaleY) * ALPHA;
			}
		}

		protected override function dealCharge(percent: number): void {
			if (percent != 1)
				this.isPull = true;
		}

		public override function drawShape(): void {
			this.graphics.clear();
			for (var i: uint = 0; i < 2; i++) { // 0,1
				this.drawOwnerLine(-SIZE / Math.pow(2, i + 1),
					SIZE / Math.pow(2, i + 1),
					i * 0.1 + 0.2);
			}
		}
	}
}