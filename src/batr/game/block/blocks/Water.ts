import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";
import BlockColored from "./Colored";

export default class Water extends BlockColored {
	//============Static Variables============//
	protected static readonly ALPHA: number = 0.4;

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x2222FF) {
		super(color);
		this._attributes = BlockAttributes.WATER;
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new Water(this._color);
	}

	//============Display Implements============//
	override get pixelAlpha(): uint {
		return Water.ALPHA;
	}

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		shape.graphics.beginFill(this._color, Water.ALPHA);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}
}
