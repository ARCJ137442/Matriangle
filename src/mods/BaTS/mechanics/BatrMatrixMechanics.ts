import Block from 'matriangle-api/server/block/Block'
import { BlockEventMap } from 'matriangle-api/server/block/BlockEventTypes'
import Entity from 'matriangle-api/server/entity/Entity'
import {
	mRot,
	mRot2axis,
	mRot2increment,
} from 'matriangle-api/server/general/GlobalRot'
import { alignToGridCenter_P } from 'matriangle-api/server/general/PosTransform'
import { PROJECTILES_SPAWN_DISTANCE } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMap from 'matriangle-api/server/map/IMap'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import { HSVtoHEX } from 'matriangle-common/color'
import {
	randInt,
	intMax,
	intMin,
	ReLU_I,
	randIntBetween,
} from 'matriangle-common/exMath'
import {
	fPointRef,
	fPoint,
	iPoint,
	iPointRef,
	intPoint,
	iPointVal,
} from 'matriangle-common/geometricTools'
import { MDNCodes } from 'matriangle-common/keyCodes'
import {
	randomIn,
	randomWithout,
	ConcreteClass,
	MapFromObject,
	randomBoolean,
	mergeRecords,
	clearArray,
	randomInWeightMap,
} from 'matriangle-common/utils'
import { uint, int } from 'matriangle-legacy/AS3Legacy'
import BSColored from 'matriangle-mod-native/block/BSColored'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import {
	getPlayers,
	spreadPlayer,
	hitTestEntity_I_Grid,
	isHitAnyEntity_I_Grid,
	NATIVE_DEFAULT_PLAYER_CONTROL_CONFIGS,
} from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { PlayerControlConfig } from 'matriangle-mod-native/mechanics/program/KeyboardControlCenter'
import { NativeBlockPrototypes } from 'matriangle-mod-native/registry/BlockRegistry_Native'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import BSGate from '../block/BSGate'
import BonusBoxSymbol from '../display/entity/BonusBoxSymbol'
import EffectBlockLight from '../entity/effect/EffectBlockLight'
import EffectExplode from '../entity/effect/EffectExplode'
import EffectPlayerDeathFadeout from '../entity/effect/EffectPlayerDeathFadeout'
import EffectPlayerDeathLight from '../entity/effect/EffectPlayerDeathLight'
import EffectPlayerLevelup from '../entity/effect/EffectPlayerLevelup'
import BonusBox from '../entity/item/BonusBox'
import IPlayerBatr from '../entity/player/IPlayerBatr'
import IPlayerHasAttributes, {
	i_hasAttributes,
} from '../entity/player/IPlayerHasAttributes'
import IPlayerHasExperience, {
	i_hasExperience,
} from '../entity/player/IPlayerHasExperience'
import IPlayerHasStats, { i_hasStats } from '../entity/player/IPlayerHasStats'
import IPlayerHasTeam, { i_hasTeam } from '../entity/player/IPlayerHasTeam'
import IPlayerHasTool, { i_hasTool } from '../entity/player/IPlayerHasTool'
import { EnumBatrPlayerAction } from '../entity/player/control/BatrPlayerAction'
import PlayerStats from '../entity/player/stat/PlayerStats'
import PlayerTeam from '../entity/player/team/PlayerTeam'
import Projectile from '../entity/projectile/Projectile'
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
import ThrownBlock from '../entity/projectile/other/ThrownBlock'
import Wave from '../entity/projectile/other/Wave'
import { BlockEventType_Batr } from '../registry/BlockEventRegistry_Batr'
import { NativeBlockEventType } from 'matriangle-mod-native/registry/BlockEventRegistry_Native'
import { BatrBlockIDs } from '../registry/BlockRegistry_Batr'
import { BonusType, NativeBonusTypes } from '../registry/BonusRegistry'
import Registry_Batr, { toolUsageF } from '../registry/Registry_Batr'
import { NativeTools } from '../registry/ToolRegistry'
import { MatrixRules_Batr } from '../rule/MatrixRules_Batr'
import Tool from '../tool/Tool'
import Weapon from '../tool/Weapon'

/**
 * 基于旧有AS3游戏《Battle Triangle》的游戏逻辑函数库
 * * 使用直接导出的全局函数，实现「具体类无关」的Julia风格方法
 * * 用这样一个「事件处理函数库」承担所有的导入，让「方块」「实体」等类实现轻量化
 *
 * TODO: 是否「显示事件」也要这样「外包到『事件注册表』中」去？
 *
 * TODO: 【2023-10-09 21:15:12】亟需拆分出「Batr逻辑」和「原生逻辑」
 */

//================🎛️世界加载================//

/**
 * 按照「世界规则」初始化玩家变量
 * * 如：生命值，最大生命值等
 *
 * !【2023-09-28 20:27:56】有关「设置生命值可能导致的『显示更新』副作用」，或许可以需要通过「外部屏蔽更新/玩家未激活时」等方式避免
 * * 主打：避免Player类中出现与母体耦合的代码
 *
 */
export function initPlayersByRule(
	players: IPlayerBatr[],
	rule: IMatrixRule
): void {
	// 处理工具
	let defaultTool: Tool | string = rule.safeGetRule<Tool | string>(
		MatrixRules_Batr.key_defaultTool
	)
	switch (defaultTool) {
		// 统一随机
		case 'u-random':
			// 随机选一个
			defaultTool = randomIn<Tool>(
				rule.safeGetRule<Tool[]>(MatrixRules_Batr.key_enabledTools)
			)
			break
		// 完全随机
		case 'c-random':
			defaultTool = '' // ! 设置为空串，到时好比对（💭用函数式搞一个闭包也不是不行，但这会拖慢其它模式的初始化速度）
			break
		// 固定武器：没啥事做
		default:
			break
	}
	// 开始逐个玩家分派属性
	for (const player of players) {
		// 生命 //
		player.HP = rule.safeGetRule<uint>(MatrixRules_Native.key_defaultHP)
		player.maxHP = rule.safeGetRule<uint>(
			MatrixRules_Native.key_defaultMaxHP
		)

		// TODO: 下面的「判断是否AI」留给创建者。。。
		// player.setLifeByInt(player instanceof AIPlayer ? rule.remainLivesAI : rule.remainLivesPlayer);

		// 分派工具 //
		// 空串⇒完全随机，否则直接设置成之前的武器
		player.tool =
			defaultTool === ''
				? randomIn<Tool>(
						rule.safeGetRule<Tool[]>(
							MatrixRules_Batr.key_enabledTools
						)
				  )
				: (defaultTool as Tool)
	}
	// TODO: 后续还有至少是「生命条数」没有初始化的……留给在「创建玩家」时做（只有那时候才能分辨「哪个是人类，哪个是AI」）
}

//================⚙️实体管理================//

// 实体调用的工具函数：各类抛射体伤害玩家的逻辑…… //

// !【2023-09-30 13:20:38】testCarriableWithMap, testBreakableWithMap⇒地图の存储の判断

/**
 * 使用工具创造爆炸
 *
 * @param host 发生地
 * @param p 发生地点
 * @param finalRadius 最终爆炸半径
 * @param damage 爆炸伤害
 * @param projectile 抛射体
 * @param color 爆炸颜色
 * @param edgePercent 边缘百分比（用于「伤害随距离递减」）
 */
