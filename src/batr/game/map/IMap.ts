package batr.game.map {

	import batr.common.*;

	import batr.game.block.*;

	public interface IMap {
		//============Interface Functions============//
		function get mapWidth(): uint;
	function get mapHeight(): uint;
	function get randomX(): int;
	function get randomY(): int;
	function get allDefinedPositions(): iPoint[];
	function get allMapPositions(): iPoint[];
	function get spawnPoints(): uint[];
	function get numSpawnPoints(): uint;

	function get hasSpawnPoint(): boolean;

	function get randomSpawnPoint(): iPoint;

	function get isArenaMap(): boolean;

	function get name(): string;

	function destructor(): void;

	function clone(createBlock: boolean = true): IMap;

	function copyContentFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void;
	function copyFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void;
	function generateNew(): IMap;

	function hasBlock(x: int, y: int): boolean;

	function getBlock(x: int, y: int): BlockCommon;

	function getBlockAttributes(x: int, y: int): BlockAttributes;

	function getBlockType(x: int, y: int): BlockType;

	function setBlock(x: int, y: int, block: BlockCommon): void;

	function isVoid(x: int, y: int): boolean;

	function setVoid(x: int, y: int): void;

	function removeAllBlock(deleteBlock: boolean = true): void;

	// Display About
	function setDisplayTo(target: IMapDisplayer): void;

	function forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

	function updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;
	// SpawnPoint About
	function addSpawnPoint(p: uint): void;

	function removeSpawnPoint(p: uint): void;

	function clearSpawnPoints(): void;

	// AI About
	function getMatrixObject(): Vector.<Object[]>;

	function getMatrixInt(): Vector.<int[]>;

	function getMatrixUint(): Vector.<uint[]>;

	function getMatrixNumber(): Vector.<Number[]>;

	function getMatrixBoolean(): Vector.<Boolean[]>;

}
}