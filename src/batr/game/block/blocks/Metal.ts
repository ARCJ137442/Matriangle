import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalRenderVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import BlockWall from "./Wall";

export default class BlockMetal extends BlockWall {

	//============Constructor & Destructor============//
	public constructor(lineColor: uint = 0x444444, fillColor: uint = 0xdddddd) {
		super(lineColor, fillColor);
		this._attributes = NativeBlockAttributes.METAL
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockMetal(this._lineColor, this._color);
	}

	//============Display Implements============//
	public static readonly LINE_SIZE: uint = DEFAULT_SIZE / 20;

	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(BlockMetal.LINE_SIZE, BlockMetal.LINE_SIZE, DEFAULT_SIZE - BlockMetal.LINE_SIZE * 2, DEFAULT_SIZE - BlockMetal.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Block
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(DEFAULT_SIZE / 4, DEFAULT_SIZE / 4, DEFAULT_SIZE / 2, DEFAULT_SIZE / 2);
		shape.graphics.endFill();
	}
}