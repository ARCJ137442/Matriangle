import {
	IEntityActive,
	IEntityActiveLite,
	IEntityDisplayable,
	i_active,
	i_activeLite,
	i_displayable,
} from 'matriangle-api/server/entity/EntityInterfaces'
import Entity from 'matriangle-api/server/entity/Entity'
import CommonSystem from 'matriangle-api/server/template/CommonSystem'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import { IDisplayable } from 'matriangle-api/display/DisplayInterfaces'
import {
	IDisplayDataEntities,
	IDisplayDataEntityState,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { OptionalRecursive2 } from 'matriangle-common'

/**
 * Use for manage entities in world.
 * * 用于管理一系列实体的「实体系统」
 *
 * ! 只用于对实体的（快速）增删改查，不留存世界引用（删去了先前的`host`相关变量）
 * ! 📌现在不再用于「显示呈现」，且不再用于分派事件
 * * 更多是在「通用系统」之上「细致优化」相关代码如「玩家遍历」。。。
 */
export default class EntitySystem
	extends CommonSystem<Entity>
	implements IDisplayable<IDisplayDataEntities>
{
	/**
	 * 构造函数
	 * * 默认不复用UUID
	 * * 总是从空系统开始
	 */
	public constructor(reuseUUID: boolean = false) {
		super(reuseUUID)
	}
	/**
	 * 活跃实体列表
	 * * 便于母体遍历
	 */
	public readonly entriesActive: IEntityActive[] = []

	/**
	 * 轻量级活跃实体列表
	 * * 便于母体遍历
	 */
	public readonly entriesActiveLite: IEntityActiveLite[] = []

	/**
	 * 轻量级活跃实体列表
	 * * 便于自身遍历（显示帧率高的时候需要频繁使用）
	 */
	public readonly entriesDisplayable: IEntityDisplayable<IDisplayDataEntityState>[] =
		[]

	/**
	 * @override 覆盖：增加特别的「活跃实体管理」选项
	 */
	override add(entry: Entity): boolean {
		// 活跃实体⇒添加到活跃实体列表
		if (i_active(entry)) this.entriesActive.push(entry)
		// 不可能同为「活跃实体」与「轻量级活跃实体」
		else if (i_activeLite(entry)) this.entriesActiveLite.push(entry)
		// 可显示实体
		if (super.add(entry)) {
			// 超类逻辑 //
			// 超类添加成功
			// * 可显示⇒注册UUID数据
			if (i_displayable<IDisplayDataEntityState>(entry)) {
				// 加入「可显示实体」列表
				this.entriesDisplayable.push(entry)
				// 录入
				this.addEntityDisplayData<IDisplayDataEntityState>(
					this.getEntryUUID(entry),
					entry
				)
			}
			return true
		}
		return false
	}

	/**
	 * @override 覆盖：增加特别的「活跃实体管理」选项
	 */
	override remove(entry: Entity): boolean {
		// 活跃实体⇒移除活跃实体列表
		if (
			i_active(entry) &&
			(this._temp_eIndex = this.entriesActive.indexOf(entry)) >= 0
		)
			this.entriesActive.splice(this._temp_eIndex, 1)
		// 不可能同为「活跃实体」与「轻量级活跃实体」
		else if (
			i_activeLite(entry) &&
			(this._temp_eIndex = this.entriesActiveLite.indexOf(entry)) >= 0
		)
			this.entriesActiveLite.splice(this._temp_eIndex, 1)
		// * 可显示⇒注销实体显示数据
		if (i_displayable<IDisplayDataEntityState>(entry))
			this.removeEntityDisplayData(this.getEntryUUID(entry))
		// 超类逻辑
		return super.remove(entry)
	}

	protected _temp_eIndex: int = 0

	// * 对接显示 * //
	readonly i_displayable = true as const

	/**
	 * 完全实体数据
	 * * 动态引用其它实体的数据
	 *   * 这样能通过引用保证实体的「显示数据」总是最新的
	 *
	 * ?【2023-11-18 09:37:25】问题是：如何处理「实体被删除」的情况
	 * * 目前可能的解决办法：使用`null`占位符，作为「需要删除」的信号（`undefined`无法被传输）
	 */
	protected _displayDataInit: IDisplayDataEntities = {}

	/**
	 * 待更新实体数据
	 * * 动态引用其它实体的数据
	 *   * 这样能通过引用保证实体的「显示数据」总是最新的
	 *
	 * ?【2023-11-18 09:37:25】问题是：如何处理「实体被删除」的情况
	 * * 目前可能的解决办法：使用`null`占位符，作为「需要删除」的信号（`undefined`无法被传输）
	 */
	protected _displayDataToRefresh: OptionalRecursive2<IDisplayDataEntities> =
		{}

	/**
	 * @implements 给出一个「UUID-实体数据」字典
	 * * 这个「UUID」有效的前提是：在整个实体周期内必须唯一
	 */
	getDisplayDataInit(): IDisplayDataEntities {
		return this._displayDataInit
	}

	/**
	 * @implements 收集
	 */
	getDisplayDataRefresh(): OptionalRecursive2<IDisplayDataEntities> {
		return this._displayDataToRefresh
	}

	/** @implements 遍历所有可显示实体，递归清洗数据 */
	flushDisplayData(): void {
		// ? 如果直接清除了引用，那后面更新又怎么办呢？冒泡吗？
		for (const entity of this.entriesDisplayable) entity.flushDisplayData()
		// * 清除「待更新显示数据」中的null（清除之前已经拿走了数据，所以这之后不再需要）
		for (const key in this._displayDataToRefresh)
			if (this._displayDataToRefresh[key] === null)
				delete this._displayDataToRefresh[key]
		// ? 但按上面这样做了之后，还是需要同步一堆空对象。。。
	}

	/** 录入实体数据 */
	protected addEntityDisplayData<StateT extends IDisplayDataEntityState>(
		uuid: uint,
		entity: IEntityDisplayable<StateT>
	): void {
		this._displayDataInit[uuid] = entity.getDisplayDataInit()
		this._displayDataToRefresh[uuid] = entity.getDisplayDataRefresh()
	}

	// !【2023-11-18 16:26:46】「刷新实体数据」的功能已经被「实体」本身所包含了

	/**
	 * 删除实体数据
	 * * 置空而非删除
	 *
	 * ! 不能使用`delete`：这样没法让「显示端」知道「数据被删除」（「被删除」暂时是无法检测到的，只有「覆写」能检测到）
	 */
	public removeEntityDisplayData(uuid: uint): void {
		// delete this._displayDataInit[uuid]
		this._displayDataInit[uuid] = this._displayDataToRefresh[uuid] = null
	}
}
