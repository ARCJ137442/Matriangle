

import Entity from "./Entity";
import CommonSystem from "../template/CommonSystem";
import { IBatrDisplayable, IBatrDisplayableContainer, IBatrShapeContainer } from "../../../display/api/BatrDisplayInterfaces";
import { int } from "../../../legacy/AS3Legacy";

/**
 * Use for manage entities in game.
 * * 用于管理一系列实体的「实体系统」
 * 
 * ! 只用于对实体的（快速）增删改查，不留存游戏引用（删去了先前的`host`相关变量）
 * 
 * * TODO: 【20230915 0:08:17】也将用于分派事件
 */
export default class EntitySystem extends CommonSystem<Entity> implements IBatrDisplayableContainer {

    // 可显示&容器 //
    public readonly i_displayable: true = true;
    public readonly i_displayableContainer: true = true;

    // TODO: 有待实现：绑定「显示对象」引用，动态响应式添加实体显示对象……
    public shapeInit(shape: IBatrShapeContainer, ...children: IBatrDisplayable[]): void {
        throw new Error("Method not implemented.");
    }

    public shapeRefresh(shape: IBatrShapeContainer): void {
        throw new Error("Method not implemented.");
    }

    public shapeDestruct(shape: IBatrShapeContainer): void {
        throw new Error("Method not implemented.");
    }

    protected _zIndex: int = 0;
    public get zIndex(): int { return this._zIndex }

    public set zIndex(value: int) {
        throw new Error("Method not implemented.");
    }

}
