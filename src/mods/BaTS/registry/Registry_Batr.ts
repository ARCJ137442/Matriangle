import EntityType from 'matriangle-api/server/entity/EntityType'
import { mRot } from 'matriangle-api/server/general/GlobalRot'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import Tool from '../tool/Tool'
import IWorldRegistry, {
	typeID,
} from 'matriangle-api/server/registry/IWorldRegistry'
import BlockEventRegistry from 'matriangle-api/server/block/BlockEventRegistry'
import { BlockConstructorMap } from 'matriangle-api/server/map/IMapStorage'
import Registry_V1 from 'matriangle-api/server/registry/Registry_V1'

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
export default class Registry_Batr
	extends Registry_V1
	implements IWorldRegistry
{
	// 构造&析构 //
	public constructor(
		blockConstructorMap: BlockConstructorMap = new Map(),
		blockEventRegistry: BlockEventRegistry = new BlockEventRegistry(),
		entityTypeMap: Map<typeID, EntityType> = new Map<typeID, EntityType>()
	) {
		super(blockConstructorMap, blockEventRegistry, entityTypeMap)
	}

	override destructor(): void {
		super.destructor()
	}

	//========🛠️工具========//
	/**
	 * !【2023-10-16 23:31:12】非原生
	 */
	public readonly toolUsageMap: Map<typeID, toolUsageF> = new Map()
}
