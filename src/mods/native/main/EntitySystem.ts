import {
	IEntityActive,
	IEntityActiveLite,
	i_active,
	i_activeLite,
} from 'matriangle-api/server/entity/EntityInterfaces'
import Entity from 'matriangle-api/server/entity/Entity'
import CommonSystem from 'matriangle-api/server/template/CommonSystem'
import { int } from 'matriangle-legacy/AS3Legacy'

/**
 * Use for manage entities in world.
 * * 用于管理一系列实体的「实体系统」
 *
 * ! 只用于对实体的（快速）增删改查，不留存世界引用（删去了先前的`host`相关变量）
 * * 📌现在不再用于「显示呈现」，且不再用于分派事件
 */
export default class EntitySystem extends CommonSystem<Entity> {
	// !【2023-10-02 23:04:15】现在不再用于「显示呈现」，专注于「实体管理」有关代码
	// * 更多是在「通用系统」之上「细致优化」相关代码如「玩家遍历」。。。

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
	 * @override 覆盖：增加特别的「活跃实体管理」选项
	 */
	override add(entry: Entity): boolean {
		// 活跃实体⇒添加到活跃实体列表
		if (i_active(entry)) this.entriesActive.push(entry)
		// 不可能同为「活跃实体」与「轻量级活跃实体」
		else if (i_activeLite(entry)) this.entriesActiveLite.push(entry)
		// 超类逻辑
		return super.add(entry)
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
		// 超类逻辑
		return super.remove(entry)
	}
	protected _temp_eIndex: int = 0
}
