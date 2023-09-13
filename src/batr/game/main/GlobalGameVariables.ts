import { uint } from "../../legacy/AS3Legacy";

export const TPS: uint = 100;
export const FIXED_TPS: uint = TPS / 2; // (For CD, to be solved) In order to synchronize the in-game CD with the real CD
export const TICK_TIME_S: number = 1 / TPS;
export const TICK_TIME_MS: number = TICK_TIME_S * 1000;
// Timer:A delay lower than 20 milliseconds is not recommended

export const TOOL_MIN_CD: uint = TPS / 8;
export const PROJECTILES_SPAWN_DISTANCE: number = 0.55;

//==== 取自「事件分派」系统，旨在「兼顾通用性」时避免循环导入 ====//
/**
 * 决定第一步「针对事件类型分派」使用的索引
 */
export type GameEventType = string;

/**
 * 决定第二部「针对『方块类型/实体类型』分派」使用的索引
 * * 【20230912 9:15:27】目前方法：统一「散列化」为指定类型（字符串），保证一一对应即可
 */
export type PatchIndexType = string;