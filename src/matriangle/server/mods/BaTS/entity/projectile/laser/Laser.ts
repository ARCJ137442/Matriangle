import { iPoint, intPoint } from '../../../../../../common/geometricTools'
import {
	IShape,
	IGraphicContext,
} from '../../../../../../display/api/DisplayInterfaces'
import { DEFAULT_SIZE } from '../../../../../../display/api/GlobalDisplayVariables'
import { uint } from '../../../../../../legacy/AS3Legacy'
import {
	IEntityInGrid,
	IEntityFixedLived,
} from '../../../../../api/entity/EntityInterfaces'
import {
	isAxisPositive_M,
	mRot,
	mRot2axis,
} from '../../../../../general/GlobalRot'
import IMatrix from '../../../../../main/IMatrix'
import IPlayer from '../../../../native/entities/player/IPlayer'
import { getPlayers } from '../../../../native/mechanics/NativeMatrixMechanics'
import {
	computeFinalDamage,
	playerCanHurtOther,
} from '../../../mechanics/BatrMatrixMechanics'
import Tool from '../../../tool/Tool'
import { i_hasAttributes } from '../../player/IPlayerHasAttributes'
import Projectile from '../Projectile'

/**
 * 「激光」是
 * * 在网格之内的（逻辑上从一格的方块**直线**延伸到另一格，属于「格点实体」）的
 * * 有一个「发射朝向」的
 * * 生成后在一固定周期内结束的
 * 抛射体
 */

