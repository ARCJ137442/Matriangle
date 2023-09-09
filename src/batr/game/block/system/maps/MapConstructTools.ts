import { identity } from "../../../../common/utils";
import { int, uint } from "../../../../legacy/AS3Legacy";
import BlockCommon, { BlockType } from "../../BlockCommon";
import BlockSpawnPointMark from "../../blocks/SpawnPointMark";
import IMapStorage from "../IMapStorage";

function cloneBlock(block: BlockCommon): BlockCommon {
    return block.clone();
}

/**
 * * 在存储结构的基础上，新增「复制」的可选项
 * @param storage 待操作的存储结构
 * @param x x坐标
 * @param y y坐标
 * @param block 待放置方块
 * @param clone 是否复制
*/
export function setBlock(
    storage: IMapStorage,
    x: int,
    y: int,
    block: BlockCommon,
    clone: boolean = false
): void {
    storage.setBlock(x, y, clone ? block.clone() : block);
}


/**
 * 按指定位置与配置填充方块
 * ! 其中无需调用`setBlock`方法，以减少多余的「clone」判断
 * 
 * @param storage 待操作的存储结构
 * @param x1 起点x坐标
 * @param y1 起点y坐标
 * @param x2 终点x坐标
 * @param y2 终点y坐标
 * @param block 待填充方块
 * @param outline 是否只填充边框 
 * @param clone 是否复制方块实例
 */
export function fillBlock(
    storage: IMapStorage,
    x1: int, y1: int, x2: int, y2: int,
    block: BlockCommon,
    outline: boolean = false,
    clone: boolean = false,
): void {
    let xl: int = Math.min(x1, x2), xm: int = Math.max(x1, x2);
    let yl: int = Math.min(y1, y2), ym: int = Math.max(y1, y2);
    let xi: int, yi: int;
    // * 函数式编程：决定是「原样」还是「拷贝」
    let blockF: (block: BlockCommon) => BlockCommon = (
        clone ?
            cloneBlock :
            identity<BlockCommon>
    );

    // 外框
    for (xi = xl; xi <= xm; xi++) {
        storage.setBlock(xi, yl, blockF(block))
        storage.setBlock(xi, ym, blockF(block))
    }
    for (yi = yl; yi <= ym; yi++) {
        storage.setBlock(xl, yi, blockF(block))
        storage.setBlock(xm, yi, blockF(block))
    }

    // 内部
    if (!outline)
        for (xi = xl + 1; xi < xm; xi++) {
            for (yi = yl + 1; yi < ym; yi++) {
                storage.setBlock(xi, yi, blockF(block));
            }
        }
}

/**
 * 镜面放置方块
 * @param storage 待操作的存储结构
 * @param rX 是否为x镜像
 * @param rY 是否为y镜像
 * @param x 放置的x坐标
 * @param y 放置的y坐标
 * @param block 待放置的方块
 * @param clone 是否复制实例
 * @param lx 镜面对称的参考x坐标（不是镜面x坐标）
 * @param ly 镜面对称的参考y坐标（不是镜面y坐标）
 */
export function setReflectBlock(
    storage: IMapStorage,
    rX: boolean, rY: boolean,
    x: int, y: int,
    block: BlockCommon,
    clone: boolean = false,
    lx: int = 23, ly: int = 23,
): void {
    let blockF: (block: BlockCommon) => BlockCommon = (
        clone ?
            cloneBlock :
            identity<BlockCommon>
    );
    storage.setBlock(x, y, blockF(block));
    if (rX)
        storage.setBlock(lx - x, y, blockF(block));
    if (rY) {
        storage.setBlock(x, ly - y, blockF(block));
        if (rX)
            storage.setBlock(lx - x, ly - y, blockF(block));
    }
}

/**
 * 按镜面对称填充方块
 * @param storage 待操作的存储结构
 * @param rX 是否x镜像
 * @param rY 是否y镜像
 * @param x1 起始x坐标
 * @param y1 起始y坐标
 * @param x2 终点x坐标
 * @param y2 终点y坐标
 * @param block 待放置方块
 * @param outline 是否仅边框
 * @param clone 是否复制
 * @param lx 镜面对称的参考x坐标（不是镜面x坐标）
 * @param ly 镜面对称的参考y坐标（不是镜面y坐标）
 */
export function fillReflectBlock(
    storage: IMapStorage,
    rX: boolean, rY: boolean,
    x1: int, y1: int, x2: int, y2: int,
    block: BlockCommon,
    outline: boolean = false,
    clone: boolean = false,
    lx: int = 23, ly: int = 23,
): void {
    fillBlock(storage, x1, y1, x2, y2, block, outline, clone);
    if (rX)
        fillBlock(storage, lx - x2, y1, lx - x1, y2, block, outline, clone);
    if (rY) {
        fillBlock(storage, x1, ly - y2, x2, ly - y1, block, outline, clone);
        if (rX)
            fillBlock(storage, lx - x2, ly - y2, lx - x1, ly - y1, block, outline, clone);
    }
}

/**
 * 按「镜面对称+`y=x`对称」放置方块
 * @param storage 待操作的存储结构
 * @param rX 是否x镜像
 * @param rY 是否y镜像
 * @param x1 起始x坐标
 * @param y1 起始y坐标
 * @param x2 终点x坐标
 * @param y2 终点y坐标
 * @param block 待放置方块
 * @param outline 是否仅边框
 * @param clone 是否复制
 * @param lx 镜面对称的参考x坐标（不是镜面x坐标）
 * @param ly 镜面对称的参考y坐标（不是镜面y坐标）
 */
