import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalRenderVariables";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";
import Wall from "./Wall";
import BlockWall from "./Wall";

// Move as thrown block.
export default class BlockMoveableWall extends BlockWall {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x889988;
	public static readonly FILL_COLOR: uint = 0xbbccbb;

	public static readonly LINE_SIZE: uint = Wall.LINE_SIZE;

	//============Instance Variables============//
	protected _virus: boolean;

	//============Constructor & Destructor============//
	public constructor(virus: boolean = false) {
		super(BlockMoveableWall.LINE_COLOR, BlockMoveableWall.FILL_COLOR);
		this._virus = virus;
		this._attributes = NativeBlockAttributes.MOVEABLE_WALL;
	}

	//============Destructor Function============//
	override destructor(): void {
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public get virus(): boolean {
		return this._virus;
	}

	//============Instance Functions============//
	override clone(): BlockCommon {
		return new BlockMoveableWall(this._virus);
	}

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
}