export default abstract class Laser
	extends Projectile
	implements IEntityInGrid, IEntityFixedLived
{
	//============Instance Variables============//
	/** 激光的长度 */
	public _length: uint
	/** 对外只读的「激光长度」 */
	public get length(): number {
		return this._length
	}
	/** 先前是否已对实体造成伤害 */
	public hasDamaged: boolean = false

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: uint,
		LIFE: uint,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		chargePercent: number = 1 // * 没有「充能机制」就是「完全充能」
	) {
		super(
			owner,
			attackerDamage * chargePercent, // ?【2023-10-15 12:39:29】这里的计算可能会被`initFromToolNAttributes`覆盖掉
			extraDamageCoefficient,
			direction
		)
		this._position.copyFrom(position)
		this._length = length
		this._temp_chargePercent = chargePercent // !【2023-10-15 12:39:19】临时缓存，以便在`initFromToolNAttributes`中调用
		this._LIFE = LIFE
		this._life = LIFE * chargePercent
	}
	protected _temp_chargePercent: number = 1

	override initFromToolNAttributes(tool: Tool, buffDamage: number): this {
		// 先使用「工具默认伤害」初始化
		super.initFromToolNAttributes(tool, buffDamage)
		this._attackerDamage *= this._temp_chargePercent
		return this
	}

	// 固定生命周期 //
	public readonly i_fixedLive = true as const

	/** 总存在时间 */
	protected _life: uint
	protected _LIFE: uint
	public get life(): uint {
		return this._life
	}
	public get LIFE(): uint {
		return this._LIFE
	}
	public get lifePercent(): number {
		return this._life / this._LIFE
	}

	// 格点 //
	// public readonly i_inGrid = true as const;
	/**
	 * 存储激光的格点位置
	 * * 坐标即为「激光根部」，又称「起始点」
	 */
	protected readonly _position: iPoint = new iPoint()
	/** 激光的格点位置（起始点） */
	get position(): intPoint {
		return this._position
	}
	set position(value: intPoint) {
		this._position.copyFrom(value)
	}

	//============World Mechanics============//
	/**
	 * 处理生命周期
	 * * 不断减少「生命值」
	 * * 减少到0及以下：通知世界移除自身
	 *
	 * @param host 母体
	 */
	public dealLife(host: IMatrix): void {
		if (--this._life <= 0)
			// ! 一到0便移除，避免多余的一次世界刻处理
			host.removeEntity(this) // TODO: 有待「实体系统」的修缮
	}

	/**
	 * 默认的「世界刻逻辑」：处理生命周期
	 * @param host 母体
	 */
	override onTick(host: IMatrix): void {
		super.onTick(host)
		this.dealLife(host)
	}

	/**
	 * 对玩家的碰撞测试
	 * * 【2023-10-15 10:48:39】产生来由：只需要「玩家个数×坐标维数」的计算复杂度
	 *   * 相比「预先缓存坐标」「主动循环遍历」（均为自身长度×玩家个数）的方式，性能更佳
	 *
	 * @param player 需要做碰撞测试的玩家
	 * @returns 这个玩家是否在光束的作用范围内
	 */
	protected hitTestPlayer(player: IPlayer): boolean {
		const beamAxis = mRot2axis(this.direction)
		for (let i = 0; i < this.position.length; i++) {
			// 「光束轴向」⇒判断「0 < 距离/朝向向量 < 自身实际长度」
			if (i === beamAxis) {
				// 计算相对于「光束朝向」的绝对距离，脱离范围相当于「在激光直线之外」
				const hitDistance = isAxisPositive_M(this.direction)
					? player.position[i] - this.position[i] // 自身朝向为正方向⇒应该用正数(自身方向)*【距离】碰到玩家坐标
					: this.position[i] - player.position[i] // 自身朝向为负方向⇒应该用负数(自身方向)*【距离】碰到玩家坐标
				// 脱离の条件：反方向 || 在长度之外（一般见于「被方块阻挡」，这里的「长度」是在外部被计算的）
				if (hitDistance < 0 || hitDistance > this.length) return false
			}
			// 其它轴向：不等⇒不可能碰着
			else if (this.position[i] !== player.position[i]) return false
		}
		return true
	}

	/**
	 * 激光伤害单个玩家
	 * * 用于被子类重载改写，以便扩展功能（如「传送激光」的传送）
	 * * 📌实际核心还是避免「硬分派」的发生（如「在世界机制中手动判断乃至switch类型」）
	 *
	 * @default 默认逻辑：伤害玩家
	 *
	 * @param host 所在母体
	 * @param player 被伤害的玩家
	 * @param canHurt 计算出的「激光是否能（应）伤害该玩家」
	 * @param finalDamage 计算出的「最终伤害」
	 */
	protected hitAPlayer(
		host: IMatrix,
		player: IPlayer,
		canHurt: boolean,
		finalDamage: uint
	): void {
		if (canHurt) player.removeHP(host, finalDamage, this.owner)
	}

	/**
	 * （在母体内）「伤害」玩家
	 *
	 * @param host 所影响的母体
	 */
	protected hurtPlayers(host: IMatrix): void {
		// 改变「已尝试造成伤害」标签
		this.hasDamaged = true
		// 遍历所有玩家
		for (const player of getPlayers(host)) {
			// 碰撞检测
			if (this.hitTestPlayer(player))
				// 伤害（一个）玩家
				this.hitAPlayer(
					host,
					player,
					playerCanHurtOther(
						this.owner,
						player,
						this.canHurtEnemy,
						this.canHurtSelf,
						this.canHurtAlly
					),
					computeFinalDamage(
						this._attackerDamage,
						// 计算「最终伤害」
						player !== null && i_hasAttributes(player)
							? player.attributes.buffResistance
							: 0,
						this._extraResistanceCoefficient
					)
				)
		}
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IMatrix): void {}

	//============Display Implements============//
	/**
	 * 唯一做的一件事，就是「缩放图形长度使其与激光长度一致」
	 * * 原理：图形上下文中只绘制「一格内激光的样子」（并且是类条形码横纹），再由图像拉伸机制把图形拉长
	 */
	public shapeInit(shape: IShape): void {
		shape.scaleX = this._length
	}
	/**
	 * 刷新：（暂时只）更新激光长度
	 *
	 * ? 是否需要重绘图形，以便（每次显示更新时）响应玩家颜色
	 * * 可能的性能开销
	 */
	public shapeRefresh(shape: IShape): void {
		// this.shapeDestruct(shape);
		// this.shapeInit(shape);
		shape.scaleX = this._length
	}
	/** 析构：清空图形上下文 */
	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear()
	}

	/**
	 * 绘制一个「Beam」
	 * @param graphics 2D绘画上下文
	 * @param y1 以x轴为横轴的「起始垂直坐标」
	 * @param y2 以x轴为横轴的「终止垂直坐标」
	 * @param color 绘制的颜色
	 * @param alpha 绘制的不透明度
	 */
	protected drawLine(
		graphics: IGraphicContext,
		y1: number,
		y2: number,
		color: uint = 16777215,
		alpha: number = 1
	): void {
		const yStart: number = Math.min(y1, y2)
		graphics.beginFill(color, alpha)
		graphics.drawRect(0, yStart, DEFAULT_SIZE, Math.max(y1, y2) - yStart)
		graphics.endFill()
	}

	protected drawOwnerLine(
		graphics: IGraphicContext,
		y1: number,
		y2: number,
		alpha: number = 1
	): void {
		const yStart: number = Math.min(y1, y2)
		graphics.beginFill(this.ownerColor, alpha)
		graphics.drawRect(0, yStart, DEFAULT_SIZE, Math.max(y1, y2) - yStart)
		graphics.endFill()
	}
}
