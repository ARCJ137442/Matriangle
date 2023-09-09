// TODO: 待拆分，变成MAP_V1/MapLogic_V1的实现

import { iPoint } from "../../../../common/intPoint";
import { int, uint } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../BlockAttributes";
import BlockCommon, { BlockType } from "../../BlockCommon";
import IMap from "../IMap";
import IMapDisplayer from "../../../../display/map/IMapDisplayer";


/**
 * This class only achieved spawn points
 */
export default class NativeMapCommon implements IMap {
	//============Static Functions============//
	protected static getTargetByLayer(l: int, top: IMapDisplayer, bottom: IMapDisplayer, middle: IMapDisplayer): IMapDisplayer {
		return l > 0 ? top : (l < 0 ? bottom : middle);
	}

	//============Instance Variables============//
	protected _spawnPoints: uint[] = new array<uint>();
	protected _arena: boolean = false;
	protected _name: string;

	//============Constructor============//
	public constructor(name: string, arena: boolean = false) {
		super();
		this._arena = arena;
		this._name = name;
	}

	//============Destructor============//
	public destructor(): void {
		this._spawnPoints = null;
		this._name = null;
	}

	//============Interface Getter And Setter============//
	public get mapWidth(): uint {
		return 0;
	}

	public get mapHeight(): uint {
		return 0;
	}

	public get randomX(): int {
		return 0;
	}

	public get randomY(): int {
		return 0;
	}

	public get allDefinedPositions(): iPoint[] {
		return null;
	}

	public get allMapPositions(): iPoint[] {
		return null;
	}

	public get spawnPoints(): uint[] {
		return this._spawnPoints;
	}

	public get name(): string {
		return this._name;
	}

	public get numSpawnPoints(): uint {
		return this._spawnPoints.length;
	}

	public get hasSpawnPoint(): boolean {
		return this.numSpawnPoints > 0;
	}

	public get randomSpawnPoint(): iPoint {
		if (this.hasSpawnPoint) {
			return UintPointCompress.releaseFromUint(this._spawnPoints[exMath.random(this.numSpawnPoints)]);
		}
		return null;
	}

	/**
	 * This property determines this map's
	 * switch/mechine/trap/spawner can be destroy or carry
	 * by Tool BlockThrower.
	 */
	public get isArenaMap(): boolean {
		return this._arena;
	}

	//============Tool Functions============//

	protected removeDisplayerBlockAt(x: int, y: int, bottom: IMapDisplayer, middle: IMapDisplayer, top: IMapDisplayer): void {
		if (bottom != null)
			bottom.removeBlock(x, y);
		if (middle != null)
			middle.removeBlock(x, y);
		if (top != null)
			top.removeBlock(x, y);
	}

	//============Interface Functions============//
	public clone(createBlock: boolean = true): IMap {
		return null;
	}

	/**
	 * only copy _isArena
	 */
	public copyFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void {
		// name
		this._name = target.name;
		// isArena
		this._arena = target.isArenaMap;
	}

	/**
	 * only copy spawnpoints
	 */
	public copyContentFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void {
		// spawnpoints
		this._spawnPoints = target.spawnPoints.concat();
	}

	public generateNew(): IMap {
		return this.clone(true);
	}

	public hasBlock(x: int, y: int): boolean {
		return false;
	}

	public getBlock(x: int, y: int): BlockCommon {
		return null;
	}

	public getBlockAttributes(x: int, y: int): BlockAttributes {
		return null;
	}

	public getBlockType(x: int, y: int): BlockType {
		return null;
	}

	public setBlock(x: int, y: int, block: BlockCommon): void {
		return;
	}

	public isVoid(x: int, y: int): boolean {
		return false;
	}

	public setVoid(x: int, y: int): void {
		return;
	}

	public removeAllBlock(deleteBlock: boolean = true): void {
		return;
	}

	public setDisplayTo(target: IMapDisplayer): void {
		return;
	}

	public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
		return;
	}

	public updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
		this.removeDisplayerBlockAt(x, y, targetBottom, targetMiddle, targetTop);
		if (block != null)
			getTargetByLayer(block.attributes.drawLayer, targetTop, targetBottom, targetMiddle).setBlock(x, y, block);
	}

	//========SpawnPoint About========//

	/**
	 * @param	p	the point uses UintPointCompress
	 */
	public addSpawnPoint(p: uint): void {
		this._spawnPoints.push(p);
	}

	/**
	 * @param	p	the point uses UintPointCompress
	 */
	public removeSpawnPoint(p: uint): void {
		for (let i: int = this._spawnPoints.length - 1; i > 0; --i) {
			if (this._spawnPoints[i] == p)
				this._spawnPoints.splice(i, 1);
		}
	}

	public clearSpawnPoints(): void {
		this._spawnPoints.splice(0, this.numSpawnPoints);
	}

	//========AI About========//

	/**
	 * Get with Matrix[x][y].
	 * @return	The Matrix.
	 */
	public getMatrixObject(): Vector.<Object[]> {
		let result: Vector.<Object[]> = new Vector.<Object[]>(this.mapHeight);
		let vec: object[];
		for (let i: uint = 0; i < this.mapHeight; i++) {
			vec = new Array<Object>(this.mapWidth);
			result[i] = vec;
		}
		return result;
	}

	/**
	 * Get with Matrix[x][y].
	 * @return	The Matrix.
	 */
	public getMatrixInt(): Vector.<int[]> {
		let result: Vector.<int[]> = new Vector.<int[]>(this.mapHeight);
		let vec: int[];
		for (let i: uint = 0; i < this.mapHeight; i++) {
			vec = new array<int>(this.mapWidth);
			result[i] = vec;
		}
		return result;
	}

	/**
	 * Get with Matrix[x][y].
	 * @return	The Matrix.
	 */
	public getMatrixUint(): Vector.<uint[]> {
		let result: Vector.<uint[]> = new Vector.<uint[]>(this.mapHeight);
		let vec: uint[];
		for (let i: uint = 0; i < this.mapHeight; i++) {
			vec = new array<uint>(this.mapWidth);
			result[i] = vec;
		}
		return result;
	}

	/**
	 * Get with Matrix[x][y].
	 * @return	The Matrix.
	 */
	public getMatrixNumber(): Vector.<Number[]> {
		let result: Vector.<Number[]> = new Vector.<Number[]>(this.mapHeight);
		let vec: number[];
		for (let i: uint = 0; i < this.mapHeight; i++) {
			vec = new Array<Number>(this.mapWidth);
			result[i] = vec;
		}
		return result;
	}

	/**
	 * Get with Matrix[x][y].
	 * @return	The Matrix.
	 */
	public getMatrixBoolean(): Vector.<Boolean[]> {
		let result: Vector.<Boolean[]> = new Vector.<Boolean[]>(this.mapHeight);
		let vec: boolean[];
		for (let i: uint = 0; i < this.mapHeight; i++) {
			vec = new Array<Boolean>(this.mapWidth);
			result[i] = vec;
		}
		return result;
	}
}