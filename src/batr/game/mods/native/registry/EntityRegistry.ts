import { isExtend } from "../../../../common/utils";
import { DisplayLayers } from "../../../../display/api/BatrDisplayInterfaces";
import Effect from "../../../api/entity/Effect";
import EntityType from "../../../api/entity/EntityType";
import EffectBlockLight from "../entities/effect/EffectBlockLight";
import EffectExplode from "../entities/effect/EffectExplode";
import EffectPlayerDeathFadeout from "../entities/effect/EffectPlayerDeathFadeout";
import EffectPlayerDeathLight from "../entities/effect/EffectPlayerDeathLight";
import EffectPlayerHurt from "../entities/effect/EffectPlayerHurt";
import EffectPlayerLevelup from "../entities/effect/EffectPlayerLevelup";
import EffectSpawn from "../entities/effect/EffectSpawn";
import EffectTeleport from "../entities/effect/EffectTeleport";
import BonusBox from "../entities/item/BonusBox";
import Player from "../entities/player/Player";
import Lightning from "../entities/projectile/Lightning";
import ShockWaveBase from "../entities/projectile/ShockWaveBase";
import ShockWaveDrone from "../entities/projectile/ShockWaveDrone";
import ThrownBlock from "../entities/projectile/ThrownBlock";
import Wave from "../entities/projectile/Wave";
import Bullet from "../entities/projectile/bullet/Bullet";
import BulletBasic from "../entities/projectile/bullet/BulletBasic";
import BulletBomber from "../entities/projectile/bullet/BulletBomber";
import BulletNuke from "../entities/projectile/bullet/BulletNuke";
import BulletTracking from "../entities/projectile/bullet/BulletTracking";
import Laser from "../entities/projectile/laser/Laser";
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

	// TODO: 增加「显示层级」
	// 子弹 // ! 现在统一「名称」与其对应类名相同（虽然后续可以改）
	export const BULLET_BASIC: EntityType = new EntityType(BulletBasic, DisplayLayers.PROJECTILE);
	export const BULLET_NUKE: EntityType = new EntityType(BulletNuke, DisplayLayers.PROJECTILE);
	export const BULLET_BOMBER: EntityType = new EntityType(BulletBomber, DisplayLayers.PROJECTILE);
	export const BULLET_TRACKING: EntityType = new EntityType(BulletTracking, DisplayLayers.PROJECTILE);

	// 激光
	export const LASER_BASIC: EntityType = new EntityType(LaserBasic, DisplayLayers.PROJECTILE);
	export const LASER_PULSE: EntityType = new EntityType(LaserPulse, DisplayLayers.PROJECTILE);
	export const LASER_TELEPORT: EntityType = new EntityType(LaserTeleport, DisplayLayers.PROJECTILE);
	export const LASER_ABSORPTION: EntityType = new EntityType(LaserAbsorption, DisplayLayers.PROJECTILE);

	// 其它抛射物
	export const WAVE: EntityType = new EntityType(Wave, DisplayLayers.PROJECTILE);
	export const THROWN_BLOCK: EntityType = new EntityType(ThrownBlock, DisplayLayers.PROJECTILE);
	export const LIGHTNING: EntityType = new EntityType(Lightning, DisplayLayers.PROJECTILE);

	// 冲击波（子机）相关
	export const SHOCKWAVE_BASE: EntityType = new EntityType(ShockWaveBase, DisplayLayers.PROJECTILE);
	export const SHOCKWAVE_DRONE: EntityType = new EntityType(ShockWaveDrone, DisplayLayers.PROJECTILE);

	// 奖励箱
	export const BONUS_BOX: EntityType = new EntityType(BonusBox, DisplayLayers.BONUS_BOX);

	// 玩家
	export const PLAYER: EntityType = new EntityType(Player, DisplayLayers.PLAYER);
	// export const AI_PLAYER: EntityType = new EntityType(AIPlayer, DisplayLayers.PLAYER); // TODO: 计划不再区分，把「AI玩家」认为是「玩家」的一种多态

	// 特效
	export const EFFECT_EXPLODE: EntityType = new EntityType(EffectExplode, DisplayLayers.EFFECT_TOP);
	export const EFFECT_SPAWN: EntityType = new EntityType(EffectSpawn, DisplayLayers.EFFECT_BOTTOM);
	export const EFFECT_TELEPORT: EntityType = new EntityType(EffectTeleport, DisplayLayers.EFFECT_BOTTOM);
	export const EFFECT_PLAYER_DEATH_LIGHT: EntityType = new EntityType(EffectPlayerDeathLight, DisplayLayers.EFFECT_TOP);
	export const EFFECT_PLAYER_DEATH_FADEOUT: EntityType = new EntityType(EffectPlayerDeathFadeout, DisplayLayers.EFFECT_MIDDLE);
	export const EFFECT_PLAYER_HURT: EntityType = new EntityType(EffectPlayerHurt, DisplayLayers.EFFECT_TOP);
	export const EFFECT_PLAYER_LEVELUP: EntityType = new EntityType(EffectPlayerLevelup, DisplayLayers.EFFECT_TOP);
	export const EFFECT_BLOCK_LIGHT: EntityType = new EntityType(EffectBlockLight, DisplayLayers.EFFECT_TOP);

	/**
	 * 注册表：声明所有原生实体
	 * * 在后面直接使用「filter」方法筛选，避免「各类型数组」的难以管理问题
	 */
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
		SHOCKWAVE_DRONE,
		LIGHTNING,
		// 玩家
		PLAYER,
		// 奖励箱
		BONUS_BOX,
		// 特效
		EFFECT_EXPLODE,
		EFFECT_SPAWN,
		EFFECT_TELEPORT,
		EFFECT_PLAYER_DEATH_LIGHT,
		EFFECT_PLAYER_DEATH_FADEOUT,
		EFFECT_PLAYER_HURT,
		EFFECT_PLAYER_LEVELUP,
		EFFECT_BLOCK_LIGHT,
	];

	/** 自动过滤：BULLETS */
	export const _BULLETS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Bullet)
	);
	/** 自动过滤：LASERS */
	export const _LASERS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Laser)
	);
	/** 自动过滤：WAVES */
	export const _WAVES: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Wave)
	);
	/** 自动过滤：EFFECTS */
	export const _EFFECTS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Effect)
	);

}
