import { uint } from "../../../legacy/AS3Legacy";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapRotate extends AbstractBlockXTrap {
	//============Static Variables============//
	protected static readonly COLOR: uint = 0x0000ff;

	//============Constructor & Destructor============//
	public constructor() {
		super(BlockXTrapRotate.COLOR, BlockAttributes.X_TRAP_ROTATE);
	}

	override clone(): BlockCommon {
		return new BlockXTrapRotate();
	}
}