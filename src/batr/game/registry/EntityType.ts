﻿package batr.game.entity {

	import batr.common.*;
	import batr.general.*;

	export default class EntityType extends TypeCommon {
		//============Static Variables============//
		public static const NULL: EntityType = null;
		public static const ABSTRACT: EntityType = new EntityType('Abstract');

		public static const BULLET_BASIC: EntityType = new EntityType('BulletBasic');
		public static const BULLET_NUKE: EntityType = new EntityType('BulletNuke');
		public static const SUB_BOMBER: EntityType = new EntityType('SubBomber');
		public static const BULLET_TRACKING: EntityType = new EntityType('TrackingBullet');

		public static const LASER_BASIC: EntityType = new EntityType('LaserBasic');
		public static const LASER_PULSE: EntityType = new EntityType('LaserPulse');
		public static const LASER_TELEPORT: EntityType = new EntityType('LaserTeleport');
		public static const LASER_ABSORPTION: EntityType = new EntityType('LaserAbsorption');
		public static const WAVE: EntityType = new EntityType('Wave');
		public static const THROWN_BLOCK: EntityType = new EntityType('ThrownBlock');
		public static const LIGHTNING: EntityType = new EntityType('Lightning').asUnrotatable;
		public static const SHOCKWAVE_LASER_BASE: EntityType = new EntityType('ShockLaserBase');

		public static const SHOCKWAVE_LASER_DRONE: EntityType = new EntityType('ShockLaserDrone');

		public static const BONUS_BOX: EntityType = new EntityType('BonusBox');

		public static const PLAYER: EntityType = new EntityType('Player');

		public static const AI_PLAYER: EntityType = new EntityType('AIPlayer');

		public static const _BULLETS: EntityType[] = new < EntityType > [EntityType.BULLET_BASIC, EntityType.BULLET_NUKE, EntityType.SUB_BOMBER, EntityType.BULLET_TRACKING];
		public static const _LASERS: EntityType[] = new < EntityType > [EntityType.LASER_BASIC, EntityType.LASER_PULSE, EntityType.LASER_TELEPORT, EntityType.LASER_ABSORPTION];
		public static const _WAVES: EntityType[] = new < EntityType > [EntityType.WAVE];

		public static const _PROJECTILES: EntityType[] = new < EntityType > [EntityType.SHOCKWAVE_LASER_BASE, EntityType.SHOCKWAVE_LASER_DRONE, EntityType.WAVE, EntityType.THROWN_BLOCK].concat(EntityType._BULLETS, EntityType._LASERS);
		public static const _ALL_ENTITY: EntityType[] = new < EntityType > [EntityType.PLAYER, EntityType.BONUS_BOX].concat(EntityType._PROJECTILES);

		//============Static Getter And Setter============//
		public static function get RANDOM(): EntityType {
			return _ALL_ENTITY[exMath.random(_ALL_ENTITY.length)];

		}

		//============Static Functions============//
		public static function fromString(str: string): EntityType {
			for (var type of EntityType._ALL_ENTITY) {
				if (type.name == str)
					return type;

			}
			return NULL;

		}

		public static function isIncludeIn(type: EntityType, types: EntityType[]): boolean {
			for (var type2 of types) {
				if (type === type2)
					return true;
			}
			return false;
		}

		//============Constructor Function============//
		public EntityType(name: string): void {
			super(name);
		}

		//============Instance Variables============//
		protected _rotatable: boolean = true;

		//============Instance Getter And Setter============//
		public override function get label(): string {
			return 'entity';
		}

		public get rotatable(): boolean {
			return this._rotatable;
		}

		public get asUnrotatable(): EntityType {
			this._rotatable = false;
			return this;
		}
	}
}