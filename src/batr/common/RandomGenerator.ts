import { uint, uint$MAX_VALUE } from '../legacy/AS3Legacy'

export default class RandomGenerator {
	//============Static Variables============//
	public static readonly DEFAULT_BUFFER: number[] = new Array<number>(1, 2, 3);

	//============Static Functions============//
	/**
	 * calculate polynomial uses Using Qin Jiushao algorithm
	 * (x, [1,2,3,4]) => 1x^3 + 2x^2 + 2x^1 + 4x^0 = x(x(x1+2)+3)+4
	 * @param x the `x`
	 * @param coefficients [1,2,3,4] of x will be 1*x**3 + 2*x**2 + 3*x**1 + 4*x**0
	 * @returns the calculated
	 */
	public static calcPoly(x: number, coefficients: number[]): number {
		if (isNaN(x) || coefficients == null)
			return 0;
		// let zeroIndex: uint = uint(coefficients[0]);
		let result: number = 0;
		// calculate polynomial uses Using Qin Jiushao algorithm
		for (let i: uint = 0; i < coefficients.length; i++) {
			result *= x
			result += coefficients[i]
		}
		return result;
	}

	public static lashToFloat(value: number, mode: number): number {
		return (value % mode) / mode;
	}

	protected static isEqualNumVec(v1: number[], v2: number[]): boolean {
		if (v1.length != v2.length)
			return false;
		return v1.every(
			(n: number, i: uint, v: number[]): boolean => v1[i] == v2[i]
		);
	}

	//============Instance Variables============//
	protected _mode: number;
	protected _buffer: number[];
	protected _randomList: number[] = new Array<number>();

	//============Init RandomGenerator============//
	public constructor(seed: number, mode: number, buffer: number[] | null = null, length: uint = 1) {
		this._mode = mode;
		this._buffer = buffer ?? RandomGenerator.DEFAULT_BUFFER;
		this._randomList[0] = seed;
		this.generateNext(length);
	}

	//============Instance Functions============//
	//======Getters And Setters======//
	public get seed(): number {
		return this._randomList[0];
	}

	public set seed(value: number) {
		let reGenerate: boolean = (value != this.seed);
		this._randomList[0] = value;
		if (reGenerate)
			this.dealReset();
	}

	public get mode(): number {
		return this._mode;
	}

	public set mode(value: number) {
		let reGenerate: boolean = (value != this.mode);
		this._mode = value;
		if (reGenerate)
			this.dealReset();
	}

	public get buffer(): number[] {
		return this._buffer;
	}

	public set buffer(value: number[]) {
		let reGenerate: boolean = !RandomGenerator.isEqualNumVec(this.buffer, value);
		this._buffer = value;
		if (reGenerate)
			this.dealReset();
	}

	public get numList(): number[] {
		// Include Seed
		return this._randomList;
	}

	public get numCount(): uint {
		// Include Seed
		return this._randomList.length;
	}

	public get lastNum(): number {
		return this._randomList[this._randomList.length - 1];
	}

	public get cycle(): uint {
		for (let i: uint = 0; i < this._randomList.length; i++) {
			let li: uint = this._randomList.lastIndexOf(this._randomList[i], i);
			if (li > i)
				return li - i;
		}
		return uint$MAX_VALUE;
	}

	//======Public Functions======//
	public clone(): RandomGenerator {
		return new RandomGenerator(this.seed, this.mode, this.buffer, this.numCount);
	}

	public isEqual(other: RandomGenerator, strictMode: boolean = false): boolean {
		if (this.mode != other.mode || this.seed != other.seed)
			return false;
		let i: uint;
		for (i = 0; i < this.buffer.length; i++) {
			if (this.buffer[i] != other.buffer[i])
				return false;
		}
		if (strictMode) {
			if (this.numCount != other.numCount)
				return false;
			for (i = 1; i < this.numList.length; i++) {
				if (this.numList[i] != other.numList[i])
					return false;
			}
		}
		return true;
	}

	public generateNext(count: uint = 1): void {
		if (count == 0)
			return;
		for (let i: uint = 0; i < count; i++) {
			this._randomList.push(
				RandomGenerator.calcPoly(
					this.lastNum, this.buffer
				) % this.mode
			);
		}
	}

	public getRandom(count: uint = 1): number[] {
		let arr: number[] = [];
		for (let i: uint = 0; i < count; i++) {
			this.generateNext();
			arr.push(this.lastNum);
		}
		return arr;
	}
	public getRandomAt(index: uint = 0): number {
		// index Start At 1
		if (index == 0) {
			this.generateNext();
			return this.lastNum;
		}
		else if (index < this.numCount) {
			return this._randomList[index];
		}
		else {
			this.generateNext(index - (this.numCount - 1));
			return this.lastNum;
		}
	}

	public constructor(buff: number = 1, next: boolean = true) {
		// index Start At 1
		return this.getRandomAt(next ? 0 : this.numCount - 1) / this._mode * buff;
	}

	public reset(): void {
		this._randomList.length = 1;
		this.dealReset();
	}

	protected dealReset(): void {
		let tempCount: uint = this.numCount - 1;
		this.reset();
		this.generateNext(tempCount);
	}
}