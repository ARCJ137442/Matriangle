import MainFont from "./fonts.deprecated/MainFont";
import { uint } from "../../legacy/AS3Legacy";
import { Font } from "../../legacy/flash/text";

export const MAIN_FONT: Font = new MainFont();

/** 一个标准的「方块」的展示大小；决定几乎所有游戏元素（方块、实体）的绘制尺度 */
export const DEFAULT_SIZE: uint = 100;
export const DEFAULT_SIZE_FRACTION: number = 1 / DEFAULT_SIZE;
export const DEFAULT_SCALE: number = 32 / 100;
export const DISPLAY_SIZE: uint = 768;

export const DISPLAY_GRID_SIZE: number = DEFAULT_SIZE * DEFAULT_SCALE; // 32
export const DISPLAY_GRIDS: number = DISPLAY_SIZE / DISPLAY_GRID_SIZE; // 24
export const INTERNAL_DISPLAY_SIZE: number = DISPLAY_GRIDS * DEFAULT_SIZE; // 2400
