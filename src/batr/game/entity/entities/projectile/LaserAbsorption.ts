package batr.game.entity.entity.projectile {

	import batr.general.*;
	import batr.game.model.*;
	import batr.game.main.*;

	import batr.game.entity.entity.player.*;
	import batr.game.entity.*;

	export default class LaserAbsorption extends LaserBasic {
		//============Static Variables============//
		public static const LIFE: number = GlobalGameVariables.TPS;
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 4;
		public static const SCALE_V: number = 1 / 4;

		//============Instance Variables============//
		protected scaleReverse: boolean = true;

		//============Constructor Function============//
		public LaserAbsorption(host: Game, x: number, y: number, owner: Player, length: uint = LENGTH): void {
			super(host, x, y, owner, length);
			this._currentWeapon = WeaponType.ABSORPTION_LASER;
			this.damage = this._currentWeapon.defaultDamage;
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.LASER_ABSORPTION;
		}

		//============Instance Functions============//
		public override function onLaserTick(): void {
			this.scaleY += SCALE_V * (scaleReverse ? -1 : 1);
			if (this.scaleY >= 1) {
				scaleReverse = true;

				this._host.laserHurtPlayers(this);
			}
			else if (this.scaleY <= -1)
				scaleReverse = false;
		}

		public override function drawShape(): void {
			graphics.clear();

			// Left
			drawOwnerLine(-SIZE / 2, -SIZE / 4, 0.6);
			drawOwnerLine(-SIZE / 2, -SIZE / 8, 0.5);
			// Right
			drawOwnerLine(SIZE / 4, SIZE / 2, 0.6);

			drawOwnerLine(SIZE / 8, SIZE / 2, 0.5);
		}
	}
}