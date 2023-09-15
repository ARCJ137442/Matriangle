import { iPoint, fPoint } from "../../common/geometricTools";
import { int } from "../../legacy/AS3Legacy";

/**
 * 在方块环境下从「以左上角为缩放点」变成「以中心为缩放点」
 * @param p 方块坐标
 * @returns 实体坐标
 */
export function alignToEntity(p: number): number {
    return p + 0.5;
}

/**
 * 将一个「浮点数点」对齐「网格」得到「整数点」
 * 在实体环境下从「以中心为缩放点」变成「以左上角为缩放点」
 * 
 * * 【20230913 19:44:29】现在因类型问题，不再就地更改`p`
 * 
 * @param p 待对齐的位置
 * @param destination 对齐后的「目标点」（会被就地更改）
 * @returns 对齐网格后的「整数点」
 */
export function alignToEntity_P(p: iPoint, destination: fPoint): fPoint {
    return destination.copyFrom(p).inplaceMap(alignToEntity);
}

/**
 * 将一个「浮点数点」对齐「网格」得到「整数点」
 * 
 * ! 就地运算：会改变「点对象」本身
 * 
 * @param p 待对齐的位置
 * @returns 对齐网格后的「整数点」
 */
export function alignToGrid_P(p: fPoint, destination: iPoint): iPoint {
    return destination.copyFrom(p.inplaceMap(alignToGrid)) as iPoint; // ! 先转换成整数，然后再复制到目标地去
}

/**
 * 同`alignToGrid_P`，但只是在单个维度上
 * * 逻辑：取整对齐
 * 
 * 如下图：方格内任一点都会被对齐到整数点「#」内
 * ```
 * # - +
 * |   |
 * + - +
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
 * * 别名@`alignToGrid`
 *
 * ! 会改变参数
 *
 * ! 暂时弃用
 */
// export const fPoint2iPoint: (fp: fPoint, destination: iPoint) => iPoint = (
//     (fp: fPoint, destination: iPoint): iPoint => alignToGrid_P(fp, destination)
// );

/**
 * ? 是否还有`fPoint2iPoint`的必要
 */
