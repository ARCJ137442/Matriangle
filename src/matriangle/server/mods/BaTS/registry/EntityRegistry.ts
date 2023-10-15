import { getClass, isExtend } from '../../../../common/utils'
import { DisplayLayers } from '../../../../display/api/DisplayInterfaces'
import Effect from '../entity/effect/Effect'
import Entity from '../../../api/entity/Entity'
import EntityType from '../../../api/entity/EntityType'
import EffectBlockLight from '../entity/effect/EffectBlockLight'
import EffectExplode from '../entity/effect/EffectExplode'
import EffectPlayerDeathFadeout from '../entity/effect/EffectPlayerDeathFadeout'
import EffectPlayerDeathLight from '../entity/effect/EffectPlayerDeathLight'
import EffectPlayerHurt from '../entity/effect/EffectPlayerHurt'
import EffectPlayerLevelup from '../entity/effect/EffectPlayerLevelup'
import EffectSpawn from '../entity/effect/EffectSpawn'
import EffectTeleport from '../entity/effect/EffectTeleport'
import BonusBox from '../entity/item/BonusBox'
import PlayerBatr from '../entity/player/PlayerBatr'
import Bullet from '../entity/projectile/bullet/Bullet'
import BulletBasic from '../entity/projectile/bullet/BulletBasic'
import BulletBomber from '../entity/projectile/bullet/BulletBomber'
import BulletNuke from '../entity/projectile/bullet/BulletNuke'
import BulletTracking from '../entity/projectile/bullet/BulletTracking'
import Laser from '../entity/projectile/laser/Laser'
import LaserAbsorption from '../entity/projectile/laser/LaserAbsorption'
import LaserBasic from '../entity/projectile/laser/LaserBasic'
import LaserPulse from '../entity/projectile/laser/LaserPulse'
import LaserTeleport from '../entity/projectile/laser/LaserTeleport'
import Lightning from '../entity/projectile/other/Lightning'
import ShockWaveBase from '../entity/projectile/other/ShockWaveBase'
import ShockWaveDrone from '../entity/projectile/other/ShockWaveDrone'
import ThrownBlock from '../entity/projectile/other/ThrownBlock'
import Wave from '../entity/projectile/other/Wave'

/**
 * 用于识别的「实体类型」
 * * 存储与「实体类」有关的元信息
 *
 * ! 这应该是静态的：即「一个『类型实例』对应多个『实体实例』的引用」
 *
 * !【2023-10-01 16:18:46】这不应该在「所有实体类加载完成前」被导入
 *
 */
export module NativeEntityTypes {
	//============Registry============//

	// TODO: 增加「显示层级」
	// 子弹 // ! 现在统一「名称」与其对应类名相同（虽然后续可以改）
	export const BULLET_BASIC: EntityType = new EntityType(
		'BulletBasic',
		BulletBasic,
		DisplayLayers.PROJECTILE
	)
	export const BULLET_NUKE: EntityType = new EntityType(
		'BulletNuke',
		BulletNuke,
		DisplayLayers.PROJECTILE
	)
	export const BULLET_BOMBER: EntityType = new EntityType(
		'BulletBomber',
		BulletBomber,
		DisplayLayers.PROJECTILE
	)
	export const BULLET_TRACKING: EntityType = new EntityType(
		'BulletTracking',
		BulletTracking,
		DisplayLayers.PROJECTILE
	)

	// 激光
	export const LASER_BASIC: EntityType = new EntityType(
		'LaserBasic',
		LaserBasic,
		DisplayLayers.PROJECTILE
	)
	export const LASER_PULSE: EntityType = new EntityType(
		'LaserPulse',
		LaserPulse,
		DisplayLayers.PROJECTILE
	)
	export const LASER_TELEPORT: EntityType = new EntityType(
		'LaserTeleport',
		LaserTeleport,
		DisplayLayers.PROJECTILE
	)
	export const LASER_ABSORPTION: EntityType = new EntityType(
		'LaserAbsorption',
		LaserAbsorption,
		DisplayLayers.PROJECTILE
	)