export function toolCreateExplode(
	host: IMatrix,
	creator: IPlayer | null,
	p: fPointRef,
	finalRadius: number,
	damage: uint,
	extraResistanceCoefficient: uint,
	canHurtSelf: boolean,
	canHurtEnemy: boolean,
	canHurtAlly: boolean,
	color: uint,
	edgePercent: number = 1
): void {
	// 生成特效
	host.addEntity(new EffectExplode(p, finalRadius, color))
	// 遍历伤害玩家
	let distanceP: number
	for (const player of getPlayers(host)) {
		// 玩家坐标视作网格中心：对齐
		alignToGridCenter_P(
			player.position,
			_temp_toolCreateExplode_playerCenterP
		)
		// 计算距离百分比
		distanceP =
			p.getDistanceSquare(_temp_toolCreateExplode_playerCenterP) /
			(finalRadius * finalRadius)
		// 只有在距离内才算
		if (distanceP <= 1) {
			// Operate damage by percent
			if (edgePercent < 1)
				damage *= edgePercent + distanceP * (1 - edgePercent)
			if (
				creator === null ||
				playerCanHurtOther(
					creator,
					player,
					canHurtEnemy,
					canHurtSelf,
					canHurtAlly
				)
			) {
				// Hurt With FinalDamage
				player.removeHP(
					host,
					computeFinalDamage(
						uint(damage),
						(player as IPlayerHasAttributes)?.attributes
							.buffResistance ?? 0,
						extraResistanceCoefficient
					),
					creator
				)
			}
		}
	}
}
const _temp_toolCreateExplode_playerCenterP: fPoint = new fPoint()

/**
 * 抛射体「波浪」伤害玩家的逻辑
 * @param host 母体
 * @param wave 在其中运行的抛射体「波浪」
 */
export function waveHurtPlayers(host: IMatrix, wave: Wave): void {
	/** 引用 */
	const base: fPoint = wave.position
	/** Wave的尺寸即为其伤害半径 */
	const radius: number = wave.nowScale
	// 开始遍历所有玩家
	for (const victim of getPlayers(host)) {
		// TODO: 如何在保持通用性的同时，保证专用性与效率。。。（过滤和遍历已经是一种方案了）
		// FinalDamage
		if (projectileCanHurtOther(wave, victim)) {
			if (base.getDistanceSquare(victim.position) <= radius * radius) {
				victim.removeHP(host, wave.attackerDamage, wave.owner)
			}
		}
	}
}

// !【2023-10-04 22:27:25】下面的代码全部在迁移之中，等待复活🏗️

/* export function lightningHurtPlayers(host: IBatrMatrix, lightning: Lightning, players: IPlayer[], damages: uint[]): void {
    let p: IPlayer, d: uint;
    for (let i in players) {
        p = players[i];
        d = damages[i];
        if (p !== null)
            p.finalRemoveHP(lightning.owner, lightning.ownerTool, d);
    }
} */

//================🕹️玩家================//

/**
 * 根据「队伍id」判断「是否互为敌方」
 * * 其中一方为null/没有「队伍」⇒互为敌方（与「空玩家」`null`的行为一致）
 *
 * @param player 其中一个玩家
 * @param other 另一个玩家
 * @returns 是否「互为敌方」
 */
export function isEnemy(
	player: IPlayer | null,
	other: IPlayer | null
): boolean {
	return player === null || other === null
		? false
		: (player as IPlayerHasTeam)?.team.id !==
				(other as IPlayerHasTeam)?.team.id
}

/**
 * 根据「队伍id」判断「是否互为友方」
 * * 其中一方为null/没有「队伍」⇒互不为友方（与「空玩家」`null`的行为一致）
 *
 * @param player 其中一个玩家
 * @param other 另一个玩家
 * @returns 是否「互为友方」
 */
export function isAlly(player: IPlayer | null, other: IPlayer | null): boolean {
	return player === null || other === null
		? false
		: (player as IPlayerHasTeam)?.team.id ===
				(other as IPlayerHasTeam)?.team.id
}

/**
 * 当玩家「得到奖励」所用的逻辑
 *
 * @param host 调用的母体
 * @param player 奖励箱将作用到的玩家
 * @param forcedBonusType 要强制应用的类型（若非空则强制应用此类型的奖励）
 */
export function playerPickupBonusBox(
	host: IMatrix,
	player: IPlayer,
	bonusBox: BonusBox,
	forcedBonusType: BonusType = bonusBox.bonusType
): void {
	// Deactivate
	bonusBox.isActive = false
	// Effect
	let buffColor: int = -1
	switch (forcedBonusType) {
		// 生命
		case NativeBonusTypes.ADD_HP:
			// 随机
			player.addHP(
				host,
				uint(player.HP * (0.05 * (1 + randInt(10)))),
				null
			)
			break
		case NativeBonusTypes.ADD_HEAL:
			player.heal += 5 * (1 + randInt(25))
			break
		case NativeBonusTypes.ADD_LIFE:
			if (player.lifeNotDecay || player.isFullHP)
				player.maxHP += host.rule.getRule(
					MatrixRules_Batr.key_bonusMaxHPAdditionAmount
				) as uint
			// ! 可能出错
			else player.lives++
			break
		// Tool
		case NativeBonusTypes.RANDOM_TOOL:
			// !【2023-10-09 16:13:20】没工具⇒没用
			if (i_hasTool(player))
				// 选择一个「玩家所持工具」以外的工具
				player.tool = randomWithout(
					host.rule.getRule(
						MatrixRules_Batr.key_enabledTools
					) as Tool[],
					player.tool
				)
			break
		// 属性增强
		case NativeBonusTypes.BUFF_RANDOM:
			// 重定向buff
			playerPickupBonusBox(
				host,
				player,
				bonusBox,
				randomIn(NativeBonusTypes._ABOUT_BUFF)
			)
			return
		case NativeBonusTypes.BUFF_DAMAGE:
			// 无「属性」⇒无效
			if ((player as IPlayerHasAttributes).attributes === undefined)
				break
				// 属性增强
			;(player as IPlayerHasAttributes).attributes.buffDamage +=
				host.rule.getRule(
					MatrixRules_Batr.key_bonusBuffAdditionAmount
				) as uint
			buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR
			break
		case NativeBonusTypes.BUFF_CD:
			// 无「属性」⇒无效
			if ((player as IPlayerHasAttributes).attributes === undefined)
				break
				// 属性增强
			;(player as IPlayerHasAttributes).attributes.buffCD +=
				host.rule.getRule(
					MatrixRules_Batr.key_bonusBuffAdditionAmount
				) as uint
			buffColor = BonusBoxSymbol.BUFF_CD_COLOR
			break
		case NativeBonusTypes.BUFF_RESISTANCE:
			// 无「属性」⇒无效
			if ((player as IPlayerHasAttributes).attributes === undefined)
				break
				// 属性增强
			;(player as IPlayerHasAttributes).attributes.buffResistance +=
				host.rule.getRule(
					MatrixRules_Batr.key_bonusBuffAdditionAmount
				) as uint
			buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR
			break
		case NativeBonusTypes.BUFF_RADIUS:
			// 无「属性」⇒无效
			if ((player as IPlayerHasAttributes).attributes === undefined)
				break
				// 属性增强
			;(player as IPlayerHasAttributes).attributes.buffRadius +=
				host.rule.getRule(
					MatrixRules_Batr.key_bonusBuffAdditionAmount
				) as uint
			buffColor = BonusBoxSymbol.BUFF_RADIUS_COLOR
			break
		case NativeBonusTypes.ADD_EXPERIENCE:
			// !【2023-10-09 16:14:50】没经验⇒没用
			if (i_hasExperience(player))
				player.addExperience(
					host,
					((player.level >> 2) + 1) << 2 // * 增加的经验值：min(玩家等级÷4, 4)
				)
			buffColor = BonusBoxSymbol.EXPERIENCE_COLOR
			break
		// 队伍
		case NativeBonusTypes.RANDOM_CHANGE_TEAM:
			// 仅「有队伍机制」
			if (i_hasTeam(player)) randomizePlayerTeam(host, player)
			break
		// 其它
		case NativeBonusTypes.RANDOM_TELEPORT:
			spreadPlayer(host, player, false, true)
			break
	}
	// （用于「获得buff」）广义的右下角添加效果
	if (buffColor >= 0)
		host.addEntity(
			new EffectPlayerLevelup(
				temp_playerPickupBonusBox_effectP
					.copyFrom(player.position)
					.addFromSingle(0.5),
				buffColor,
				0.75
			)
		)
	// 有统计⇒加入统计
	if (i_hasStats(player)) player.stats.pickupBonusBoxCount++
}
const temp_playerPickupBonusBox_effectP: fPoint = new fPoint()

