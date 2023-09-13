/**
 * 定义了一些抽象的接口，用于在编写时生成专用代码
 * 
 * ! 这些接口只用于「编译时检查」与「在断言下简化算法实现」，无法用于「判定」与「辨识」
 * * 参见「TS编译到JS去掉所有接口代码」的特性
 * 
 */

import { fPoint, iPoint } from "../../../common/geometricTools";
import { IBatrDisplayable } from "../../../display/api/BatrDisplayInterfaces";
import EntityCommon from "./EntityCommon";

/**
 * 「格点实体」是
 * ①对坐标要求只需精确到整数的
 * ②与地图坐标体系相同，坐标判断等同于「地图方块」的
 * ③在与地图方块互动时无需对地图坐标做“特殊对齐操作”的
 * 实体
 * 
 * ! 使用了TS「接口继承类」的思想，强制要求实现者「继承实体基类，或至少实现其所有方法」
 */
export interface IEntityInGrid extends EntityCommon {

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
 * 实体
 */
export interface IEntityOutGrid extends EntityCommon {

    /**
     * 强制实现者实现此类，用于「制造冲突」
     */
    _position: fPoint;
    get position(): fPoint;
    set position(value: fPoint);

}

/**
 * 「可显示实体」是
 * ①有需要被「显示端」实现的
 * ②会影响游戏呈现的
 * 实体
 */
export interface IEntityDisplayable extends EntityCommon, IBatrDisplayable { }

/**
 * TODO: 构造如下接口
 * 「可控制实体」是
 * ①响应游戏钩子的
 * ②影响游戏逻辑的
 * ③接受外部IO的
 * ④必会被序列化的
 * 高活跃度实体
 * 
 * 「高活跃实体」是指
 * ①每游戏刻都会被触发钩子的
 * ②有必要进行一定性能考量的
 * 实体
 * 包括：所有种类的玩家
 * 包括：冲击波子机
 * 包括：抛射体
 * 
 * 抛射体是
 * ①生命周期短的
 * ②会使用并触发游戏逻辑的
 * ③时刻要刷新的
 * ④对坐标要求精确到浮点数的
 * 高活跃实体
 */