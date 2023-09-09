import intPoint from "../../../common/intPoint";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";
import IMap from "./IMap";
import IMapLogic from "./IMapLogic";
import IMapStorage from "./IMapStorage";

/**
 * 集成地图类型
 * * 直接继承「逻辑结构」「存储结构」
 *   * 「逻辑结构」负责直接与游戏主体对接，处理游戏中与地图自身相关的逻辑（但其本身不存储对游戏主体的引用，「切换地图」也不归此管）
 *   * 「存储结构」负责直接与方块实例对接，处理对各个方块的增删改查（不负责处理游戏功能）
 * ? 使用抽象类，但不实现：把实现的方法用「抽象方法」丢给其子类实现
 */
export default abstract class MapIntegrated implements IMap, IMapLogic, IMapStorage {

	// 实现逻辑结构
	public abstract get name(): string;
	public abstract get isArenaMap(): boolean;
	public abstract getBlockPlayerDamage(x: number, y: number): number;
	public abstract isKillZone(x: number, y: number): boolean;

	// 实现存储结构
	public abstract get mapWidth(): number;
	public abstract get mapHeight(): number;
	public abstract getMapSize(dim: number): number;
	public abstract get randomX(): number;
	public abstract get randomY(): number;
	public abstract get randomPoint(): intPoint;
	public abstract get allValidPositions(): intPoint[];
	public abstract clone(createBlock?: boolean | undefined): IMapStorage;
	public abstract copyContentFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void;
	public abstract copyFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void;
	public abstract generateNew(): IMapStorage;
	public abstract hasBlock(x: number, y: number): boolean;
	public abstract getBlock(x: number, y: number): BlockCommon | null;
	public abstract getBlockAttributes(x: number, y: number): BlockAttributes | null;
	public abstract getBlockType(x: number, y: number): Function | null;
	public abstract setBlock(x: number, y: number, block: BlockCommon): void;
	public abstract isVoid(x: number, y: number): boolean;
	public abstract setVoid(x: number, y: number): void;
	public abstract removeAllBlock(deleteBlock?: boolean | undefined): void;
	public abstract get spawnPoints(): intPoint[];
	public abstract get numSpawnPoints(): number;
	public abstract get hasSpawnPoint(): boolean;
	public abstract get randomSpawnPoint(): intPoint;
	public abstract addSpawnPoint(x: number, y: number): void;
	public abstract removeSpawnPoint(x: number, y: number): void;
	public abstract clearSpawnPoints(): void;
	public abstract getMatrixObject(): Object[][];
	public abstract getMatrixInt(): number[][];
	public abstract getMatrixUint(): number[][];
	public abstract getMatrixNumber(): Number[][];
	public abstract getMatrixBoolean(): Boolean[][];

	/**
	 * 直接返回自身，因为自身「即是逻辑结构，又是存储结构」
	 */
	public get logic(): IMapLogic {
		return this as IMapLogic;
	}

	/**
	 * 直接返回自身，因为自身「即是逻辑结构，又是存储结构」
	 */
	public get storage(): IMapStorage {
		return this as IMapStorage;
	}

	/**
	 * 析构函数
	 */
	public abstract destructor(): void;

}