/**
 * 玩家使用工具
 * * 【2023-10-05 17:19:47】现在直接导向注册表（若有相关规则）的「工具使用」函数中
 */
export function playerUseTool(
	host: IMatrix,
	player: IPlayerHasTool,
	rot: uint,
	chargePercent: number
): void {
	;(host.registry as Registry_Batr)?.toolUsageMap.get(player.tool.id)?.(
		host,
		player,
		player.tool,
		rot,
		chargePercent
	)
	// 没注册的工具才报信息
	if ((host.registry as Registry_Batr)?.toolUsageMap.has(player.tool.id)) {
		/* empty */
	} else
		console.warn(
			'WIP@directUseTool',
			player.tool,
			player,
			player.direction,
			player.tool.chargingPercent
		)
}

interface BulletConstructor extends ConcreteClass<Bullet> {
	new (
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		speed: number,
		finalExplodeRadius: number,
		...otherArgs: any[]
	): Bullet

	/** 需要的两个静态（类）属性 */
	DEFAULT_SPEED: number

	DEFAULT_EXPLODE_RADIUS: number
}

/**
 * 集成所有「生成子弹」的逻辑
 */
function generateBullet(
	constructor: BulletConstructor,
	host: IMatrix,
	user: IPlayer,
	tool: Tool,
	direction: mRot,
	defaultSpeed: number = constructor.DEFAULT_SPEED,
	defaultExplodeRadius: number = constructor.DEFAULT_EXPLODE_RADIUS,
	...otherArgs: unknown[]
): void {
	host.addEntity(
		new constructor(
			user,
			host.map.towardWithRot_FF(
				alignToGridCenter_P(user.position, _temp_toolUsage_PF),
				direction,
				PROJECTILES_SPAWN_DISTANCE
			),
			direction,
			0,
			0, // 后续从工具处初始化
			defaultSpeed, // ?【2023-10-05 17:39:49】是不是参数位置有问题
			computeFinalRadius(
				defaultExplodeRadius,
				(user as IPlayerHasAttributes)?.attributes.buffRadius ?? 0
			),
			...otherArgs
		)
			.initFromToolNAttributes(
				tool,
				(user as IPlayerHasAttributes)?.attributes.buffDamage ?? 0
			)
			.initLife(
				host.rule.getRule<uint>(MatrixRules_Batr.key_bulletMaxLife)
			)
	)
}
const _temp_toolUsage_PF: fPoint = new fPoint()

interface LaserConstructor extends ConcreteClass<Laser> {
	new (
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: uint,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		...otherArgs: any[]
		// chargePercent?: number // ! 「充能百分比」作为「附加参数」使用 // * 没有「充能机制」就是「完全充能」
	): Laser

	/** 需要的静态（类）属性 */
	LIFE: uint
}

/**
 * 集成所有「生成激光」的逻辑
 */
function generateLaser(
	constructor: LaserConstructor,
	host: IMatrix,
	user: IPlayer,
	tool: Tool,
	direction: mRot,
	...otherArgs: unknown[]
): void {
	// 预先计算坐标
	host.map.towardWithRot_II(
		_temp_toolUsage_PI.copyFrom(user.position),
		direction
	)
	// 手动计算长度
	const length = calculateLaserLength(
		host,
		_temp_toolUsage_PI, // 这里的`_temp_toolUsage_PI`已经前进了
		direction
	)
	// 长度非零⇒生成并添加实体
	if (length > 0)
		host.addEntity(
			new constructor(
				user,
				// 直接在正前方一格生成
				_temp_toolUsage_PI,
				direction,
				length,
				// 后续从工具处初始化
				0,
				0,
				// 「充能百分比」等其它附加参数
				...otherArgs
			).initFromToolNAttributes(
				tool,
				(user as IPlayerHasAttributes)?.attributes.buffDamage ?? 0
			)
		)
}
const _temp_toolUsage_PI: fPoint = new iPoint()

/**
 * 一个原生的「武器使用」映射表
 * * 基本继承原先AS3版本中的玩法
 *
 * * 💭【2023-10-05 17:33:39】本来放在「工具注册表」里面的，但这个映射表的「机制注册」已经多于「ID注册」了。。。
 */
export const NATIVE_TOOL_USAGE_MAP: Map<typeID, toolUsageF> = MapFromObject<
	typeID,
	toolUsageF
>({
	// * 武器：普通子弹 * //
	[NativeTools.TOOL_ID_BULLET_BASIC]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void => generateBullet(BulletBasic, host, user, tool, direction),
	// * 武器：核弹 * //
	[NativeTools.TOOL_ID_BULLET_NUKE]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void => {
		const scalePercent: number = 0.25 + chargePercent * 0.75
		generateBullet(
			BulletNuke,
			host,
			user,
			tool,
			direction,
			// * 充能越充分，速度越慢
			BulletNuke.DEFAULT_SPEED * (2 - scalePercent),
			// * 充能越充分，爆炸范围越大
			BulletNuke.DEFAULT_EXPLODE_RADIUS * scalePercent
		)
	},
	// * 武器：轰炸机 * //
	[NativeTools.TOOL_ID_BULLET_BOMBER]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void => {
		const scalePercent: number = 0.25 + chargePercent * 0.75
		generateBullet(
			BulletBomber,
			host,
			user,
			tool,
			direction,
			// * 充能越充分，速度越慢
			BulletBomber.DEFAULT_SPEED,
			// * 充能越充分，爆炸范围越大
			BulletBomber.DEFAULT_EXPLODE_RADIUS,
			// * 充能越充分，爆炸频率越高
			uint(BulletBomber.MAX_BOMB_TICK * (1.5 - scalePercent)) // !特殊参数：`maxBombTick`
		)
	},
	// * 武器：跟踪子弹 * //
	[NativeTools.TOOL_ID_BULLET_TRACKING]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void =>
		generateBullet(
			BulletTracking,
			host,
			user,
			tool,
			direction,
			// 默认速度
			BulletTracking.DEFAULT_SPEED,
			// 默认爆炸半径
			BulletTracking.DEFAULT_EXPLODE_RADIUS,
			// 所追踪的玩家
			getPlayers(host),
			// * 充能越充分，追踪时速度越快
			1 + chargePercent * 0.5,
			// * 完全充能⇒大于1
			chargePercent >= 1
		),
	// * 武器：基础激光 * //
	[NativeTools.TOOL_ID_LASER_BASIC]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void =>
		generateLaser(
			LaserBasic,
			host,
			user,
			tool,
			direction,
			// 充能大小
			chargePercent
		),
	// * 武器：传送激光 * //
	[NativeTools.TOOL_ID_LASER_TELEPORT]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void =>
		generateLaser(
			LaserTeleport,
			host,
			user,
			tool,
			direction,
			// 生命周期
			LaserTeleport.LIFE
		),
	// * 武器：吸收激光 * //
	[NativeTools.TOOL_ID_LASER_ABSORPTION]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void => generateLaser(LaserAbsorption, host, user, tool, direction),
	// * 武器：脉冲激光 * //
	[NativeTools.TOOL_ID_LASER_PULSE]: (
		host: IMatrix,
		user: IPlayer,
		tool: Tool,
		direction: mRot,
		chargePercent: number
	): void =>
		generateLaser(
			LaserPulse,
			host,
			user,
			tool,
			direction,
			// 是否为「回拽激光」
			chargePercent < 1
		),
})

/**
 * 玩家使用工具的代码
 * TODO: 代码太多太大太集中，需要迁移！重构！💢
 */
