import { DEFAULT_SIZE, DEFAULT_SIZE_FRACTION } from "./GlobalRenderVariables";

export function localPosToRealPos(p: number): number {
	return p * DEFAULT_SIZE;
}

export function realPosToLocalPos(p: number): number {
	return p * DEFAULT_SIZE_FRACTION;
}
