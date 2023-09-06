/**
 * The 32bit signed integer from ActionScript 3.0
 */
export type int = number;
/**
 * The 32bit unsigned integer from ActionScript 3.0
 */
export type uint = number;

// {int/uint}.{MAX/MIN}_VALUE
export const int$MAX_VALUE: int = 0x7fffffff // 1<<31 will overflow
export const int$MIN_VALUE: int = -0x80000000
export const uint$MAX_VALUE: uint = 0xffffffff
export const uint$MIN_VALUE: uint = -0x100000000

// type as conversion
export function int(n: any): int { return n | 0 }
export function uint(n: any): uint { return n | 0 }
