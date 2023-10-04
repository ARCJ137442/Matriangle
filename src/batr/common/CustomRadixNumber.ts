/* The common class calls <CustomRadixNumber>
 * The Number-System can use for define some Custom-Radix-Mechanism
 * The static class implements The Custom Radix Conversion of Unsigned-Integer(number)
 * The class can be create by operator new,likes [let a:CustomRadixNumber=new CustomRadixNumber()],but that also can be register at class
 * The Custom-Number instanceof express as string
 * An example:The Radix-36 Number 'a0' can be converted to number(0*36^0+10*36^1)=360
 * */

//============Import Something============//
import { uint } from '../legacy/AS3Legacy'

//============Class Start============//
export default class CustomRadixNumber {
	//============Static Variables============//
	public static readonly CHAR_SET_ERROR_MESSAGE: string = 'CharSet Error!';
	public static readonly DEFAULT_CHAR_SET: string = '0123456789';
	public static readonly DEFAULT_DOT_CHAR: string = '.';
	public static readonly DEFAULT_OPERATION_PRECISION: uint = 0x10;

	protected static _instances: Array<CustomRadixNumber> = new Array<CustomRadixNumber>();

	//============Static Getter And Setter============//
	public static get instanceCount(): uint {
		return CustomRadixNumber._instances.length;
	}

	public static get alInstances(): Array<CustomRadixNumber> {
		return CustomRadixNumber._instances.concat();
	}

	//============Static Functions============//
	// Instance
	protected static registerInstance(instance: CustomRadixNumber): void {
		CustomRadixNumber._instances.push(instance);
	}

	public static registerMechanism(charSet: string, key: any = null): void {
		CustomRadixNumber.registerInstance(new CustomRadixNumber(charSet, key));
	}

	public static getInstanceByKey(key: any, fromIndex: uint = 0, strictEqual: boolean = false): CustomRadixNumber | null {
		for (let instance of CustomRadixNumber._instances) {
			if (instance._key === key || !strictEqual && instance._key == key) {
				if (CustomRadixNumber._instances.indexOf(instance) >= fromIndex) {
					return instance;
				}
			}
		}
		return null;
	}

	// Tools
	protected static isEmptyString(string: string | null): boolean {
		return (string === null || string.length < 1);
	}

	protected static dealCharSet(charSet: string): string {
		// Test
		if (charSet === null || charSet.length < 1)
			return '';
		// Set
		let returnCharSet: string = charSet;
		let char: string;
		let otherIndex: uint;
		// Operation
		for (let i: uint = 0; i < charSet.length; i++) {
			char = charSet.charAt(i);
			otherIndex = charSet.indexOf(char, i + 1);
			if (otherIndex >= 0) {
				returnCharSet = returnCharSet.slice(0, i) + returnCharSet.slice(i + 1);
			}
		}
		// Output
		return returnCharSet;
	}

	public static dealDotChar(dotChar: string): string {
		return dotChar.charAt(0);
	}

	//============Constructor & Destructor============//
	public constructor(charSet: string = CustomRadixNumber.DEFAULT_CHAR_SET, dotChar: string = CustomRadixNumber.DEFAULT_DOT_CHAR, key: any = null) {
		// Test
		if (CustomRadixNumber.isEmptyString(charSet)) {
			throw new Error(CustomRadixNumber.CHAR_SET_ERROR_MESSAGE);
		}
		// Set
		this._charSet = CustomRadixNumber.dealCharSet(charSet);
		this._dotChar = CustomRadixNumber.dealDotChar(dotChar);
		this._key = key;
		// Register
		CustomRadixNumber.registerInstance(this);
	}

	//============Instance Variables============//
	protected _charSet: string;
	protected _dotChar: string;
	protected _key: any;

	//============Instance Getter And Setter============//
	/**
	 * get the radix
	 * ! radix with 2 contains charset '01'
	 */
	public get radix(): uint {
		return CustomRadixNumber.isEmptyString(this._charSet) ? 0 : this._charSet.length;
	}

	public get charSet(): string | null {
		return (
			CustomRadixNumber.isEmptyString(this._charSet) ?
				null : this._charSet
		)
	}

