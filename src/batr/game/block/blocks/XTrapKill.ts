import { uint } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapKill extends AbstractBlockXTrap {
	//============Static Variables============//
	protected static readonly COLOR: uint = 0xff0000;
	protected static readonly COLOR_ROTATE: uint = 0x0000ff;

	//============Constructor & Destructor============//
	public constructor() {
		super(BlockXTrapKill.COLOR, NativeBlockAttributes.X_TRAP_KILL);
	}

	override clone(): BlockCommon {
		return new BlockXTrapKill();
	}
}