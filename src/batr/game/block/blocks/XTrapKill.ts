import { uint } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapKill extends AbstractBlockXTrap {

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockXTrapKill = new BlockXTrapKill();

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