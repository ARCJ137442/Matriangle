import { iPoint } from "../../../common/geometricTools";
import { uint } from "../../../legacy/AS3Legacy";
import IBatrMatrix from "../../main/IBatrMatrix";
import Block from "../block/Block";


//==== 取自「事件分派」系统，旨在「兼顾通用性」时避免循环导入 ====//
/**
 * 决定第一步「针对事件类型分派」使用的索引
 */
export type BlockEventType = string;

/**
 * 决定第二部「针对『方块类型/实体类型』分派」使用的索引
 * * 【20230912 9:15:27】目前方法：统一「散列化」为指定类型（字符串），保证一一对应即可
 */
export type BlockPatchIndex = string;

/**
 * 事件处理函数的通用类型
 */
export type HandlerF = (host: IBatrMatrix, ...args: any[]) => void;

/**
 * 事件分派中的「元素类型⇒处理函数」映射
 */
export type TypePatchMap = {
    [key: BlockPatchIndex]: HandlerF;
};

/**
 * 事件分派中的「事件类型⇒『元素类型⇒处理函数』映射」映射
 */
export type BlockEventPatchMap = {
    [key: BlockEventType]: TypePatchMap;
};

/**
 * 「游戏随机刻」的「事件处理函数」类型
 */
export type randomTickEventF = (
    host: IBatrMatrix,
    block: Block,
    position: iPoint
) => void;

/**
 * 「游戏方块刻」的「事件处理函数」类型
 */
export type blockTickEventF = (
    host: IBatrMatrix,
    block: Block,
    position: iPoint,
    time: uint
) => void;

export enum BlockEventTypes {
    TICK = "tick",
    RANDOM_TICK = "randomTick",
    DESTROY = "destroy",
    CREATE = "create",
    UPDATE = "update"
}