/*

public playerUseToolAt(player: IPlayer, tool: Tool, x: number, y: number, toolRot: uint, chargePercent: number, projectilesSpawnDistance: number): void {
    // Set Variables
    let p: Projectile = null;

    let centerX: number = PosTransform.alignToEntity(PosTransform.alignToGrid(x));

    let centerY: number = PosTransform.alignToEntity(PosTransform.alignToGrid(y));

    let frontBlock: Block;

    let laserLength: number = this.rule.maxLaserLength;

    if (Tool.isIncludeIn(tool, Tool._LASERS) &&
        !this._rule.allowLaserThroughAllBlock) {
        laserLength = this.getLaserLength2(x, y, toolRot);

        // -projectilesSpawnDistance
    }
    // Debug: console.log('playerUseTool:','X=',player.getX(),spawnX,'Y:',player.getY(),y)
    // Summon Projectile
    switch (tool) {
        case Tool.BULLET:
            p = new BulletBasic(this, x, y, player);

            break;
        case Tool.NUKE:
            p = new BulletNuke(this, x, y, player, chargePercent);

            break;
        case Tool.BULLET_BOMBER:
            p = new SubBomber(this, x, y, player, chargePercent);

            break;
        case Tool.TRACKING_BULLET:
            p = new BulletTracking(this, x, y, player, chargePercent);

            break;
        case Tool.LASER:
            p = new LaserBasic(this, x, y, player, laserLength, chargePercent);

            break;
        case Tool.PULSE_LASER:
            p = new LaserPulse(this, x, y, player, laserLength, chargePercent);

            break;
        case Tool.TELEPORT_LASER:
            p = new LaserTeleport(this, x, y, player, laserLength);

            break;
        case Tool.ABSORPTION_LASER:
            p = new LaserAbsorption(this, x, y, player, laserLength);

            break;
        case Tool.WAVE:
            p = new Wave(this, x, y, player, chargePercent);

            break;
        case Tool.BLOCK_THROWER:
            let carryX: int = this.lockPosInMap(PosTransform.alignToGrid(centerX), true);
            let carryY: int = this.lockPosInMap(PosTransform.alignToGrid(centerY), false);
            frontBlock = this.getBlock(carryX, carryY);
            if (player.isCarriedBlock) {
                // Throw
                if (this.testCanPass(carryX, carryY, false, true, false, false, false)) {
                    // Add Block
                    p = new ThrownBlock(this, centerX, centerY, player, player.carriedBlock.copy(), toolRot, chargePercent);
                    // Clear
                    player.setCarriedBlock(null);
                }
            }
            else if (chargePercent >= 1) {
                // Carry
                if (frontBlock !== null && this.testCarriableWithMap(frontBlock.attributes, this.map)) {
                    player.setCarriedBlock(frontBlock, false);
                    this.setBlock(carryX, carryY, null);
                    // Effect
                    this.addBlockLightEffect2(centerX, centerY, frontBlock, true);
                }
            }
            break;
        case Tool.MELEE:

            break;
        case Tool.LIGHTNING:
            p = new Lightning(this, centerX, centerY, toolRot, player, player.computeFinalLightningEnergy(100) * (0.25 + chargePercent * 0.75));
            break;
        case Tool.SHOCKWAVE_ALPHA:
            p = new ShockWaveBase(this, centerX, centerY, player, player === null ? WorldRule.DEFAULT_DRONE_TOOL : IPlayer.droneTool, player.droneTool.chargePercentInDrone);
            break;
        case Tool.SHOCKWAVE_BETA:
            p = new ShockWaveBase(this, centerX, centerY, player, player === null ? WorldRule.DEFAULT_DRONE_TOOL : IPlayer.droneTool, player.droneTool.chargePercentInDrone, 1);
            break;
    }
    if (p !== null) {
        p.rot = toolRot;
        this._entitySystem.add(p);
        this._projectileContainer.addChild(p);
    }
} */

/**
 * 根据（使用武器的）玩家与（被玩家使用的）武器计算「攻击者伤害」
 * * 应用：玩家发射抛射体，伤害&系数均转移到抛射体上
 *
 * * 📌攻击者伤害 = 武器基础伤害 + 玩家「伤害加成」 * 武器「附加伤害系数」
 *
 * ? 似乎确实是导出一个箭头函数就足够了
 *
 * @param baseDamage （来自武器的）基础伤害
 * @param buffDamage （来自使用者的）伤害加成
 * @param extraDamageCoefficient （来自武器的）伤害提升系数
 * @returns 攻击者伤害：已经由攻击者完全提供，后续计算不再与攻击者有关的伤害
 */
export const computeAttackerDamage = (
	baseDamage: uint,
	buffDamage: uint,
	extraDamageCoefficient: uint
): uint => baseDamage + buffDamage * extraDamageCoefficient

/**
 * 根据（已得到攻击者「攻击伤害」加成的）「攻击者伤害」与「玩家抗性」「抗性系数」计算「最终伤害」（整数）
 * * 应用：抛射体伤害玩家
 *
 * * 📌最终伤害 = Max{攻击者伤害 - 玩家「伤害减免」 * 武器「抗性减免系数」, 1}
 *
 * ! 相比AS3版本的变动：
 * * 对「抛射体伤害玩家」的逻辑：现在不传入「攻击者所用工具」（从抛射体处已移除），在计算上直接使用「攻击者伤害」
 *
 * @param attackerDamage （已把「伤害加成」算入内的）攻击者伤害
 * @param buffResistance （来自被攻击者的）伤害减免
 * @param extraResistanceCoefficient （来自武器/抛射体的）抗性减免系数
 * @returns
 */
export const computeFinalDamage = (
	attackerDamage: uint,
	buffResistance: uint,
	extraResistanceCoefficient: uint
): uint =>
	intMax(
		attackerDamage - buffResistance * extraResistanceCoefficient,
		1 // ! 保证不能有「无敌」的情况发生
	)

/**
 * 用于结合玩家特性计算「最终CD」
 * @param baseCD （来自武器的）基础冷却
 * @param buffCD （来自玩家的）冷却减免
 * @returns 最终冷却时间：最小为1
 */
export const computeFinalCD = (baseCD: uint, buffCD: uint): uint =>
	Math.ceil(
		// 使用向上取整保证最小为1
		baseCD / (1 + buffCD / 10)
	)

/**
 * 计算（武器的）影响半径
 * * 应用：给抛射体作参考，如「子弹爆炸」「波浪大小」……
 *
 * * 📌最终半径 = 基础半径 * (1 + Min{范围加成/16, 3})
 *
 * @param baseRadius （来自武器的）基础半径（浮点数）
 * @returns 计算好的「最终半径」（浮点数）
 */
export const computeFinalRadius = (
	baseRadius: number,
	buffRadius: uint
): number => baseRadius * (1 + Math.min(buffRadius / 16, 3))

/**
 * 计算（用于「闪电」武器的）最终闪电能量
 * * 应用：给「闪电」抛射体作参考
 *
 * * 📌最终闪电能量 = 基础能量 * Min{1 + 伤害加成 / 20 + 范围加成 / 10, 10}
 *
 * @param baseEnergy （来自武器/抛射体内置的）基础能量
 * @param buffDamage （来自玩家的）伤害加成
 * @param buffRadius （来自玩家的）范围加成
 * @returns 最终的「闪电能量」（整数）
 */
export const computeFinalLightningEnergy = (
	baseEnergy: uint,
	buffDamage: uint,
	buffRadius: uint
): uint => baseEnergy * intMin(1 + buffDamage / 20 + buffRadius / 10, 10)

/**
 * 计算玩家的「总世界分数」
 * * 应用：衡量一个玩家在世界中的「一般表现」
 * * 逻辑：经验+击杀/死亡+伤害
 */
