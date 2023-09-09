import intPoint, { iPoint } from "../../../../common/intPoint";
import { identity, randomIn } from "../../../../common/utils";
import { int, uint } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../BlockAttributes";
import BlockCommon from "../../BlockCommon";
import IMap from "../IMap";
import IMapStorage from "../IMapStorage";

/**
 * 稀疏地图
 * * 使用固定的「{[坐标↔字符串]: 方块对象}字典」存储其内方块（的引用）
 * * 基本迁移自原来的初代版本「MAP_V1」
 */
export default class MapStorageSparse implements IMapStorage {

    //============Static Utils============//
    public static pointToIndex2d(x: int, y: int): string {
        return `${x}_${y}`;
    }

    public static indexToPoint(str: string): iPoint {
        let s: string[] = str.split('_');

        return new iPoint(int(s[0]), int(s[1]));
    }

    protected readonly _dict: { [key: string]: BlockCommon } = {};

    /**
     * 缓存的「最上、最下、最左、最右」坐标
     * * 形式：[x+, x-, y+, y-] | [右, 左, 上, 下]
     * ? 或许可以改造成多维版本
     */
    protected readonly _border: [int, int, int, int] = [0, 0, 0, 0];

    /**
     * 用于构建「随机结构生成」的「生成器函数」
     */
    public generatorF: (x: IMapStorage) => IMapStorage = identity<IMapStorage>;

    //============Constructor & Destructor============//

    /**
     * 构造函数
     */
    public constructor() {

    }

    /**
     * 析构函数
     */
    public destructor(): void {

    }

    //============Interface============//

    generateNext(...args: any[]): IMapStorage {
        return this.generatorF(this);
    }

    protected _spawnPoints: intPoint[] = [];

    get spawnPoints(): intPoint[] {
        return this._spawnPoints;
    }

    get numSpawnPoints(): int {
        return this._spawnPoints.length;
    }

    get hasSpawnPoint(): boolean {
        return this._spawnPoints.length > 0;
    }

    get randomSpawnPoint(): intPoint {
        return randomIn(this._spawnPoints)
    }

    public addSpawnPointAt(x: int, y: int): void {
        if (!this.hasSpawnPointAt(x, y))
            this._spawnPoints.push(new intPoint(x, y))
    }

    public hasSpawnPointAt(x: int, y: int): boolean {
        for (let point of this._spawnPoints)
            if (point.x == x && point.y == y)
                return true;
        return false
    }

    // ! 非接口实现
    public indexSpawnPointOf(x: int, y: int): uint | -1 {
        for (let index: uint = 0; index < this._spawnPoints.length; index++) {
            let point: intPoint = this._spawnPoints[index];
            if (point.x == x && point.y == y)
                return index;
        }
        return -1;
    }

    public removeSpawnPoint(x: int, y: int): void {
        let index: uint = this.indexSpawnPointOf(x, y);
        if (index != -1)
            this._spawnPoints.splice(index, 1);
    }

    public clearSpawnPoints(): void {
        while (this._spawnPoints.length > 0)
            this._spawnPoints.pop();
    }

    // AI相关
    // getMatrixObject(): Object[][] {
    //     throw new Error("Method not implemented.");
    // }

    // getMatrixInt(): number[][] {
    //     throw new Error("Method not implemented.");
    // }

    // getMatrixUint(): number[][] {
    //     throw new Error("Method not implemented.");
    // }

    // getMatrixNumber(): Number[][] {
    //     throw new Error("Method not implemented.");
    // }

    // getMatrixBoolean(): Boolean[][] {
    //     throw new Error("Method not implemented.");
    // }

    get mapWidth(): int {
        return this._border[1] - this._border[0];
    }

    get mapHeight(): int {
        return this._border[3] - this._border[2];
    }

    getMapSize(dim: int): int {
        if (dim === 0) return this.mapWidth;
        else if (dim === 1) return this.mapHeight;
        else throw new Error(`getMapSize: 无效维度${dim}`);
    }

    get randomX(): int {
        throw new Error("Method not implemented.");
    }

    get randomY(): int {
        throw new Error("Method not implemented.");
    }

    get randomPoint(): intPoint {
        throw new Error("Method not implemented.");
    }

    get allValidPositions(): intPoint[] {
        throw new Error("Method not implemented.");
    }

    clone(createBlock?: boolean | undefined): IMapStorage {
        throw new Error("Method not implemented.");
    }

    copyContentFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }

    copyFrom(source: IMapStorage, clearSelf?: boolean | undefined, createBlock?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }

    generateNew(): IMapStorage {
        throw new Error("Method not implemented.");
    }

    hasBlock(x: int, y: int): boolean {
        throw new Error("Method not implemented.");
    }

    getBlock(x: int, y: int): BlockCommon | null {
        throw new Error("Method not implemented.");
    }

    getBlockAttributes(x: int, y: int): BlockAttributes | null {
        throw new Error("Method not implemented.");
    }

    getBlockType(x: int, y: int): Function | null {
        throw new Error("Method not implemented.");
    }

    setBlock(x: int, y: int, block: BlockCommon): void {
        throw new Error("Method not implemented.");
    }

    isVoid(x: int, y: int): boolean {
        throw new Error("Method not implemented.");
    }

    setVoid(x: int, y: int): void {
        throw new Error("Method not implemented.");
    }

    removeAllBlock(deleteBlock?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }

    //============Display Implements============//

    // TODO: 有待对接

    // public setDisplayTo(target: IMapDisplayer): void {
    // 	target.removeAllBlock();
    // 	let ix: int, iy: int, iBlock: BlockCommon;
    // 	for (let index: string in this._Content) {
    // 		iBlock = this.storage.getBlock(ix, iy);
    // 		target.setBlock(ix, iy, iBlock);
    // 	}
    // }

    // public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
    // 	targetBottom.removeAllBlock();
    // 	targetMiddle.removeAllBlock();
    // 	targetTop.removeAllBlock();
    // 	let ix: int, iy: int, iBlock: BlockCommon, iLayer: int;

    // 	for (let index: string in this._Content) {
    // 		ix = Map_V1.indexToPoint(index).x;

    // 		iy = Map_V1.indexToPoint(index).y;

    // 		iBlock = this._getBlock(ix, iy);

    // 		if (iBlock == null)
    // 			continue;

    // 		iLayer = iBlock.attributes.drawLayer;

    // 		NativeMapCommon.getTargetByLayer(iLayer, targetTop, targetBottom, targetMiddle).setBlock(ix, iy, iBlock);
    // 	}
    // }
}