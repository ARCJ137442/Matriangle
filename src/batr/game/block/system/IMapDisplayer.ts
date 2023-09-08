
// import batr.game.block.*;

import { int } from "../../../legacy/AS3Legacy";
import BlockCommon from "../BlockCommon";

export default interface IMapDisplayer {
	hasBlock(x: int, y: int): Boolean;
	getBlock(x: int, y: int): BlockCommon;
	removeBlock(x: int, y: int): void;
	removeAllBlock(): void;
	setBlock(x: int, y: int, block: BlockCommon, overwrite: Boolean/* = true*/): void;
}