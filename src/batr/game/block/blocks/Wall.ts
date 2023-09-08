import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import BlockColored from "./Colored";

export default class BlockWall extends BlockColored {
	//============Static Variables============//

	//============Instance Variables============//
	protected _lineColor: uint;

	//============Constructor & Destructor============//
	public constructor(lineColor: uint = 0xaaaaaa, fillColor: uint = 0xbbbbbb) {
		super(fillColor); // ! won't give the attributes
		this._lineColor = lineColor;
		this._attributes = NativeBlockAttributes.COLORED_BLOCK;
	}

	override destructor(): void {
		this._lineColor = 0;
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockWall(this._lineColor, this._color);
	}

	//========Display Implements========//
	public static readonly LINE_SIZE: uint = DEFAULT_SIZE / 50;

	public get lineColor(): uint {
		return this._lineColor;
	}

	public set lineColor(color: uint) {
		if (this._lineColor != color) {
			this._lineColor = color;
		}
	}

	override get pixelColor(): uint {
		return this.attributes.defaultPixelColor;
	}

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(
			BlockWall.LINE_SIZE, BlockWall.LINE_SIZE,
			DEFAULT_SIZE - BlockWall.LINE_SIZE * 2, DEFAULT_SIZE - BlockWall.LINE_SIZE * 2
		);
		shape.graphics.endFill();
	}
}