export function setReflectMirrorBlock(
    storage: IMapStorage,
    rX: boolean, rY: boolean,
    x: int, y: int,
    block: BlockCommon,
    clone: boolean = false,
    lx: int = 23, ly: int = 23,
): void {
    setReflectBlock(storage, rX, rY, x, y, block, clone, lx, ly);
    setReflectBlock(storage, rY, rX, y, x, block, clone, lx, ly);
}

/**
 * 按「镜面对称+`y=x`对称」填充方块
 * @param storage 待操作的存储结构
 * @param rX 是否x镜像
 * @param rY 是否y镜像
 * @param x1 起始x坐标
 * @param y1 起始y坐标
 * @param x2 终点x坐标
 * @param y2 终点y坐标
 * @param block 待放置方块
 * @param outline 是否仅边框
 * @param clone 是否复制
 * @param lx 镜面对称的参考x坐标（不是镜面x坐标）
 * @param ly 镜面对称的参考y坐标（不是镜面y坐标）
 */
export function fillReflectMirrorBlock(
    storage: IMapStorage,
    rX: boolean, rY: boolean,
    x1: int, y1: int,
    x2: int, y2: int,
    type: BlockCommon,
    outline: boolean = false,
    clone: boolean = false,
    lx: int = 23, ly: int = 23,
): void {
    fillReflectBlock(storage, rX, rY, x1, y1, x2, y2, type, outline, clone, lx, ly);
    fillReflectBlock(storage, rY, rX, y1, x1, y2, x2, type, outline, clone, lx, ly);
}

//================地图特殊================//

/**
 * 生成「激光陷阱下侧柱」
 * * 源自地图需要
 * @param storage 待操作的存储结构
 * @param rootX 根部所属x坐标
 * @param blockWall 对应「墙」的方块
 * @param blockGlass 对应「玻璃」的方块
 * @param blockBedrock 对应「基岩」的方块
 * @param blockLaserTrap 对应「激光陷阱」的方块
 * @param clone 是否复制实例
 */
export function drawLaserTrapDownPillar(
    storage: IMapStorage,
    rootX: uint,
    blockWall: BlockCommon,
    blockGlass: BlockCommon,
    blockBedrock: BlockCommon,
    blockLaserTrap: BlockCommon,
    clone: boolean = false
): void {
    fillBlock(storage, rootX - 1, 1, rootX - 1, 18, blockWall, clone);
    fillBlock(storage, rootX + 1, 1, rootX + 1, 18, blockWall, clone);
    fillBlock(storage, rootX, 1, rootX, 18, blockBedrock, clone);
    setBlock(storage, rootX, 19, blockLaserTrap, clone);
    setBlock(storage, rootX + 1, 19, blockGlass, clone);
    setBlock(storage, rootX - 1, 19, blockGlass, clone);
    setBlock(storage, rootX, 20, blockGlass, clone);
    setBlock(storage, rootX + 1, 20, blockWall, clone);
    setBlock(storage, rootX - 1, 20, blockWall, clone);
}

/**
 * 生成「激光陷阱上侧柱」
 * * 源自地图需要
 * @param storage 待操作的存储结构
 * @param rootX 根部所属x坐标
 * @param blockWall 对应「墙」的方块
 * @param blockGlass 对应「玻璃」的方块
 * @param blockBedrock 对应「基岩」的方块
 * @param blockLaserTrap 对应「激光陷阱」的方块
 * @param clone 是否复制实例
 */
export function drawLaserTrapUpPillar(
    storage: IMapStorage,
    rootX: uint,
    blockWall: BlockCommon,
    blockGlass: BlockCommon,
    blockBedrock: BlockCommon,
    blockLaserTrap: BlockCommon,
    clone: boolean = false
): void {
    fillBlock(storage, rootX - 1, 22, rootX - 1, 5, blockWall, clone);
    fillBlock(storage, rootX + 1, 22, rootX + 1, 5, blockWall, clone);
    fillBlock(storage, rootX, 22, rootX, 5, blockBedrock, clone);
    setBlock(storage, rootX, 4, blockLaserTrap, clone);
    setBlock(storage, rootX + 1, 4, blockGlass, clone);
    setBlock(storage, rootX - 1, 4, blockGlass, clone);
    setBlock(storage, rootX, 3, blockGlass, clone);
    setBlock(storage, rootX + 1, 3, blockWall, clone);
    setBlock(storage, rootX - 1, 3, blockWall, clone);
}

/**
 * 生成「激光陷阱盒」
 * * 源自地图需要
 * @param storage 待操作的存储结构
 * @param x 中心x坐标
 * @param y 中心y坐标
 * @param blockWall 对应「墙」的方块
 * @param blockGlass 对应「玻璃」的方块
 * @param blockLaserTrap 对应「激光陷阱」的方块
 * @param clone 是否复制实例
 */
export function drawLaserTrapBox(
    storage: IMapStorage, x: int, y: int,
    blockWall: BlockCommon,
    blockGlass: BlockCommon,
    blockLaserTrap: BlockCommon,
    clone: boolean = false
): void {
    setBlock(storage, x, y, blockLaserTrap, clone);
    setBlock(storage, x + 1, y, blockGlass, clone);
    setBlock(storage, x - 1, y, blockGlass, clone);
    setBlock(storage, x, y - 1, blockGlass, clone);
    setBlock(storage, x, y + 1, blockGlass, clone);
    setBlock(storage, x + 1, y - 1, blockWall, clone);
    setBlock(storage, x - 1, y - 1, blockWall, clone);
    setBlock(storage, x + 1, y + 1, blockWall, clone);
    setBlock(storage, x - 1, y + 1, blockWall, clone);
}

export function addSpawnPointWithMark(storage: IMapStorage, x: int, y: int): void {
    storage.addSpawnPointAt(x, y);
    storage.setBlock(x, y, BlockSpawnPointMark.INSTANCE);
}