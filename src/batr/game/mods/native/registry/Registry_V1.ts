import { BlockType } from "../../../api/block/Block";
import EntityType from "../../../api/entity/EntityType";
import IBatrRegistry, { typeID } from "./IBatrRegistry";

/**
 * 第一版「世界注册表」
 * * 具体角色&功能，详见所实现的接口
 * TODO: 目前这里还没有实质性的内容
 */
export default class Registry_V1 implements IBatrRegistry {

	get blockTypeMap(): Map<typeID, BlockType> {
		throw new Error("Method not implemented.");
	}

	get entityTypeMap(): Map<typeID, EntityType> {
		throw new Error("Method not implemented.");
	}

}