export const computeTotalPlayerScore = (stats: PlayerStats): uint =>
	ReLU_I(
		// 经验等级
		+(stats.profile?.level ?? 0) * 50 +
			(stats.profile?.experience ?? 0) * 5 +
			// 击杀/死亡
			// + stats.killAllyCount // !【2023-10-01 15:09:10】现在击杀友方不计分
			stats.killCount * 2 -
			stats.deathCount * 2 +
			// - stats.suicideCount // !【2023-10-01 15:09:10】现在自杀不计分
			stats.pickupBonusBoxCount * 10 +
			// 伤害
			stats.causeDamage -
			stats.damageBy
	)

/**
 * 处理「玩家伤害」事件
 * @param host 所处的母体
 * @param attacker 攻击者
 * @param victim 受害者
 * @param damage 伤害
 */
export function handlePlayerHurt(
	host: IMatrix,
	attacker: IPlayer | null,
	victim: IPlayer,
	damage: uint
): void {
	// 尝试存入统计信息
	if (host.rule.getRule<boolean>(MatrixRules_Batr.key_recordPlayerStats)) {
		// 攻击者の统计
		if (attacker !== null && i_hasStats(attacker))
			addHurtStats_attacker(attacker, victim, damage)
		// 受害者の统计
		if (victim !== null && i_hasStats(victim))
			addHurtStats_victim(attacker, victim, damage)
	}
}

/** 给攻击者增加伤害统计 */
function addHurtStats_attacker(
	attacker: IPlayerHasStats,
	victim: IPlayer | null,
	damage: uint
): void {
	// 总造成伤害
	attacker.stats.causeDamage += damage
	// 对特定玩家的统计
	attacker.stats.addCauseDamagePlayerCount(victim, damage)
	// 自身
	if (victim === attacker) attacker.stats.causeDamageOnSelf += damage
	// 友方
	if (isAlly(attacker, victim)) attacker.stats.causeDamageOnAlly += damage
}

/** 给受害者增加伤害统计 */
function addHurtStats_victim(
	attacker: IPlayer | null,
	victim: IPlayerHasStats,
	damage: uint
): void {
	// 总受到伤害
	victim.stats.damageBy += damage
	// 对特定玩家的统计
	victim.stats.addDamageByPlayerCount(attacker, damage)
	// ! 「自身」已在「攻击者」处计算
	//  友方
	if (isAlly(attacker, victim)) victim.stats.damageByAlly += damage
}

/**
 * 处理「玩家死亡」
 * @param host 所处的母体
 * @param attacker 攻击者
 * @param victim 受害者
 * @param damage 致死的伤害
 */
export function handlePlayerDeath(
	host: IMatrix,
	attacker: IPlayer | null,
	victim: IPlayer,
	damage: uint
): void {
	// 特效 //
	// 死亡光效
	host.addEntities(
		EffectPlayerDeathLight.fromPlayer(
			victim.position,
			victim,
			false /* 淡出 */
		),
		EffectPlayerDeathFadeout.fromPlayer(
			victim.position,
			victim,
			false /* 淡出 */
		)
	)

	// 取消激活 // !【2023-10-05 19:51:35】不能取消激活：玩家需要实体刻来计算「重生刻」（不然又徒增专用代码）
	// victim.isActive = false;

	// 保存死亡点，在后续生成奖励箱时使用 //
	const deadP: iPoint = victim.position.copy()

	// 移动受害者到指定地方 //
	victim.setPosition(
		host,
		host.rule.safeGetRule<iPoint>(MatrixRules_Native.key_deadPlayerMoveTo),
		false // !【2023-10-08 20:33:36】目前并不需要触发钩子，因为此时玩家已经处于「死亡」状态
	)
	// TODO: 统一设置位置？

	// 死后在当前位置生成奖励箱 //
	if (
		host.rule.safeGetRule<boolean>(
			MatrixRules_Batr.key_bonusBoxSpawnAfterPlayerDeath
		) &&
		(host.rule.safeGetRule<uint>(MatrixRules_Batr.key_bonusBoxMaxCount) <
			0 ||
			getBonusBoxCount(host) <
				host.rule.safeGetRule<uint>(
					MatrixRules_Batr.key_bonusBoxMaxCount
				)) &&
		host.map.testBonusBoxCanPlaceAt(deadP, getPlayers(host))
	) {
		addBonusBoxInRandomTypeByRule(host, deadP)
	}

	// 尝试存入统计信息 //
	if (host.rule.getRule<boolean>(MatrixRules_Batr.key_recordPlayerStats)) {
		// 攻击者の统计
		if (attacker !== null && i_hasStats(attacker))
			addDeathStats_attacker(attacker, victim, damage)
		// 受害者の统计
		if (victim !== null && i_hasStats(victim))
			addDeathStats_victim(attacker, victim, damage)
	}

	// 检测「世界结束」 // TODO: 通用化
	// host.testWorldEnd();
}

/** 给攻击者增加死亡统计 */
function addDeathStats_attacker(
	attacker: IPlayerHasStats,
	victim: IPlayer | null,
	damage: uint
): void {
	// 总击杀数
	attacker.stats.killCount++
	// 对特定玩家的击杀数
	attacker.stats.addKillPlayerCount(victim)
	// 自身
	if (attacker === victim) attacker.stats.suicideCount++
	// 友方
	if (isAlly(attacker, victim)) {
		attacker.stats.killAllyCount++
	}
}

/** 给受害者增加死亡统计 */
function addDeathStats_victim(
	attacker: IPlayer | null,
	victim: IPlayerHasStats,
	damage: uint
): void {
	// 总死亡次数
	victim.stats.deathCount++
	// 总体死亡
	victim.stats.deathByPlayer++
	victim.stats.addDeathByPlayerCount(attacker)
	// 击杀者非空
	if (attacker !== null) {
		// ! 「自身」已在「击杀者」处计算
		// 友方
		if (isAlly(attacker, victim)) {
			victim.stats.deathByAllyCount++
		}
	}
}

/**
 * 在指定坐标添加随机类型的奖励箱
 *
 * ! 忽略「特定情况忽略」的选项，例如允许「在『锁定玩家队伍』的情况下改变玩家队伍」
 *
 * @param host 所在的母体
 * @param p 添加的坐标
 */
export function addBonusBoxInRandomTypeByRule(
	host: IMatrix,
	p: intPoint
): void {
	host.addEntity(new BonusBox(p, getRandomBonusType(host.rule)))
}

/** 判断实体是否为奖励箱 */
const isBonusBox = (e: Entity): boolean => e instanceof BonusBox

/**
 * （🚩专用代码迁移）用于获取一个母体内所有的奖励箱
 * * 特殊高效分派逻辑：使用「约定属性」`bonusBoxes`（可以是getter）
 *
 * 📌JS知识：`in`能匹配getter，而`hasOwnProperty`不行
 *
 * @param host 所在的母体
 * @returns 所有奖励箱的列表
 */
export function getBonusBoxes(host: IMatrix): BonusBox[] {
	// 💭【2023-10-03 23:44:22】根据类型做分派，但要导入「具体类型」……
	// 📌【2023-10-03 23:46:04】约定使用特殊的「bonusBoxes」属性做「特殊化」
	if (
		// 有键
		'bonusBoxes' in host &&
		// 类型检查
		Array.isArray(host.bonusBoxes) &&
		// 内容检查
		(host.bonusBoxes.length === 0 || host.bonusBoxes.every(isBonusBox))
	) {
		return host.bonusBoxes as BonusBox[]
	}
	// 否则用最笨的方法
	else {
		return host.entities.filter(isBonusBox) as BonusBox[]
	}
}

/**
 * （🚩专用代码迁移）获取一个母体的奖励箱数量
 * @param host 所在的母体
 * @returns 奖励箱数量
 */
export function getBonusBoxCount(host: IMatrix): uint {
	if ('bonusBoxes' in host && Array.isArray(host.bonusBoxes)) {
		return host.bonusBoxes.length
	}
	// 否则用最笨的方法
	else {
		let c: uint = 0
		for (const e of host.entities) if (e instanceof BonusBox) c++
		return c
	}
}

