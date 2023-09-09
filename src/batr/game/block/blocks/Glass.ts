import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import BlockColored from "./Colored";

export default class BlockGlass extends BlockColored {

	//============Constructor & Destructor============//
	public constructor(color: uint = 0xddffff) {
		super(color);
		this._attributes = NativeBlockAttributes.GLASS;
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockGlass(this._color);
	}

	//============Display Implements============//
	protected static readonly LINE_SIZE: uint = DEFAULT_SIZE / 16;
	protected static readonly ALPHA_FRAME: number = 0.6;
	protected static readonly ALPHA_FILL: number = 0.2;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(this._color, BlockGlass.ALPHA_FRAME);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.drawRect(BlockGlass.LINE_SIZE, BlockGlass.LINE_SIZE, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color, BlockGlass.ALPHA_FILL);
		shape.graphics.drawRect(BlockGlass.LINE_SIZE, BlockGlass.LINE_SIZE, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2);
		shape.graphics.endFill();
	}
}