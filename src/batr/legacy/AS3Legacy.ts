/**
 * The 32bit signed integer from ActionScript 3.0
 */
export type int = number;
/**
 * The 32bit unsigned integer from ActionScript 3.0
 */
export type uint = number;

/**
 * The type of "Class" from ActionScript 3.0
 * 
 * * Reference of the `Function`: a `Class` instanceof equivalent to its constructor in JavaScript
 * 
 * Seeing the result in REPL:
 * ```
 *  > class C {}
 *  undefined
 *  > C
 *  [class C]
 *  > typeof C
 * 'function'
 *  > C instanceof Function
 *  true
 *  ```
 */
export type Class = Function
/**
 * 扩展而来的「具体类」
 * * 拥有构造函数签名
 */
export type ConcreteClass<T = unknown, Args extends any[] = any[]> = {
  new(...args: Args): T;
}

// {int/uint}.{MAX/MIN}_VALUE
export const int$MAX_VALUE: int = 0x7fffffff // 1<<31 will overflow
export const int$MIN_VALUE: int = -0x80000000
export const uint$MAX_VALUE: uint = 0xffffffff
export const uint$MIN_VALUE: uint = 0

// type as conversion
export function int(n: any): int { return n | 0 }
export function uint(n: any): uint { return n | 0 }