/**
 * 测试玩家「拾取奖励箱」的逻辑
 *
 * ? 💭母体需要额外「专门化」去获取一个「所有奖励箱」吗？？？
 */
export function bonusBoxTest(
	host: IMatrix,
	player: IPlayerBatr,
	at: iPointRef = player.position
): boolean {
	for (const bonusBox of getBonusBoxes(host)) {
		if (hitTestEntity_I_Grid(bonusBox, at)) {
			// TODO: 【2023-10-03 23:55:46】断点
			// 玩家获得奖励
			playerPickupBonusBox(host, player, bonusBox)
			// 触发玩家钩子（不涉及世界机制）
			player.onPickupBonusBox(host, bonusBox)
			// 移除
			host.removeEntity(bonusBox)
			// host.testWorldEnd(); // TODO: 通用化
			return true
		}
	}
	return false
}

// !【2023-10-04 22:26:28】已废弃：`handlePlayerTeamsChange`（原`onPlayerTeamsChange`）

/**
 * 随机安排所有玩家的队伍（若有）
 */
export function randomizeAllPlayerTeam(host: IMatrix): void {
	for (const player of getPlayers(host)) {
		if (i_hasTeam(player)) randomizePlayerTeam(host, player)
	}
}

/**
 * 随机获取一个队伍
 * * 迁移自`GameRule_V1.randomTeam`
 * @param host 所在的母体
 */
export function getRandomTeam(host: IMatrix): PlayerTeam {
	return randomIn(
		host.rule.safeGetRule<PlayerTeam[]>(MatrixRules_Batr.key_playerTeams)
	)
}

/**
 * 随机安排一个玩家的队伍
 *
 * !【2023-10-04 11:54:17】现在直接安排一个随机队伍，不管其是否与玩家先前队伍一致
 *
 * @param host 所在的母体
 * @param player 要安排队伍的玩家
 */
export function randomizePlayerTeam(
	host: IMatrix,
	player: IPlayerHasTeam
): void {
	player.team = getRandomTeam(host)
}

/**
 * 当玩家升级时（等级增加之后）
 *
 * @param host 升级的玩家所在的「世界母体」
 * @param player 升级的玩家（具有「经验机制」的）
 */
export function handlePlayerLevelup(
	host: IMatrix,
	player: IPlayerHasExperience
): void {
	if (i_hasAttributes(player)) {
		// 若「有属性」⇒随机增强三个属性
		let color: uint
		let i: uint = 0
		let nowE: uint = randInt(4)
		const effP: fPoint = new fPoint()
		const N: uint = 3
		while (i < N) {
			switch (nowE) {
				case 1:
					color = BonusBoxSymbol.BUFF_CD_COLOR
					player.attributes.buffCD += host.rule.safeGetRule<uint>(
						MatrixRules_Batr.key_bonusBuffAdditionAmount
					)
					break
				case 2:
					color = BonusBoxSymbol.BUFF_RESISTANCE_COLOR
					player.attributes.buffResistance +=
						host.rule.safeGetRule<uint>(
							MatrixRules_Batr.key_bonusBuffAdditionAmount
						)
					break
				case 3:
					color = BonusBoxSymbol.BUFF_RADIUS_COLOR
					player.attributes.buffRadius += host.rule.safeGetRule<uint>(
						MatrixRules_Batr.key_bonusBuffAdditionAmount
					)
					break
				default:
					color = BonusBoxSymbol.BUFF_DAMAGE_COLOR
					player.attributes.buffDamage += host.rule.safeGetRule<uint>(
						MatrixRules_Batr.key_bonusBuffAdditionAmount
					)
			}
			nowE = (nowE + 1) & 3
			i++
			// 特效
			effP.copyFrom(player.position)
			for (let j: uint = 0; j < N; j++) {
				// 获取一个不重复、但又在角落的位置（高维化）
				effP[j] += player.position[j] + ((i >> j) & 1)
			}
			host.addEntity(new EffectPlayerLevelup(effP, color, 0.75))
		}
	}
}

//================ 方块随机刻函数 ================//

/**
 * * 事件处理函数API：可访问世界实例，参与调用世界API（生成实体、放置其它方块等）
 *
 * （示例）响应方块随机刻 @ MoveableWall
 * * 机制：「可移动的墙」在收到一个随机刻时，开始朝周围可以移动的方向进行移动
 * * 原`moveableWallMove`
 *
 * ? 是否可以放开一点，通过TS合法手段让`block`成为任意`Block`的子类
 * @param host 调用此函数的母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export function randomTick_MoveableWall(
	host: IMatrix,
	position: iPoint,
	block: Block<null>
): void {
	// 正式开始放置 //
	// 坐标计算
	const randomRot: uint = host.map.storage.randomForwardDirectionAt(position)
	host.map.towardWithRot_II(
		_temp_randomTick_MoveableWall.copyFrom(position),
		randomRot,
		1
	)
	// * 现在不会再尝试多次了
	if (
		host.map.isInMap_I(_temp_randomTick_MoveableWall) &&
		host.map.testCanPass_I(
			_temp_randomTick_MoveableWall,
			false,
			true,
			false,
			false
		)
	)
		host.addEntity(
			// 生成实体
			new ThrownBlock(
				null, // 无主
				_temp_randomTick_MoveableWall, // !【2023-10-08 00:46:12】因为其坐标的特殊性，无需对齐网格中心
				randomRot,
				0.25 + Math.random() * 0.25, // 0.25~0.5 // * 【2023-10-08 00:33:11】别飞太快
				block, // ! 【2023-09-22 22:32:47】现在在构造函数内部会自行拷贝
				NativeTools.WEAPON_BLOCK_THROWER.baseDamage,
				NativeTools.WEAPON_BLOCK_THROWER.extraResistanceCoefficient
			)
		)
	else return
	// 清空自身位置 //
	host.map.storage.setVoid(position)
	// 所谓「病毒模式」就是「可能会传播的模式」，这个只会生成一次 // !【2023-10-07 19:24:47】因最新的「方块状态重写」「变量用途不明」等原因，废弃之
	// if (!(block.state as MoveableWall)?.virus)
}
const _temp_randomTick_MoveableWall: fPoint = new fPoint()

/**
 * （示例）响应方块随机刻 @ ColorSpawner
 * * 机制：当「颜色生成器」收到一个随机刻时，有1/4机率随机在「周围曼哈顿距离≤2处」生成一个随机颜色的「颜色块」（生成过程不一定成功）
 * * 原`colorSpawnerSpawnBlock`
 *
 * @param host 调用此函数的母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export function randomTick_ColorSpawner(
	host: IMatrix,
	position: iPoint,
	block: Block<null>
): void {
	// 概率筛选
	if (randomBoolean(3, 1)) return
	// 新位置寻址：随机位移
	_temp_randomTick_ColorSpawner_blockP
		.copyFrom(position)
		.inplaceMap((p: int): number => p + randIntBetween(-2, 3))
	if (
		// 放置条件：在地图内&是空位
		host.map.isInMap_I(_temp_randomTick_ColorSpawner_blockP) &&
		host.map.storage.isVoid(_temp_randomTick_ColorSpawner_blockP)
	) {
		// 生成一个新的随机「颜色方块」
		const newBlock: Block<BSColored> =
			NativeBlockPrototypes.COLORED.softCopy().randomizeState()
		// 放置
		host.map.storage.setBlock(
			_temp_randomTick_ColorSpawner_blockP,
			newBlock
		) // * 后续世界需要处理「方块更新事件」
		host.addEntity(
			EffectBlockLight.fromBlock(
				_temp_randomTick_ColorSpawner_blockP,
				newBlock,
				false // 淡出
			)
		)
	}
}
const _temp_randomTick_ColorSpawner_blockP: iPoint = new iPoint()

/**
 * （示例）响应方块随机刻 @ LaserTrap
 * * 机制：当「激光陷阱」收到一个随机刻时，随机向周围可发射激光的方向发射随机种类的「无主激光」
 * * 原`laserTrapShootLaser`
 *
 * ! 性能提示：此处使用copy新建了多维点对象
 *
 * !【2023-10-04 21:46:30】现在变为「格点实体」后，激光生成的相关逻辑得到简化
 *
 * @param host 调用此函数的母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export function randomTick_LaserTrap(
	host: IMatrix,
	position: iPoint,
	block: Block<null>
): void {
	let randomR: mRot
	// add laser by owner=null
	let p: Laser
	let laserLength: uint
	// 最大尝试16次
	for (let i: uint = 0; i < 0x10; ++i) {
		// 随机生成方向&位置
		randomR = host.map.storage.randomForwardDirectionAt(position)
		_temp_randomTick_LaserTrap.copyFrom(position) // !要挪过来
		host.map.towardWithRot_II(_temp_randomTick_LaserTrap, randomR, 1)
		// 地图内外检测
		if (host.map.isInMap_I(_temp_randomTick_LaserTrap)) {
			// 长度
			laserLength = calculateLaserLength(
				host,
				_temp_randomTick_LaserTrap,
				randomR
			)
			if (laserLength <= 0) continue
			// 随机获取一个激光生成配置
			const randomS = randomIn(_temp_randomTick_weapons)
			p = new randomS[0](
				null,
				_temp_randomTick_LaserTrap,
				randomR,
				laserLength,
				randomS[1].baseDamage,
				randomS[1].extraResistanceCoefficient,
				// 其它附加参数
				...randomS[2]
			)
			// 添加实体
			host.addEntity(p)
			break
		}
	}
}
/** 用于「激光生成的位置」 */
const _temp_randomTick_LaserTrap: iPoint = new iPoint()
/** 「激光陷阱」生成所有激光的列表 [构造函数, 对应武器, 附加参数] */
const _temp_randomTick_weapons: Array<[LaserConstructor, Weapon, unknown[]]> = [
	[LaserBasic, NativeTools.WEAPON_LASER_BASIC.copy(), [1 /* 完全充能 */]],
	[LaserTeleport, NativeTools.WEAPON_LASER_TELEPORT.copy(), []],
	[LaserAbsorption, NativeTools.WEAPON_LASER_ABSORPTION.copy(), []],
	[
		LaserPulse,
		NativeTools.WEAPON_LASER_PULSE.copy(),
		[randomBoolean() /* 随机「回拽」「前推」 */],
	],
]

