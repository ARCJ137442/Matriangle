import { int, uint } from '../legacy/AS3Legacy'

//==============Variables==============//
const PRIME_LIST: Array<uint> = new Array<uint>(2, 3); // only `2` will pass the method about parameter 'length'

//==============Functions==============//

// Prime System
export function getPrimesLessThan(x: uint): uint[] {
	if (x > getLastPrime()) {
		increasePrime(x);
		return PRIME_LIST.slice();
	}
	else {
		for (let i: uint = 0; i < PRIME_LIST.length; i++) {
			if (PRIME_LIST[i] > x)
				return PRIME_LIST.slice(0, i);
		}
		return new Array<uint>();
	}
}

export function getPrimeAt(i: uint): uint {
	let arr: uint[] = new Array<uint>();
	for (let i: uint = getLastPrime(); arr.length < i; i += 10)
		arr = getPrimesLessThan(i);
	if (arr.length >= i)
		return arr[i - 1];
	return 2;
}

function isPrime_local(x: uint): boolean {
	return PRIME_LIST.every(
		(p: uint, i: uint, v: uint[]): boolean => x % p != 0 || x == p
	);
}

export function isPrime(x: uint): boolean {
	if (x < 2)
		return false;
	if (x > getLastPrime())
		increasePrime(x);
	return isPrime_local(x);
}

function increasePrime(to: uint): void {
	for (let n: uint = getLastPrime(); n <= to; n++) {
		if (isPrime_local(n)) {
			PRIME_LIST.push(n);
		}
	}
}

function getLastPrime(): uint {
	return PRIME_LIST[PRIME_LIST.length - 1];
}

//==Special Function==//
export function $(x: uint): uint {
	return x > 0 ? x : 1 / (-x);
}

export function $i(x: uint, y: uint = NaN): uint {
	if (isNaN(y))
		y = x < 1 ? -1 : 1;
	return y < 0 ? -1 / (x) : x;
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
	return (((((x & 1) ^ ((x >> 1) & 1)) & ((x & 1) | 2)) << 1) | ((x + 1) & 1)) - 1;
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
export const chi = chi4;
export const χ = chi4;

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
	return (rot >> 1 == 0) ? 0 : (~(rot & 1) << 1) + 3
	// return Number(a[rot]) // ? 据说用这个也有挺好的性能
}
export const psi = psiN;
export const ψ = psiN;

/**
 * Get sign of number.
 * @param	x	the number.
 * @return	0,1 or -1.
 */
export function sgn(x: number): int {
	return x == 0 ? 0 : (x > 0 ? 1 : -1)
}

//==Int Function==//

/**
 * lash the number(include integers),keep the phase in Section[0,max);
 * @param	n
 * @param	max
 * @return	the lashed number
 */
export function lockNum(n: number, max: number): number {
	if (n < 0)
		return lockNum(n + max, max);
	if (n >= max)
		return lockNum(n - max, max);
	return n;
}

export function intAbs(n: int): int {
	return int(n >= 0 ? n : -n);
}

export function intMax(a: int, b: int): int {
	return a > b ? a : b;
}

export function intMin(a: int, b: int): int {
	return a < b ? a : b;
}

export function mod(num: number, modNum: number): number {
	return (num / modNum - Math.floor(num / modNum)) * modNum;
}

export function intMod(num: int, modNum: int): int {
	return num % modNum;
}

export function redirectNum(num: number, directNum: number): number {
	return Math.round(num * directNum) / directNum;
}

//==Random About==//

/**
 * @param x upper limit
 * @returns interval [0,n)
 */
export function randomFloat(x: number): number {
	return Math.random() * x;
}

/**
 * 生成一个[0,x)的无符号整数
 * @param	x	:int.
 * @return	:int
 */
export function randInt(x: int): int {
	return int(randomFloat(x));
}

export function random1(): int {
	return Math.random() < 0.5 ? -1 : 1;
}

