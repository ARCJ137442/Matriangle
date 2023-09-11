import { intPoint } from "../../../common/geometricTools";
import { int, uint } from "../../../legacy/AS3Legacy";
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
	public abstract generatorF: (x: IMapStorage) => IMapStorage;
	public abstract generateNext(...args: any[]): IMapStorage;

	// 实现逻辑结构
	public abstract get name(): string;
	public abstract get isArenaMap(): boolean;
	public abstract getBlockPlayerDamage(x: int, y: int): int;
	public abstract isKillZone(x: int, y: int): boolean;

	// 实现存储结构
	public abstract get mapWidth(): int;
	public abstract get mapHeight(): int;
	public abstract getMapSize(dim: int): int;
	public abstract get randomX(): int;
	public abstract get randomY(): int;
	public abstract get randomPoint(): intPoint;
	public abstract forEachValidPositions(f: (x: int, y: int, ...args: any[]) => void, ...args: any[]): void;
	public abstract clone(createBlock?: boolean | undefined): IMapStorage;
	public abstract copyContentFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void;
	public abstract copyFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void;
	public abstract generateNew(): IMapStorage;
	public abstract hasBlock(x: int, y: int): boolean;
	public abstract getBlock(x: int, y: int): BlockCommon | null;
	public abstract getBlockAttributes(x: int, y: int): BlockAttributes | null;
	public abstract getBlockType(x: int, y: int): Function | null;
	public abstract setBlock(x: int, y: int, block: BlockCommon): void;
	public abstract isVoid(x: int, y: int): boolean;
	public abstract setVoid(x: int, y: int): void;
	public abstract clearBlocks(deleteBlock?: boolean | undefined): void;
	public abstract get spawnPoints(): intPoint[];
	public abstract get numSpawnPoints(): uint;
	public abstract get hasSpawnPoint(): boolean;
	public abstract get randomSpawnPoint(): intPoint;
	public abstract hasSpawnPointAt(x: int, y: int): boolean;
	public abstract addSpawnPointAt(x: int, y: int): void;
	public abstract removeSpawnPoint(x: int, y: int): void;
	public abstract clearSpawnPoints(): void;
	public abstract getMatrixObject(): Object[][];
	public abstract getMatrixInt(): int[][];
	public abstract getMatrixUint(): uint[][];
	public abstract getMatrixNumber(): Number[][];
	public abstract getMatrixBoolean(): Boolean[][];

	/**
	 * 直接返回自身，因为自身「即是逻辑结构，又是存储结构」
	 */
	public get logic(): IMapLogic {
		return this;
	}

	/**
	 * 直接返回自身，因为自身「即是逻辑结构，又是存储结构」
	 */
	public get storage(): IMapStorage {
		return this;
	}

	/**
	 * 析构函数
	 */
	public abstract destructor(): void;

}