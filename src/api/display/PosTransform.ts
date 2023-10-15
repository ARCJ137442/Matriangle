
import { DEFAULT_SIZE, DEFAULT_SIZE_FRACTION } from "./GlobalDisplayVariables"
/**
 * 这里的工具函数主要是在显示时将「逻辑端尺寸」（实数）转换为「显示端尺寸」（像素）
 */

/**
 * 逻辑端尺寸→显示端尺寸
 * @param p 逻辑端尺寸（方格）
 * @returns 显示端尺寸（像素）
 */
export function logical2Real(p: number): number {
	return p * DEFAULT_SIZE
}

/**
 * 显示端尺寸→逻辑端尺寸
 * @param p 显示端尺寸（像素）
 * @returns 逻辑端尺寸（方格）
 */
export function real2Logical(p: number): number {
	return p * DEFAULT_SIZE_FRACTION
}
