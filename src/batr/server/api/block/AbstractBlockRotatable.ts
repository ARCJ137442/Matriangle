import { uint } from "../../../legacy/AS3Legacy";
import { IShape } from "../../../display/api/DisplayInterfaces";
import BlockAttributes from "./BlockAttributes";
import Block from "./Block";
import { mRot } from "../../general/GlobalRot";

/**
 * 预定义所有「需要朝向的方块」的基类
 * 
 * TODO: 后续正式得到使用
 */
export default abstract class AbstractBlockRotatable extends Block {
	//============Constructor & Destructor============//
	public constructor(
		attributes: BlockAttributes,
		/**
		 * The direction of block
		 * * default: see `GlobalRot.DEFAULT`
		 */
		protected _direction: mRot,
	) {
		super(attributes);
	}

	//============World Mechanics============//
	/** Determinate the direction of block */
	public get direction(): uint {
		return this._direction;
	}

	//========Display Implements========//

	override shapeInit(shape: IShape): void {
		super.shapeInit(shape);
		shape.rot = this._direction;
	}
}