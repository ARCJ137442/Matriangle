
import { uint } from '../legacy/AS3Legacy'
import intPoint from './intPoint';
/**
 * This module compress uint 0x0~0xffffffff into point(x:uint,y:uint)
 * For example:
 * x=0xa6cf,y=0x8ab will compress into 0x(a6cf 08ab)
 * @author ARCJ137442
 */
/**
 * @param	x	position x.
 * @param	y	position y.
 * @return	if x<=0xffff&&y<=0xffff.
 */
export function isValidPositionToCompress(x: uint, y: uint): boolean {
	return x <= 0xffff && y <= 0xffff;
}

/**
 * Test position,if invalid then throw error.
 * @param	x	position x.
 * @param	y	position y.
 */
function testUintPoint(x: uint, y: uint): void {
	if (!isValidPositionToCompress(x, y))
		throw new Error('Position out of range:' + x + ',' + y);
}

/**
 * compress two uint in one uint as point.
 * @param	x	uint 0x0~0xffff.
 * @param	y	uint 0x0~0xffff.
 * @return	The uint as point.
 */
export function compressFromPoint(x: uint, y: uint): uint {
	testUintPoint(x, y);
	return x | (y << 16);
}

/**
 * compress two uint in one uint as point.
 * @param	p	the iPoint.
 * @return	The uint as point.
 */
export function compressFromPoint2(p: intPoint): uint {
	return compressFromPoint(p.x, p.y);
}

/**
 * split a uint point into a point.
 * @param	p	the uint point.
 * @return	The uint as point.
 */
export function releaseFromUint(uPoint: uint): intPoint {
	return new intPoint(getXFromUint(uPoint), getYFromUint(uPoint));
}

/**
 * Get X from uint point.
 * @param	uPoint	the uint point.
 * @return	the position X.
 */
export function getXFromUint(uPoint: uint): uint {
	return uPoint & 0xffff;
}

/**
 * Get Y from uint point.
 * @param	uPoint	the uint point.
 * @return	the position Y.
 */
export function getYFromUint(uPoint: uint): uint {
	// don't use uPoint>>16 because the uint will be signed when bit-move.
	let s: String = uPoint.toString(16);
	return s.length > 4 ? uint(parseInt(s.slice(0, s.length - 4), 16)) : 0;
}
