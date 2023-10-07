import { IBatrShape } from "../../../../display/api/DisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";
import BSBiColored from "./BSBiColored";

/**
 * ! 即将迁移
 * * 现在「基于『方块id-方块状态』的系统」没有「独立方块类」的位置
 * * 这些代码流亡到这里，等待进一步清除/修改
 */
export class BlockShapeFunctions {

	// AXTrap

	//============Display Implements============//
	protected static readonly LINE_SIZE: uint = DEFAULT_SIZE / 20;
	protected static readonly ALPHA: number = 1;
	protected static readonly ALPHA_BACK: number = 0.4;
	protected static readonly COLOR_NULL: uint = 0;
	protected static readonly COLOR_HURT: uint = 0xff8000;
	protected static readonly COLOR_KILL: uint = 0xff0000;
	protected static readonly COLOR_ROTATE: uint = 0x0000ff;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Back
		shape.graphics.beginFill(this._color, AbstractBlockXTrap.ALPHA_BACK);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();

		// X
		shape.graphics.lineStyle(AbstractBlockXTrap.LINE_SIZE, this._color, AbstractBlockXTrap.ALPHA);
		shape.graphics.moveTo(AbstractBlockXTrap.LINE_SIZE / 2, AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.lineTo(DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2, DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.moveTo(AbstractBlockXTrap.LINE_SIZE / 2, DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.lineTo(DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2, AbstractBlockXTrap.LINE_SIZE / 2);
	}

	// ColorSpawner

	//============Display Implements============//
	public static readonly LINE_COLOR: uint = 0x999999;
	public static readonly FILL_COLOR: uint = 0xaaaaaa;
	public static readonly CENTER_COLOR: uint = 0x444444;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;

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

	// Glass

	//============Display Implements============//
	protected static readonly LINE_SIZE: uint = DEFAULT_SIZE / 16;
	protected static readonly ALPHA_FRAME: number = 0.6;
	protected static readonly ALPHA_FILL: number = 0.2;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(this._color, BlockGlass.ALPHA_FRAME);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.drawRect(BlockGlass.LINE_SIZE, BlockGlass.LINE_SIZE, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color, BlockGlass.ALPHA_FILL);
		shape.graphics.drawRect(BlockGlass.LINE_SIZE, BlockGlass.LINE_SIZE, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2, DEFAULT_SIZE - BlockGlass.LINE_SIZE * 2);
		shape.graphics.endFill();
	}

	// Gate

	//============Display Implements============//
	protected static readonly BLOCK_SIZE: uint = DEFAULT_SIZE;
	protected static readonly LINE_SIZE: uint = this.BLOCK_SIZE / 20;

	public static readonly LINE_COLOR: uint = 0xaaaaaa;
	public static readonly FILL_COLOR: uint = 0xbbbbbb;
	public static readonly CENTER_COLOR: uint = 0x666666;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		if (this._open) {
			// Line
			shape.graphics.beginFill(BlockGate.LINE_COLOR);
			shape.graphics.drawRect(0, 0, BlockGate.BLOCK_SIZE, BlockGate.BLOCK_SIZE);
			shape.graphics.drawRect(BlockGate.LINE_SIZE, BlockGate.LINE_SIZE, BlockGate.BLOCK_SIZE - BlockGate.LINE_SIZE * 2, BlockGate.BLOCK_SIZE - BlockGate.LINE_SIZE * 2);
			shape.graphics.endFill();
		}
		else {
			shape.graphics.beginFill(BlockGate.LINE_COLOR);
			shape.graphics.drawRect(0, 0, BlockGate.BLOCK_SIZE, BlockGate.BLOCK_SIZE);
			shape.graphics.endFill();
			// Fill
			shape.graphics.beginFill(BlockGate.FILL_COLOR);
			shape.graphics.drawRect(BlockGate.LINE_SIZE, BlockGate.LINE_SIZE, BlockGate.BLOCK_SIZE - BlockGate.LINE_SIZE * 2, BlockGate.BLOCK_SIZE - BlockGate.LINE_SIZE * 2);
			shape.graphics.endFill();
			// Center
			shape.graphics.beginFill(BlockGate.CENTER_COLOR);
			shape.graphics.drawCircle(BlockGate.BLOCK_SIZE / 2, BlockGate.BLOCK_SIZE / 2, BlockGate.BLOCK_SIZE / 3);
			shape.graphics.drawCircle(BlockGate.BLOCK_SIZE / 2, BlockGate.BLOCK_SIZE / 2, BlockGate.BLOCK_SIZE / 4);
			shape.graphics.endFill();
		}
	}

	// Colored

	public shapeInit(shape: IBatrShape): void {
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}

	// Wall
	public constructor(lineColor: uint = 0xaaaaaa, fillColor: uint = 0xbbbbbb) {
		super(fillColor); // ! won't give the attributes
		this._lineColor = lineColor;
		this._attributes = NativeBlockAttributes.COLORED_BLOCK;
	}

