import { uint } from "../../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../registry/BlockAttributesRegistry";
import BlockWall from "./Wall";

export default class BlockBedrock extends BlockWall {
	//============Static Variables============//
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
}
