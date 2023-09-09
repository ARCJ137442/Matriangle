import intPoint, { iPoint } from "../../../../common/intPoint";
import { int } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../BlockAttributes";
import BlockCommon from "../../BlockCommon";
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
}