import { uint } from "../../legacy/AS3Legacy";

/** 每秒游戏刻数 */
export const TPS: uint = 100;
/** 修正后的「每秒游戏刻数」 */
export const FIXED_TPS: uint = TPS; // !【2023-10-01 12:03:43】现在与TPS相同，其有效性有待进一步核实
/** 每个游戏刻所经历的秒数 */
export const TICK_TIME_S: number = 1 / TPS;
/** 每个游戏刻所经历的毫秒数 */
export const TICK_TIME_MS: number = TICK_TIME_S * 1000;
// Timer:A delay lower than 20 milliseconds instanceof not recommended

/** 用于「武器无冷却」模式中的「最小冷却」 */
export const TOOL_MIN_CD: uint = TPS / 8;
/** 抛射体在玩家面前生成的距离 */
export const PROJECTILES_SPAWN_DISTANCE: number = 0.55;
