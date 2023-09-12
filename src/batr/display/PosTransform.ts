import { DEFAULT_SIZE, DEFAULT_SIZE_FRACTION } from "./GlobalDisplayVariables";

/**
 * 这个类主要是在显示时将「逻辑端尺寸」（实数）转换为「显示端尺寸」（像素）
 */

export function localPosToRealPos(p: number): number {
	return p * DEFAULT_SIZE;
}

export function realPosToLocalPos(p: number): number {
	return p * DEFAULT_SIZE_FRACTION;
}
