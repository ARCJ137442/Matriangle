import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../display/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../../registry/BlockAttributesRegistry";
import BlockCommon, { BlockType } from "../BlockCommon";
import { randomBoolean2 } from "../../../common/utils";

export default class BlockGate extends BlockCommon {
	//============Static Variables============//
	protected static readonly BLOCK_SIZE: uint = DEFAULT_SIZE;
	protected static readonly LINE_SIZE: uint = this.BLOCK_SIZE / 20;

	public static readonly LINE_COLOR: uint = 0xaaaaaa;
	public static readonly FILL_COLOR: uint = 0xbbbbbb;
	public static readonly CENTER_COLOR: uint = 0x666666;

	public static override randomInstance(type: BlockType): BlockCommon {
		return new BlockGate(randomBoolean2());
	}

	//============Instance Variables============//
	protected _open: boolean;

	//============Constructor & Destructor============//
	public constructor(open: boolean = true) {
		super(NativeBlockAttributes.GATE_OPEN);
		this._open = open;
		this.updateAttributes();
	}

	override destructor(): void {
		this._open = false;
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockGate(this._open);
	}


	//============Game Mechanics============//
	public updateAttributes(): void {
		this._attributes = this._open ? NativeBlockAttributes.GATE_OPEN : NativeBlockAttributes.GATE_CLOSE;
	}

	public get open(): boolean {
		return this._open
	}

	public set open(open: boolean) {
		this._open = open;
		this.updateAttributes();
	}

	//============Display Implements============//
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
}