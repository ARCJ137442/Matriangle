import { halfBrightnessTo } from 'matriangle-common/color'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import {
	IEntityActive,
	IEntityHasPosition,
	IEntityShortLived,
	IEntityWithDirection,
} from 'matriangle-api/server/entity/EntityInterfaces'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import Tool from '../../tool/Tool'
import Weapon from '../../tool/Weapon'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import IPlayerHasTeam from '../player/IPlayerHasTeam'
import { computeAttackerDamage } from '../../mechanics/BatrMatrixMechanics'
import { IDisplayDataEntityState } from 'matriangle-api/display/RemoteDisplayAPI'
import EntityDisplayable from 'matriangle-api/server/entity/EntityDisplayable'
import { typeID } from 'matriangle-api'
import { Ref, Val, xPoint } from 'matriangle-common'

export interface IDisplayDataStateProjectile extends IDisplayDataEntityState {
	// TODO: 有待扩充
}
/**
 * 「抛射体」是
 * * 生命周期短的
 * * 活跃的
 * * 有方向的
 * * 可显示的
 * * 与某个「所有者」（可空）绑定的
 * 实体
 *
 * ! 【2023-09-22 22:46:10】现在不再「默认绑定某种工具（武器）」
 */
export default abstract class Projectile
	extends EntityDisplayable<IDisplayDataStateProjectile>
	implements
		IEntityActive,
		IEntityWithDirection,
		// IEntityDisplayable<IDisplayDataStateProjectile>,
		IEntityShortLived
{
	//============Basic Properties============//
	/** 实体的「实体类型」标签 */
	/**
	 * 记录「抛射它的玩家」
	 * * 可为空，表示「无主玩家」 // ? 这个或许有待商量：其实世界可以创建一个「伪玩家」（或者「大自然」母体等「虚拟玩家」）来实现这种事情
	 */
	protected _owner: IPlayer | null

	/** 公开的「所有者」属性 */
	public get owner(): IPlayer | null {
		return this._owner
	}
	public set owner(value: IPlayer | null) {
		this._owner = value
		// this.shapeInit(shape: IBatrShape); // TODO: 回调「重绘函数」
	}

	/**
	 * ! 【2023-09-20 20:49:55】现在一些有关「武器」的属性，不再于抛射体中保留引用
	 *
	 * ? 为什么要在「抛射体伤害到玩家」的时候才计算伤害数据？理论上就不应该保留这个引用
	 *
	 * ? 为什么「抛射体」一定要和「武器」绑定在一起
	 * * 【2023-09-27 19:50:16】或许日后会有一个「武器抛射体」的概念
	 *
	 * 📌玩家之间的「伤害」分为多个概念/计算过程：
	 * * 玩家所持有武器的「基础伤害」
	 * * 武器「基础伤害」与玩家「伤害加成」叠加形成的「攻击方伤害」
	 * * 「攻击方伤害」在伤害玩家时，被受害者抗性减免后形成的「受害方伤害」（实际伤害/最终伤害）
	 *
	 * TODO: 日后要计算「攻击方伤害」时，「攻击者一侧的『造成伤害』数据」应全部来自于抛射体
	 * * 例如：伤害应该预先计算好，然后再用于构造抛射体
	 * * 抛射体不负责计算玩家伤害——这应该是「玩家使用工具」时做的事情
	 */
	protected _attackerDamage: uint
	/** 只读：获取「在计算『玩家抗性』前的最终伤害」 */
	public get attackerDamage(): uint {
		return this._attackerDamage
	}

	/**
	 * 存储用于「被攻击者抗性减免」的系数
	 * * 初衷：使「攻击者」与「被伤害者」在「伤害计算」上彻底解耦
	 *   * 源自「不再持有『发射抛射体』所用工具的引用」
	 */
	protected _extraResistanceCoefficient: uint
	/** 只读：获取「在计算『被攻击者伤害』时的『抗性减免系数』」 */
	public get extraResistanceCoefficient(): uint {
		return this._extraResistanceCoefficient
	}

	/**
	 * 移植from玩家
	 * * 🎯让伤害属性在生成时计算，而无需存储「使用的工具」
	 *
	 * 默认值：仅伤害「敌方」
	 */
	public canHurtEnemy: boolean = true
	public canHurtSelf: boolean = false
	public canHurtAlly: boolean = false

	/** 链式操作快速配置「可伤害の玩家」 */
	public setCanHurt(
		canHurtEnemy: boolean,
		canHurtSelf: boolean,
		canHurtAlly: boolean
	): this {
		this.canHurtEnemy = canHurtEnemy
		this.canHurtSelf = canHurtSelf
		this.canHurtAlly = canHurtAlly
		return this
	}

	/**
	 * 链式操作：从武器与「玩家属性」处快速配置
	 * * 「可伤害玩家」类型
	 * * 攻击者伤害
	 * * 武器伤害系数
	 */
	public initFromToolNAttributes(tool: Tool, buffDamage: uint): this {
		if (tool instanceof Weapon) {
			this.canHurtEnemy = tool.canHurtEnemy
			this.canHurtSelf = tool.canHurtSelf
			this.canHurtAlly = tool.canHurtAlly
			this._attackerDamage = computeAttackerDamage(
				tool.baseDamage,
				buffDamage,
				tool.extraDamageCoefficient
			)
			this._extraResistanceCoefficient = tool.extraResistanceCoefficient
		}
		return this
	}

	//============Constructor & Destructor============//
	public constructor(
		id: typeID,
		owner: IPlayer | null,
		attackerDamage: uint,
		extraResistanceCoefficient: uint,
		direction: mRot
	) {
		super(id)
		this._owner = owner
		this._attackerDamage = attackerDamage
		this._extraResistanceCoefficient = extraResistanceCoefficient
		this._direction = direction
	}

	override destructor(): void {
		this._owner = null
		super.destructor()
	}

	//============Interface Methods============//
	// 活跃 //
	readonly i_active = true as const

	/**
	 * 世界刻更新函数
	 *  * 可被子类多次&任意顺序的`super.onTick`调用
	 *
	 * @param host 调用它的母体
	 */
	public onTick(host: IMatrix): void {}

	// 朝向 //
	/** 基本朝向实现 */
	protected _direction: mRot
	/**
	 * 对外暴露的方向属性
	 * * 在「被修改」时调用显示更新（现在需要手动调用了）
	 */
	get direction(): mRot {
		return this._direction
	}
	set direction(value: mRot) {
		this._direction = value
		// * 显示更新
		this._proxy.direction = value
	}

	// 显示 //
	readonly i_displayable = true as const
	/** （二维）显示覆盖优先级 */
	protected _zIndex: uint = 0
	/**
	 * （公开的）显示覆盖优先级
	 *
	 * ? 或许在设置的时候，也需要更新：不再由Flash管理
	 */
	public get zIndex(): uint {
		return this._zIndex
	}
	public set zIndex(value: uint) {
		this._zIndex = value
	}

	/**
	 * （显示端）获取所有者（玩家）的填充颜色
	 * * 用于根据队伍颜色绘制图形
	 */
	public get ownerColor(): uint {
		// return this._owner?.fillColor ?? 0;
		return (this._owner as IPlayerHasTeam)?.team.color ?? 0 // ! 现在这里是获取玩家的队伍颜色
	}

	/**
	 * （显示端）获取所有者（玩家）的线条颜色
	 * * 用于根据队伍颜色绘制图形
	 */
	public get ownerLineColor(): uint {
		// return this._owner?.lineColor ?? 0;
		return halfBrightnessTo(this.ownerColor) // ! 直接使用位运算，动态计算「线条颜色」（深色，亮度一半）
	}

	// 短周期 //
	readonly i_shortLive = true as const
}

