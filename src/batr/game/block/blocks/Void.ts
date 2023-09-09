import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";

/**
 * 定义一个「空」方块，作为游戏的空值元素
 * ! 此类使用**单例模式**构建其对象，以替代AS3版本中的`null`
 */
export default class BlockVoid extends BlockCommon {
	public static readonly instance: BlockVoid = new BlockVoid();

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.VOID);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockVoid();
	}
}

// 导出单例
export const BLOCK_VOID: BlockCommon = BlockVoid.instance;
