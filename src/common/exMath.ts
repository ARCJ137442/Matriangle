import { int, uint } from '../legacy/AS3Legacy'

//==============Variables==============//
const PRIME_LIST: Array<uint> = new Array<uint>(2, 3) // only `2` will pass the method about parameter 'length'

//==============Functions==============//

// Prime System
export function getPrimesLessThan(x: uint): uint[] {
	if (x > getLastPrime()) {
		increasePrime(x)
		return PRIME_LIST.slice()
	} else {
		for (let i: uint = 0; i < PRIME_LIST.length; i++) {
			if (PRIME_LIST[i] > x) return PRIME_LIST.slice(0, i)
		}
		return new Array<uint>()
	}
}

export function getPrimeAt(i: uint): uint {
	let arr: uint[] = new Array<uint>()
	for (let i: uint = getLastPrime(); arr.length < i; i += 10)
		arr = getPrimesLessThan(i)
	if (arr.length >= i) return arr[i - 1]
	return 2
}

function isPrime_local(x: uint): boolean {
	return PRIME_LIST.every(
		(p: uint, i: uint, v: uint[]): boolean => x % p != 0 || x == p
	)
}

export function isPrime(x: uint): boolean {
	if (x < 2) return false
	if (x > getLastPrime()) increasePrime(x)
	return isPrime_local(x)
}

function increasePrime(to: uint): void {
	for (let n: uint = getLastPrime() + 1; n <= to; n++) {
		if (isPrime_local(n)) {
			PRIME_LIST.push(n)
		}
	}
}

function getLastPrime(): uint {
	return PRIME_LIST[PRIME_LIST.length - 1]
}

//==Special Function==//
export function $(x: uint): uint {
	return x > 0 ? x : 1 / -x
}

export function $i(x: uint, y: uint = NaN): uint {
	if (isNaN(y)) y = x < 1 ? -1 : 1
	return y < 0 ? -1 / x : x
}

/**
 * A Function in unsigned integers.
 * even(0,2,4,6,...)->0
 * odd:
 *   num[%4=1](1,5,9,...)->1
 *   num[%4=3](3,7,11...)->-1
 * Total list:
 * 	 [0,1,0,-1,0,1,0,-1,0,1,0,-1...] // from 0
 * A Special Property: χ(x)*χ(y)=χ(x*y)
 * @return	χ(x∈N)
 */
export function chi4(x: int): int {
	return (
		(((((x & 1) ^ ((x >> 1) & 1)) & ((x & 1) | 2)) << 1) | ((x + 1) & 1)) -
		1
	)
}

/** some trial to improve the logic of chi
 * x&1:
 * 	 0  1  0  1  0  1  0  1
 * x&2:
 *   0  0  2  2  0  0  2  2
 * (x+1)&2:
 *   0  2  2  0  0  2  2  0
 * x&2>>1:
 * 	 0  1  1  0  0  1  1  0
 * ~(x&1):
 *  -1 -2 -1 -2 -1 -2 -1 -2
 * ~(x&2):
 *  -1 -1 -3 -3 -1 -1 -3 -3
 * ~(x&1) + (x+1)&2:
 *  -1 -2 -1 -2 -1 -2 -1 -2
 */
export const chi = chi4
export const χ = chi4

/**
 * 从「『右左下上』式方向」到「各个维度坐标」的「单位圆表征」
 * * psi = ψ,
 * * psi(0, 1, 2, 3...) = psi(右, 左, 下, 上...) @ x轴 = 1, -1, 0, 0, 0, 0, 0, 0...
 * * (~(x & 1) << 1) => -2, -4, -2, -4...
 * * 对负数：皆为0
 *
 * ! 不具有周期性
 */
// const a = [1, -1]
export function psiN(rot: int): int {
	return rot >> 1 == 0 ? 0 : (~(rot & 1) << 1) + 3
	// return Number(a[rot]) // ? 据说用这个也有挺好的性能
}
export const psi = psiN
export const ψ = psiN

/**
 * Get sign of number.
 * @param	x	the number.
 * @return	0,1 or -1.
 */