/**
 * 具有「位置」的抛射体
 * * 为统一集中方法而存在
 */
export abstract class ProjectileHasPosition<Pos extends number>
	extends Projectile
	implements IEntityHasPosition
{
	protected _position: xPoint<Pos>

	/**
	 * 构造函数
	 *
	 * @param newPosition 坐标 // ! 必须传入一个全新值，因为`_position`无法根据泛型类型初始化
	 */
	public constructor(
		id: typeID,
		owner: IPlayer | null,
		attackerDamage: uint,
		extraResistanceCoefficient: uint,
		newPosition: Val<xPoint<Pos>>,
		direction: mRot
	) {
		super(id, owner, attackerDamage, extraResistanceCoefficient, direction)
		// 设置坐标
		this._position = newPosition
	}

	/** @implements 直接返回对应实体坐标 */
	get position(): xPoint<Pos> {
		return this._position
	}

	/**
	 * 设置实体坐标
	 * * 核心逻辑：拷贝&自动通知显示代理（后者是构造此类的初衷）
	 *
	 * @param newPosition 新的坐标（引用）
	 */
	public setPosition(newPosition: Ref<xPoint<Pos>>): this {
		// 拷贝坐标
		this._position.copyFrom(newPosition)
		// 显示更新
		this._proxy.position = this._position
		// 返回自身
		return this
	}

	/**
	 * 步进坐标
	 * * 核心逻辑：依照母体与指定方向（默认为自身方向）前进指定距离
	 *
	 * @abstract 抽象方法：根据{@link Pos}的不同类型分派不同方法
	 */
	public abstract moveToward(
		host: IMatrix,
		distance: Pos,
		direction?: mRot /*  = this._direction */
	): this
}

/** 在格点上的「有坐标抛射体」 */
export abstract class ProjectileInGrid extends ProjectileHasPosition<int> {
	/** @implements 实现——分派{@link IMatrix.towardWithRot_II}方法 */
	public moveToward(
		host: IMatrix,
		distance: int,
		direction: mRot = this._direction
	): this {
		// 移动
		host.map.towardWithRot_II(this._position, direction, distance)
		// 更新
		this._proxy.position = this._position
		// 返回自身
		return this
	}
}

/** 不在格点上的「有坐标抛射体」 */
export abstract class ProjectileOutGrid extends ProjectileHasPosition<uint> {
	/** @implements 实现——分派{@link IMatrix.towardWithRot_FF}方法 */
	public moveToward(
		host: IMatrix,
		distance: number,
		direction: mRot = this._direction
	): this {
		// 移动
		host.map.towardWithRot_FF(this._position, direction, distance)
		// 更新
		this._proxy.position = this._position
		// 返回自身
		return this
	}
}
