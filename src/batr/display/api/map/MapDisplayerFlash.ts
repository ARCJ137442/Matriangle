import Block from "../../../game/api/block/Block";
import { int } from "../../../legacy/AS3Legacy";
import IMapDisplayer from "./IMapDisplayer";

/**
 * Flash实现
 * 
 * ! 已弃用
export default class MapDisplayerFlash extends Sprite implements IMapDisplayer {
	//============Static Functions============//
	protected static isBlockLocationEquals(block: Block, x: int, y: int): boolean {
		return PosTransform.realPosToLocalPos(block.x) == x && PosTransform.realPosToLocalPos(block.y) == y;
	}

	//============Constructor & Destructor============//
	public constructor() {
		super();
	}

	//============Destructor Function============//
	public destructor(): void {
		this.clearBlock();
	}

	//============Interface Functions============//
	public hasBlock(x: int, y: int): boolean {
		let b: Block;
		for (let i: int = 0; i < this.numChildren; i++) {
			b = this.getBlockAsChildAt(i);
			if (b === null)
				continue;
			if (isBlockLocationEquals(b, x, y))
				return true;
		}
		return false;
	}

	public getBlock(x: int, y: int): Block {
		let b: Block;
		for (let i: int = 0; i < this.numChildren; i++) {
			b = this.getBlockAsChildAt(i);
			if (b === null)
				continue;
			if (isBlockLocationEquals(b, x, y))
				return b;
		}
		return null;
	}

	public removeBlock(x: int, y: int): void {
		let b: Block;
		for (let i: int = 0; i < this.numChildren; i++) {
			b = this.getBlockAsChildAt(i);
			if (b === null)
				continue;
			if (isBlockLocationEquals(b, x, y)) {
				this.removeChildAt(i);
				b.destructor();
			}
		}
	}

	public clearBlock(): void {
		let b: Block;
		for (let i: int = this.numChildren - 1; i >= 0; i--) {
			b = this.getBlockAsChildAt(i);
			if (b !== null)
				b.destructor();
			this.removeChild(b);
		}
	}

	public setBlock(x: int, y: int, block: Block, overwrite: boolean = true): void {
		if (block === null)
			return;
		let iBlock: Block = this.getBlock(x, y);
		if (overwrite || !block.displayEquals(iBlock))
			this.removeBlock(x, y);
		block.x = PosTransform.localPosToRealPos(x);
		block.y = PosTransform.localPosToRealPos(y);
		this.addChild(block);
	}

	//============Instance Functions============//
	protected getBlockAsChildAt(index: int): Block {
		if (index >= this.numChildren)
			return null;
		return this.getChildAt(index) as Block;
	}
}
 */
