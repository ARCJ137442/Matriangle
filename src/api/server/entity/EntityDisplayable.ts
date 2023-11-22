import {
	IDisplayDataEntity,
	IDisplayDataEntityState,
} from '../../display/RemoteDisplayAPI'
import Entity from './Entity'
import { IEntityDisplayable } from './EntityInterfaces'
import { typeID } from '../registry/IWorldRegistry'
import {
	DisplayProxyEntity,
	IDisplayProxyEntity,
} from '../../display/DisplayProxies'

/**
 * 「可显示实体」的一个默认实现
 * * 用于快速构造一个「可显示实体」，复用其内的方法
 * * 可用于「可显示实体」的「父类」
 *   * 但因JS「只能单继承」的特性，其它「已经继承{@link Entity}以外的类」的类就需要手动实现{@link IEntityDisplayable}接口
 */
export default abstract class EntityDisplayable<
		EntityStateT extends IDisplayDataEntityState,
	>
	// 继承自「实体」
	extends Entity
	// 实现「可显示实体」接口：有特定「自定义实体状态」的接口
	implements IEntityDisplayable<EntityStateT>
{
	/**
	 * 构造函数
	 */
	public constructor(id: typeID) {
		super(id)
		this._proxy = new DisplayProxyEntity<EntityStateT>(id)
	}
	/** @implements 直接委托自身的「代理对象」 */
	getDisplayData(): IDisplayDataEntity<EntityStateT> {
		// * 先尝试同步一次（可选）
		this.syncDisplayProxy?.()
		// * 再传出数据
		return this._proxy.getDisplayData()
	}

	/** （暂且可选）抽象方法：同步自身数据到显示代理 */ // TODO: 为了后续数据同步严谨（不至于「构造函数设置之后，数据就不更新了」），是否需要推广到所有实体中？
	protected abstract syncDisplayProxy?(): void

	/** 内部的「实体显示代理」 */
	protected _proxy: IDisplayProxyEntity<EntityStateT>

	get proxy(): IDisplayProxyEntity<EntityStateT> {
		return this._proxy
	}

	/** 可显示 */
	readonly i_displayable = true as const
}
