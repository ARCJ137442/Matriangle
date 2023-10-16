import EntityType from '../entity/EntityType'
import IWorldRegistry, { typeID } from './IWorldRegistry'
import Block from '../block/Block'
import BlockEventRegistry from '../block/BlockEventRegistry'
import { BlockConstructorMap } from '../map/IMapStorage'

/**
 * 第一版「世界注册表」
 * * 具体角色&功能，详见所实现的接口
 * * 直接使用「只读属性」替代getter
 */
export default class Registry_V1 implements IWorldRegistry {
	// 构造&析构 //
	public constructor(
		blockConstructorMap: BlockConstructorMap = new Map<
			typeID,
			() => Block
		>(),
		blockEventRegistry: BlockEventRegistry = new BlockEventRegistry(),
		entityTypeMap: Map<typeID, EntityType> = new Map<typeID, EntityType>()
	) {
		this.blockConstructorMap = blockConstructorMap
		this.blockEventRegistry = blockEventRegistry
		this.entityTypeMap = entityTypeMap
	}

	public destructor(): void {
		this.blockConstructorMap.clear()
		this.blockEventRegistry.destructor()
		this.entityTypeMap.clear()
	}

	//========🧊方块========//
	readonly blockConstructorMap: BlockConstructorMap
	readonly blockEventRegistry: BlockEventRegistry

	//========🕹️实体========//
	readonly entityTypeMap: Map<typeID, EntityType>

	// !【2023-10-05 17:09:08】有关「工具」一类的东西不应该引进来
	// !【2023-10-16 23:29:00】或许可以参考Rule的做法：一切都是动态的键（但似乎又多了「检测」环节）
}
