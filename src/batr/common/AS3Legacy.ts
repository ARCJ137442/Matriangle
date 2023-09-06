export type int = number;
export type uint = number;

// {int/uint}.{MAX/MIN}_VALUE
export const int$MAX_VALUE: int = 0x7fffffff // 1<<31 will overflow
export const int$MIN_VALUE: int = -0x80000000
export const uint$MAX_VALUE: uint = 0xffffffff
export const uint$MIN_VALUE: uint = -0x100000000

export function Int(n: any): int {
    return n | 0
}
export function UInt(n: any): uint {
    return n | 0
}