	//========Display Implements========//
	public static readonly LINE_SIZE: uint = DEFAULT_SIZE / 50;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(
			BSWall.LINE_SIZE, BSWall.LINE_SIZE,
			DEFAULT_SIZE - BSWall.LINE_SIZE * 2, DEFAULT_SIZE - BSWall.LINE_SIZE * 2
		);
		shape.graphics.endFill();
	}

	// Bedrock

	public static readonly LINE_COLOR: uint = 0x999999;
	public static readonly FILL_COLOR: uint = 0xaaaaaa;

	//============Constructor & Destructor============//
	public constructor(
		lineColor: uint = BlockBedrock.LINE_COLOR,
		fillColor: uint = BlockBedrock.FILL_COLOR
	) {
		super(lineColor, fillColor);
		this._attributes = NativeBlockAttributes.BEDROCK;
	}

	// LaserTrap

	//============Display Implements============//
	public static readonly LINE_COLOR: uint = BlockBedrock.LINE_COLOR;
	public static readonly FILL_COLOR: uint = BlockBedrock.FILL_COLOR;
	public static readonly CENTER_COLOR: uint = BlockColorSpawner.CENTER_COLOR;

	public static readonly LINE_SIZE: uint = BSBiColored.LINE_SIZE;
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

	// Metal
	public constructor(lineColor: uint = 0x444444, fillColor: uint = 0xdddddd) {
		super(lineColor, fillColor);
		this._attributes = NativeBlockAttributes.METAL
	}

	//============Display Implements============//
	public static readonly LINE_SIZE: uint = DEFAULT_SIZE / 20;

	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(BlockMetal.LINE_SIZE, BlockMetal.LINE_SIZE, DEFAULT_SIZE - BlockMetal.LINE_SIZE * 2, DEFAULT_SIZE - BlockMetal.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Block
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(DEFAULT_SIZE / 4, DEFAULT_SIZE / 4, DEFAULT_SIZE / 2, DEFAULT_SIZE / 2);
		shape.graphics.endFill();
	}

	// MoveableWall
	public static readonly LINE_COLOR: uint = 0x889988;
	public static readonly FILL_COLOR: uint = 0xbbccbb;

	public static readonly LINE_SIZE: uint = Wall.LINE_SIZE;
	public shapeInit(shape: IBatrShape): void {
		// Line
		shape.graphics.beginFill(this._lineColor);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(BlockMoveableWall.LINE_SIZE, BlockMoveableWall.LINE_SIZE, DEFAULT_SIZE - Wall.LINE_SIZE * 2, DEFAULT_SIZE - BlockMoveableWall.LINE_SIZE * 2);
		// Circle
		shape.graphics.drawCircle(DEFAULT_SIZE / 2, DEFAULT_SIZE / 2, DEFAULT_SIZE / 8);
		shape.graphics.endFill();
	}

	// SpawnPointMark

	//============Display Implements============//
	public static readonly LINE_COLOR: uint = 0x808080;
	public static readonly FILL_COLOR: uint = 0xcccccc;
	public static readonly CENTER_COLOR: uint = 0x8000ff;
	public static readonly BASE_ALPHA: number = 0.5;

	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;
	public shapeInit(shape: IBatrShape): void {
		// Base
		shape.graphics.beginFill(BlockSpawnPointMark.LINE_COLOR, BlockSpawnPointMark.BASE_ALPHA);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.drawRect(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.LINE_SIZE, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2);
		shape.graphics.endFill();
		shape.graphics.beginFill(BlockSpawnPointMark.FILL_COLOR, BlockSpawnPointMark.BASE_ALPHA);
		shape.graphics.drawRect(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.LINE_SIZE, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2, DEFAULT_SIZE - BlockSpawnPointMark.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Center
		shape.graphics.lineStyle(BlockSpawnPointMark.LINE_SIZE, BlockSpawnPointMark.CENTER_COLOR);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 3
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 4
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 5
		);
		this.drawSpawnMark(
			shape,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 2,
			DEFAULT_SIZE / 6
		);
		/*shape.graphics.beginFill(LINE_COLOR);
		shape.graphics.drawCircle(
			DEFAULT_SIZE/2,
			DEFAULT_SIZE/2,
			DEFAULT_SIZE/10
		);
		shape.graphics.endFill();*/
	}

	protected drawSpawnMark(shape: IBatrShape, cX: number, cY: number, radius: number): void {
		shape.graphics.drawRect(cX - radius, cY - radius, radius * 2, radius * 2);
		shape.graphics.moveTo(cX - radius, cY);
		shape.graphics.lineTo(cX, cY + radius);
		shape.graphics.lineTo(cX + radius, cY);
		shape.graphics.lineTo(cX, cY - radius);
		shape.graphics.lineTo(cX - radius, cY);
	}

	// SupplyPoint

	//============Display Implements============//
	public static readonly LINE_COLOR: uint = 0x444444;
	public static readonly FILL_COLOR: uint = 0xdddddd;
	public static readonly CENTER_COLOR: uint = 0x00ff00;
	public static readonly BASE_ALPHA: number = 0.5;
	public static readonly GRID_SIZE: uint = DEFAULT_SIZE;

	public static readonly LINE_SIZE: number = BlockSupplyPoint.GRID_SIZE / 32;

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

	// Water

	//============Display Implements============//
	protected static readonly ALPHA: number = 0.4;
	override get pixelAlpha(): uint {
		return BlockWater.ALPHA;
	}

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		shape.graphics.beginFill(this._color, BlockWater.ALPHA);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}

	// XTrapHurt
	protected static readonly COLOR: uint = 0xff8000;
	// XTrapKill
	protected static readonly COLOR: uint = 0xff0000;
	// XTrapRotate
	protected static readonly COLOR_ROTATE: uint = 0x0000ff;
}
