
// import batr.common.*;

import Entity from "./Entity";
import CommonSystem from "../template/CommonSystem";

/**
 * Use for manage entities in game.
 * * 用于管理一系列实体的「实体系统」
 * 
 * ! 只用于对实体的（快速）增删改查，不留存游戏引用（删去了先前的`host`相关变量）
 * 
 * * TODO: 【20230915 0:08:17】也将用于分派事件
 */
export default class EntitySystem extends CommonSystem<Entity> {

}
