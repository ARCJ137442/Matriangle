/**
 * 定义了一些抽象的接口，用于在编写时生成专用代码
 * 
 * ! 这些接口只用于「编译时检查」与「在断言下简化算法实现」，无法直接用于「判定」与「辨识」
 * * 参见「TS编译到JS去掉所有接口代码」的特性
 * * 不过也有使用「强制要求固定常量」的解决方法
 * 
 */

import { fPoint, iPoint } from "../../../common/geometricTools";
import { IBatrDisplayable } from "../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../legacy/AS3Legacy";
import IBatrGame from "../../main/IBatrGame";
import GameStats from "../../mods/native/stat/GameStats";
import { mRot } from "../general/GlobalRot";
import { CommonIO_IR } from "../io/CommonIO";
import Entity from "./Entity";

/**
 * 「格点实体」是
 * ①对坐标要求只需精确到整数的
 * ②与地图坐标体系相同，坐标判断等同于「地图方块」的
 * ③在与地图方块互动时无需对地图坐标做“特殊对齐操作”的
 * 实体
 * 
 * ! 使用了TS「接口继承类」的思想，强制要求实现者「继承实体基类，或至少实现其所有方法」
 * 
 * 典例：
 * * 玩家
 * * 奖励箱
 */
export interface IEntityInGrid extends Entity {

    /**
     * 留存一个（公开）的实例变量，用于解决TS「无法在运行时判断是否实现接口」的问题
     * * 后续可在「接口编译时被删去」后使用`entity?.isInGrid`（或更精确地，`entity?.isInGrid === true`）判断
     */
    readonly i_InGrid: true;

    /**
     * 强制实现者实现此类，用于「制造冲突」
     */
    _position: iPoint;
    get position(): iPoint;
    set position(value: iPoint);
}

/**
 * 「非格点实体」是
 * ①对坐标存储需要浮点数精度的
 * ②需要与方块坐标进行“特意对齐”的
 * 实体『
 * 
 * 典例：
 * * 抛射体
 */
export interface IEntityOutGrid extends Entity {

    /**
     * 留存一个（公开）的实例变量，用于解决TS「无法在运行时判断是否实现接口」的问题
     * * 参见`IEntityInGrid`
     */
    readonly i_InGrid: false;

    /**
     * 强制实现者实现此类，用于「制造冲突」
     */
    _position: fPoint;
    get position(): fPoint;
    set position(value: fPoint);

}

/**
 * 「有方向实体」是
 * ①有「任意维整数角」方向的
 * ②需要在机制（或许也有显示）上区分的
 * 实体
 * 
 * ! 至于「有无『用浮点数表示的方向』」，暂未开展研究
 * 
 * 典例：
 * * 玩家
 * * 抛射体
 */
export interface IEntityWithDirection extends Entity {
    /**
     * 留存一个（公开）的实例变量，用于解决TS「无法在运行时判断是否实现接口」的问题
     * * 参见`IEntityInGrid`
     */
    readonly i_hasDirection: true;

    _direction: mRot;
    get direction(): mRot;
    set direction(value: mRot);
}

/**
 * 「可显示实体」是
 * ①有需要被「显示端」实现的
 * ②会影响游戏呈现的
 * 实体
 * 
 * 典例：
 * * 几乎一切原生实体
 */
export interface IEntityDisplayable extends Entity, IBatrDisplayable {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_displayable: true;
    // protected _zIndex: uint = 0;

    /**
     * 实体的显示层级
     * 
     * TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
     */
    get zIndex(): uint;
    set zIndex(value: uint)
}

/**
 * 「活跃实体」是指
 * ①每游戏刻都会被触发钩子的
 * ②影响游戏逻辑的
 * ③有必要进行一定性能考量的
 * 实体
 * 
 * 典例：
 * * 玩家
 * * 冲击波子机
 * * 抛射体
 */
export interface IEntityActive extends Entity {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_active: true;

    /**
     * 响应游戏刻
     * 
     * 在游戏调用事件循环时，随之调用以处理其游戏逻辑
     * 
     * * 不用担心「循环导入」问题：TS的接口在编译后会被删除，对编译后的执行毫无影响
     * 
     * @param host 调用它的「游戏主体」
     */
    onTick(host: IBatrGame): void;

}

/**
 * 「需IO实体」是
 * ①接受并响应游戏IO操作（键盘等）的
 * 实体
 * 
 * ! 【20230915 0:02:18】「AI玩家」的「AI逻辑」将由AI作为「活跃实体」的`onTick`游戏刻调用
 * 
 * 典例：
 * * 玩家
 */
export interface IEntityNeedsIO extends Entity {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_needsIO: true;

    /**
     * 响应游戏IO
     * 
     * 游戏IO操作（键盘等）会触发此方法
     * 
     * * 不用担心「循环导入」问题：TS的接口在编译后会被删除，对编译后的执行毫无影响
     * 
     * @param host 调用它的「游戏主体」
     */
    onIO(host: IBatrGame, inf: CommonIO_IR): void;

}

/**
 * 「短周期实体」是
 * ①生命周期相对短的（生成到消耗的时间很短）
 * ②删除不会对游戏运行造成太显著影响的
 * ③可能会被游戏专门存储以便（在空间访问上）优化的
 * 实体
 * 
 * 典例：
 * * 抛射体
 */
export interface IEntityShortLived extends Entity {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_shortLived: true;

    // ? 暂时没想好有什么要「特别支持」的方法，因为这本身与「特效」不完全相同
}

/**
 * 「定周期实体」是
 * ①生命周期相对固定的（生成到消失的时间固定）
 * ②一般需要根据「存活总时长」与「剩余存活时长」的比值「存活百分比」进行更新的
 * 实体
 * 
 * ! 一般以「游戏刻数」为时间计量单位（这样可以不涉及浮点运算）
 * 
 * 典例：
 * * 特效
 */
export interface IEntityFixedLived extends Entity {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_fixedLived: true;

    /**
     * 「存活总时长」
     * * 一般是个固定值（或会被实现为只读属性）
     */
    get LIVE(): uint

    /**
     * 「剩余存活时长」
     */
    get live(): uint

    /**
     * [0,1]的存活百分比
     */
    get livePercent(): number;

}

/**
 * 「具统计实体」是
 * ①需要（在实体侧）存储「游戏统计信息」以被游戏使用的
 * ②需要在运行时「读取数据」的
 * 实体
 * 
 * 典例：
 * * 玩家
 */
export interface IEntityHasStats extends Entity {

    // * 留存「接口约定的变量」，判断「实例是否实现接口」
    readonly i_hasStats: true;

    get stats(): GameStats; // TODO: 这里只是个占位符，后续会专门规定一个基类去实现这些东西

}
