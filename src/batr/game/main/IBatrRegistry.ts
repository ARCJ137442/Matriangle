import { BlockType } from "../api/block/Block";
import EntityType from "../api/entity/EntityType";

export type typeID = string;

/**
 * 「总注册表」
 * * 负责与「对象化/反对象化」「类型映射表」等数据交互
 * * 只负责「查找&返回」与「保存&加载」，不负责「具体运行」
 */
export default interface IBatrRegistry {

    /**
     * 方块类型映射表：方块id⇒方块类型
     */
    get blockTypeMap(): Map<typeID, BlockType>;

    /**
     * 实体类型映射表：实体id⇒实体类型
     */
    get entityTypeMap(): Map<typeID, EntityType>;


}
