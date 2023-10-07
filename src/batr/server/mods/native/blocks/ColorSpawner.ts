import { uint } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../display/api/DisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../display/api/GlobalDisplayVariables";
import Block from "../../../api/block/Block";
import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";

export default class BlockColorSpawner extends Block {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x999999;
	public static readonly FILL_COLOR: uint = 0xaaaaaa;
	public static readonly CENTER_COLOR: uint = 0x444444;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockColorSpawner = new BlockColorSpawner();

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.COLOR_SPAWNER);
	}

	override clone(): Block {
		return new BlockColorSpawner();
	}

	//============Display Implements============//
	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(BlockColorSpawner.LINE_COLOR);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BlockColorSpawner.FILL_COLOR);
		shape.graphics.drawRect(BlockColorSpawner.LINE_SIZE, BlockColorSpawner.LINE_SIZE, DEFAULT_SIZE - BlockColorSpawner.LINE_SIZE * 2, DEFAULT_SIZE - BlockColorSpawner.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Circle
		shape.graphics.lineStyle(DEFAULT_SIZE / 32, BlockColorSpawner.CENTER_COLOR);
		// 1
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.4);
		// 2
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.25);
		// 3
		shape.graphics.drawCircle(DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE * 0.325);
	}
}