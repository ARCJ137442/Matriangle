package batr.game.entity.entity.projectile {

	import batr.general.*;
	import batr.common.*;

	import batr.game.block.*;
	import batr.game.entity.*;
	import batr.game.entity.entity.player.*;
	import batr.game.model.*;
	import batr.game.main.*;

	import flash.display.*;
	import flash.geom.*;

	export default class ShockWaveDrone extends ProjectileCommon {
		//============Static Variables============//
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 80;
		public static const BLOCK_RADIUS: number = GlobalGameVariables.DEFAULT_SIZE / 2;

		public static const MOVING_INTERVAL: uint = GlobalGameVariables.FIXED_TPS * 0.0625;

		//============Instance Variables============//
		public lastBlockType: BlockType = BlockType.NULL;
		public nowBlockType: BlockType = BlockType.NULL;

		protected _weapon: WeaponType;
		protected _weaponChargePercent: number;

		protected _weaponRot: uint;
		protected _moveDuration: uint = 0;

		//============Constructor Function============//
		public ShockWaveDrone(host: Game, x: number, y: number, owner: Player, weapon: WeaponType, weaponRot: uint, weaponChargePercent: number): void {
			super(host, x, y, owner);
			this._currentWeapon = WeaponType.SHOCKWAVE_ALPHA;
			this._weapon = weapon;
			this._weaponChargePercent = weaponChargePercent;
			this._weaponRot = weaponRot;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this.graphics.clear();
			this._weapon = null;
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.SHOCKWAVE_LASER_DRONE;
		}

		//============Instance Functions============//

		//====Tick Function====//
		public override function onProjectileTick(): void {
			if (this._host == null)
				return;
			// Ticking
			if (this._moveDuration > 0)
				this._moveDuration--;
			else {
				this._moveDuration = ShockWaveDrone.MOVING_INTERVAL;
				// Moving
				this.moveForwardInt(1);
				var ex: number = this.entityX;
				var ey: number = this.entityY;
				if (_host.isOutOfMap(ex, ey) || !this._host.testCanPass(ex, ey, false, true, false)) {
					// Gone
					this._host.entitySystem.removeProjectile(this);
				}
				// Use Weapon
				else
					this.host.playerUseWeaponAt(this.owner, this._weapon,
						ex + GlobalRot.towardIntX(this._weaponRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE),
						ey + GlobalRot.towardIntY(this._weaponRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE),
						this._weaponRot, this._weaponChargePercent, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			}
		}

		//====Graphics Functions====//
		public override function drawShape(): void {
			this.graphics.beginFill(this.ownerColor, 0.5);
			this.graphics.drawRect(-BLOCK_RADIUS, -BLOCK_RADIUS, BLOCK_RADIUS * 2, BLOCK_RADIUS * 2);
			this.graphics.drawRect(-BLOCK_RADIUS / 2, -BLOCK_RADIUS / 2, BLOCK_RADIUS, BLOCK_RADIUS);
			this.graphics.endFill();
		}
	}
}
