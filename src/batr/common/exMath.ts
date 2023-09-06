import { int, uint } from './AS3Legacy'

export default class exMath {
	//==============Static Variables==============//
	private static PrimeList: Array<uint> = new Array<uint>(2);

	//==============Static Functions==============//
	//==Special Function==//
	public static $(x: uint): uint {
		return x > 0 ? x : 1 / (-x);
	}

	public static $i(x: uint, y: uint = NaN): uint {
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
	public static chi4(x: int): int {
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

	public static readonly chi = exMath.chi4;
	public static readonly χ = exMath.chi4;

	/**
	 * Get sign of number.
	 * @param	x	the number.
	 * @return	0,1 or -1.
	 */
	public static sgn(x: number): int {
		return x == 0 ? 0 : (x > 0 ? 1 : -1)
	}

	//==Int Function==//

	/**
	 * lash the number(include integers),keep the phase in Section[0,max);
	 * @param	n
	 * @param	max
	 * @return	the lashed number
	 */
	public static lockNum(n: number, max: number): number {
		if (n < 0)
			return exMath.lockNum(n + max, max);
		if (n >= max)
			return exMath.lockNum(n - max, max);
		return n;
	}

	public static intAbs(n: int): int {
		return int(n >= 0 ? n : -n);
	}

	public static intMax(a: int, b: int): int {
		return a > b ? a : b;
	}

	public static intMin(a: int, b: int): int {
		return a < b ? a : b;
	}

	public static mod(num: number, modNum: number): number {
		return (num / modNum - Math.floor(num / modNum)) * modNum;
	}

	public static intMod(num: int, modNum: int): int {
		return num % modNum;
	}

	public static redirectNum(num: number, directNum: number): number {
		return Math.round(num * directNum) / directNum;
	}

	//==Random About==//

	/**
	 * @param x upper limit
	 * @returns interval [0,n)
	 */
	public static randomFloat(x: number): number {
		return Math.random() * x;
	}

	/**
	 * @param	x	:int.
	 * @return	:int
	 */
	public static randInt(x: int): int {
		return int(exMath.randomFloat(x));
	}

	public static random1(): int {
		return Math.random() < 0.5 ? -1 : 1;
	}

	public static randomBetween(x: number, y: number): number {
		let h: number = Math.max(x, y);
		let l: number = Math.min(x, y);
		return l + exMath.randInt(h - l);
	}

	public static randIntBetween(x: int, y: int): int {
		let h: int = exMath.intMax(x, y);
		let l: int = exMath.intMin(x, y);
		return l + Math.random() * (h - l);
	}

	public static isBetween(
		x: number,
		n1: number, n2: number,
		withL: Boolean = false,
		withM: Boolean = false
	): Boolean {
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
	public static randomByWeight(weights: number[]): uint {
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
					// trace(R+"|"+(rs+N)+">R>="+rs+","+(i+1))
					if (R >= rs && R < rs + N)
						return i;
				}
			}
		}
		return exMath.randInt(weights.length);
	}

	public static randomByWeight2(...weights: number[]): number {
		return exMath.randomByWeight(weights);
	}

	public static randomByWeightV(weights: number[]): number {
		if (weights.length >= 1) {
			let all: number = this.getSum(weights);
			if (weights.length == 1)
				return 0;
			let r: number = this.randomFloat(all);
			for (let i = 0; i < weights.length; i++) {
				let N = weights[i];
				let rs = 0;
				for (let l = 0; l < i; l++)
					rs += weights[l];
				// trace(R+"|"+(rs+N)+">R>="+rs+","+(i+1))
				if (r <= rs + N)
					return i;
			}
		}
		console.error('Nothing is out by weighted random!', weights)
		return exMath.randInt(weights.length) + 1;
	}

	public static angleToArc(value: number): number {
		return value * Math.PI / 180;
	}

	public static arcToAngle(value: number): number {
		return value / Math.PI * 180;
	}

	public static getSum(a: number[]): number {
		let sum: number = 0;
		for (let i of a) {
			if (!isNaN(i))
				sum += i;
		}
		return sum;
	}

	public static getAverage(a: number[]): number {
		let sum: number = 0;
		for (let i of a) {
			if (!isNaN(i)) {
				sum += i;
			}
		}
		return sum / a.length;
	}

	public static removeEmptyInArray(arr: (number | null)[]): void {
		for (let i: number = Math.max(arr.length - 1, 0); i >= 0; i--) {
			if (arr[i] == null || isNaN(arr[i] as number))
				arr.splice(i, 1);
		}
	}

	public static removeEmptyIn(...lists: any[]): void {
		for (let i of lists) {
			if (i instanceof Array)
				exMath.removeEmptyInArray(i);
		}
	}

	public static getDistance(x1: number, y1: number, x2: number, y2: number): number {
		return exMath.getDistance2(x1 - x2, y1 - y2);
	}

	public static getDistance2(dx: number, dy: number): number {
		return Math.sqrt(exMath.getDistanceSquare2(dx, dy));
	}

	public static getDistanceSquare(x1: number, y1: number, x2: number, y2: number): number {
		return exMath.getDistanceSquare2(x1 - x2, y1 - y2);
	}

	public static getDistanceSquare2(x: number, y: number): number {
		return x * x + y * y;
	}

	public static NumberBetween(x: number, num1: number = Number.NEGATIVE_INFINITY, num2: number = Number.POSITIVE_INFINITY): number {
		return Math.min(Math.max(num1, num2), Math.max(Math.min(num1, num2), x));
	}

	// Prime System
	public static getPrimes(x: uint): uint[] {
		if (x > exMath.lastPrime) {
			exMath.lastPrime = x;
			return exMath.PrimeList;
		}
		else {
			for (let i: uint = 0; i < exMath.PrimeList.length; i++) {
				if (exMath.PrimeList[i] > x)
					return exMath.PrimeList.slice(0, i);
			}
			return new Array<uint>();
		}
	}

	public static getPrimeAt(x: uint): uint {
		let arr: uint[] = new Array<uint>();
		for (let i: uint = exMath.lastPrime; arr.length < x; i += 10)
			arr = exMath.getPrimes(i);
		if (arr.length >= x)
			return arr[x - 1];
		return 2;
	}

	public static isPrime(x: uint): Boolean {
		if (Math.abs(x) < 2)
			return false;
		if (x > exMath.lastPrime)
			exMath.lastPrime = x;
		return exMath.PrimeList.every((p: uint, i: uint, v: uint[]): Boolean => {
			return x % p != 0 && x != p;
		});
	}

	private static get lastPrime(): uint {
		return exMath.PrimeList[exMath.PrimeList.length - 1] | 0;
	}

	private static set lastPrime(Num: uint) {
		for (let n: uint = exMath.lastPrime; n <= Num; n++) {
			if (exMath.PrimeList.every(
				(p: uint, i: uint, v: uint[]): Boolean => (n % p != 0 && n != p)
			)) {
				exMath.PrimeList.push(n);
			}
		}
	}
}