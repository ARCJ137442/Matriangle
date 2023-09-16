import EntityType from "../../../api/entity/EntityType";
import BonusBox from "../entities/item/BonusBox";
import Player from "../entities/player/Player";
import Lightning from "../entities/projectile/Lightning";
import ShockWaveBase from "../entities/projectile/ShockWaveBase";
import ShockWaveDrone from "../entities/projectile/ShockWaveDrone";
import ThrownBlock from "../entities/projectile/ThrownBlock";
import Wave from "../entities/projectile/Wave";
import BulletBasic from "../entities/projectile/bullet/BulletBasic";
import BulletBomber from "../entities/projectile/bullet/BulletBomber";
import BulletNuke from "../entities/projectile/bullet/BulletNuke";
import BulletTracking from "../entities/projectile/bullet/BulletTracking";
import LaserAbsorption from "../entities/projectile/laser/LaserAbsorption";
import LaserBasic from "../entities/projectile/laser/LaserBasic";
import LaserPulse from "../entities/projectile/laser/LaserPulse";
import LaserTeleport from "../entities/projectile/laser/LaserTeleport";

/**
 * 用于识别的「实体类型」
 * * 存储与「实体类」有关的元信息
 * 
 * ! 这应该是静态的：即「一个『类型实例』对应多个『实体实例』的引用」
 */
export module NativeEntityTypes {
	//============Registry============//

	// 子弹 // ! 现在统一「名称」与其对应类名相同（虽然后续可以改）
	export const BULLET_BASIC: EntityType = new EntityType(BulletBasic);
	export const BULLET_NUKE: EntityType = new EntityType(BulletNuke);
	export const BULLET_BOMBER: EntityType = new EntityType(BulletBomber);
	export const BULLET_TRACKING: EntityType = new EntityType(BulletTracking);

	// 激光
	export const LASER_BASIC: EntityType = new EntityType(LaserBasic);
	export const LASER_PULSE: EntityType = new EntityType(LaserPulse);
	export const LASER_TELEPORT: EntityType = new EntityType(LaserTeleport);
	export const LASER_ABSORPTION: EntityType = new EntityType(LaserAbsorption);

	// 其它
	export const WAVE: EntityType = new EntityType(Wave);
	export const THROWN_BLOCK: EntityType = new EntityType(ThrownBlock);
	export const LIGHTNING: EntityType = new EntityType(Lightning);

	// 冲击波（子机）相关
	export const SHOCKWAVE_BASE: EntityType = new EntityType(ShockWaveBase);
	export const SHOCKWAVE_DRONE: EntityType = new EntityType(ShockWaveDrone);

	// 奖励箱
	export const BONUS_BOX: EntityType = new EntityType(BonusBox);

	// 玩家
	export const PLAYER: EntityType = new EntityType(Player);
	// export const AI_PLAYER: EntityType = new EntityType(AIPlayer); // TODO: 计划不再区分，把「AI玩家」认为是「玩家」的一种多态

	export const _ALL_ENTITY: EntityType[] = [
		// 子弹
		BULLET_BASIC,
		BULLET_NUKE,
		BULLET_BOMBER,
		BULLET_TRACKING,
		// 激光
		LASER_BASIC,
		LASER_PULSE,
		LASER_TELEPORT,
		LASER_ABSORPTION,
		// 其它抛射体
		WAVE,
		THROWN_BLOCK,
		SHOCKWAVE_BASE,
		SHOCKWAVE_DRONE, WAVE,
		LIGHTNING,

		// 其它
	];

	export const _BULLETS: EntityType[] = [
		BULLET_BASIC,
		BULLET_NUKE,
		BULLET_BOMBER,
		BULLET_TRACKING
	];
	export const _LASERS: EntityType[] = [
		LASER_BASIC,
		LASER_PULSE,
		LASER_TELEPORT,
		LASER_ABSORPTION
	];
	export const _WAVES: EntityType[] = [
		WAVE
	];

}