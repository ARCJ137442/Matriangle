import EntityType from '../../../api/server/entity/EntityType'
import { mRot } from '../../../api/server/general/GlobalRot'
import IMatrix from '../../../api/server/main/IMatrix'
import IPlayer from '../entities/player/IPlayer'
import Tool from '../../BaTS/tool/Tool'
import IWorldRegistry, { typeID } from '../../../api/server/registry/IWorldRegistry'
import Block from '../../../api/server/block/Block'
import BlockEventRegistry from '../../../api/server/block/BlockEventRegistry'
import { BlockConstructorMap } from '../../../api/server/map/IMapStorage'

/**
 * 统一「工具被玩家在指定『母体』内以某个方向使用」的回调函数类型
 * @returns 目前不返回任何值
 */
export type toolUsageF = (
	host: IMatrix,
	user: IPlayer,
	tool: Tool,
	direction: mRot,
	chargePercent: number
) => void

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

	//========🛠️工具========//
	/**
	 * ! 非接口
	 */
	public readonly toolUsageMap: Map<typeID, toolUsageF> = new Map<
		typeID,
		toolUsageF
	>()

	// !【2023-10-05 17:09:08】有关「工具」一类的东西确实不应该引进来，但可以参考Rule的做法
}
