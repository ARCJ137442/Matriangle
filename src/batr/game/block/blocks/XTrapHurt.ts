import { uint } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";
import AbstractBlockXTrap from "./AXTrap";

export default class BlockXTrapHurt extends AbstractBlockXTrap {

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockXTrapHurt = new BlockXTrapHurt();

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