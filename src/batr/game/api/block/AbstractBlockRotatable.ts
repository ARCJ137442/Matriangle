import * as GlobalRot from "../../general/GlobalRot";
import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../display/api/BatrDisplayInterfaces";
import BlockAttributes from "./BlockAttributes";
import Block from "./Block";

/**
 * 预定义所有「需要朝向的方块」的基类
 * 
 * TODO: 正式得到使用
 */
export default abstract class AbstractBlockRotatable extends Block {
	//============Constructor & Destructor============//
	public constructor(
		attributes: BlockAttributes,
		/**
		 * The direction of block
		 * * default: see `GlobalRot.DEFAULT`
		 */
		protected _rot: uint = GlobalRot.DEFAULT,
	) {
		super(attributes);
	}

	//============Game Mechanics============//
	/** Determinate the direction of block */
	public get rot(): uint {
		return this._rot;
	}

	//========Display Implements========//

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		shape.rot = this._rot;
	}
}