import EntityType from "../../../api/entity/EntityType";
import { mRot } from "../../../general/GlobalRot";
import IMatrix from "../../../main/IMatrix";
import IPlayer from "../entities/player/IPlayer";
import Tool from "../tool/Tool";
import IWorldRegistry, { typeID } from "../../../api/registry/IWorldRegistry";
import Block from "../../../api/block/Block";

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
 * TODO: 目前这里还没有实质性的内容
 */
export default class Registry_V1 implements IWorldRegistry {

	protected _blockTypeMap: Map<typeID, () => Block> = new Map<typeID, () => Block>();
	get blockTypeMap(): Map<typeID, () => Block> { return this._blockTypeMap; }

	protected _entityTypeMap: Map<typeID, EntityType> = new Map<typeID, EntityType>();
	get entityTypeMap(): Map<typeID, EntityType> { return this._entityTypeMap; }

	/**
	 * ! 非接口
	 */
	protected _toolUsageMap: Map<typeID, toolUsageF> = new Map<typeID, toolUsageF>();
	get toolUsageMap(): Map<typeID, toolUsageF> { return this._toolUsageMap; }

	// !【2023-10-05 17:09:08】有关「工具」一类的东西确实不应该引进来，但可以参考Rule的做法

}
