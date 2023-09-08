package batr.game.entity.entity.projectile {

	import batr.common.*;
	import batr.general.*;

	import batr.game.block.*;
	import batr.game.entity.entity.player.*;
	import batr.game.entity.entity.projectile.*;
	import batr.game.entity.*;
	import batr.game.model.*;
	import batr.game.main.*;

	import flash.display.*;
	import flash.geom.*;

	export default class ThrownBlock extends ProjectileCommon {
		//============Static Variables============//
		public static const MAX_SPEED: number = 15 / GlobalGameVariables.FIXED_TPS;
		public static const MIN_SPEED: number = 1 / 3 * MAX_SPEED;

		//============Instance Variables============//
		public xSpeed: number;
		public ySpeed: number;
		protected _carriedBlock: BlockCommon;

		//============Constructor Function============//
		public ThrownBlock(host: Game, x: number, y: number,
			owner: Player, block: BlockCommon,
			rot: uint, chargePercent: number = 1): void {
			super(host, x, y, owner);
			this._carriedBlock = block;

			this._currentWeapon = WeaponType.BLOCK_THROWER;
			this.xSpeed = GlobalRot.towardIntX(rot) * (MIN_SPEED + (MAX_SPEED - MIN_SPEED) * chargePercent);
			this.ySpeed = GlobalRot.towardIntY(rot) * (MIN_SPEED + (MAX_SPEED - MIN_SPEED) * chargePercent);
			this.damage = exMath.getDistance2(GlobalRot.towardIntX(rot, chargePercent), GlobalRot.towardIntY(rot, chargePercent)) * this._currentWeapon.defaultDamage;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			Utils.removeChildIfContains(this, this._carriedBlock);

			this._carriedBlock = null;

			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.THROWN_BLOCK;
		}

		public get carriedBlock(): BlockCommon {
			return this._carriedBlock;
		}

		//============Instance Functions============//
		//====Tick Function====//
		public override function onProjectileTick(): void {
			if (!this._host.isOutOfMap(this.entityX, this.entityY) &&
				this._host.testCanPass(
					this.lockedEntityX, this.lockedEntityY,
					false, true, false, false
				) && !this._host.isHitAnyPlayer(this.gridX, this.gridY)) {
				this.addXY(this.xSpeed, this.ySpeed);
			}
			else {
				if (Game.debugMode)
					trace('Block Hit:', this.getX(), this.getY());
				if (!this._host.isHitAnyPlayer(this.gridX, this.gridY))
					this.addXY(-this.xSpeed, -this.ySpeed);
				this.onBlockHit();
			}
		}

		protected onBlockHit(): void {
			// Locate
			var lx: int = this.lockedGridX, ly: int = this.lockedGridY;
			// Detect
			var lba: BlockAttributes = this.host.getBlockAttributes(lx, ly);
			// Hurt
			this._host.thrownBlockHurtPlayer(this);
			if (this.host.testBreakableWithMap(lba, this.host.map)) {
				// Place
				this._host.setBlock(lx, ly, this._carriedBlock);
				// Effect
				this.host.addBlockLightEffect2(
					PosTransform.alignToEntity(lx),
					PosTransform.alignToEntity(ly),
					this.carriedBlock, false
				);
			}
			else {
				// Effect
				this.host.addBlockLightEffect2(
					this.entityX, this.entityY,
					this.carriedBlock, false
				);
			}
			// Remove
			this._host.entitySystem.removeProjectile(this);
		}

		//====Graphics Functions====//
		public override function drawShape(): void {
			if (this._carriedBlock != null) {
				this._carriedBlock.x = -this._carriedBlock.width / 2;

				this._carriedBlock.y = -this._carriedBlock.height / 2;

				this.addChild(this._carriedBlock);
			}
		}
	}
}