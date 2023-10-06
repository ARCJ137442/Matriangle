import { float } from "../../common/exMath";
import { iPoint, fPoint, iPointRef, fPointRef } from "../../common/geometricTools";
import { int } from "../../legacy/AS3Legacy";

// /**
//  * // 在方块环境下从「以左上角为缩放点」变成「以中心为缩放点」
//  * * 逻辑：转为浮点
//  * * 应用：现在用`alignToGrid`取代，不建议使用
//  * 
//  * ! 注意：直接变成浮点！直接变成浮点！变成浮点！浮点！
//  * * 不再是AS3时期那样「为了方便旋转，而向易用性妥协」了
//  * 
//  * @param p 方块坐标
//  * @returns 实体坐标
//  */
// export function alignToEntity(p: int): number {
//	 // return p + 0.5;
//	 return p + 0.0;
// }

/**
 * 同`alignToGrid_P`，但只是在单个维度上
 * * 逻辑：取整对齐
 * * 应用：抛射体在与格点实体（如玩家、奖励箱）/地图（方块）互动时，要在世界机制里先转换成「网格坐标」再比较
 * 
 * ! 注意：直接向下取整！直接向下取整！向下取整！取整！
 * * 不再是AS3时期那样「为了方便旋转，而向易用性妥协」了
 * 
 * 如下图：方格内任一点都会被对齐到整数点「#」内
 * ```
 * # - + → x+
 * |   |
 * + - +
 * ↓
 * y+
 * ```
 * 
 * @param xi 单个维度的坐标
 * @returns 对齐网格后的单维度坐标（取整）
 */
export function alignToGrid(xi: number): int {
    // return p < 0 ? -1 : 0 + Math.floor(p); // ? 已经不知道这段代码到底是干什么用的了
    return int(xi);
}

/**
 * 同`alignToGridCenter_P`，但只是在单个维度上
 * * 逻辑：对齐到网格中央
 * * 应用：玩家发射子弹时，坐标需要从「网格左上角」迁移到中央，以「在网格中央发射子弹」
 * 
 * ! 注意：直接向下取整！直接向下取整！向下取整！取整！
 * * 不再是AS3时期那样「为了方便旋转，而向易用性妥协」了
 * 
 * 如下图：方格左上角的点「#」会被对齐到格子中央的「∘」
 * ```
 * # - + → x+
 * | ∘ |
 * + - +
 * ↓
 * y+
 * ```
 * 
 * @param xi 单个维度的坐标
 * @returns 对齐网格后的单维度坐标（取整）
 */
export function alignToGridCenter(xi: number): number {
    // return p < 0 ? -1 : 0 + Math.floor(p); // ? 已经不知道这段代码到底是干什么用的了
    return xi + 0.5;
}

/**
 * 将一个「浮点数点」对齐「网格中央」
 * 
 * ! 注意：对齐网格中央！对齐网格中央！网格中央！中央！
 * * 💭【2023-09-22 21:53:52】这只是因为「非格点实体确实应该在那个坐标」
 * 
 * * 【2023-09-22 20:52:09】现在不会改变参数`p`，而是改变「目标点」`destination`
 * * 与此同时，不再使用类型不稳定的`inplaceMap`函数
 * 
 * @param p 待对齐的位置
 * @param destination 对齐后的「目标点」（会被就地更改）
 * @returns 对齐网格后的「整数点」
 */
export function alignToGridCenter_P(p: iPointRef, destination: fPointRef): fPointRef {
    for (let i = 0; i < p.length; i++) {
        // * 先转换成浮点数
        destination[i] = alignToGridCenter(float(p[i]))
    }
    return destination;
}

/**
 * 将一个「浮点数点」对齐「网格」得到「整数点」
 * 
 * ! 注意：直接向下取整！直接向下取整！向下取整！取整！
 * * 不再是AS3时期那样「为了方便旋转，而向易用性妥协」了
 * 
 * * 【2023-09-22 20:52:09】现在不会改变参数`p`，而是改变「目标点」`destination`
 * * 与此同时，不再使用类型不稳定的`inplaceMap`函数
 * 
 * @param p 待对齐的位置
 * @param destination 数据要存储到的「目标点」
 * @returns 对齐网格后的「目标点」
 */
export function alignToGrid_P(p: fPointRef, destination: iPointRef): iPointRef {
    for (let i = 0; i < p.length; i++) {
        destination[i] = alignToGrid(p[i])
    }
    return destination;
}
