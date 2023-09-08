package batr.game.entity.entity.projectile {

	import batr.general.*;

	import batr.game.entity.*;
	import batr.game.entity.entity.player.*;
	import batr.game.model.*;
	import batr.game.main.*;

	export default class LaserBasic extends ProjectileCommon {
		//============Static Variables============//
		public static readonly LIFE: number = GlobalGameVariables.FIXED_TPS;
		public static readonly SIZE: number = DEFAULT_SIZE / 2;
		public static readonly LENGTH: uint = 32; // EntityPos

		//============Instance Variables============//
		protected _life: uint = LIFE;
		public isDamaged: boolean = false;

		//============Constructor & Destructor============//
		public constructor(host: Game, x: number, y: number, owner: Player, length: number = LENGTH, chargePercent: number = 1) {
			super(host, x, y, owner);
			this._currentTool = ToolType.LASER;
			this.damage = this._currentTool.defaultDamage;
			this.scaleX = length;
			this.dealCharge(chargePercent);
			this.drawShape();
		}

		//============Destructor Function============//
		override destructor(): void {
			shape.graphics.clear();
			super.destructor();
		}

		//============Instance Getter And Setter============//
		override get type(): EntityType {
			return EntityType.LASER_BASIC;
		}

		public get length(): number {
			return this.scaleX;
		}

		public get life(): uint {
			return this._life;
		}

		//============Instance Functions============//
		override drawShape(): void {
			shape.graphics.clear();
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

		override onProjectileTick(): void {
			onLaserTick(); // Unturnable
			onLaserCommonTick(); // Unturnable
		}

		protected drawLine(y1: number, y2: number,
			color: uint = 0xffffff,
			alpha: number = 1): void {
			var yStart: number = Math.min(y1, y2);
			shape.graphics.beginFill(color, alpha);
			shape.graphics.drawRect(0, yStart,
				DEFAULT_SIZE,
				Math.max(y1, y2) - yStart);
			shape.graphics.endFill();
		}

		protected drawOwnerLine(y1: number, y2: number,
			alpha: number = 1): void {
			var yStart: number = Math.min(y1, y2);
			shape.graphics.beginFill(this.ownerColor, alpha);
			shape.graphics.drawRect(0, yStart,
				DEFAULT_SIZE,
				Math.max(y1, y2) - yStart);
			shape.graphics.endFill();
		}
	}
}