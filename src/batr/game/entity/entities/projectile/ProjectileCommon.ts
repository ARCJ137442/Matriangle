package batr.game.entity.entity.projectile {

	import batr.game.entity.entity.player.*;
	import batr.game.entity.*;
	import batr.game.model.*;
	import batr.game.main.*;

	export default class ProjectileCommon extends EntityCommon {
		//============Instance Variables============//
		protected _owner: Player;
		protected _currentWeapon: WeaponType;

		public damage: uint;

		//============Constructor Function============//
		public function ProjectileCommon(host: Game, x: Number, y: Number, owner: Player): void {
			super(host, x, y);
			this._owner = owner;
			this._currentWeapon = WeaponType.ABSTRACT;
		}

		//============Instance Getter And Setter============//
		public override function get type(): EntityType {
			return EntityType.ABSTRACT;
		}

		public function get owner(): Player {
			return this._owner;
		}

		public function set owner(value: Player): void {
			this._owner = value;
			this.drawShape();
		}

		public function get currentWeapon(): WeaponType {
			return this._currentWeapon;
		}

		public function get ownerColor(): uint {
			return this._owner == null ? 0 : this._owner.fillColor;
		}

		public function get ownerLineColor(): uint {
			return this._owner == null ? 0 : this._owner.lineColor;
		}

		//============Instance Functions============//
		public override function destructor(): void {
			this._owner = null;
			this._currentWeapon = null;
			super.destructor();
		}

		public override function tickFunction(): void {
			this.onProjectileTick();
			super.tickFunction();
		}

		public function onProjectileTick(): void {

		}

		public function drawShape(): void {

		}
	}
}