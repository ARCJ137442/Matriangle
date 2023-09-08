
// import batr.game.block.*;

export default interface IMapDisplayer {
	hasBlock(x: int, y: int): Boolean;
	getBlock(x: int, y: int): BlockCommon;
	removeBlock(x: int, y: int): void;
	removeAllBlock(): void;
	setBlock(x: int, y: int, block: BlockCommon, overwrite: Boolean = true): void;
}