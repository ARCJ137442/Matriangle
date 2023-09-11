import * as exMath from './exMath';
import { int } from '../legacy/AS3Legacy'
import { flash } from '../legacy/FlashLegacy';
// import flash.geom.Point;

/**
 * 经过特殊定制的整数点支持
 * TODO: 数组化重写，用数组形式提升代码性能
 */
export default class intPoint { // don't extends Object, otherwise it will make the functions undefined!
	//============Static Variables============//

	//============Static Functions============//
	public static invertPoint(p: intPoint): intPoint {
		return new intPoint(p.y, p.x);
	}

	public static getDistance(p1: intPoint, p2: intPoint): number {
		return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
	}

	public static getManhattanDistance(p1: intPoint, p2: intPoint): int {
		return exMath.intAbs(p1.x - p2.x) + exMath.intAbs(p1.y - p2.y);
	}

	public static convertToGeomPoint(p: intPoint): flash.geom.Point {
		return new flash.geom.Point(p.x, p.y);
	}

	public static copy(p: intPoint): intPoint {
		return new intPoint(p.x, p.y);
	}

	// Use For AI

	/**
	 * R---S
	 * |   |
	 * |   |
	 * |   |
	 * T======
	 * S: Start
	 * T: Target
	 * R: Return
	 */
	public static getLineTargetPoint(start: intPoint, target: intPoint, defaultReturnX: boolean = true): intPoint | null {
		let xD: int = exMath.intAbs(start.x - target.x);
		let yD: int = exMath.intAbs(start.y - target.y);
		if (xD < yD || xD == yD && defaultReturnX)
			return new intPoint(target.x, start.y);
		if (xD > yD)
			return new intPoint(start.x, target.y);
		return null;
	}

	/**
	 * R---S
	 * |   |
	 * |   |
	 * |   |
	 * T======
	 * S: Start
	 * T: Target
	 * R: Return
	 */
	public static getLineTargetPoint2(sX: int, sY: int, tX: int, tY: int, defaultReturnX: boolean = true): intPoint | null {
		let xD: int = exMath.intAbs(sX - tX);
		let yD: int = exMath.intAbs(sY - tY);
		if (xD < yD || xD == yD && defaultReturnX)
			return new intPoint(tX, sY);
		if (xD > yD)
			return new intPoint(sX, tY);
		return null;
	}

	/**
	 * @param	s	start point
	 * @param	t	target point
	 * @return	The Distance.
	 */
	public static getLineTargetDistance(s: intPoint, t: intPoint): int {
		return exMath.intMin(exMath.intAbs(s.x - t.x), exMath.intAbs(s.y - t.y));
	}

	/**
	 * @param	sX	start point x.
	 * @param	sY	start point y.
	 * @param	tX	target point x.
	 * @param	tY	target point y.
	 * @return	The Distance.
	 */
	public static getLineTargetDistance2(sX: int, sY: int, tX: int, tY: int): int {
		return exMath.intMin(exMath.intAbs(sX - tX), exMath.intAbs(sY - tY));
	}

	//============Instance Variables============//
	public x: int = 0;
	public y: int = 0;

	//============Constructor & Destructor============//
	public constructor(x: number, y: number) {
		this.x = int(x);
		this.y = int(y);
	}

	//============Instance Functions============//
	public toString(): string {
		return `iPoint(x=${this.x}, y=${this.y})`
	}

	public invert(): intPoint {
		this.x ^= this.y;
		this.y ^= this.x;
		this.x ^= this.y;
		return this;
	}

	public clone(): intPoint {
		return intPoint.copy(this);
	}

	public copyFrom(source: intPoint): void {
		this.x = source.x;
		this.y = source.y;
	}

	public getDistance(p: intPoint): number {
		return intPoint.getDistance(this, p);
	}

	public getManhattanDistance(p: intPoint): int {
		return intPoint.getManhattanDistance(this, p);
	}

	public isEqual(p: intPoint): boolean {
		return this.x == p.x && this.y == p.y;
	}

	public isInSameLine(p: intPoint): boolean {
		return this.x == p.x || this.y == p.y;
	}
}

export class floatPoint extends Array<number> {
	get x(): number { return this[0] }
	set x(value: number) { this[0] = value }
	get y(): number { return this[1] }
	set y(value: number) { this[1] = value }
}

// Full alias
export const iPoint = intPoint; // as class
export type iPoint = intPoint; // as type
export const fPoint = floatPoint; // as class
export type fPoint = floatPoint; // as type
