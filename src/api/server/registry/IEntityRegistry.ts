import { getClass } from 'matriangle-common/utils'
import Entity from '../entity/Entity'
import EntityType from '../entity/EntityType'

export function getEntityType(
	entity: Entity,
	types: EntityType[]
): EntityType | undefined {
	// 尝试在「注册表」中搜索
	for (const entityType of types) {
		if (entityType.entityClass === getClass(entity)) {
			return entityType
		}
	}
	// 未找到⇒返回「未定义」 // TODO: 目前「实体注册机制」尚未完全实现
	console.error(
		`未找到${entity.toString()}在${types.toString()}对应的实体类型`
	)
	return undefined
}
