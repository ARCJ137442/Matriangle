import { fPoint } from 'matriangle-common/geometricTools'
import { IShape } from 'matriangle-api/display/DisplayInterfaces'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Entity from 'matriangle-api/server/entity/Entity'
import {
	IEntityActiveLite,
	IEntityDisplayable,
	IEntityFixedLived,
	IEntityOutGrid,
	IEntityShortLived,
} from 'matriangle-api/server/entity/EntityInterfaces'

/**
 * * 【20230913 23:18:15】现在将原本独立的「特效」也归入「实体」范畴了
 *
 * ```
 * 特效是
 * * 显示周期相对较短的
 * * 可能在地图中任何位置产生的（非格点实体）
 * * 有相对固定的生命周期lifespan的
 * * 相对活跃但不受影响世界逻辑的(不会接收世界回调的钩子)
 * (轻量级)实体
 * ```
 * ? 参考Minecraft的「粒子效果」或许「独立出去」也值得考量
 */
export default abstract class Effect
	extends Entity
	implements
		IEntityDisplayable,
		IEntityShortLived,
		IEntityFixedLived,
		IEntityOutGrid,
		IEntityActiveLite
{
	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * @param position 坐标（引用而无需值）
	 * @param LIFE 最大生命时长
	 */
	public constructor(
		position: fPoint,
		/**
		 * 当前的「初始/最大 生命时长」
		 *
		 * ! 用于生成「生命周期百分比」，进而用于控制动画
		 */
		public readonly LIFE: uint
	) {
		super()
		this._position.copyFrom(position)
		this._life = this.LIFE
	}

	// 轻量级活跃 //
	public readonly i_activeLite = true as const

	/**
	 * 超类方法：处理生命时长
	 * * 这里只需要一个「自删除回调函数」回调自己即可
	 *
	 * @param remove 调用`remove(this)`即可通知母体删除自身
	 */
	public onTick(remove: (entity: Entity) => void): void {
		if (--this._life <= 0) {
			remove(this)
		}
		// this._life--; // * 与内置「--」的差别在于：它一定会让实体的「生命周期」停留于`0`
	}

	// 短周期 //
	public readonly i_shortLive = true as const

	// 固定周期 //
	public readonly i_fixedLive = true as const

	/**
	 * 当前的剩余生命时长
	 *
	 * ! 以「世界刻」为单位
	 */
	protected _life: uint
	/** 外部只读的剩余生命时长 */
	public get life(): uint {
		return this._life
	}

	public get lifePercent(): number {
		return this._life / this.LIFE
	}

	// 非格点 //
	public readonly i_outGrid = true as const

	/** 特效作为「非格点实体」的位置 */
	protected _position: fPoint = new fPoint()
	public get position(): fPoint {
		return this._position
	}
	public set position(value: fPoint) {
		this._position.copyFrom(value)
	}

	//============Display Implements============//

	/**
	 * 用于决定对象的「显示层级」
	 */
	protected _zIndex: uint = 0
	/**
	 * 读写对象的「显示层级」
	 */
	public get zIndex(): uint {
		return this._zIndex
	}
	public set zIndex(value: uint) {
		this._zIndex = value
		// TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
	}

	// 可显示 //
	public readonly i_displayable = true as const

	public abstract shapeInit(shape: IShape, ...params: unknown[]): void
	public abstract shapeRefresh(shape: IShape): void
	/** */
	public shapeDestruct(shape: IShape): void {
		shape.graphics.clear()
	}
}