export function sgn(x: number): int {
	return x == 0 ? 0 : x > 0 ? 1 : -1
}

//==Int Function==//

/**
 * lash the number(include integers),keep the phase in Section[0,max);
 * @param	n
 * @param	max
 * @return	the lashed number
 */
export function lockNum(n: number, max: number): number {
	if (n < 0) return lockNum(n + max, max)
	if (n >= max) return lockNum(n - max, max)
	return n
}

export function intAbs(n: int): int {
	return int(n >= 0 ? n : -n)
}

export function intMax(a: int, b: int): int {
	return a > b ? a : b
}

export function intMin(a: int, b: int): int {
	return a < b ? a : b
}

/** （源自DL）正⇒正；非正⇒零 */
export function ReLU_I(n: int): int {
	return n > 0 ? n : 0
}

/**
 * 取余运算
 * * 与「模运算」不同的是：模运算会保留负数，而取余运算会将结果限制在[0,modNum)之间
 *
 * !【2023-10-09 01:20:44】目前出现了「浮点相加不精确导致范围溢出」的问题，所以不能贸然使用加法
 * * 宁愿最后结果有偏差，也不要溢出
 * * 一般来说是「加一次就到范围内」的了
 */
export function reminder_F(num: number, modNum: number): number {
	return num < 0 ? reminder_F(num + modNum, modNum) : num % modNum
}

/**
 * 取余运算
 * * 与「模运算」不同的是：模运算会保留负数，而取余运算会将结果限制在[0,modNum)之间
 */
export function reminder_I(num: int, modNum: int): int {
	return (_temp_reminder_I = num % modNum) < 0
		? _temp_reminder_I + modNum // 取模之后，绝对值不会超过modNum
		: _temp_reminder_I
}
let _temp_reminder_I: int

export function redirectNum(num: number, directNum: number): number {
	return Math.round(num * directNum) / directNum
}

//==Random About==//

/**
 * @param x upper limit
 * @returns interval [0,n)
 */
export function randomFloat(x: number): number {
	return Math.random() * x
}

/**
 * 生成一个[0,x)的无符号整数
 * @param	x	:int.
 * @return	:int
 */
export function randInt(x: int): int {
	return int(randomFloat(x))
}

export function random1(): int {
	return Math.random() < 0.5 ? -1 : 1
}

/**
 * 在一定的「自然数取模随机」中规避某个值
 * * 例如：在0~9的取值中规避3，则x=3, n=9
 * * 这里的`1 + randInt(n - 1)`相当于在整个循环群里循环(1~n)次
 *   * 0和(n+1)都会循环到自身，所以规避了
 *
 * @param x 要规避的值
 * @param n 取值范围的上界（不含）
 */
export function randModWithout(x: uint, n: uint): uint {
	return (x + 1 + randInt(n - 1)) % n
}

export function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min)
}

/**
 * 获取一个在指定连续整数区间内的随机数
 *
 * @param min 最小值（含）
 * @param max 最大值（不含）
 * @returns [最小值, 最大值)内的随机整数
 */
export function randIntBetween(min: int, max: int): int {
	return min + randInt(max - min)
}

export function isBetween(
	x: number,
	n1: number,
	n2: number,
	withL: boolean = false,
	withM: boolean = false
): boolean {
	const m: number = Math.max(n1, n2)
	const l: number = Math.min(n1, n2)
	if (withL && withM) return x >= l && x <= m
	else if (withL) return x >= l && x < m
	else if (withM) return x > l && x <= m
	return x > l && x < m
}

export function angleToArc(value: number): number {
	return (value * Math.PI) / 180
}

export function arcToAngle(value: number): number {
	return (value / Math.PI) * 180
}

export function sum(a: number[]): number {
	let sum: number = 0
	for (const i of a) {
		if (!isNaN(i)) sum += i
	}
	return sum
}

export function average(a: number[]): number {
	let sum: number = 0
	for (const i of a) {
		if (!isNaN(i)) {
			sum += i
		}
	}
	return sum / a.length
}

