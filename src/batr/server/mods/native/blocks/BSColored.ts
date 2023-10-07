import { uint } from "../../../../legacy/AS3Legacy";
import { randInt } from "../../../../common/exMath";
import BlockState from "../../../api/block/BlockState";

/**
 * 「有颜色状态」是
 * * 「有颜色」的
 * 方块状态
 * 
 * @property {uint} color 十六进制颜色码
 */
export default class BSColored extends BlockState {

	protected _color: uint;

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000) {
		super();
		this._color = color;
	}

	override destructor(): void {
		this._color = 0;
		super.destructor();
	}

	copy(): BSColored {
		return new BSColored(this._color);
	}

	cloneBlank(): BSColored {
		return new BSColored(0x000000);
	}

	randomize(): this {
		this._color = randInt(0xffffff);
		return this;
	}

	//============Display Implements============//
	public get color(): uint {
		return this._color;
	}

	public set color(value: uint) {
		if (this._color != value) {
			this._color = value;
		}
	}

	override calculatePixelColor(): uint {
		return this._color;
	}

}