	public get key(): any {
		return this._key;
	}

	//============Instance Functions============//
	/* This's the Main Function of Radix Conversion(unfinished).
	 * Functions:
	 * 	getWeightFromChar(char:string):uint
	 * 	fromNumberInt(uint:uint):string
	 * 	toNumberInt(customNumber:string):uint
	 * 	fromNumberFloat(uint:uint):string
	 * 	toNumberFloat(customNumber:string):uint
	 * */
	public getWeightFromChar(char: string): uint {
		let weight: uint = this._charSet.indexOf(char);
		return weight >= 0 ? weight : 0;
	}

	public getCharFromWeight(weight: uint): string {
		let char: string = this._charSet.charAt(weight);
		return char;
	}

	public fromNumberUInt(n: uint): string {
		// Test
		if (n == 0)
			return this.getCharFromWeight(0);
		// Set
		let returnString: string = '';
		let radix: uint = this.radix;
		let tempNum: uint = Math.floor(n);
		let tempNum2: uint = 0;
		// Operation
		for (let i: uint = 0; i < 0x10000 && tempNum > 0; i++) {
			tempNum2 = tempNum % radix;
			tempNum -= tempNum2;
			tempNum /= radix;
			returnString = this.getCharFromWeight(tempNum2) + returnString;
		}
		// Output
		return returnString;
	}

	public toNumberUInt(customNumber: string): uint {
		// Test
		if (CustomRadixNumber.isEmptyString(customNumber))
			return 0;
		// Set
		let returnNumber: uint = 0;
		let radix: uint = this.radix;
		let tempNum: uint = 0;
		// Operation
		for (let i: uint = customNumber.length - 1; i >= 0; i--) {
			tempNum = this.getWeightFromChar(customNumber.charAt(i)) * Math.pow(radix, customNumber.length - i - 1);
			returnNumber += tempNum;
		}
		// Output
		return returnNumber;
	}

	/**
	 * represent positive float numbers in the custom radix
	 * @param number positive float number to convert
	 * @param precision the float precision
	 * @returns a string represents the number in custom radix
	 */
	public fromNumberFloat(number: number, precision: number = CustomRadixNumber.DEFAULT_OPERATION_PRECISION): string {
		// Test
		if (number == 0)
			return this.getCharFromWeight(0);
		// Set
		let returnString: string = '';
		let radix: uint = this.radix;
		let integer: uint = uint(number); // number
		let float: number = number - integer; // float
		let tempNum3: number = 0;
		let i: number;
		// Operation
		// integer
		returnString += this.fromNumberUInt(integer);
		// float
		if (!isNaN(float) && float != 0.0 && isFinite(float)) {
			// dot //
			returnString += this._dotChar;
			// float //
			for (i = 0; i < precision; i++) {
				tempNum3 = uint(float * radix);
				float = float * radix - tempNum3;
				returnString += this.getCharFromWeight(tempNum3);
			}
			for (i = returnString.length - 1; i >= 0; i--) {
				if (returnString.charAt(i) == this.getCharFromWeight(0)) {
					returnString = returnString.slice(0, returnString.length - 1);
				}
				else
					break;
			}
		}
		// Output
		return returnString;
	}

	public toNumberFloat(customNumber: string): number {
		// Test
		if (CustomRadixNumber.isEmptyString(customNumber))
			return 0;
		// Set
		let returnNumber: number = 0;
		let radix: number = this.radix;
		let customNumberParts: Array<string> = customNumber.split(this._dotChar);
		let cNumInt: string = String(customNumberParts[0] == undefined ? '' : customNumberParts[0]);
		let cNumFloat: string = String(customNumberParts[1] == undefined ? '' : customNumberParts[1]);
		// Operation
		// number
		if (!CustomRadixNumber.isEmptyString(cNumInt))
			returnNumber += this.toNumberUInt(cNumInt);
		// float
		if (!CustomRadixNumber.isEmptyString(cNumFloat))
			returnNumber += this.toNumberUInt(cNumFloat) / Math.pow(radix, cNumFloat.length);
		// Output
		return returnNumber;
	}
}