import { uint } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapHurt extends AbstractBlockXTrap {
	//============Static Variables============//
	protected static readonly COLOR: uint = 0xff8000;

	//============Constructor & Destructor============//
	public constructor() {
		super(BlockXTrapHurt.COLOR, NativeBlockAttributes.X_TRAP_HURT);
	}

	override clone(): BlockCommon {
		return new BlockXTrapHurt();
	}
}