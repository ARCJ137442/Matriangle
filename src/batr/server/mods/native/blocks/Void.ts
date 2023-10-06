import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";
import Block from "../../../api/block/Block";

/**
 * 定义一个「空」方块，作为世界的空值元素
 * ! 此类使用**单例模式**构建其对象，以替代AS3版本中的`null`
 */
export default class BlockVoid extends Block {

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockVoid = new BlockVoid();

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.VOID);
	}

	override clone(): Block {
		return new BlockVoid();
	}
}

// 导出单例
export const BLOCK_VOID: Block = BlockVoid.INSTANCE;
