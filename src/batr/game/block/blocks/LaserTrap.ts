import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon from "../BlockCommon";
import BlockBedrock from "./Bedrock";
import BlockColorSpawner from "./ColorSpawner";
import BlockWall from "./Wall";

export default class BlockLaserTrap extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = BlockBedrock.LINE_COLOR;
	public static readonly FILL_COLOR: uint = BlockBedrock.FILL_COLOR;
	public static readonly CENTER_COLOR: uint = BlockColorSpawner.CENTER_COLOR;

	public static readonly LINE_SIZE: uint = BlockWall.LINE_SIZE;

	/**
	 * 启用单例模式的方块，只有一个实例
	 * 
	 * ! 为属性安全，禁止一切对方块本身进行修改的行为
	 */
	public static readonly INSTANCE: BlockLaserTrap = new BlockLaserTrap();


	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.LASER_TRAP);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockLaserTrap();
	}

	//============Display Implements============//
	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(BlockLaserTrap.LINE_COLOR);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BlockLaserTrap.FILL_COLOR);
		shape.graphics.drawRect(BlockLaserTrap.LINE_SIZE, BlockLaserTrap.LINE_SIZE, DEFAULT_SIZE - BlockLaserTrap.LINE_SIZE * 2, DEFAULT_SIZE - BlockLaserTrap.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Rhombus
		shape.graphics.lineStyle(BlockLaserTrap.LINE_SIZE, BlockLaserTrap.CENTER_COLOR);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 3
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 4
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 5
		);
		this.drawRhombus(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 6
		);
		// Point
		shape.graphics.beginFill(BlockLaserTrap.CENTER_COLOR);
		shape.graphics.drawCircle(
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 16
		);
		shape.graphics.endFill();
	}

	protected drawRhombus(shape: IBatrShape, cX: number, cY: number, radius: number): void {
		shape.graphics.moveTo(cX - radius, cY);
		shape.graphics.lineTo(cX, cY + radius);
		shape.graphics.lineTo(cX + radius, cY);
		shape.graphics.lineTo(cX, cY - radius);
		shape.graphics.lineTo(cX - radius, cY);
	}
}