import { iPoint, intPoint } from 'matriangle-common/geometricTools'
import { uint, int, int$MAX_VALUE } from 'matriangle-legacy/AS3Legacy'
import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'
import Projectile from '../Projectile'
import {
	IEntityFixedLived,
	IEntityInGrid,
} from 'matriangle-api/server/entity/EntityInterfaces'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { mRot, toOpposite_M } from 'matriangle-api/server/general/GlobalRot'
import { playerCanHurtOther } from '../../../mechanics/BatrMatrixMechanics'
import {
	getHitEntity_I_Grid,
	isHitAnyEntity_I_Grid,
} from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { getPlayers } from 'matriangle-mod-native/mechanics/NativeMatrixMechanics'
import { clearArray } from 'matriangle-common/utils'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'

/**
 * 「闪电」
 * * 拥有用于「造成伤害」与「穿透方块」的「能量值」，会在穿透时衰减
 * * 可以穿透多个实体，同时对其造成伤害
 * * 可能会伤害到所有者自己
 * * 在生成的瞬间（生成后第一个世界刻）计算路径并造成伤害
 *   * 后续的淡出效果只在显示端起作用
 *
 * ? 是否要为了「等待消失」而「延长生命周期」？
 *
 * @author ARCJ137442
 */
export default class Lightning
	extends Projectile
	implements IEntityFixedLived, IEntityInGrid
{
	protected _position: iPoint = new iPoint()
	protected _life: uint = Lightning.LIFE

	/** 是否已计算好路径与伤害 */
	public isCalculated: boolean = false

	protected _energy: int
	protected _initialEnergy: int
	public get energyPercent(): number {
		return this._energy / this._initialEnergy
	}

	protected _wayPoints: iPoint[] = []
	protected _hurtPlayers: IPlayer[] = []
	protected _hurtDefaultDamage: uint[] = []

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * @param position 整数位置（根部）
	 * @param direction 初始朝向
	 * @param owner 所有者
	 * @param energy 拥有的「能量」
	 */
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		energy: int
	) {
		super(owner, attackerDamage, extraDamageCoefficient, direction)
		this._position.copyFrom(position)
		this._initialEnergy = this._energy = energy
	}

	// 固定生命周期 //
	public readonly i_fixedLive = true as const

	get LIFE(): uint {
		return Lightning.LIFE
	}
	get life(): uint {
		return this._life
	}
	get lifePercent(): number {
		return this._life / this.LIFE
	}

	// 格点实体 //
	// public readonly i_inGrid = true as const;

	/** 实现：返回自身整数位置（根节点所在方块位置） */
	get position(): intPoint {
		return this._position
	}
	set position(value: intPoint) {
		this._position.copyFrom(value)
	}

	//============Destructor Function============//
	/** 析构：所有数组清空 */
	override destructor(): void {
		clearArray(this._wayPoints)
		clearArray(this._hurtPlayers)
		clearArray(this._hurtDefaultDamage)
	}

	//============World Mechanics============//
	/**
	 * 计算电弧路径
	 */
	protected lightningWays(host: IMatrix): void {
		// Draw in location in this
		const head: iPoint = this._position.copy()
		// let cost: int = 0;
		let player: IPlayer | null = null
		let tRot: mRot = this.owner?.direction ?? 0
		let nRot: mRot | -1 = -1
		// 开始生成路径 //
		// 先把自身位置加进路径
		this.addWayPoint(this._position)
		// 不断循环添加路径
		while (
			// 条件：能量 > 0
			(this._energy -=
				// 计算能量损耗
				/* cost =  */ this.operateCost(host, head)) > 0
		) {
			// console.log('initWay in '+head,nRot,tRot,cost);
			// 标记（并在后续伤害）当前位置的玩家
			player = getHitEntity_I_Grid(head, getPlayers(host))
			if (
				player !== null &&
				(this.owner === null ||
					playerCanHurtOther(
						this.owner,
						player,
						this.canHurtEnemy,
						this.canHurtSelf,
						this.canHurtAlly
					))
			) {
				this._hurtPlayers.push(player)
				this._hurtDefaultDamage.push(
					this._attackerDamage * this.energyPercent
				)
			}
			// Update Rot
			nRot = this.getLeastWeightRot(host, head, tRot)
			if (nRot === -1) {
				tRot = nRot
				this.addWayPoint(head)
			}
			// Move
			host.map.towardWithRot_II(head, nRot, 1)
		}
		// 先前只是根据后节点的方向设置节点，所以最后要把头节点加上
		this.addWayPoint(head)
	}

	/**
	 * 增加路径点
	 * * 会创建新对象，复制已有点
	 *
	 * ! 使用「绝对坐标」（地图坐标）而非「相对坐标」
	 * * 减少计算：仅在显示的时一次性换算（copyFrom+minusFrom）
	 *
	 * @param p 要加入的坐标点（引用）
	 */
	protected addWayPoint(p: iPoint): void {
		// TODO: 高维化
		this._wayPoints.push(p.copy())
	}

	/**
	 * 给出「能量耗损最少」的前进方向
	 * * 使用贪心算法遍历
	 * @param host 所属母体
	 * @param p 当前点
	 * @param nowRot 当前朝向（默认方向）
	 * @returns 新的「目标朝向」（若已找到前进方向），或`-1`（未找到前进方向，一般不会发生）
	 */
	protected getLeastWeightRot(
		host: IMatrix,
		p: iPoint,
		nowRot: mRot
	): mRot | -1 {
		let cost: int
		let result: mRot | -1 = -1
		// 默认
		// nowRot = host.map.storage.randomRotateDirectionAt(p, nowRot, 1); // ? 不知道这行「随机旋转」代码是干啥用的
		// ! 现在不再是「从当前点开始旋转遍历」了，而是「在所有可前进方向中选择除了『来时路』外的所有方向」
		const oppositeR: mRot = toOpposite_M(nowRot)
		let leastCost: int = int$MAX_VALUE // 默认是最大值，鼓励后续贪心替代
		for (const towardR of host.map.storage.getForwardDirectionsAt(p)) {
			// 不吃回头草
			if (towardR === oppositeR) continue
			// 步进位移，缓存位置
			host.map.towardWithRot_II(
				this._temp_getLeastWeightRot.copyFrom(p), // * 先复制自身，然后进行步进位移
				towardR,
				1
			)
			// 计算损耗
			cost = this.operateCost(host, this._temp_getLeastWeightRot)
			// 贪心比对损耗：第一印象式
			if (cost < leastCost) {
				leastCost = cost
				result = towardR
			}
		}
		// 返回
		return result
	}
	/** 临时缓存 */
	protected _temp_getLeastWeightRot: iPoint = new iPoint()

	/**
	 * 计算每个点「通过」所需的「预算值」
	 * @param host 所处的母体
	 * @param p 待计算的点
	 * @returns 当前点的「预算值」
	 */
	protected operateCost(host: IMatrix, p: iPoint): int {
		if (isHitAnyEntity_I_Grid(p, getPlayers(host))) return 5 // The electricResistance of player
		if (host.map.storage.isInMap(p)) return int$MAX_VALUE // The electricResistance out of world
		const attributes: BlockAttributes | null =
			host.map.storage.getBlockAttributes(p)
		if (attributes !== null) return attributes.electricResistance
		return 0
	}

	override onTick(host: IMatrix): void {
		super.onTick(host)
		if (!this.isCalculated) {
			this.isCalculated = true
			this.lightningWays(host)
			// lightningHurtPlayers(host, this, this._hurtPlayers, this._hurtDefaultDamage);
			console.warn(
				'WIP lightningHurtPlayers!',
				this,
				this._hurtPlayers,
				this._hurtDefaultDamage
			)
		}
		// 处理生命周期
		if (this._life > 0) this._life--
		// 大限若至，移除自身
		else host.removeEntity(this)
	}

	/** 实现：不响应「所处方块更新」事件 */
	public onPositedBlockUpdate(host: IMatrix): void {}

	//============Display Implements============//
	public static readonly LIGHT_ALPHA: number = 0.5
	public static readonly LIGHT_BLOCK_WIDTH: number = 0.2
	public static readonly LIFE: uint = TPS / 2

	/** 临时变量：用于「只绘制一次」 */
	protected _isDrawComplete: boolean = false
	// TODO: 【2023-11-15 23:38:04】亟待迁移至显示端
	// /**
	//  * 每次都更新图形的不透明度，但只绘制一次闪电
	//  *
	//  * ? 第一次更新，第一个世界刻……联动耦合地太紧了
	//  * * 第一次计算完成之后就应该绘制（且只绘制一次图）
	//  */
	// public shapeRefresh(shape: IShape): void {
	// 	// 更新不透明度
	// 	shape.alpha = this._life / Lightning.LIFE
	// 	// 尝试绘制闪电
	// 	if (this._isDrawComplete) return
	// 	this.drawLightning(shape)
	// 	this._isDrawComplete = this.isCalculated
	// }

	// override displayInit(shape: IShape): void {
	// 	// ! 这时候可能路径还没计算好，所以不能绘制……
	// }

	// public displayDestruct(shape: IShape): void {
	// 	shape.graphics.clear()
	// }

	// protected drawLightning(shape: IShape): void {
	// 	if (this._wayPoints.length < 1) return
	// 	// These points uses local grid,for example the initial point instanceof (0,0)
	// 	let point: iPoint = this._wayPoints[0],
	// 		pointH: iPoint = this._wayPoints[0]
	// 	// drawLines
	// 	for (let i: uint = 1; i < this._wayPoints.length; i++) {
	// 		point = pointH
	// 		pointH = this._wayPoints[i]
	// 		// Head
	// 		shape.graphics.beginFill(this.ownerColor, Lightning.LIGHT_ALPHA)
	// 		shape.graphics.drawRect(
	// 			DEFAULT_SIZE *
	// 				(intMin(point.x, pointH.x) - Lightning.LIGHT_BLOCK_WIDTH),
	// 			DEFAULT_SIZE *
	// 				(intMin(point.y, pointH.y) - Lightning.LIGHT_BLOCK_WIDTH),
	// 			DEFAULT_SIZE *
	// 				(intAbs(point.x - pointH.x) +
	// 					Lightning.LIGHT_BLOCK_WIDTH * 2),
	// 			DEFAULT_SIZE *
	// 				(intAbs(point.y - pointH.y) +
	// 					Lightning.LIGHT_BLOCK_WIDTH * 2)
	// 		)
	// 		shape.graphics.endFill()
	// 		// console.log('drawPoint at ',point,pointH);
	// 	}
	// }
}