	// 其它抛射物
	export const WAVE: EntityType = new EntityType(
		'Wave',
		Wave,
		DisplayLayers.PROJECTILE
	)
	export const THROWN_BLOCK: EntityType = new EntityType(
		'ThrownBlock',
		ThrownBlock,
		DisplayLayers.PROJECTILE
	)
	export const LIGHTNING: EntityType = new EntityType(
		'Lightning',
		Lightning,
		DisplayLayers.PROJECTILE
	)

	// 冲击波（子机）相关
	export const SHOCKWAVE_BASE: EntityType = new EntityType(
		'ShockWaveBase',
		ShockWaveBase,
		DisplayLayers.PROJECTILE
	)
	export const SHOCKWAVE_DRONE: EntityType = new EntityType(
		'ShockWaveDrone',
		ShockWaveDrone,
		DisplayLayers.PROJECTILE
	)

	// 奖励箱
	export const BONUS_BOX: EntityType = new EntityType(
		'BonusBox',
		BonusBox,
		DisplayLayers.BONUS_BOX
	)

	// 玩家
	export const PLAYER: EntityType = new EntityType(
		'Player',
		PlayerBatr,
		DisplayLayers.PLAYER
	)

	// 特效
	export const EFFECT_EXPLODE: EntityType = new EntityType(
		'EffectExplode',
		EffectExplode,
		DisplayLayers.EFFECT_TOP
	)
	export const EFFECT_SPAWN: EntityType = new EntityType(
		'EffectSpawn',
		EffectSpawn,
		DisplayLayers.EFFECT_BOTTOM
	)
	export const EFFECT_TELEPORT: EntityType = new EntityType(
		'EffectTeleport',
		EffectTeleport,
		DisplayLayers.EFFECT_BOTTOM
	)
	export const EFFECT_PLAYER_DEATH_LIGHT: EntityType = new EntityType(
		'EffectPlayerDeathLight',
		EffectPlayerDeathLight,
		DisplayLayers.EFFECT_TOP
	)
	export const EFFECT_PLAYER_DEATH_FADEOUT: EntityType = new EntityType(
		'EffectPlayerDeathFadeout',
		EffectPlayerDeathFadeout,
		DisplayLayers.EFFECT_MIDDLE
	)
	export const EFFECT_PLAYER_HURT: EntityType = new EntityType(
		'EffectPlayerHurt',
		EffectPlayerHurt,
		DisplayLayers.EFFECT_TOP
	)
	export const EFFECT_PLAYER_LEVELUP: EntityType = new EntityType(
		'EffectPlayerLevelup',
		EffectPlayerLevelup,
		DisplayLayers.EFFECT_TOP
	)
	export const EFFECT_BLOCK_LIGHT: EntityType = new EntityType(
		'EffectBlockLight',
		EffectBlockLight,
		DisplayLayers.EFFECT_TOP
	)

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
	]

	/** 自动过滤：BULLETS */
	export const _BULLETS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Bullet)
	)
	/** 自动过滤：LASERS */
	export const _LASERS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Laser)
	)
	/** 自动过滤：WAVES */
	export const _WAVES: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Wave)
	)
	/** 自动过滤：EFFECTS */
	export const _EFFECTS: EntityType[] = _ALL_ENTITY.filter(
		(type: EntityType): boolean => isExtend(type.entityClass, Effect)
	)
}

export function getEntityType(
	entity: Entity,
	types: EntityType[] = NativeEntityTypes._ALL_ENTITY
): EntityType {
	for (const entityType of types) {
		if (entityType.entityClass === getClass(entity)) {
			return entityType
		}
	}
	throw new Error(
		`未找到${entity.toString()}在${types.toString()}对应的实体类型`
	)
}