export function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

/**
 * 获取一个在指定连续整数区间内的随机数
 * @param min 最小值（含）
 * @param max 最大值（不含）
 * @returns [最小值, 最大值)内的随机整数
 */
export function randIntBetween(min: int, max: int): int {
	return min + randInt(max - min);
}

export function isBetween(
	x: number,
	n1: number, n2: number,
	withL: boolean = false,
	withM: boolean = false
): boolean {
	let m: number = Math.max(n1, n2);
	let l: number = Math.min(n1, n2);
	if (withL && withM)
		return x >= l && x <= m;
	else if (withL)
		return x >= l && x < m;
	else if (withM)
		return x > l && x <= m;
	return x > l && x < m;
}

/**
 * Choose an index in an array that regard the content as weights
 * @param weights the weight of random
 * @returns the selected index of the weight
 */
export function randomByWeight(weights: number[]): uint {
	// Return Number Include 0
	if (weights.length >= 1) {
		let all = 0;
		let i;
		for (i in weights) {
			if (!isNaN(weights[i]))
				all += weights[i];
		}
		if (weights.length == 1)
			return 0;
		else {
			let R = Math.random() * all;
			for (i = 0; i < weights.length; i++) {
				let N = weights[i];
				let rs = 0;
				for (let l = 0; l < i; l++)
					rs += weights[l];
				// trace(R+'|'+(rs+N)+'>R>='+rs+','+(i+1))
				if (R >= rs && R < rs + N)
					return i;
			}
		}
	}
	return randInt(weights.length);
}

export function randomByWeight2(...weights: number[]): number {
	return randomByWeight(weights);
}

export function randomByWeightV(weights: number[]): number {
	if (weights.length >= 1) {
		let all: number = sum(weights);
		if (weights.length == 1)
			return 0;
		let r: number = randomFloat(all);
		for (let i = 0; i < weights.length; i++) {
			let N = weights[i];
			let rs = 0;
			for (let l = 0; l < i; l++)
				rs += weights[l];
			// trace(R+'|'+(rs+N)+'>R>='+rs+','+(i+1))
			if (r <= rs + N)
				return i;
		}
	}
	console.error('Nothing is out by weighted random!', weights)
	return randInt(weights.length) + 1;
}

export function angleToArc(value: number): number {
	return value * Math.PI / 180;
}

export function arcToAngle(value: number): number {
	return value / Math.PI * 180;
}

export function sum(a: number[]): number {
	let sum: number = 0;
	for (let i of a) {
		if (!isNaN(i))
			sum += i;
	}
	return sum;
}

export function average(a: number[]): number {
	let sum: number = 0;
	for (let i of a) {
		if (!isNaN(i)) {
			sum += i;
		}
	}
	return sum / a.length;
}

export function removeEmptyInArray(arr: (number | null)[]): void {
	for (let i: number = Math.max(arr.length - 1, 0); i >= 0; i--) {
		if (arr[i] == null || isNaN(arr[i] as number))
			arr.splice(i, 1);
	}
}

export function removeEmptyIn(...lists: any[]): void {
	for (let i of lists) {
		if (i instanceof Array)
			removeEmptyInArray(i);
	}
}

export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
	return getDistance2(x1 - x2, y1 - y2);
}

export function getDistance2(dx: number, dy: number): number {
	return Math.sqrt(getDistanceSquare2(dx, dy));
}

export function getDistanceSquare(x1: number, y1: number, x2: number, y2: number): number {
	return getDistanceSquare2(x1 - x2, y1 - y2);
}

export function getDistanceSquare2(x: number, y: number): number {
	return x * x + y * y;
}

export function NumberBetween(x: number, num1: number = Number.NEGATIVE_INFINITY, num2: number = Number.POSITIVE_INFINITY): number {
	return Math.min(Math.max(num1, num2), Math.max(Math.min(num1, num2), x));
}
