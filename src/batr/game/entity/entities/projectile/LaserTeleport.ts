package batr.game.entity.entity.projectile {

	import batr.general.*;

	import batr.game.entity.entity.player.*;
	import batr.game.entity.*;
	import batr.game.model.*;
	import batr.game.main.*;

	export default class LaserTeleport extends LaserBasic {
		//============Static Variables============//
		public static const LIFE: number = GlobalGameVariables.FIXED_TPS * 0.5;
		public static const SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 4;

		//============Constructor Function============//
		public LaserTeleport(host: Game, x: number, y: number, owner: Player, length: uint = LENGTH): void {
			super(host, x, y, owner, length);
			this._currentWeapon = WeaponType.TELEPORT_LASER;
			this.damage = this._currentWeapon.defaultDamage;
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.LASER_TELEPORT;
		}

		//============Instance Functions============//
		public override function onLaserTick(): void {
			this.alpha = (this._life & 3) < 2 ? 0.75 : 1;
			if (_life < 1 / 4 * LIFE)
				this.scaleY = (1 / 4 * LIFE - _life) / (1 / 4 * LIFE);
			else if ((this._life & 3) == 0)
				this._host.laserHurtPlayers(this);
		}

		public override function drawShape(): void {
			graphics.clear();

			// Middle
			drawOwnerLine(-SIZE / 2, SIZE / 2, 0.25);
			// Side
			drawOwnerLine(-SIZE / 2, -SIZE / 4, 0.6);
			drawOwnerLine(SIZE / 4, SIZE / 2, 0.6);
		}
	}
}