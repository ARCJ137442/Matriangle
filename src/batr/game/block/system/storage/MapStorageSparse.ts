import { randInt, randIntBetween } from "../../../../common/exMath";
import { iPoint, intPoint } from "../../../../common/geometricTools";
import { generateArray, identity, randomIn } from "../../../../common/utils";
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
 * 
 * ! 目前还只是二维版本，若需支持多维还需要一些升级
 * * 这些升级会触及到最基本的「地图存储结构」接口，其性能开销目前尚未估量
 */
export default class MapStorageSparse implements IMapStorage {

    //============Static Utils============//
    public static pointToIndex_2d(x: int, y: int): string {
        return `${x}_${y}`;
    }

    public static pointToIndex(p: iPoint): string {
        return p.join('_');
    }

    public static indexToPoint(str: string): iPoint {
        let s: string[] = str.split('_');
        return new iPoint(...s.map(int));
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
     * * 默认是二维
     */
    protected _nDim: uint = 2;
    public get mapDimension(): uint { return this._nDim }

    /**
     * 缓存的「维度边界」坐标，始终是方形的
     * * 一个存放最小值，一个存放最大值
     * * 轴向顺序：x,y,z,w…
     */
    protected readonly _border_max: iPoint = new iPoint(this._nDim);
    protected readonly _border_min: iPoint = new iPoint(this._nDim);
    /**
     * * 一系列为了明确概念的存取器方法
     */
    protected get borderRight(): int { return this._border_max[0] };
    protected set borderRight(v: int) { this._border_max[0] = v };
    protected get borderLeft(): int { return this._border_min[0] };
    protected set borderLeft(v: int) { this._border_min[0] = v };
    protected get borderDown(): int { return this._border_max[1] };
    protected set borderDown(v: int) { this._border_max[1] = v };
    protected get borderUp(): int { return this._border_min[1] };
    protected set borderUp(v: int) { this._border_min[1] = v };
    /**
     * 用于构建「随机结构生成」的「生成器函数」
     */
    public generatorF: (x: IMapStorage) => IMapStorage = identity<IMapStorage>;

    //============Constructor & Destructor============//

    /**
     * 构造函数
     */
    public constructor() { }

    isInMap_2d(x: number, y: number): boolean {
        return (
            (
                this._border_min[0] <= x && x <= this._border_max[0]
            ) && (
                this._border_min[1] <= y && y <= this._border_max[1]
            )
        )
    }

    isInMap(p: intPoint): boolean {
        for (let i: uint = 0; i < this._nDim; i++) {
            if (
                p[i] < this._border_min[i] || p[i] > this._border_max[i]
            ) return false;
        }
        return true;
    }
    hasBlock(p: intPoint): boolean {
        throw new Error("Method not implemented.");
    }
    getBlock(p: intPoint): BlockCommon | null {
        throw new Error("Method not implemented.");
    }
    getBlockAttributes(p: intPoint): BlockAttributes | null {
        throw new Error("Method not implemented.");
    }
    getBlockType(p: intPoint): Function | null {
        throw new Error("Method not implemented.");
    }
    setBlock(p: intPoint, block: BlockCommon): void {
        throw new Error("Method not implemented.");
    }
    isVoid(p: intPoint): boolean {
        throw new Error("Method not implemented.");
    }
    setVoid(p: intPoint): void {
        throw new Error("Method not implemented.");
    }
    addSpawnPointAt(p: intPoint): void {
        throw new Error("Method not implemented.");
    }
    hasSpawnPointAt(p: intPoint): boolean {
        throw new Error("Method not implemented.");
    }
    removeSpawnPoint(p: intPoint): void {
        throw new Error("Method not implemented.");
    }

    protected _temp_size: iPoint = new iPoint(this._nDim)
    /**
     * 实现：max-min，矢量相减
     */
    public get size(): number[] {
        return this._temp_size.copyFrom(this._border_max).minusFrom(this._border_min);
    }

    protected readonly _allDirection: intRot[] = generateArray(this._nDim << 1, identity);
    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public get allDirection(): intRot[] { return this._allDirection; }

    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public getForwardDirectionsAt_2d(x: int, y: int): intRot[] {
        return this.allDirection;
    }

    public getForwardDirectionsAt(p: intPoint): number[] {
        return this.allDirection;
    }

    /**
     * * 默认（内联）就是随机取
     * @param x x坐标
     * @param y y坐标
     * @returns 随机一个坐标方向
     */
    public randomForwardDirectionAt_2d(x: int, y: int): intRot {
        return randInt(this._nDim << 1);
    }

    public randomForwardDirectionAt(p: intPoint): number {
        return randInt(this._nDim << 1)
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

    public addSpawnPointAt_2d(x: int, y: int): void {
        if (!this.hasSpawnPointAt_2d(x, y))
            this._spawnPoints.push(new iPoint(x, y))
    }

    public hasSpawnPointAt_2d(x: int, y: int): boolean {
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

    public removeSpawnPoint_2d(x: int, y: int): void {
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

    public getMapSizeAt(dim: int): int {
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

    /**
     * ! 默认其边界之内都为**合法**；使用缓存技术，因为获得的量是只读的
     */
    protected readonly _temp_randomPoint: iPoint = new iPoint(this._nDim);
    public get randomPoint(): iPoint {
        this._temp_randomPoint.x = this.randomX;
        this._temp_randomPoint.y = this.randomY;
        return this._temp_randomPoint;
    }

    // ! 边界之内，均为合法：会遍历边界内所有内容⇒直接对遍历到的点调用回调即可
    public forEachValidPositions_2d(f: (x: int, y: int, ...args: any[]) => void, ...args: any[]): void {
        for (let x = this.borderLeft; x < this.borderRight; x++) {
            for (let y = this.borderUp; y < this.borderDown; y++) {
                f(x, y, ...args);
            }
        }
    }

    /**
     * * 遍历N维超方形测试
     * 
     * ! 启发：
     * 1. 确实可以用循环的方式实现N维遍历算法，虽较为复杂但更为高效
     * 2. 可以直接传递「参数数组」而不用频繁「打包解包」
     * 
     * TODO: 整合进多维遍历中
     * 
     * @param maxes 
     * @param mins 
     * @param f 
     * @param args 
     */
    public nDTraverse(
        mins: number[], maxes: number[],
        f: (point: number[], args: any[]) => void,
        args: any[]
    ): void {
        // 检查
        if (maxes.length !== mins.length) throw new Error('maxes and mins must have the same length');
        // 通过数组长度获取维数
        const nDim: number = maxes.length;
        // 当前点坐标的表示：复制mins数组
        const point: number[] = mins.slice();
        // 进位的临时变量
        let i: number;
        // 不断遍历，直到「最高位进位」后返回
        main: while (true) {
            // 执行当前点：调用回调函数
            f(point, args)
            // 迭代到下一个点：不断循环尝试进位
            i = 0;
            // 先让第i轴递增，然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
            while (++point[i] > maxes[i]) {
                // 旧位清零
                point[i] = mins[i];
                // 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
                if (++i >= nDim)
                    break main;
            }
        }
    } /*
    let n: number = 0;
    nDTraverse(
        [1, 2, 3],
        [3, 4, 5],
        (point: number[], args: any[]): void => {
            console.log(`point:${point}, args: ${args}`)
            n++;
        },
        ['arg1', 'arg2', 'arg3']
    )
    console.log(`一共遍历${n}次！`)
    */


    forEachValidPositions(f: (p: iPoint, ...args: any[]) => void, ...args: any[]): void {
        return this._forEachValidPositions(f, 0, ...args);
    }

    protected readonly _temp_forEachPoint: iPoint = new iPoint(this._nDim);
    /**
     * 内部实现：递归遍历超方形
     * @param f 回调函数f
     * @param args 除了「坐标点」外的附加参数
     * @param fromAxis 目前正在遍历的轴向（x→y→z）
     */
    _forEachValidPositions(f: (p: iPoint, ...args: any[]) => void, fromAxis: uint, ...args: any[]): void {
        let i: int = this._border_min[fromAxis], l: int = this._border_max[fromAxis]
        // 最后一维⇒遍历最后一维，并直接调用回调函数
        if (fromAxis >= this._nDim) {
            while (i <= l) {
                f(this._temp_forEachPoint, ...args);
                i++;
            }
        }
        // 非倒数第二维：遍历当前维度，并递归遍历下一维
        else {
            while (i <= l) {
                this._temp_forEachPoint[fromAxis] = i; // 设置参数，以转变「指针」位置
                this._forEachValidPositions(f, fromAxis + 1, ...args);
                i++;
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
        this.forEachValidPositions_2d(
            (x: int, y: int, source: MapStorageSparse, target: MapStorageSparse): void =>
                target.setBlock_2d(x, y, source.getBlock_2d(x, y)),
            this, nStorage
        )
        // 复制重生点
        for (const sP of this._spawnPoints) {
            if (deep)
                nStorage.addSpawnPointAt_2d(sP.x, sP.y)
            else nStorage._spawnPoints.push(sP);
        }
        // 复制边界信息
        nStorage._border_max.copyFrom(this._border_max)
        nStorage._border_min.copyFrom(this._border_min)
        return nStorage;
    }

    public copyContentFrom(source: IMapStorage, clearSelf: boolean = false, deep: boolean = false): void {
        if (clearSelf) {
            this.clearBlocks();
            this.clearSpawnPoints();
        }
        source.forEachValidPositions_2d(
            (x: int, y: int, source: IMapStorage, target: IMapStorage): void => {
                if (source.getBlock_2d(x, y) !== null)
                    target.setBlock_2d(x, y, source.getBlock_2d(x, y) as BlockCommon)
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
    public hasBlock_2d(x: int, y: int): true {
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
    public getBlock_2d(x: int, y: int): BlockCommon {
        this._temp_block = this._dict[MapStorageSparse.pointToIndex_2d(x, y)];
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
    public getBlockAttributes_2d(x: int, y: int): BlockAttributes {
        return this.getBlock_2d(x, y).attributes;
    }

    /**
     * * 因getBlock一定能返回方块实例，所以此处直接访问
     * @param x x坐标
     * @param y y坐标
     * @returns 返回的方块类型（一定有值）
     */
    public getBlockType_2d(x: int, y: int): BlockType {
        return this.getBlock_2d(x, y).type; // TODO: 具体的「.type」属性能否工作，还有待验证
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

    public setBlock_2d(x: int, y: int, block: BlockCommon): void {
        // 放置方块
        this._dict[MapStorageSparse.pointToIndex_2d(x, y)] = block;
        // 更新边界
        this.updateBorder(x, y);
    }

    /**
     * 判断某个位置是否为「空」
     * * 实质上直接判断返回的「方块类型」是否为`BlockVoid`即可
     * @param x x坐标
     * @param y y坐标
     */
    public isVoid_2d(x: int, y: int): boolean {
        return this.getBlockType_2d(x, y) === NativeBlockTypes.VOID; // ! 已经锁定「默认方块」就是「空」
    }

    /**
     * 设置某个位置的方块为「空」
     * 
     * ! 直接删除键，而非「覆盖为空」
     * 
     * @param x x坐标
     * @param y y坐标
     */
    public setVoid_2d(x: int, y: int): void {
        delete this._dict[MapStorageSparse.pointToIndex_2d(x, y)];
    }

    public clearBlocks(deleteBlock?: boolean | undefined): void {
        let deleteF: (x: int, y: int, target: IMapStorage) => void = (
            deleteBlock ?
                (x: int, y: int, target: IMapStorage): void => {
                    target.getBlock_2d(x, y)?.destructor();
                    target.setVoid_2d(x, y);
                } :
                (x: int, y: int, target: IMapStorage): void => target.setVoid_2d(x, y)
        )
        this.forEachValidPositions_2d(
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