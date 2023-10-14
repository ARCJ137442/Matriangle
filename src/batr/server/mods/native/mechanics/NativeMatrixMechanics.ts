import {
	iPointRef,
	fPointVal,
	fPoint,
	iPointVal,
	iPoint,
	traverseNDSquareSurface,
} from '../../../../common/geometricTools'
import { MDNCodes } from '../../../../common/keyCodes'
import { int, int$MIN_VALUE, uint } from '../../../../legacy/AS3Legacy'
import BlockAttributes from '../../../api/block/BlockAttributes'
import Entity from '../../../api/entity/Entity'
import { i_inGrid, i_outGrid, i_hasDirection } from '../../../api/entity/EntityInterfaces'
import IMap from '../../../api/map/IMap'
import { mRot } from '../../../general/GlobalRot'
import { alignToGridCenter_P } from '../../../general/PosTransform'
import IMatrix from '../../../main/IMatrix'
import EffectPlayerDeathLight from '../../batr/entity/effect/EffectPlayerDeathLight'
import EffectSpawn from '../../batr/entity/effect/EffectSpawn'
import EffectTeleport from '../../batr/entity/effect/EffectTeleport'
import { i_batrPlayer } from '../../batr/entity/player/IPlayerBatr'
import { i_hasStats } from '../../batr/entity/player/IPlayerHasStats'
import { computeFinalBlockDamage, bonusBoxTest } from '../../batr/mechanics/BatrMatrixMechanics'
import IPlayer, { isPlayer } from '../entities/player/IPlayer'
import { PlayerControlConfig } from './program/KeyboardControlCenter'
import MatrixRuleBatr from '../rule/MatrixRuleBatr'

/**
 * 所有世界的「原生逻辑」
 * * 【2023-09-17 16:03:55】现在使用静态函数，实现「具体类无关」的Julia风格方法
 * * 用这样一个「事件注册」类承担所有的导入，让「方块」「实体」等类实现轻量化
 *
 * TODO: 是否「显示事件」也要这样「外包到『事件注册表』中」去？
 *
 * !【2023-10-13 19:06:17】分离逻辑：尽可能使用「类继承」的「单分派」特性
 * * 方法：把所有「依赖于Batr特有逻辑」的代码，都放入一个「专门的『机制分派对象』中」
 *   * 以便于针对「机制类」分派方法
 *   * 顺带使用`super`解决「复用」的问题
 * * 注：这种特性在Julia中很自然（就是「声明不同方法+invoke」的事情），但在传统OOP中就没那么显而易见
 */
//================🎛️世界加载================//

// 世界规则相关 //

//================⚙️实体管理================//

//================🕹️玩家================//

// !【2023-10-09 19:26:02】`isPlayer`现已迁移至`IPlayer`类中
/**
 * 用于在「通用化」后继续「专用化」，获取所有玩家的列表
 *
 * @param host 所在的母体
 * @returns 所有玩家的列表
 */
export function getPlayers(host: IMatrix): IPlayer[] {
	if ('players' in host) {
		return host['players'] as IPlayer[]
	}

	// 否则原样筛选
	else {
		return host.entities.filter(isPlayer)
	}
}

// 键盘控制相关 //

// !【2023-10-14 10:30:37】有关「键盘控制标准」已移至{@link KeyboardController}

/**
 * 存储「玩家向某方向移动」的枚举
 * * 很大程度上基于「任意维整数角」{@link mRot}
 * * 注意：目前的「移动」是负数
 */
export enum PlayerMoveActions {
	X_P = -1,
	X_N = -2,
	Y_P = -3,
	Y_N = -4,
	Z_P = -5,
	Z_N = -6,
	W_P = -7,
	W_N = -8,
}

/**
 * 存储（靠键盘操作的）玩家默认的「控制按键组」
 */
