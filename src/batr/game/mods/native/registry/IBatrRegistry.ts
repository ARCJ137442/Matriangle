import { BlockType } from "../../../api/block/Block";
import EntityType from "../../../api/entity/EntityType";

/**
 * 所有「使用ID进行索引的物件」ID的类型
 * 
 * ! 固定是字符串：若更改，无法一并改变「对象化」等多个地方的功能
 */
export type typeID = string;

/**
 * 「总注册表」
 * * 负责与「对象化/反对象化」「类型映射表」等数据交互
 * * 只负责「查找&返回」与「保存&加载」，不负责「具体运行」
 * 
 * TODO: JS对象化
 * * 可能涉及的：对「工具使用映射表」的处理
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
