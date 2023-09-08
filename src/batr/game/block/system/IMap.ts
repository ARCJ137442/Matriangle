
// import batr.common.*;

// import batr.game.block.*;

export default interface IMap {
	//============Interface Functions============//
	get mapWidth(): uint;
	get mapHeight(): uint;
	get randomX(): int;
	get randomY(): int;
	get allDefinedPositions(): iPoint[];
	get allMapPositions(): iPoint[];
	get spawnPoints(): uint[];
	get numSpawnPoints(): uint;

	get hasSpawnPoint(): boolean;

	get randomSpawnPoint(): iPoint;

	get isArenaMap(): boolean;

	get name(): string;

	destructor(): void;

	clone(createBlock: boolean = true): IMap;

	copyContentFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void;
	copyFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void;
	generateNew(): IMap;

	hasBlock(x: int, y: int): boolean;

	getBlock(x: int, y: int): BlockCommon;

	getBlockAttributes(x: int, y: int): BlockAttributes;

	getBlockType(x: int, y: int): BlockType;

	setBlock(x: int, y: int, block: BlockCommon): void;

	isVoid(x: int, y: int): boolean;

	setVoid(x: int, y: int): void;

	removeAllBlock(deleteBlock: boolean = true): void;

	// Display About
	setDisplayTo(target: IMapDisplayer): void;

	forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

	updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;
	// SpawnPoint About
	addSpawnPoint(p: uint): void;

	removeSpawnPoint(p: uint): void;

	clearSpawnPoints(): void;

	// AI About
	getMatrixObject(): Vector.<Object[]>;

	getMatrixInt(): Vector.<int[]>;

	getMatrixUint(): Vector.<uint[]>;

	getMatrixNumber(): Vector.<Number[]>;

	getMatrixBoolean(): Vector.<Boolean[]>;
}