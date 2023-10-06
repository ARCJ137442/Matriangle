import { uint } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../display/api/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../display/api/GlobalDisplayVariables";
import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";
import Block, { BlockType } from "../../../api/block/Block";
import { randInt } from "../../../../common/exMath";

export default class BlockColored extends Block {

	public static override randomInstance(type: BlockType): Block {
		return new BlockColored(randInt(0xffffff));
	}

	protected _color: uint;

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000) {
		super(NativeBlockAttributes.COLORED_BLOCK);
		this._color = color;
	}

	override destructor(): void {
		this._color = 0;
		super.destructor();
	}

	override clone(): Block {
		return new BlockColored(this._color);
	}

	//============Display Implements============//
	public get fillColor(): uint {
		return this._color;
	}

	public set fillColor(value: uint) {
		if (this._color != value) {
			this._color = value;
		}
	}

	override get pixelColor(): uint {
		return this._color;
	}

	public shapeInit(shape: IBatrShape): void {
		shape.graphics.beginFill(this._color);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();
	}
}