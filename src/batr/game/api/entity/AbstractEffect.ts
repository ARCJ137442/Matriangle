import { IBatrShape } from "../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../legacy/AS3Legacy";
import Entity from "./Entity";
import { IBatrDisplayable } from './../../../display/api/BatrDisplayInterfaces';

/**
 * * 【20230913 23:18:15】现在将原本独立的「特效」也归入「实体」范畴了
 * 
 * ```
 * 特效是
 * * 有相对固定的生命周期lifespan的
 * * 只用于显示而不会对游戏逻辑产生影响的(不会接收游戏回调的钩子)
 * (轻量级)实体
 * ```
 * ? 参考Minecraft的「粒子效果」或许「独立出去」也值得考量
 */
export default abstract class AbstractEffect extends Entity implements IBatrDisplayable {

    /**
     * 当前的剩余生命时长
     * 
     * ! 以「游戏刻」为单位
     */
    protected life: uint;

    constructor(

        /**
         * 当前的「初始/最大 生命时长」
         * 
         * ! 用于生成「生命周期百分比」，进而用于控制动画
         */
        protected LIFE: uint,
    ) {
        super();
        this.life = this.LIFE;
    }

    //============Display Implements============//

    /**
     * 用于决定对象的「显示层级」
     */
    protected _zIndex: uint = 0;
    /**
     * 读写对象的「显示层级」
     */
    get zIndex(): uint { return this._zIndex }
    set zIndex(value: uint) {
        this._zIndex = value
        // TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
    }

    public abstract shapeInit(shape: IBatrShape): void;
    public abstract shapeRefresh(shape: IBatrShape): void;
    public abstract shapeDestruct(shape: IBatrShape): void;

}