
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { EMPTY } from "../../../common/keyCodes";
import { iPoint } from "../../../common/intPoint";
import { DISPLAY_GRIDS } from "../../../display/GlobalDisplayVariables";
import { uint, int } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockAttributes from "../BlockAttributes";
import BlockCommon, { BlockType } from "../BlockCommon";
import IMap from "./IMap";
import IMapLogic from "./IMapLogic";
import IMapStorage from "./IMapStorage";
import IMapDisplayer from "../../../display/map/IMapDisplayer";
import IMapGenerator from "./maps/IMapGenerator";
import MapGenerator from "./maps/MapGenerator";
import NativeMapCommon from "./maps/NativeMapCommon";

// import batr.game.map.*;
// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.map.main.*;

// import flash.utils.getQualifiedClassName;

/* This's a Game Map<Version 1>
 * This Map only save BlockType,not BlockCommon
 */
export default class MapLogic_V1 implements IMapLogic {
	//============Instance Variables============//
	protected _storage: IMapStorage

	//============Constructor============//
	public constructor(name: string, storageL, isArena: boolean = false) {
		super(name, isArena);
		if (content != null)
			this._Content = content;
	}

	//============Destructor============//
	public destructor(): void {
		this.removeAllBlock();
	}

	//============Instance Getter And Setter============//

	//============Interface Functions============//

	public getBlockPlayerDamage(x: int, y: int): int {
		let blockAtt: BlockAttributes = this._map.getBlockAttributes(x, y);
		if (blockAtt != null)
			return blockAtt.playerDamage;
		return 0;
	}

	public isKillZone(x: int, y: int): boolean {
		let blockAtt: BlockAttributes = this._map.getBlockAttributes(x, y);
		if (blockAtt != null)
			return blockAtt.playerDamage == int.MAX_VALUE;
		return false;
	}
	/**
	 * construct new map.
	 * If has generator,generate to new map
	 * Else clone self
	 * @return
	 */
	public generateNew(): IMap {
		// trace('generateNew:',this===MAP_5,this._generator)
		if (this._generator != null)
			return this._generator.generateTo(this.clone(), true);
		return super.generateNew();
	}

	public hasBlock(x: int, y: int): boolean {
		if (this.getBlock(x, y) == null) {
			this._setVoid(x, y);

			return false;
		}
		return this._Content.hasOwnProperty(Map_V1.pointToIndex(x, y));
	}

	public getBlock(x: int, y: int): BlockCommon {
		return this._getBlock(x, y);
	}

	public getBlockAttributes(x: int, y: int): BlockAttributes {
		if (this.hasBlock(x, y))
			return this._getBlock(x, y).attributes;
		else
			return NativeBlockAttributes.VOID;
	}

	public getBlockType(x: int, y: int): BlockType {
		if (this.hasBlock(x, y))
			return this._getBlock(x, y).type;
		else
			return BlockType.VOID;
	}

	public setBlock(x: int, y: int, block: BlockCommon): void {
		this._setBlock(x, y, block);
	}

	public isVoid(x: int, y: int): boolean {
		return (!this.hasBlock(x, y) || this.getBlockType(x, y) == BlockType.VOID);
	}

	public setVoid(x: int, y: int): void {
		this._setVoid(x, y);
	}

	public removeAllBlock(deleteBlock: boolean = true): void {
		// trace(this+':removeAllBlock!')
		let block: BlockCommon;
		for (let key: string in this._Content) {
			block = this._Content[key] as BlockCommon;

			if (deleteBlock && block != null)
				block.destructor();
			delete this._Content[key];
		}
	}

	public setDisplayTo(target: IMapDisplayer): void {
		target.removeAllBlock();
		let ix: int, iy: int, iBlock: BlockCommon;
		for (let index: string in this._Content) {
			ix = Map_V1.indexToPoint(index).x;
			iy = Map_V1.indexToPoint(index).y;
			iBlock = this._getBlock(ix, iy);
			target.setBlock(ix, iy, iBlock);
		}
	}

	public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
		targetBottom.removeAllBlock();
		targetMiddle.removeAllBlock();
		targetTop.removeAllBlock();
		let ix: int, iy: int, iBlock: BlockCommon, iLayer: int;

		for (let index: string in this._Content) {
			ix = Map_V1.indexToPoint(index).x;

			iy = Map_V1.indexToPoint(index).y;

			iBlock = this._getBlock(ix, iy);

			if (iBlock == null)
				continue;

			iLayer = iBlock.attributes.drawLayer;

			NativeMapCommon.getTargetByLayer(iLayer, targetTop, targetBottom, targetMiddle).setBlock(ix, iy, iBlock);
		}
	}

	//============Instance Funcitons============//
	//========Core========//
	protected _getBlock(x: int, y: int): BlockCommon {
		let block: BlockCommon = this._Content[Map_V1.pointToIndex(x, y)] as BlockCommon;
		return block == null ? BlockCommon.fromType(BlockType.NULL) : block;
	}

	protected _setBlock(x: int, y: int, block: BlockCommon): void {
		if (block == null)
			this._setVoid(x, y);
		this._Content[Map_V1.pointToIndex(x, y)] = block;
	}

	protected _setVoid(x: int, y: int): void {
		delete this._Content[Map_V1.pointToIndex(x, y)];
	}

	public fillBlock(x1: int, y1: int, x2: int, y2: int,
		type: BlockType,
		outline: boolean = false): Map_V1 {
		let xl: int = Math.min(x1, x2), xm: int = Math.max(x1, x2);

		let yl: int = Math.min(y1, y2), ym: int = Math.max(y1, y2);

		let xi: int, yi: int;

		for (xi = xl; xi <= xm; xi++) {
			for (yi = yl; yi <= ym; yi++) {
				if (!outline || outline && ((xi == xm || xi == xl) || (yi == ym || yi == yl))) {
					this._setBlock(xi, yi, BlockCommon.fromType(type));
				}
			}
		}
		return this;
	}

	public fillBlock2(x1: int, y1: int, x2: int, y2: int,
		block: BlockCommon,
		outline: boolean = false): Map_V1 {
		let xl: int = Math.min(x1, x2), xm: int = Math.max(x1, x2);

		let yl: int = Math.min(y1, y2), ym: int = Math.max(y1, y2);

		let xi: int, yi: int;

		for (xi = xl; xi <= xm; xi++) {
			for (yi = yl; yi <= ym; yi++) {
				if (!outline || outline && ((xi == xm || xi == xl) || (yi == ym || yi == yl))) {
					this._setBlock(xi, yi, block.clone());
				}
			}
		}
		return this;
	}
}