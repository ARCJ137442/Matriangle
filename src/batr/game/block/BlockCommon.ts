
// import batr.game.block.*;
// import batr.game.block.blocks.*;

import { getClass } from "../../common/utils";
import { Class, int, uint, uint$MAX_VALUE } from "../../legacy/AS3Legacy";
import { IBatrDisplayable, IBatrShape } from "../../display/BatrDisplayInterfaces";
import BlockAttributes from "./BlockAttributes";
import Game from "../main/Game";
import IBatrGame from "../main/IBatrGame";

// import flash.display.Shape;
// import flash.events.Event;

export type BlockType = Class;

/**
 * One of the fundamental element in BaTr
 * 
 * ! [20230908 21:13:57] The **Block** isn't contains information of "position"
 * ! which is controlled by Game and Player
 */
export default abstract class BlockCommon implements IBatrDisplayable {

	//============Static============//
	/**
	 * ! the original implement of `XXType` now will be combined as static variables and functions, or be concentrated to module `XXRegistry`
	 */

	// ? so it could be generalized to registry
	// * and it may be uses the class directly
	// public static fromType(type: BlockType): BlockCommon {
	// 	switch (type) {
	// 		case BlockType.X_TRAP_HURT:
	// 		case BlockType.X_TRAP_KILL:
	// 		case BlockType.X_TRAP_ROTATE:
	// 			return new XTrap(type);
	// 		case BlockType.GATE_OPEN:
	// 			return new Gate(true);
	// 		case BlockType.GATE_CLOSE:
	// 			return new Gate(false);
	// 		default:
	// 			if (type != null && type.currentBlock != null)
	// 				return new type.currentBlock();
	// 			else
	// 				return null;
	// 	}
	// }

	/**
	 * 从「方块类型」获取一个随机参数的实例
	 * ! 在「方块类型=类(构造函数)」的情况下，type参数就是类自身
	 * * 用于：地图生成「随机获取方块」
	 * @param type 方块类型
	 */
	public static randomInstance(type: BlockType): BlockCommon {
		return new (type as any)(); // ! 此处必将是构造函数，因此必能构造
	}

	// public static fromMapColor(color: uint): BlockCommon {
	// 	return BlockCommon.fromType(BlockType.fromMapColor(color));
	// }

	//============Constructor & Destructor============//
	public constructor(attributes: BlockAttributes) {
		// super();
		this._attributes = attributes;
	}

	public destructor(): void {

	}

	public clone(): BlockCommon {
		throw new Error("Method not implemented.");
	}

	//============Game Mechanics============//
	/**
	 * Every Block has a `BlockAttributes` to define its nature, 
	 * it determinate the block's behavior in game.
	 * 
	 * * It only contains the **reference** of the attributes, so it don't uses much of memory when it is linked to a static constant.
	 */
	protected _attributes: BlockAttributes;
	public get attributes(): BlockAttributes {
		return this._attributes;
	}

	/**
	 * It don't implements as another object
	 * 
	 * ! It will directly returns its constructor
	 */
	public get type(): BlockType {
		return getClass(this);
	}

	// ! 此处的「响应随机刻」因「循环导入问题」被移除

	//============Display Implements============//

	/**
	 * Determinate the single-pixel color
	 */
	public get pixelColor(): uint {
		return this.attributes.defaultPixelColor // default
	}

	public get pixelAlpha(): number {
		return this.attributes.defaultPixelAlpha // default
	}

	public shapeRefresh(shape: IBatrShape): void {
		this.shapeDestruct(shape);
		this.shapeInit(shape);
	}

	public shapeInit(shape: IBatrShape): void {

	}

	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear();
	}
}
