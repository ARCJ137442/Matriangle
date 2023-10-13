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
export type Class = Function;
// export type Class = (...params: any[]) => Exclude<unknown, void>; // !【2023-10-13 22:44:30】不能采用此定义，会导致`Map`等对象不起作用

/**
 * 扩展而来的「具体类」
 * * 拥有构造函数签名
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConcreteClass<T = unknown, Args extends any[] = any[]> = {
  new(...args: Args): T;
}

// {int/uint}.{MAX/MIN}_VALUE
export const int$MAX_VALUE: int = 0x7fffffff; // 1<<31 will overflow
export const int$MIN_VALUE: int = -0x80000000;
export const uint$MAX_VALUE: uint = 0xffffffff;
export const uint$MIN_VALUE: uint = 0;

// type as conversion
export function int(n: unknown): int { return (n as int) | 0; }
export function uint(n: unknown): uint { return (n as uint) | 0; }
