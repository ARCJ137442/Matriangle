import EntityType from "../../../api/entity/EntityType";
import { mRot } from "../../../general/GlobalRot";
import IMatrix from "../../../main/IMatrix";
import IPlayer from "../entities/player/IPlayer";
import Tool from "../tool/Tool";
import IWorldRegistry, { typeID } from "../../../api/registry/IWorldRegistry";
import Block from "../../../api/block/Block";
import BlockEventRegistry from "../../../api/block/BlockEventRegistry";

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
) => void;

/**
 * 第一版「世界注册表」
 * * 具体角色&功能，详见所实现的接口
 * * 直接使用「只读属性」替代getter
 */
export default class Registry_V1 implements IWorldRegistry {

	// 构造&析构 //
	public constructor(
		blockTypeMap: Map<typeID, () => Block> = new Map<typeID, () => Block>(),
		blockEventRegistry: BlockEventRegistry = new BlockEventRegistry(),
		entityTypeMap: Map<typeID, EntityType> = new Map<typeID, EntityType>(),
	) {
		this.blockTypeMap = blockTypeMap;
		this.blockEventRegistry = blockEventRegistry;
		this.entityTypeMap = entityTypeMap;
	}

	public destructor(): void {
		this.blockTypeMap.clear();
		this.blockEventRegistry.destructor();
		this.entityTypeMap.clear();
	}

	//========🧊方块========//
	readonly blockTypeMap: Map<typeID, () => Block>;
	readonly blockEventRegistry: BlockEventRegistry;

	//========🕹️实体========//
	readonly entityTypeMap: Map<typeID, EntityType>;

	//========🛠️工具========//
	/**
	 * ! 非接口
	 */
	public readonly toolUsageMap: Map<typeID, toolUsageF> = new Map<typeID, toolUsageF>();

	// !【2023-10-05 17:09:08】有关「工具」一类的东西确实不应该引进来，但可以参考Rule的做法

}
