import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalRenderVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import BlockBedrock from "./Bedrock";

export default class BlockColorSpawner extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = BlockBedrock.LINE_COLOR;
	public static readonly FILL_COLOR: uint = BlockBedrock.FILL_COLOR;
	public static readonly CENTER_COLOR: uint = 0x444444;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.COLOR_SPAWNER);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
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