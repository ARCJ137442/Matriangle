import { uint } from "../legacy/AS3Legacy";

export const TPS: uint = 100;
export const FIXED_TPS: uint = TPS / 2; // (For CD, to be solved) In order to synchronize the in-game CD with the real CD
export const TICK_TIME_S: number = 1 / TPS;
export const TICK_TIME_MS: number = TICK_TIME_S * 1000;
// Timer:A delay lower than 20 milliseconds is not recommended

export const TOOL_MIN_CD: uint = TPS / 8;
export const PROJECTILES_SPAWN_DISTANCE: number = 0.55;
