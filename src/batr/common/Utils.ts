import { int, uint, int$MAX_VALUE, int$MIN_VALUE, uint$MAX_VALUE, uint$MIN_VALUE } from "../legacy/AS3Legacy"
import { DisplayObject, DisplayObjectContainer } from "../legacy/flash/display";
import { ByteArray } from "../legacy/flash/utils";
import exMath from "./exMath";

// import flash.utils.getTimer;
// import flash.utils.ByteArray;
// import *;

export default class Utils {
	//================Static Variables================//

	//================Static Functions================//
	//============Math Methods============//
	public static NumberToPercent(x: number, floatCount: uint = 0): string {
		if (floatCount > 0) {
			let pow: uint = 10 ** floatCount;
			let returnNum: number = Math.floor(x * pow * 100) / pow;
			return returnNum + "%";
		}
		return Math.round(x * 100) + "%";
	}

	public static NTP(x: number, floatCount: uint = 0): string {
		return Utils.NumberToPercent(x, floatCount);
	}

	/**
	 * Lock uint[0,uint$MAX_VALUE] into Number[0,1].
	 * @param	value	uint.
	 * @return	Number between 0~1.
	 */
	public static uintToPercent(value: uint): number {
		return value / uint$MAX_VALUE;
	}

	/**
	 * The reverse  based :uintToPercent.
	 * @param	value	Number 0~1.
	 * @return	uint.
	 */
	public static percentToUint(value: number): uint {
		return uint(value * uint$MAX_VALUE);
	}

	//============Display Methods============//
	public static removeChildIfContains(parent: DisplayObjectContainer, child: DisplayObject): void {
		if (child != null && parent.contains(child))
			parent.removeChild(child);
	}

	public static removeAllChildren(container: DisplayObjectContainer): void {
		while (container.numChildren > 0) {
			container.removeChildAt(0);

		}
	}

	//============Boolean Methods============//
	public static randomBoolean(trueWeight: uint = 1, falseWeight: uint = 1): boolean {
		return exMath.randomFloat(trueWeight + falseWeight) < trueWeight;
	}

	public static randomBoolean2(chance: number = 0.5): boolean {
		return (Math.random() <= chance);
	}

	public static binaryToBooleans(bin: uint, length: uint = 0): boolean[] {
		let l: uint = Math.max(bin.toString(2).length, length);
		let v: boolean[] = new Array<boolean>(Boolean(l), true); // ???
		for (let i: uint = 0; i < l; i++) {
			v[i] = Boolean(bin >> i & 1);
		}
		return v;

	}

	public static booleansToBinary(...boo: boolean[]): uint {
		let args: boolean[] = new Array<boolean>;

		for (let i: uint = 0; i < boo.length; i++) {
			args[i] = boo[i];
		}
		return Utils.booleansToBinary2(args);
	}

	public static booleansToBinary2(boo: boolean[]): uint {
		let l: uint = boo.length;

		let uin: uint = 0;

		for (let i: int = l - 1; i >= 0; i--) {
			uin |= uint(boo[i]) << i;

		}
		return uin;
	}

	//============String Methods============//
	public static hasSpellInString(spell: string, string: string): boolean {
		return (string.toLowerCase().indexOf(spell) >= 0);

	}

	public static startswith(string: string, start: string): boolean {
		return (string.indexOf(start) == 0);

	}

	//============Code Methods============//
	public static returnRandom<T>(...Paras: Array<T>): T {
		return Paras[exMath.randomFloat(Paras.length)];

	}

	public static getPropertyInObjects(objects: object[], key: string): any[] {
		let ra: any[] = new Array<any>();

		for (let i: uint = 0; i < objects.length; i++) {
			if (key in objects[i]) {
				ra.push((objects[i] as any)?.[key]); // if not have value, do not return
			}
		}
		return ra;
	}

	public static copyObjectByBytes(object: Object): Object {
		let tempObject: ByteArray = new ByteArray();

		tempObject.writeObject(object);

		tempObject.position = 0;

		return tempObject.readObject() as Object;

	}

	/**
	 * @param arr array
	 * @param input element
	 * @returns whether the element is contains in array
	 */
	public static contains<T>(arr: T[], input: T): boolean {
		return (arr.indexOf(input) >= 0);
	}

	public static spliceAndReturnCount<T>(arr: T[], input: T | T[], count: uint = 0): uint {
		if (Utils.isEmptyArray(arr)) {
			return 0;
		}
		let tempCount: uint = count;

		for (let ts: uint = arr.length - 1; ts >= 0; ts--) {
			if (count == 0 || tempCount > 0) {
				if (input instanceof Array) {
					if (Utils.contains(input as T[], arr[ts])) {
						arr.splice(ts, 1);
						if (tempCount > 0)
							tempCount--;
					}
				}
				else if (arr[ts] == input) {
					arr.splice(ts, 1);
					if (tempCount > 0)
						tempCount--;
				}
			}
			else {
				break;
			}
		}
		return count - tempCount;
	}

	public static isEmptyArray<T>(A: Array<T> | null): boolean {
		return (A == null || A.length < 1);
	}

	public static isEmptyString(S: string): boolean {
		return (S == null || S.length < 1);
	}

	public static isEqualArray<T>(A: T[], B: T[]): boolean {
		if (A.length != B.length) {
			return false;
		}
		else {
			for (let i = 0; i < A.length; i++) {
				if (A[i] != B[i]) {
					return false;
				}
			}
			return true;
		}
	}

	public static isEqualObject(
		a: { [key: string]: [value: any] },
		b: { [key: string]: [value: any] },
		ignoreUnique: boolean = false,
		ignoreVariable: boolean = false,
		notDetectB: boolean = false
	): boolean {
		for (let i in a) {
			let fa: any = a[i];
			if (ignoreUnique || b.hasOwnProperty(i)) {
				let fb: any = b[i];
				if (!ignoreVariable) {
					if (Utils.isPrimitiveInstance(fa) == Utils.isComplexInstance(fb)) {
						return false;
					}
					else if (Utils.isPrimitiveInstance(fa)) {
						if (fa != fb) {
							return false;
						}
					}
					else {
						if (!Utils.isEqualObject(fa, fb)) {
							return false;
						}
					}
				}
			}
			else {
				return false;
			}
		}
		if (!notDetectB) {
			if (!Utils.isEqualObject(b, a, ignoreUnique, ignoreVariable, true)) {
				return false;
			}
		}
		return true;
	}

	public static isPrimitiveInstance(v: any): boolean {
		return (
			v == undefined ||
			v == null ||
			v instanceof Boolean ||
			// v instanceof int ||
			v instanceof Number ||
			v instanceof String /*||
			// v instanceof uint ||
			/*v instanceof void*/
		)
	}

	public static isComplexInstance(v: any): boolean {
		return !Utils.isPrimitiveInstance(v);
	}
}