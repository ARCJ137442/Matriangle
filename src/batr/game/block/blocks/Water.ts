import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import BlockColored from "./Colored";

export default class BlockWater extends BlockColored {
	//============Static Variables============//
	protected static readonly ALPHA: number = 0.4;

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x2222FF) {
		super(color);
		this._attributes = NativeBlockAttributes.WATER;
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockWater(this._color);
	}

	//============Display Implements============//
	override get pixelAlpha(): uint {
		return BlockWater.ALPHA;
	}

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		shape.graphics.beginFill(this._color, BlockWater.ALPHA);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}
}