export const NATIVE_DEFAULT_PLAYER_CONTROL_CONFIGS: Record<uint, PlayerControlConfig> = {
	// P1: WASD, Space
	1: {
		[MDNCodes.KEY_D]: PlayerMoveActions.X_P, // 右
		[MDNCodes.KEY_A]: PlayerMoveActions.X_N, // 左
		[MDNCodes.KEY_S]: PlayerMoveActions.Y_P, // 下
		[MDNCodes.KEY_W]: PlayerMoveActions.Y_N, // 上
	},
	// P2: ↑←↓→, numpad_0
	2: {
		[MDNCodes.ARROW_RIGHT]: PlayerMoveActions.X_P, // 右
		[MDNCodes.ARROW_LEFT]: PlayerMoveActions.X_N, // 左
		[MDNCodes.ARROW_DOWN]: PlayerMoveActions.Y_P, // 下
		[MDNCodes.ARROW_UP]: PlayerMoveActions.Y_N, // 上
	},
	// P3: UHJK, ]
	3: {
		[MDNCodes.KEY_K]: PlayerMoveActions.X_P, // 右
		[MDNCodes.KEY_H]: PlayerMoveActions.X_N, // 左
		[MDNCodes.KEY_J]: PlayerMoveActions.Y_P, // 下
		[MDNCodes.KEY_U]: PlayerMoveActions.Y_N, // 上
	},
	// P4: 8456, +
	4: {
		[MDNCodes.NUMPAD_6]: PlayerMoveActions.X_P, // 右
		[MDNCodes.NUMPAD_4]: PlayerMoveActions.X_N, // 左
		[MDNCodes.NUMPAD_5]: PlayerMoveActions.Y_P, // 下
		[MDNCodes.NUMPAD_8]: PlayerMoveActions.Y_N, // 上
	},
}

//================🗺️地图================//

// 测试

/**
 * 当每个玩家「移动到某个方块」时，在移动后的测试
 * * 测试位置即为玩家「当前位置」（移动后！）
 * * 有副作用：用于处理「伤害玩家的方块」
 *
 * @param host 检测所在的母体
 * @param player 被检测的玩家
 * @param isLocationChange 是否是「位置变更」所需要的（false用于「陷阱检测」）
 * @returns 这个函数是否执行了某些「副作用」（比如「伤害玩家」「旋转玩家」等），用于「陷阱伤害延迟」
 */
export function playerMoveInTest(host: IMatrix, player: IPlayer, isLocationChange: boolean = false): boolean {
	// 非激活&无属性⇒不检测（返回）
	if (!player.isActive) return false
	const attributes: BlockAttributes | null = host.map.storage.getBlockAttributes(player.position)
	if (attributes === null) return false

	let returnBoo: boolean = false
	// 开始计算
	const finalPlayerDamage: int = computeFinalBlockDamage(
		player.maxHP,
		host.rule.safeGetRule<int>(MatrixRuleBatr.key_playerAsphyxiaDamage),
		attributes.playerDamage
	)
	// int$MIN_VALUE⇒无伤害&无治疗
	if (finalPlayerDamage !== int$MIN_VALUE) {
		// 负数⇒治疗
		if (finalPlayerDamage < 0) {
			if (!isLocationChange)
				player.isFullHP
					? (player.heal -= finalPlayerDamage) /* 注意：这里是负数 */ // 满生命值⇒加「储备生命值」
					: player.addHP(host, -finalPlayerDamage, null) // 否则直接加生命值
		}
		// 正数⇒伤害
		else player.removeHP(host, finalPlayerDamage, null)
		returnBoo = true
	}
	// 附加的「旋转」效果
	if (attributes.rotateWhenMoveIn) {
		// 玩家向随机方向旋转
		player.turnTo(host, host.map.storage.randomRotateDirectionAt(player.position, player.direction, 1))
		returnBoo = true
	}
	return returnBoo
}

/**
 * 传送玩家到指定位置
 * * 先取消玩家激活
 * * 不考虑「是否可通过」
 * * 可选的「传送特效」
 *
 * @param host 所在的母体
 * @param player 被传送的玩家
 * @param p 传送目的地
 * @param rotateTo 玩家传送后要被旋转到的方向（默认为玩家自身方向）
 * @param isTeleport 是否「不是重生」（亦即：有「传送特效」且被计入统计）
 * @returns 玩家自身
 */
