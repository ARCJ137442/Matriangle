import { uint } from "../../../legacy/AS3Legacy";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapHurt extends AbstractBlockXTrap {
	//============Static Variables============//
	protected static readonly COLOR: uint = 0xff8000;

	//============Constructor & Destructor============//
	public constructor() {
		super(BlockXTrapHurt.COLOR, BlockAttributes.X_TRAP_HURT);
	}

	override clone(): BlockCommon {
		return new BlockXTrapHurt();
	}
}