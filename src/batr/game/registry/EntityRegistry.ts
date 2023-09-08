
// import batr.common.*;
// import batr.general.*;

import { NULL } from "../../general/GlobalRot";
import TypeCommon from "../template/TypeCommon";

export default class EntityType extends TypeCommon {
	//============Static Variables============//
	public static readonly NULL: EntityType = null;
	public static readonly ABSTRACT: EntityType = new EntityType('Abstract');

	public static readonly BULLET_BASIC: EntityType = new EntityType('BulletBasic');
	public static readonly BULLET_NUKE: EntityType = new EntityType('BulletNuke');
	public static readonly SUB_BOMBER: EntityType = new EntityType('SubBomber');
	public static readonly BULLET_TRACKING: EntityType = new EntityType('TrackingBullet');

	public static readonly LASER_BASIC: EntityType = new EntityType('LaserBasic');
	public static readonly LASER_PULSE: EntityType = new EntityType('LaserPulse');
	public static readonly LASER_TELEPORT: EntityType = new EntityType('LaserTeleport');
	public static readonly LASER_ABSORPTION: EntityType = new EntityType('LaserAbsorption');
	public static readonly WAVE: EntityType = new EntityType('Wave');
	public static readonly THROWN_BLOCK: EntityType = new EntityType('ThrownBlock');
	public static readonly LIGHTNING: EntityType = new EntityType('Lightning').asUnrotatable;
	public static readonly SHOCKWAVE_LASER_BASE: EntityType = new EntityType('ShockLaserBase');

	public static readonly SHOCKWAVE_LASER_DRONE: EntityType = new EntityType('ShockLaserDrone');

	public static readonly BONUS_BOX: EntityType = new EntityType('BonusBox');

	public static readonly PLAYER: EntityType = new EntityType('Player');

	public static readonly AI_PLAYER: EntityType = new EntityType('AIPlayer');

	public static readonly _BULLETS: EntityType[] = new Array<EntityType>(EntityType.BULLET_BASIC, EntityType.BULLET_NUKE, EntityType.SUB_BOMBER, EntityType.BULLET_TRACKING);
	public static readonly _LASERS: EntityType[] = new Array<EntityType>(EntityType.LASER_BASIC, EntityType.LASER_PULSE, EntityType.LASER_TELEPORT, EntityType.LASER_ABSORPTION);
	public static readonly _WAVES: EntityType[] = new Array<EntityType>(EntityType.WAVE);

	public static readonly _PROJECTILES: EntityType[] = new Array<EntityType>(EntityType.SHOCKWAVE_LASER_BASE, EntityType.SHOCKWAVE_LASER_DRONE, EntityType.WAVE, EntityType.THROWN_BLOCK).concat(EntityType._BULLETS, EntityType._LASERS);
	public static readonly _ALL_ENTITY: EntityType[] = new Array<EntityType>(EntityType.PLAYER, EntityType.BONUS_BOX).concat(EntityType._PROJECTILES);

	//============Static Getter And Setter============//
	public static get RANDOM(): EntityType {
		return _ALL_ENTITY[exMath.random(_ALL_ENTITY.length)];
	}

	//============Static Functions============//
	public static fromString(str: string): EntityType {
		for (var type of EntityType._ALL_ENTITY) {
			if (type.name == str)
				return type;
		}
		return NULL;
	}

	public static isIncludeIn(type: EntityType, types: EntityType[]): boolean {
		for (var type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Constructor & Destructor============//
	public constructor(name: string) {
		super(name);
	}

	//============Instance Variables============//
	protected _rotatable: boolean = true;

	//============Instance Getter And Setter============//
	override get label(): string {
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