// !【2023-10-08 18:15:02】

// !【2023-10-08 17:40:30】
/**
 * 原生的「方块事件」映射表
 * * 原「方块随机刻映射表」并入作其中的`RANDOM_TICK`事件（`NATIVE_BLOCK_RANDOM_TICK_MAP`）
 * * 原`moveOutTestPlayer`并入作其中的`PLAYER_MOVE_OUT`事件
 */
export const BATR_BLOCK_EVENT_MAP: BlockEventMap = {
	// * 门
	[BatrBlockIDs.GATE]: {
		// * 打开时：在玩家移出前关闭（不会伤害到玩家，因为玩家只进行「移动入方块检测」）
		[NativeBlockEventType.PLAYER_MOVE_OUT]: (
			host: IMatrix,
			position: iPoint,
			p: IPlayer
		): void => {
			const block: Block | null = host.map.storage.getBlock(position)
			if (block !== null && block.state instanceof BSGate) {
				block.state.open = false
				// ? 直接修改方块属性是否靠谱？利不利于世界响应（特别是显示端）
			}
		},
		// * 关闭时：在随机刻后打开（切换其开关状态）
		[BlockEventType_Batr.RANDOM_TICK]: (
			host: IMatrix,
			position: iPoint,
			block: Block<BSGate>
		): void => {
			if (block.state instanceof BSGate) {
				// 关闭的「门」随着随机刻打开
				if (!block.state.open) {
					block.state.open = true
				}
				// TODO: 更新显示or方块更新事件
			}
		},
	},
	// * 颜色生成器（外置）
	[BatrBlockIDs.COLOR_SPAWNER]: {
		[BlockEventType_Batr.RANDOM_TICK]: randomTick_ColorSpawner,
	},
	// * 激光陷阱（外置）
	[BatrBlockIDs.LASER_TRAP]: {
		[BlockEventType_Batr.RANDOM_TICK]: randomTick_LaserTrap,
	},
	// * 可移动墙（外置）
	[BatrBlockIDs.MOVEABLE_WALL]: {
		[BlockEventType_Batr.RANDOM_TICK]: randomTick_MoveableWall,
	},
	// * 支援点
	[BatrBlockIDs.SUPPLY_POINT]: {
		// * 机制：收到一个随机刻时，有1/8概率生成一个奖励箱
		[BlockEventType_Batr.RANDOM_TICK]: (
			host: IMatrix,
			position: iPoint,
			block: Block<null>
		): void => {
			// *过程：八分之一概率⇒未有奖励箱在其上⇒生成奖励箱
			if (
				randomBoolean(1, 7) &&
				isHitAnyEntity_I_Grid(position, getBonusBoxes(host))
			) {
				addBonusBoxInRandomTypeByRule(host, position)
			}
		},
	},
}

/**
 * 从一个「发出点」计算「应有的激光长度」
 * * 原`getLaserLength`、`getLaserLength2`
 * * 逻辑：从「发出点」出发，沿着方向直线遍历（直到「最大长度」）
 *   * 通过某一格的条件：以「激光」的方式可通过
 *
 * @param rootP 激光发出的点（根部坐标）
 * @param rot 激光的方向
 * @returns 计算出来的激光长度
 */
function calculateLaserLength(
	host: IMatrix,
	rootP: iPointRef,
	rot: mRot
): uint {
	// 当前位置移至根部
	_temp_calculateLaserLength.copyFrom(rootP)
	// 当前长度
	let l: uint = 0
	// 当前轴向&增量
	const axis = mRot2axis(rot),
		inc = mRot2increment(rot)
	const maxL: uint = host.rule.safeGetRule<uint>(
		MatrixRules_Batr.key_maxLaserLength
	)
	while (
		host.map.testCanPass_I(
			_temp_calculateLaserLength,
			false,
			false,
			true,
			false,
			false
		) &&
		l < maxL
	) {
		l++
		// 一定要走直线，不能用地图里的那个「前进」
		_temp_calculateLaserLength[axis] += inc
	}
	return l
}
const _temp_calculateLaserLength: iPointVal = new iPoint()

/**
 * 判断「玩家(发射的抛射物/使用的武器)是否能伤害另一位玩家」
 * * 逻辑：要么为空「无主⇒可伤害任何玩家」，要么根据配置判断
 *
 * @param player 可能造成伤害的玩家
 * @param other 可能被伤害的玩家
 * @param canHurtEnemy 是否允许伤害敌方
 * @param canHurtSelf 是否允许伤害自身
 * @param canHurtAlly 是否允许伤害友方
 * @returns 「是否能伤害」
 */
export function playerCanHurtOther(
	player: IPlayer | null,
	other: IPlayer,
	canHurtEnemy: boolean,
	canHurtSelf: boolean,
	canHurtAlly: boolean
): boolean {
	return (
		player === null ||
		(canHurtEnemy && isEnemy(player, other)) || // 敌方
		(canHurtSelf && player === other) || // 自己（使用全等运算符）
		(canHurtAlly && isAlly(player, other)) // 友方
	)
}

/**
 * 判断「玩家发射的抛射体是否能伤害另一位玩家」
 * * 重定向至「玩家是否能伤害玩家」，并使用抛射体自身属性
 * @param projectile 抛射体
 * @param other 可能被伤害的玩家
 * @returns 「是否能伤害」
 */
