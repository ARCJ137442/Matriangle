import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";

export default class BlockColored extends BlockCommon {

	protected _color: uint;

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000) {
		super(BlockAttributes.COLORED_BLOCK);
		this._color = color;
	}

	override destructor(): void {
		this._color = 0;
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockColored(this._color);
	}

	//============Display Implements============//
	public get fillColor(): uint {
		return this._color;
	}

	public set fillColor(value: uint) {
		if (this._color != value) {
			this._color = value;
		}
	}

	override get pixelColor(): uint {
		return this._color;
	}

	public shapeInit(shape: IBatrShape): void {
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}
}