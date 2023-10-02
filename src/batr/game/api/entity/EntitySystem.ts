

import Entity from "./Entity";
import CommonSystem from "../template/CommonSystem";

/**
 * Use for manage entities in game.
 * * 用于管理一系列实体的「实体系统」
 * 
 * ! 只用于对实体的（快速）增删改查，不留存游戏引用（删去了先前的`host`相关变量）
 * * 📌现在不再用于「显示呈现」，且不再用于分派事件
 */
export default class EntitySystem extends CommonSystem<Entity>  {

    // !【2023-10-02 23:04:15】现在不再用于「显示呈现」，专注于「实体管理」有关代码
    // * 更多是在「通用系统」之上「细致优化」相关代码如「玩家遍历」。。。
    // TODO: 增加更多更细致的「实体管理」选项

}
