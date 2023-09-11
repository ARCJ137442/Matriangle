import { randInt, randIntBetween } from "../../../../common/exMath";
import { iPoint } from "../../../../common/geometricTools";
import { identity, randomIn } from "../../../../common/utils";
import { intRot } from "../../../../general/GlobalRot";
import { int, uint } from "../../../../legacy/AS3Legacy";
import { NativeBlockTypes } from "../../../registry/BlockTypeRegistry";
import BlockAttributes from "../../BlockAttributes";
import BlockCommon, { BlockType } from "../../BlockCommon";
import { BLOCK_VOID } from "../../blocks/Void";
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

    /**
     * 用于存放「坐标字串: 方块对象」的字典
     * * 使用「稀疏映射」的方式实现「有必要才存储」的思想
     * 
     * ! 在没有相应键时，会返回undefined
     */
    protected readonly _dict: { [key: string]: BlockCommon } = {};

    /**
     * 用于在「没有存储键」时返回的默认值
     * 
     * * 默认就是「空」
     * 
     * ! 【20230910 11:16:05】现在强制这个值为「空」
     */
    protected readonly _defaultBlock: BlockCommon = BLOCK_VOID;

    /**
     * 缓存的「最右、最左、最下、最上」坐标
     * * 形式：[x+, x-, y+, y-] | [右, 左, 下, 上]
     * 
     * ! 参考系：从左上角开始（沿用原Flash风格）
     * 
     * 
     * ! 会在放置方块时**动态更新**
     * 
     * ? 或许可以改造成多维版本
     */
    protected readonly _border: [int, int, int, int] = [0, 0, 0, 0];
    /**
     * * 一系列为了明确概念的存取器方法
     */
    protected get borderRight(): int { return this._border[0] };
    protected set borderRight(v: int) { this._border[0] = v };
    protected get borderLeft(): int { return this._border[1] };
    protected set borderLeft(v: int) { this._border[1] = v };
    protected get borderDown(): int { return this._border[2] };
    protected set borderDown(v: int) { this._border[2] = v };
    protected get borderUp(): int { return this._border[3] };
    protected set borderUp(v: int) { this._border[3] = v };
    /**
     * 用于构建「随机结构生成」的「生成器函数」
     */
    public generatorF: (x: IMapStorage) => IMapStorage = identity<IMapStorage>;

    //============Constructor & Destructor============//

    /**
     * 构造函数
     * @param defaultBlock 定义在「字典外坐标」处获取方块时返回的「默认方块」
     */
    public constructor() {
        // this._defaultBlock = defaultBlock
    }

    /**
     * * 默认是二维
     */
    public get mapDimension(): uint {
        return 2;
    }

    protected readonly _allDirection: intRot[] = [0, 1, 2, 3]
    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public get allDirection(): intRot[] {
        return this._allDirection;
    }

    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public getForwardDirectionsAt(x: int, y: int): intRot[] {
        return this.allDirection;
    }

    /**
     * * 默认（内联）就是随机取
     * @param x x坐标
     * @param y y坐标
     * @returns 随机一个坐标方向
     */
    public randomForwardDirectionAt(x: int, y: int): intRot {
        return randInt(4);
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

    /**
     * 存储所有重生点的列表
     */
    protected readonly _spawnPoints: iPoint[] = [];

    public get spawnPoints(): iPoint[] {
        return this._spawnPoints;
    }

    public get numSpawnPoints(): int {
        return this._spawnPoints.length;
    }

    public get hasSpawnPoint(): boolean {
        return this._spawnPoints.length > 0;
    }

    public get randomSpawnPoint(): iPoint {
        return randomIn(this._spawnPoints)
    }

    public addSpawnPointAt(x: int, y: int): void {
        if (!this.hasSpawnPointAt(x, y))
            this._spawnPoints.push(new iPoint(x, y))
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
            let point: iPoint = this._spawnPoints[index];
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

    public get mapWidth(): int {
        return this.borderRight - this.borderLeft;
    }

    public get mapHeight(): int {
        return this.borderDown - this.borderUp;
    }

    public getMapSize(dim: int): int {
        if (dim === 0) return this.mapWidth;
        else if (dim === 1) return this.mapHeight;
        else throw new Error(`getMapSize: 无效维度${dim}`);
    }

    /**
     * 实现随机x坐标：直接在「最大尺寸」与「最小尺寸」中挑选
     * ! 注意：随机是**含有**最大值的，因为要包含右边界
     */
    public get randomX(): int {
        return randIntBetween(this.borderLeft, this.borderRight + 1);
    }
    /**
         * 实现随机y坐标：直接在「最大尺寸」与「最小尺寸」中挑选
         * ! 注意：随机是**含有**最大值的，因为要包含右边界
         */
    public get randomY(): int {
        return randIntBetween(this.borderUp, this.borderDown + 1);
    }

    // ! 默认其边界之内都为**合法**
    public get randomPoint(): iPoint {
        return new iPoint(this.randomX, this.randomY);
    }

    // ! 边界之内，均为合法：会遍历边界内所有内容⇒直接对遍历到的点调用回调即可
    public forEachValidPositions(f: (x: int, y: int, ...args: any[]) => void, ...args: any[]): void {
        for (let x = this.borderLeft; x < this.borderRight; x++) {
            for (let y = this.borderUp; y < this.borderDown; y++) {
                f(x, y, ...args);
            }
        }
    }

    /**
     * 会直接克隆出一个与自身相同类型、相同属性的对象
     */
    public clone(deep?: boolean): IMapStorage {
        // 复制构造函数参数
        let nStorage: MapStorageSparse = new MapStorageSparse();
        // 复制内容
        this.forEachValidPositions(
            (x: int, y: int, source: MapStorageSparse, target: MapStorageSparse): void =>
                target.setBlock(x, y, source.getBlock(x, y)),
            this, nStorage
        )
        // 复制重生点
        for (const sP of this._spawnPoints) {
            if (deep)
                nStorage.addSpawnPointAt(sP.x, sP.y)
            else nStorage._spawnPoints.push(sP);
        }
        // 复制边界信息
        for (let i: uint = 0; i < this._border.length; i++)
            nStorage._border[i] = this._border[i];
        return nStorage;
    }

    public copyContentFrom(source: IMapStorage, clearSelf: boolean = false, deep: boolean = false): void {
        if (clearSelf) {
            this.clearBlocks();
            this.clearSpawnPoints();
        }
        source.forEachValidPositions(
            (x: int, y: int, source: IMapStorage, target: IMapStorage): void => {
                if (source.getBlock(x, y) !== null)
                    target.setBlock(x, y, source.getBlock(x, y) as BlockCommon)
            }, // ? 这是否可以抽象出一个函数出来
            source, this
        )
    }

    // * 没有更多的了：都是内容
    public copyFrom(source: IMapStorage, clearSelf?: boolean | undefined, deep?: boolean | undefined): void {
        return this.copyContentFrom(source, clearSelf, deep);
    }

    /**
     * * 恒真：在接口意义上说，因稀疏地图「找不到⇒返回默认」的特性，所以总是能返回一个对象
     * 
     * @param x x坐标
     * @param y y坐标
     */
    public hasBlock(x: int, y: int): true {
        return true;
    }

    /**
     * 用于提升获取效率用的「临时寄存器」
     * * 这样不需要频繁`let`占空间
     */
    protected _temp_block: BlockCommon | undefined = undefined;

    /**
     * * 找不到方块(undefined)⇒返回默认
     * @param x x坐标
     * @param y y坐标
     */
    public getBlock(x: int, y: int): BlockCommon {
        this._temp_block = this._dict[MapStorageSparse.pointToIndex2d(x, y)];
        if (this._temp_block === undefined)
            return this._defaultBlock;
        else return this._temp_block;
    }

    /**
     * * 因getBlock一定能返回方块实例，所以此处直接访问
     * @param x x坐标
     * @param y y坐标
     * @returns 返回的方块属性（一定有值）
     */
    public getBlockAttributes(x: int, y: int): BlockAttributes {
        return this.getBlock(x, y).attributes;
    }

    /**
     * * 因getBlock一定能返回方块实例，所以此处直接访问
     * @param x x坐标
     * @param y y坐标
     * @returns 返回的方块类型（一定有值）
     */
    public getBlockType(x: int, y: int): BlockType {
        return this.getBlock(x, y).type; // TODO: 具体的「.type」属性能否工作，还有待验证
    }

    /**
     * 根据更新了的坐标，更新自己的「地图边界」
     * * 【20230910 10:56:53】其实在目前「地图大小固定」的情况下，这个更新很少成功
     * @param ux 更新为「有效」的x坐标
     * @param uy 更新为「有效」的y坐标
     */
    protected updateBorder(ux: int, uy: int): void {
        // x
        if (ux > this.borderRight)
            this.borderRight = ux;
        if (ux < this.borderLeft)
            this.borderLeft = ux;
        // y
        if (uy > this.borderDown)
            this.borderDown = uy;
        if (uy < this.borderUp)
            this.borderUp = uy;
    }

    public setBlock(x: int, y: int, block: BlockCommon): void {
        // 放置方块
        this._dict[MapStorageSparse.pointToIndex2d(x, y)] = block;
        // 更新边界
        this.updateBorder(x, y);
    }

    /**
     * 判断某个位置是否为「空」
     * * 实质上直接判断返回的「方块类型」是否为`BlockVoid`即可
     * @param x x坐标
     * @param y y坐标
     */
    public isVoid(x: int, y: int): boolean {
        return this.getBlockType(x, y) === NativeBlockTypes.VOID; // ! 已经锁定「默认方块」就是「空」
    }

    /**
     * 设置某个位置的方块为「空」
     * 
     * ! 直接删除键，而非「覆盖为空」
     * 
     * @param x x坐标
     * @param y y坐标
     */
    public setVoid(x: int, y: int): void {
        delete this._dict[MapStorageSparse.pointToIndex2d(x, y)];
    }

    public clearBlocks(deleteBlock?: boolean | undefined): void {
        let deleteF: (x: int, y: int, target: IMapStorage) => void = (
            deleteBlock ?
                (x: int, y: int, target: IMapStorage): void => {
                    target.getBlock(x, y)?.destructor();
                    target.setVoid(x, y);
                } :
                (x: int, y: int, target: IMapStorage): void => target.setVoid(x, y)
        )
        this.forEachValidPositions(
            deleteF, this
        )
    }

    //============Display Implements============//

    // TODO: 有待对接

    // public setDisplayTo(target: IMapDisplayer): void {
    // 	target.clearBlock();
    // 	let ix: int, iy: int, iBlock: BlockCommon;
    // 	for (let index in this._Content) {
    // 		iBlock = this.storage.getBlock(ix, iy);
    // 		target.setBlock(ix, iy, iBlock);
    // 	}
    // }

    // public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
    // 	targetBottom.clearBlock();
    // 	targetMiddle.clearBlock();
    // 	targetTop.clearBlock();
    // 	let ix: int, iy: int, iBlock: BlockCommon, iLayer: int;

    // 	for (let index in this._Content) {
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