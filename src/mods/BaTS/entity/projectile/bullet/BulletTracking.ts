import { fPoint } from 'matriangle-common/geometricTools'
import { uint, int } from 'matriangle-legacy/AS3Legacy'
import {
	comparePosition_I,
	mRot,
} from 'matriangle-api/server/general/GlobalRot'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import Bullet from './Bullet'
import {
	projectileCanHurtOther,
	toolCreateExplode,
} from '../../../mechanics/BatrMatrixMechanics'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { typeID } from 'matriangle-api'

/**
 * 跟踪子弹
 * * - 爆炸半径
 * * + 智能追踪
 * * ± 可变速度
 */

export default class BulletTracking extends Bullet {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'BulletTracking'

	public static readonly DEFAULT_SPEED: number = 12 / FIXED_TPS
	public static readonly DEFAULT_EXPLODE_COLOR: uint = 0xffff00
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 0.875

	//============Instance Variables============//
	protected _target: IPlayer | null = null
	protected _trackingFunction: (player: IPlayer) => mRot | -1 =
		this.getTargetRotWeak.bind(this) // not the criterion
	protected _scalePercent: number = 1
	protected _cachedTargets: IPlayer[] = []

	/** 类型注册（TS中实现抽象属性，可以把类型限定为其子类） */ // !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）
	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: fPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		speed: number,
		finalExplodeRadius: number,
		playersInWorld: IPlayer[],
		initialScalePercent: number,
		smartTrackingMode: boolean
	) {
		super(
			BulletTracking.ID,
			owner,
			position,
			direction,
			attackerDamage,
			extraDamageCoefficient,
			speed,
			finalExplodeRadius
		)
		// 尺寸规模（需要多次切换，因此缓存为实例变量）
		this._scalePercent = initialScalePercent
		// 目标追踪函数
		if (smartTrackingMode)
			this._trackingFunction = this.getTargetRot.bind(this)
		// 缓存「潜在目标」
		this.cacheTargetsIn(playersInWorld)
	}

	//============Instance Functions============//
	/**
	 * Cached some static properties, during the short lifespan of the bullet
	 * * 因其短周期性&访问高频性，直接缓存一个数组，以缩小搜索范围
	 */
	protected cacheTargetsIn(players: IPlayer[]): void {
		for (const player of players) {
			if (
				player !== null && // not null
				(this._owner === null || projectileCanHurtOther(this, player)) // 需可使用工具伤害
			)
				this._cachedTargets.push(player)
		}
	}

	/**
	 * ! 【20230915 20:12:19】重要的是：使用存取器设置属性，而非直接设定值
	 * @param host 母体
	 */
	override onTick(host: IMatrix): void {
		let tempRot: mRot
		// 没目标⇒找目标
		if (this._target === null) {
			let player: IPlayer
			// 根据缓存的目标开始检查，并择机开始跟踪
			for (let i: int = this._cachedTargets.length - 1; i >= 0; i--) {
				player = this._cachedTargets[i]
				// 检查目标合法性，并直接在「缓存的目标」列表中筛除（避免重复遍历）
				if (this.checkTargetInvalid(player)) {
					this._cachedTargets.splice(i, 1)
					continue
				}
				// 若「位置合法」&「值得转向」，则开始追踪
				if (
					this.isWorthToChangeDirection(host) &&
					this.getTargetRotWeak(player) !== -1
				) {
					this._target = player
					this.direction = this.getTargetRot(player)
					this.speed =
						BulletTracking.DEFAULT_SPEED * this._scalePercent
					break
				}
			}
		}
		// 如果失去了目标（玩家等待重生、不再能被工具伤害、目标「跟丢了」），重置
		else if (
			this.checkTargetInvalid(this._target) || // 先检查「玩家是否合法」
			(tempRot = this._trackingFunction(this._target)) === -1 // 再检查「是否跟丢了」
		) {
			this._target = null
		}
		// 如果目标还在且「值得转向」，那就继续追踪目标
		else if (this.isWorthToChangeDirection(host)) {
			this.direction = tempRot
		}
		// * 之后才开始父类逻辑（移动）
		super.onTick(host)
	}

	/**
	 * 判断其位置是否适合「开始追踪目标」
	 * * 逻辑：是否处于方块网格的「中间一半」部分
	 * * 🎯避免「在边边就开始『擦边追踪』」
	 *
	 * @param host 所属母体
	 * @returns 其位置是否适合「开始追踪目标」
	 */
	protected isWorthToChangeDirection(_host: IMatrix): boolean {
		// 负向过滤
		for (const pos of this._position) {
			// ! 算法：计算其所属的「四分位区间」
			switch (uint(pos * 4) & 3 /* 取模⇔按位与 */) {
				// 0、3「边缘」：筛去
				case 0:
				case 3:
					return false
				// 默认：通过
				default:
					break
			}
		}
		// 默认为真
		return true
	}

	protected checkTargetInvalid(player: IPlayer): boolean {
		return (
			// player === null || // ! 非空，但在上下文中不会发生（减少重复判断）
			player.isRespawning || // not respawning
			(this._owner !== null && !projectileCanHurtOther(this, player)) // should can use it to hurt
		)
	}

	/**
	 * 在追踪过程中，获取「追踪到玩家需要采取的朝向」的「弱化版本」
	 * * 实际上只需要在n维空间中共(n-1)维超平面（二维是线，三维是面）就可追踪
	 * * 只有在「坐标相等」时响应
	 * * 有一个响应⇒返回该轴向对应方位
	 *
	 * !现在因为「需要统一函数类型」
	 * @param player 所追踪的玩家
	 * @returns 若值得追踪，需要追踪的「绝对距离最大值」方向
	 */
	protected getTargetRotWeak(player: IPlayer): mRot | -1 {
		// * 遍历得到第一个坐标值相等的轴向（例：三维中x轴坐标相同，于是在yOz平面开始跟踪）
		let max_i: uint = 0,
			temp_distance: uint,
			max_distance: uint = 0,
			isAnyLine: boolean = false
		for (let i: uint = 0; i < player.position.nDim; i++) {
			if (this._position_I[i] === player.position[i]) {
				isAnyLine = true
				// 因为是弱化版本，所以只考虑「绝对距离最大」的轴向
				// ! 这时候距离都为零了，还需要往哪儿移动？？
			} else if (
				(temp_distance = this._position_I.getAbsDistanceAt(
					player.position,
					i
				)) > max_distance
			) {
				max_i = i
				max_distance = temp_distance
			}
		}
		// 如果共任意超平面，返回「绝对距离最大值」的逼近方法
		if (isAnyLine) {
			return (
				(max_i << 1) +
				comparePosition_I(
					this._position_I[max_i], // 自己在更正方向，就往负方向走
					player.position[max_i] // 自己在更负方向，就往正方向走
				)
			)
		}
		// 否则无果
		return -1
	}

	/**
	 * 在追踪过程中，获取「追踪到玩家需要采取的朝向」
	 * * 追踪逻辑：先直线走完「绝对距离最大」的方向，然后逐渐变小
	 *
	 * @param player 被追踪的玩家
	 * @returns 「绝对距离最大」维度的索引
	 */
	protected getTargetRot(player: IPlayer): int {
		// 先获取一个最小索引，代表「绝对距离最大」的轴向
		const iMaxAbsDistance: uint = this._position_I.indexOfAbsMaxDistance(
			player.position
		)
		// 然后根据轴向生成「任意维整数角」
		return (
			(iMaxAbsDistance << 1) +
			comparePosition_I(
				this._position_I[iMaxAbsDistance], // 自己在更正方向，就往负方向走
				player.position[iMaxAbsDistance] // 自己在更负方向，就往正方向走
			)
		)
	}

	/** 覆盖：通知母体创建爆炸 */
	override explode(host: IMatrix): void {
		toolCreateExplode(
			host,
			this._owner,
			this._position,
			this.finalExplodeRadius,
			this._attackerDamage,
			this._extraResistanceCoefficient,
			this.canHurtSelf,
			this.canHurtEnemy,
			this.canHurtAlly,
			BulletTracking.DEFAULT_EXPLODE_COLOR,
			1 // 边缘百分比
		)
		// 超类逻辑：移除自身
		super.explode(host)
	}
}
