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

	export default class BulletBasic extends ProjectileCommon {
		//============Static Variables============//
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 80;
		public static const SIZE: number = PosTransform.localPosToRealPos(3 / 8);
		public static const DEFAULT_SPEED: number = 16 / GlobalGameVariables.FIXED_TPS;
		public static const DEFAULT_EXPLODE_RADIUS: number = 1;

		//============Instance Variables============//
		public speed: number;
		public finalExplodeRadius: number;
		// Entity Pos

		public lastBlockType: BlockType = BlockType.NULL;
		public nowBlockType: BlockType = BlockType.NULL;

		//============Constructor Function============//
		public BulletBasic(host: Game, x: number, y: number,
			owner: Player,
			speed: number = DEFAULT_SPEED,
			defaultExplodeRadius: number = DEFAULT_EXPLODE_RADIUS): void {
			super(host, x, y, owner);
			this.speed = speed;

			this.finalExplodeRadius = owner == null ? defaultExplodeRadius : owner.computeFinalRadius(defaultExplodeRadius);
			this._currentWeapon = WeaponType.BULLET;

			this.damage = this._currentWeapon.defaultDamage;
			this.drawShape();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			this.graphics.clear();
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.BULLET_BASIC;
		}

		//============Instance Functions============//

		//====Tick Function====//
		public override function onProjectileTick(): void {
			this.onBulletTick();

			this.onBulletCommonTick();
		}

		public onBulletCommonTick(): void {
			// Move
			// Detect
			if (this._host == null)
				return;
			this.nowBlockType = this._host.getBlockType(this.gridX, this.gridY);
			if (this.lastBlockType != this.nowBlockType) {
				// Random rotate
				if (this.nowBlockType != null &&
					this.nowBlockType.currentAttributes.rotateWhenMoveIn) {
					this.rot += exMath.random1();
				}
			}
			this.moveForward(this.speed);

			if (!_host.isOutOfMap(this.entityX, this.entityY) &&
				this._host.testCanPass(this.entityX, this.entityY, false, true, false)) {
				this.lastBlockType = this.nowBlockType;
			}
			else {
				this.explode();
			}
		}

		public onBulletTick(): void {
		}

		protected explode(): void {
			this._host.weaponCreateExplode(this.entityX, this.entityY, this.finalExplodeRadius, this.damage, this, 0xffff00, 1);
			this._host.entitySystem.removeProjectile(this);
		}

		//====Graphics Functions====//
		public override function drawShape(): void {
			var realRadiusX: number = SIZE / 2;

			var realRadiusY: number = SIZE / 2;

			with (this.graphics) {
				clear();
				lineStyle(LINE_SIZE, this.ownerLineColor);
				beginFill(this.ownerColor);
				/* GRADIENT-FILL REMOVED
				var m:Matrix=new Matrix()
				m.createGradientBox(SIZE,
									SIZE,0,-realRadiusX,-realRadiusX)
				beginGradientFill(GradientType.LINEAR,
				[this.ownerColor,ownerLineColor],
				[1,1],
				[63,255],
				m,
				SpreadMethod.PAD,
				InterpolationMethod.RGB,
				1)
				*/
				moveTo(-realRadiusX, -realRadiusY);
				lineTo(realRadiusX, 0);
				lineTo(-realRadiusX, realRadiusY);
				lineTo(-realRadiusX, -realRadiusY);
				endFill();
			}
		}
	}
}
