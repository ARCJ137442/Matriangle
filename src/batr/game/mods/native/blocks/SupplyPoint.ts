import { uint } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../display/api/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";
import Block from "../../../api/block/Block";

export default class BlockSupplyPoint extends Block {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x444444;
	public static readonly FILL_COLOR: uint = 0xdddddd;
	public static readonly CENTER_COLOR: uint = 0x00ff00;
	public static readonly BASE_ALPHA: number = 0.5;
	public static readonly GRID_SIZE: uint = DEFAULT_SIZE;

	public static readonly LINE_SIZE: number = BlockSupplyPoint.GRID_SIZE / 32;

	/**
 * 启用单例模式的方块，只有一个实例
 * 
 * ! 为属性安全，禁止一切对方块本身进行修改的行为
 */
	public static readonly INSTANCE: BlockSupplyPoint = new BlockSupplyPoint();

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.SUPPLY_POINT);
	}

	override clone(): Block {
		return new BlockSupplyPoint();
	}
	//============Instance Getter And Setter============//

	//============Display Implements============//

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Base
		shape.graphics.beginFill(BlockSupplyPoint.LINE_COLOR, BlockSupplyPoint.BASE_ALPHA);
		shape.graphics.drawRect(0, 0, BlockSupplyPoint.GRID_SIZE, BlockSupplyPoint.GRID_SIZE);
		shape.graphics.drawRect(BlockSupplyPoint.LINE_SIZE, BlockSupplyPoint.LINE_SIZE, BlockSupplyPoint.GRID_SIZE - BlockSupplyPoint.LINE_SIZE * 2, BlockSupplyPoint.GRID_SIZE - BlockSupplyPoint.LINE_SIZE * 2);
		shape.graphics.endFill();
		shape.graphics.beginFill(BlockSupplyPoint.FILL_COLOR, BlockSupplyPoint.BASE_ALPHA);
		shape.graphics.drawRect(BlockSupplyPoint.LINE_SIZE, BlockSupplyPoint.LINE_SIZE, BlockSupplyPoint.GRID_SIZE - BlockSupplyPoint.LINE_SIZE * 2, BlockSupplyPoint.GRID_SIZE - BlockSupplyPoint.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Center
		// V
		shape.graphics.beginFill(BlockSupplyPoint.CENTER_COLOR);
		shape.graphics.drawRect(BlockSupplyPoint.GRID_SIZE / 8, BlockSupplyPoint.GRID_SIZE * 3 / 8, BlockSupplyPoint.GRID_SIZE * 0.75, BlockSupplyPoint.GRID_SIZE * 0.25);
		shape.graphics.endFill();
		// H
		shape.graphics.beginFill(BlockSupplyPoint.CENTER_COLOR);
		shape.graphics.drawRect(BlockSupplyPoint.GRID_SIZE * 3 / 8, BlockSupplyPoint.GRID_SIZE / 8, BlockSupplyPoint.GRID_SIZE * 0.25, BlockSupplyPoint.GRID_SIZE * 0.75);
		shape.graphics.endFill();
	}
}