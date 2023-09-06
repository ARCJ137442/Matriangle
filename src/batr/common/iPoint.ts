import exMath from "./exMath";
import { int } from "./AS3Legacy"
import { flash } from "./FlashLegacy";
// import flash.geom.Point;

/**
 * The point only contains integer position
 */
export default class iPoint { // don't extends Object, otherwise it will make the functions undefined!
	//============Static Variables============//

	//============Static Functions============//
	public static invertPoint(p: iPoint): iPoint {
		return new iPoint(p.y, p.x);
	}

	public static getDistance(p1: iPoint, p2: iPoint): number {
		return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
	}

	public static getManhattanDistance(p1: iPoint, p2: iPoint): int {
		return exMath.intAbs(p1.x - p2.x) + exMath.intAbs(p1.y - p2.y);
	}

	public static convertToGeomPoint(p: iPoint): flash.geom.Point {
		return new flash.geom.Point(p.x, p.y);
	}

	public static copy(p: iPoint): iPoint {
		return new iPoint(p.x, p.y);
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
	public static getLineTargetPoint(start: iPoint, target: iPoint, defaultReturnX: boolean = true): iPoint | null {
		let xD: int = exMath.intAbs(start.x - target.x);
		let yD: int = exMath.intAbs(start.y - target.y);
		if (xD < yD || xD == yD && defaultReturnX)
			return new iPoint(target.x, start.y);
		if (xD > yD)
			return new iPoint(start.x, target.y);
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
	public static getLineTargetPoint2(sX: int, sY: int, tX: int, tY: int, defaultReturnX: boolean = true): iPoint | null {
		let xD: int = exMath.intAbs(sX - tX);
		let yD: int = exMath.intAbs(sY - tY);
		if (xD < yD || xD == yD && defaultReturnX)
			return new iPoint(tX, sY);
		if (xD > yD)
			return new iPoint(sX, tY);
		return null;
	}

	/**
	 * @param	s	start point
	 * @param	t	target point
	 * @return	The Distance.
	 */
	public static getLineTargetDistance(s: iPoint, t: iPoint): number {
		return exMath.intMin(exMath.intAbs(s.x - t.x), exMath.intAbs(s.y - t.y));
	}

	/**
	 * @param	sX	start point x.
	 * @param	sY	start point y.
	 * @param	tX	target point x.
	 * @param	tY	target point y.
	 * @return	The Distance.
	 */
	public static getLineTargetDistance2(sX: number, sY: number, tX: number, tY: number): number {
		return exMath.intMin(exMath.intAbs(sX - tX), exMath.intAbs(sY - tY));
	}

	//============Instance Variables============//
	public x: number = 0;
	public y: number = 0;

	//============Constructor Function============//
	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	//============Instance Functions============//
	public toString(): string {
		return `iPoint(x=${this.x}, y=${this.y})`
		"(x=" + this.x + ", y=" + this.y + ")";
	}

	public invert(): iPoint {
		this.x ^= this.y;
		this.y ^= this.x;
		this.x ^= this.y;
		return this;
	}

	public clone(): iPoint {
		return iPoint.copy(this);
	}

	public copyFrom(source: iPoint): void {
		this.x = source.x;
		this.y = source.y;
	}

	public getDistance(p: iPoint): number {
		return iPoint.getDistance(this, p);
	}

	public getManhattanDistance(p: iPoint): number {
		return iPoint.getManhattanDistance(this, p);
	}

	public equals(p: iPoint): boolean {
		return this.x == p.x && this.y == p.y;
	}

	public isInSameLine(p: iPoint): boolean {
		return this.x == p.x || this.y == p.y;
	}
}
