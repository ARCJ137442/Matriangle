import { IBatrShape } from "../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../legacy/AS3Legacy";
import EntityCommon from "./EntityCommon";

/**
 * * 【20230913 23:18:15】现在将原本独立的「特效」也归入「实体」范畴了
 * 
 * ```
 * 特效是
 * ①有相对固定的生命周期lifespan的
 * ②只用于显示而不会对游戏逻辑产生影响的(不会接收游戏回调的钩子)
 * (轻量级)实体
 * ```
 * ? 参考Minecraft的「粒子效果」或许「独立出去」也值得考量
 */
export default class AbstractEffect extends EntityCommon {

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
    public shapeInit(shape: IBatrShape): void {
        throw new Error("Method not implemented.");
    }
    public shapeRefresh(shape: IBatrShape): void {
        throw new Error("Method not implemented.");
    }
    public shapeDestruct(shape: IBatrShape): void {
        throw new Error("Method not implemented.");
    }
}