export function teleportPlayerTo(
	host: IMatrix,
	player: IPlayer,
	p: iPointRef,
	rotateTo: mRot = player.direction,
	isTeleport: boolean = false
): IPlayer {
	player.isActive = false
	// !【2023-10-04 17:25:13】现在直接设置位置（在setter中处理附加逻辑）
	player.setPosition(host, p, true) // *【2023-10-08 20:37:56】目前还是触发相应钩子（方块事件）
	player.direction = rotateTo
	// 在被传送的时候可能捡到奖励箱
	if (i_batrPlayer(player)) bonusBoxTest(host, player, p)
	// 被传送后添加特效
	if (isTeleport) {
		const fp: fPointVal = alignToGridCenter_P(p, new fPoint()) // 对齐网格中央
		host.addEntity(new EffectTeleport(fp))
		// 只有在「有特效」的情况下算作「被传送」
		if (i_hasStats(player)) player.stats.beTeleportCount++
	}
	player.isActive = true
	return player
}

/**
 * 分散玩家
 */
export function spreadPlayer(
	host: IMatrix,
	player: IPlayer,
	rotatePlayer: boolean = true,
	createEffect: boolean = true
): IPlayer {
	// !【2023-10-04 17:12:26】现在不管玩家是否在重生
	let p: iPointRef = host.map.storage.randomPoint
	const players: IPlayer[] = getPlayers(host)
	// 尝试最多256次
	for (let i: uint = 0; i < 255; i++) {
		// 找到一个合法位置⇒停
		if (player.testCanGoTo(host, p, true, true, players)) {
			break
		}
		// 没找到⇒继续
		p = host.map.storage.randomPoint // 复制一个引用
	}
	// 传送玩家
	teleportPlayerTo(
		host,
		player,
		p, // 传引用
		// 是否要改变玩家朝向
		rotatePlayer ? host.map.storage.randomForwardDirectionAt(p) : player.direction,
		createEffect
	)
	// Debug: console.log('Spread '+player.customName+' '+(i+1)+' times.')
	return player
}

/**
 * 分散所有玩家
 */
export function spreadAllPlayer(host: IMatrix): void {
	for (const player of getPlayers(host)) {
		spreadPlayer(host, player)
	}
}

/**
 * 重生所有玩家
 * @param host 所涉及的母体
 */
export function respawnAllPlayer(host: IMatrix): void {
	for (const player of getPlayers(host)) {
		respawnPlayer(host, player)
	}
}

/**
 * 在一个重生点处「重生」玩家
 * * 逻辑：寻找随机重生点⇒移动玩家⇒设置随机特效
 *
 * @param host 所涉及的母体
 * @param player 重生的玩家
 */
export function respawnPlayer(host: IMatrix, player: IPlayer): IPlayer {
	let p: iPointVal | undefined = host.map.storage.randomSpawnPoint?.copy() // 空值访问`null.copy()`会变成undefined

	// 没位置⇒直接分散玩家
	if (p === undefined) {
		spreadPlayer(host, player, true, false)
		p = player.position // 重新确定重生地
	}

	// 有位置⇒直接重生在此/进一步在其周围寻找（应对「已经有玩家占据位置」的情况）
	else
		teleportPlayerTo(
			host,
			player,
			findFitSpawnPoint(host, player, p), // !就是这里需要一个全新的值，并且因「类型不稳定」不能用缓存技术
			host.map.storage.randomForwardDirectionAt(p),
			false // 无需特效
		) // 无需重新确定重生地

	// 加特效
	const fp: fPointVal = alignToGridCenter_P(p, new fPoint()) // 对齐网格中央，只需要生成一个数组
	host.addEntities(
		new EffectSpawn(fp), // 重生效果
		EffectPlayerDeathLight.fromPlayer(p, player, true)
	)
	// Return
	// Debug: console.log('respawnPlayer:respawn '+player.customName+'.')
	return player
}