export function removeEmptyInArray(arr: (number | null)[]): void {
	for (let i: number = Math.max(arr.length - 1, 0); i >= 0; i--) {
		if (arr[i] === null || isNaN(arr[i] as number)) arr.splice(i, 1)
	}
}

export function removeEmptyInArrays(...lists: unknown[]): void {
	for (const i of lists) {
		if (i instanceof Array) removeEmptyInArray(i as Array<never>)
	}
}

export function getDistance(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	return getDistance2(x1 - x2, y1 - y2)
}

export function getDistance2(dx: number, dy: number): number {
	return Math.sqrt(getDistanceSquare2(dx, dy))
}

export function getDistanceSquare(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	return getDistanceSquare2(x1 - x2, y1 - y2)
}

export function getDistanceSquare2(x: number, y: number): number {
	return x * x + y * y
}

export function numberBetween(
	x: number,
	num1: number = Number.NEGATIVE_INFINITY,
	num2: number = Number.POSITIVE_INFINITY
): number {
	return Math.min(Math.max(num1, num2), Math.max(Math.min(num1, num2), x))
}

/**
 * 整数→浮点数
 * @param x 待转换的整数/浮点数
 * @returns 转换成的「数值上相等」的浮点数
 */
export function float(x: int): number {
	return x + 0.0
}

/**
 * 给定任意数组，返回其频数组成的对象
 */
export function getFrequency<T = unknown>(arr: T[]): Record<string, number> {
	const frequency: Record<string, number> = {}
	for (const i of arr) {
		if (frequency[i as string]) {
			frequency[i as string]++
		} else {
			frequency[i as string] = 1
		}
	}
	return frequency
}

/**
 * 给定任意数组，返回其频率组成的数组
 * * 其中「元素-频率」的关系丢失
 */
export function getFrequencyPercents<T = unknown>(arr: T[]): number[] {
	const frequency: Record<string, number> = getFrequency(arr)
	const frequencyPercents: number[] = []
	for (const i in frequency) {
		frequencyPercents.push(frequency[i] / arr.length)
	}
	return frequencyPercents
}

/**
 * 计算x \log_2 x
 * * 用到的极限：\lim_{x \to 0} x \ln x = 0
 */
export function xLog2x(x: number): number {
	return x == 0 ? 0 : x * Math.log2(x)
}

/**
 * 计算一个数组的香农熵
 * * 核心公式：`H = - \sum^{n}_{i=1} f(i) \log_2(f(i))`
 */
export function shannonEntropy<T>(arr: T[]): number {
	const frequencyPercents = getFrequencyPercents(arr)
	let H: number = 0
	for (const f of frequencyPercents) {
		H += xLog2x(f)
	}
	return -H
}

/**
 * 计算一个数组的香农熵，并将其归一化
 * * 核心公式：除以数组长度的2对数
 *
 * @example console.log(
 * 	normalShannonEntropy([1, 2, 3]),
 * 	normalShannonEntropy([1, 2, 4]),
 * 	normalShannonEntropy([1, 2, 2]),
 * 	normalShannonEntropy([1, 1, 1]),
 * 	normalShannonEntropy([1, 1, 1, 2]),
 * 	normalShannonEntropy(['x', 'y', 'y'])
 * )
 * > 1 1 0.579380164285695 -0 0.4056390622295664 0.579380164285695
 */
export function normalShannonEntropy<T>(arr: T[]): number {
	return shannonEntropy(arr) / Math.log2(arr.length)
}

// * 一些把「运算符视作函数」的箭头常量 * //
/** （无类型考量的）加法 */
export const plus = <T = number>(x: T, y: T): T =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
	((x as any) + (y as any)) as T
/** （无类型考量的）减法 */
export const minus = <T = number>(x: T, y: T): T =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
	((x as any) - (y as any)) as T
/** （无类型考量的）乘法 */
export const times = <T = number>(x: T, y: T): T =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
	((x as any) * (y as any)) as T
/** （无类型考量的）除法 */
export const divideBy = <T = number>(x: T, y: T): T =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
	((x as any) / (y as any)) as T
/** （无类型考量的）取余 */
export const mod = <T = number>(x: T, y: T): T =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
	((x as any) % (y as any)) as T