export function projectileCanHurtOther(
	projectile: Projectile,
	other: IPlayer
): boolean {
	return playerCanHurtOther(
		projectile.owner,
		other,
		projectile.canHurtEnemy,
		projectile.canHurtSelf,
		projectile.canHurtAlly
	)
}

// /**
//  * （原「是否为AI玩家」）判断一个玩家是否「受AI操控」
//  * * 原理：使用「控制器是否为『AI控制器』」判断
//  */
// export function isAIControl(player: IPlayer): boolean {
//	 return player.controller instanceof AIController;
// }
// !【2023-09-27 23:49:23】↑现在不知道要不要「如此主观地判断」——好像「玩家和AI的区分」就那么理所当然一样

/**
 * 【玩家】获取一个玩家升级所需的经验
 * * 算法：(等级+1)*5 + floor(等级/2)
 *
 * 【2023-09-23 11:18:56】经验表：
 * ```
 * 0 => 5
 * 1 => 10
 * 2 => 16
 * 3 => 21
 * 4 => 27
 * ```
 *
 * @param level 所基于的等级
 * @returns 该等级的最大经验（升级所需经验-1）
 */
export function playerLevelUpExperience(level: uint): uint {
	return (level + 1) * 5 + (level >> 1)
}

/**
 * 存储（靠键盘操作的）玩家默认的「控制按键组」
 * * 除了默认值外，新增「使用」绑定
 */
export const BATR_DEFAULT_PLAYER_CONTROL_CONFIGS: Record<
	uint,
	PlayerControlConfig
> = mergeRecords(
	NATIVE_DEFAULT_PLAYER_CONTROL_CONFIGS,
	{
		// P1: WASD, Space
		1: {
			// 使用「二元组」表示「按下动作/释放动作」
			[MDNCodes.SPACE]: [
				EnumBatrPlayerAction.START_USING,
				EnumBatrPlayerAction.STOP_USING,
			], // 用
		},
		// P2: ↑←↓→, numpad_0
		2: {
			// 使用「二元组」表示「按下动作/释放动作」
			[MDNCodes.NUMPAD_0]: [
				EnumBatrPlayerAction.START_USING,
				EnumBatrPlayerAction.STOP_USING,
			], // 用
		},
		// P3: UHJK, ]
		3: {
			// 使用「二元组」表示「按下动作/释放动作」
			[MDNCodes.BRACKET_RIGHT]: [
				EnumBatrPlayerAction.START_USING,
				EnumBatrPlayerAction.STOP_USING,
			], // 用
		},
		// P4: 8456, +
		4: {
			// 使用「二元组」表示「按下动作/释放动作」
			[MDNCodes.NUMPAD_ADD]: [
				EnumBatrPlayerAction.START_USING,
				EnumBatrPlayerAction.STOP_USING,
			], // 用
		},
	},
	// * 第二层合并，不然会变成「直接替换」
	(sV, tV) => mergeRecords(sV, tV)
)

// 世界规则相关 //

/**
 * 加载基本的玩家队伍
 * * 内容：多个「色调均匀分布」的彩色队伍，与多个「亮度均匀分布」的灰度队伍
 * * 【2023-09-24 16:22:42】现在是「原生世界机制」中的内容，而非内置在「世界规则」之中
 * * 📌先前代码：`GameRule_V1.initPlayerTeams([], 3, 8)`
 */
export function initBasicPlayerTeams(
	parent: PlayerTeam[],
	coloredTeamCount: uint,
	grayscaleTeamCount: uint
): PlayerTeam[] {
	// let parent: PlayerTeam[] = new Array<PlayerTeam>();
	clearArray(parent)

	let h: uint, s: number, v: number, color: uint
	let i: uint
	// 黑白色队伍
	h = 0
	s = 0
	for (i = 0; i < grayscaleTeamCount; i++) {
		v = (i / (grayscaleTeamCount - 1)) * 100
		color = HSVtoHEX(h, s, v)
		parent.push(new PlayerTeam(color))
	}
	h = 0
	s = 100
	v = 100
	// Colored Team
	for (i = 0; i < coloredTeamCount; i++) {
		h = (360 * i) / coloredTeamCount
		color = HSVtoHEX(h, s, v)
		parent.push(new PlayerTeam(color))
	}
	return parent
}

/**
 * （用于菜单背景）「世界初始化」时产生的固定规则
 * * 八个AI // TODO: 日后会挪用到「启动配置」上
 * * 随机武器
 * // * 不断切换的地图
 * // * 混战
 *
 * !【2023-10-16 23:08:51】不包括具体的「会出现的工具」「会出现的奖励类型」「会随机到的地图」
 * * 亦即：具体内容需要自行配置
 */
export function loadAsBackgroundRule(rule: IMatrixRule): IMatrixRule {
	// 先加载两个背景规则 //
	rule.loadFromDefaultValueMap(MatrixRules_Native.DEFAULT_VALUE_MAP)
	rule.loadFromDefaultValueMap(MatrixRules_Batr.DEFAULT_VALUE_MAP)
	// 然后加载特性 //
	// rule.playerCount = 0
	// rule.AICount = 8
	rule.setRule<Tool | string>(MatrixRules_Batr.key_defaultTool, 'c-random')
	rule.setRule<int>(MatrixRules_Native.key_remainLivesPlayer, -1)
	// rule..remainLivesAI = -1
	// 加载玩家队伍
	rule.setRule<PlayerTeam[]>(
		MatrixRules_Batr.key_playerTeams,
		initBasicPlayerTeams([], 3, 8) // 扩展只读属性
	)
	return rule
}

/**
 * 基于世界规则获取一个新的工具
 *
 * @param rule 所基于的世界规则
 * @returns 一个新的工具，基于「世界规则」中的原型
 */
export function randomToolEnable(rule: IMatrixRule): Tool {
	return randomIn(
		rule.safeGetRule<Tool[]>(MatrixRules_Batr.key_enabledTools)
	).copy()
}

/**
 * 基于规则获取随机地图
 *
 * @param rule 需要从中获取地图的规则
 * @returns 规则中的一个随机地图（原型引用）
 */
export function getRandomMap(rule: IMatrixRule): IMap {
	return randomInWeightMap(
		rule.safeGetRule<Map<IMap, number>>(
			MatrixRules_Native.key_mapRandomPotentials
		)
	)
}

/** 缓存的「新映射」变量 */
const _temp_filterBonusType: Map<BonusType, number> = new Map<
	BonusType,
	number
>()
/**
 * 根据规则过滤奖励类型
 *
 * 过滤列表：
 * * 是否锁定队伍⇒排除关闭所有「能改变玩家队伍的奖励类型」
 *
 * ! 返回一个新映射，但不会深拷贝
 */
function filterBonusType(
	rule: IMatrixRule,
	m: Map<BonusType, number>
): Map<BonusType, number> {
	// 先清除
	_temp_filterBonusType.clear()
	// 开始添加
	m.forEach((weight: number, type: BonusType): void => {
		// 过滤1：「锁定队伍」
		if (
			type == NativeBonusTypes.RANDOM_CHANGE_TEAM /*  ||
				type == NativeBonusTypes.UNITE_PLAYER ||
				type == NativeBonusTypes.UNITE_AI */ // !【2023-10-04 22:57:24】现已被移除
		)
			return
		// 添加
		_temp_filterBonusType.set(type, weight)
	})
	// 返回
	return _temp_filterBonusType
}

/**
 * 随机获取奖励类型
 *
 * ! 会被某些规则预过滤
 *
 * @returns 随机出来的奖励类型
 */
export function getRandomBonusType(rule: IMatrixRule): BonusType {
	return randomInWeightMap(
		filterBonusType(
			rule,
			rule.safeGetRule<Map<BonusType, number>>(
				MatrixRules_Batr.key_bonusTypePotentials
			)
		)
	)
}
