import { int } from "../legacy/AS3Legacy";

//============Static Variables============//

//============Static Functions============//
export function alignToBlock(p: number): number {
	return p - 0.5;
}

export function alignToEntity(p: number): number {
	return p + 0.5;
}

export function alignToGrid(p: number): int {
	return p < 0 ? -1 : 0 + Math.floor(p);
}