const _temp_findFitSpawnPoint_pMax: iPoint = new iPoint()
const _temp_findFitSpawnPoint_pMin: iPoint = new iPoint()
/**
 * 在一个重生点附近寻找可用的重生位置
 * * 重生点处可用就直接在重生点处，否则向外寻找
 * * 若实在找不到，就强制在重生点处重生
 * * 符合「可重生」的条件：地图内&可通过
 *
 * ! 目前的bug：（来自于`traverseNDSquareSurface`）不会检查对角线上的位置
 *
 * ! 会改变点spawnP的位置，以作为「最终重生点」
 *
 * ? 【2023-10-04 18:11:09】实际上应该有一个「从重生点开始，从内向外遍历」的算法
 *
 * @param searchR 搜索的最大曼哈顿半径（默认为16）
 */
function findFitSpawnPoint(host: IMatrix, player: IPlayer, spawnP: iPointRef, searchR: uint = 16): iPoint {
	const players: IPlayer[] = getPlayers(host)
	// 尝试直接在重生点处重生
	if (host.map.storage.isInMap(spawnP) && player.testCanGoTo(host, spawnP, true, true, players)) return spawnP
	// 重生点处条件不满足⇒开始在周围寻找
	let isFound: boolean = false
	// 直接遍历
	_temp_findFitSpawnPoint_pMax.copyFrom(spawnP)
	_temp_findFitSpawnPoint_pMin.copyFrom(spawnP)
	// 一层层向外遍历
	for (let r: uint = 1; r <= searchR; r++) {
		traverseNDSquareSurface(_temp_findFitSpawnPoint_pMin, _temp_findFitSpawnPoint_pMax, (p: iPointRef): void => {
			// 判断の条件：
			if (!isFound && host.map.storage.isInMap(p) && player.testCanGoTo(host, p, true, true, players)) {
				spawnP.copyFrom(p)
				isFound = true
			}
		})
		// 找到就直接返回
		if (isFound) break
		// 没找到⇒坐标递增，继续
		_temp_findFitSpawnPoint_pMax.addFromSingle(1)
		_temp_findFitSpawnPoint_pMin.addFromSingle(-1)
	}
	return spawnP
}

/**
 * 切换一个母体的地图
 * * 迁移自AS3版本`Game.changeMap`
 *
 * ! 不会拷贝原先的地图
 *
 * @param host 要更改地图的「游戏母体」
 * @param generateNew 是否告知地图「生成新一代」（用于一些「依靠代码随机生成」的地图）
 */
export function changeMap(host: IMatrix, map: IMap, generateNew: boolean): void {
	host.map = map
	map.storage.generateNext()
	// TODO: 显示更新
}

/**
 * 投影实体的坐标到某地图中
 * * 用于「在『维数不同』的地图间切换」中，确保坐标&朝向合法
 *
 * ! 【2023-10-08 23:59:54】只会修改实体坐标（数组），不会触发任何其它代码
 * * 如：不会触发玩家「移动」的钩子函数
 *
 * @param entity 要投影的实体
 * @param map 要投影到的地图
 */

export function projectEntity(map: IMap, entity: Entity): void {
	// 有坐标⇒投影坐标
	if (i_inGrid(entity)) {
		// !【2023-10-11 23:50:15】零维规避：只有一维以上的坐标会被投影（用于规避「重生时玩家被投影到原点」的问题）
		if (entity.position.length > 0) map.projectPosition_I(entity.position)
	} else if (i_outGrid(entity)) {
		// !【2023-10-11 23:50:15】零维规避：只有一维以上的坐标会被投影（用于规避「重生时玩家被投影到原点」的问题）
		if (entity.position.length > 0) map.projectPosition_F(entity.position)
	}
	// 有方向⇒投影方向
	if (i_hasDirection(entity)) {
		map.projectDirection(entity.direction)
	}
}

/**
 * 投影所有实体的坐标
 * * 用于「在『维数不同』的地图间切换」中，确保坐标&朝向合法
 *
 * ! 【2023-10-08 23:59:54】只会修改实体坐标（数组），不会触发任何其它代码
 * * 如：不会触发玩家「移动」的钩子函数
 *
 */
export function projectEntities(map: IMap, entities: Entity[]): void {
	entities.forEach((e: Entity): void => projectEntity(map, e))
}
