import { fPoint, iPoint } from "../common/geometricTools";
import { int } from "../legacy/AS3Legacy";

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
 * ! 就地运算：会改变「点对象」本身
 * 
 * @param p 待对齐的位置
 * @returns 对齐网格后的「整数点」
 */
export function alignToEntity_P(p: iPoint): fPoint {
	return p.inplaceMap(alignToEntity);
}

/**
 * 将一个「浮点数点」对齐「网格」得到「整数点」
 * 
 * ! 就地运算：会改变「点对象」本身
 * 
 * @param p 待对齐的位置
 * @returns 对齐网格后的「整数点」
 */
export function alignToGrid_P(p: fPoint): iPoint {
	return p.inplaceMap(alignToGrid);
}

export function alignToGrid(p: number): int {
	// return p < 0 ? -1 : 0 + Math.floor(p); // ? 已经不知道这段代码到底是干什么用的了
	return int(p);
}
