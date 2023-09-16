import { randInt, randIntBetween, randModWithout, randomBetween } from "../../../../common/exMath";
import { iPoint } from "../../../../common/geometricTools";
import { generateArray, identity, randomIn } from "../../../../common/utils";
import { mRot, rotate_M, toOpposite_M } from "../../../general/GlobalRot";
import { int, uint } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../api/block/BlockAttributes";
import Block, { BlockType } from "../../../api/block/Block";
import { BLOCK_VOID } from "../blocks/Void";
import IMapStorage from "../../../api/map/IMapStorage";
import { NativeBlockTypes } from "../registry/BlockTypeRegistry";

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
    public static pointToIndex(p: iPoint): string {
        // ! （开发用）空值报错
        if (p.some((v): boolean => v === undefined || isNaN(v))) throw new Error(`MapStorageSparse.pointToIndex: 参数错误 @ ${p.toString()} [${p.x}, ${p.y}, ...]`);
        return p.join('_');
    }

    /**
     * 从字符串坐标返回新点
     * 
     * @param str 缓存的坐标
     * @param cachedTo 需要被缓存的对象，若没提供自动创建
     * @returns 返回的**新**点
     */
    public static indexToPoint(str: string, cachedTo: iPoint = new iPoint()): iPoint {
        let s: string[] = str.split('_');
        return cachedTo.copyFromArgs(...s.map(int));
    }

    /**
     * 用于存放「坐标字串: 方块对象」的字典
     * * 使用「稀疏映射」的方式实现「有必要才存储」的思想
     * 
     * ! 在没有相应键时，会返回undefined
     */
    protected readonly _dict: { [key: string]: Block } = {};

    /**
     * 用于在「没有存储键」时返回的默认值
     * 
     * * 默认就是「空」
     * 
     * ! 【20230910 11:16:05】现在强制这个值为「空」
     */
    protected readonly _defaultBlock: Block = BLOCK_VOID;

    /**
     * * 默认是二维
     */
    protected _nDim: uint;
    public get numDimension(): uint { return this._nDim }

    /**
     * * 一系列为了明确概念的存取器方法
     */
    protected get borderRight(): int { return this._borderMax[0] };
    protected set borderRight(v: int) { this._borderMax[0] = v };
    protected get borderLeft(): int { return this._borderMin[0] };
    protected set borderLeft(v: int) { this._borderMin[0] = v };
    protected get borderDown(): int { return this._borderMax[1] };
    protected set borderDown(v: int) { this._borderMax[1] = v };
    protected get borderUp(): int { return this._borderMin[1] };
    protected set borderUp(v: int) { this._borderMin[1] = v };
    /**
     * 用于构建「随机结构生成」的「生成器函数」
     * 
     * ! `args`虽然在默认情况用不到，但可能会被后期修改
     */
    public generatorF: (x: IMapStorage, ...args: any[]) => IMapStorage = identity<IMapStorage>;

    /**
     * 保存的「维度边界」坐标，始终是方形的
     * * 一个存放最小值，一个存放最大值
     * * 轴向顺序：x,y,z,w…
     */
    protected readonly _borderMax: iPoint;
    public get borderMax(): iPoint { return this._borderMax }
    protected readonly _borderMin: iPoint;
    public get borderMin(): iPoint { return this._borderMin }

    //============Constructor & Destructor============//

    /**
     * 构造函数
     * @param numDimension 整个稀疏地图的维数
     */
    public constructor(numDimension: uint) {
        // 初始化维数
        this._nDim = numDimension
        // 初始化「所有朝向」
        this._allDirection = generateArray(this.numDimension << 1, identity)
        // ! 特别初始化「边界长度」（因为它不是个临时变量）
        this._borderMax = new iPoint(this._nDim);
        this._borderMin = new iPoint(this._nDim);
    }

    protected _temp_size: iPoint = new iPoint() // ! 现在因为`xPoint`中的`copy`方法改良，无需带维数初始化
    /**
     * 实现：max-min，矢量相减
     * * 【2023-09-17 1:11:38】注意：减去之后还得批量+1
     */
    public get size(): number[] {
        return this._temp_size.copyFrom(this._borderMax).minusFrom(this._borderMin).addFromSingle(1);
    }

    // ! 现在使用getter方法动态获取，而非直接对变量进行静态闭包
    protected readonly _allDirection: mRot[];
    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public get allDirection(): mRot[] { return this._allDirection; }

    /**
     * * 默认0~3（x+、x-、y+、y-）
     * * 使用「实例常量缓存」提高性能
     * 
     * ! 不要对返回的数组进行任何修改
     */
    public getForwardDirectionsAt(p: iPoint): number[] { return this.allDirection; }

    /**
     * * 默认（内联）就是随机取
     * 
     * ! 注意：返回值是mRot「多位朝向」
     * 
     * @param x x坐标
     * @param y y坐标
     * @returns 随机一个坐标方向（mRot「多位朝向」）
     */
    public randomForwardDirectionAt(p: iPoint): mRot {
        return randInt(this._nDim << 1)
    }

    /**
     * 随机取一个「不是当前『任意维整数角』」的角度
     * * 原理：利用「取余忽略」
     * 
     * ! 假设：在「稀疏地图」中，可用朝向与位置无关（平移不变性）
     * 
     * ? 暂时没算入接口，因为这函数暂时没被其它地方用到
     */
    public randomWithoutForwardDirectionAt(p: iPoint, rot: mRot): mRot {
        return (rot + randInt((this._nDim << 1) - 1)) % this._nDim
    }

    /**
     * * 默认（内联）就是随机取
     * 
     * ! 注意：返回值是mRot「多位朝向」
     * 
     * @param x x坐标
     * @param y y坐标
     * @returns 随机一个坐标方向（mRot「多位朝向」）
     */
    public randomRotateDirectionAt(p: iPoint, rot: mRot, step: int): mRot {
        // 使用随机轴向，直接按步长旋转（算入「步长为2」的特殊情况）
        return rotate_M(
            rot,
            randModWithout(rot >> 1, this._nDim), // 等概率取一个随机轴向
            step
        )
    }

    /**
     * 析构函数
     */
    public destructor(): void { }

    //============Interface============//

    public generateNext(...args: any[]): IMapStorage {
        return this.generatorF(this, ...args);
    }

    public isInMap(p: iPoint): boolean {
        for (let i: uint = 0; i < this._nDim; ++i)
            if (this._borderMin[i] > p[i] || this._borderMax[i] < p[i])
                return false
        return true
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

    // ! 实现：会，因为这里的点不能保证「不是临时的」
    public addSpawnPointAt(p: iPoint): IMapStorage {
        if (!this.hasSpawnPointAt(p))
            this._spawnPoints.push(p.copy())
        return this;
    }

    public hasSpawnPointAt(p: iPoint): boolean {
        for (let point of this._spawnPoints)
            if (point.isEqual(p))
                return true;
        return false
    }

    public indexSpawnPointOf(p: iPoint): uint | -1 {
        for (let index: uint = 0; index < this._spawnPoints.length; index++) {
            let point: iPoint = this._spawnPoints[index];
            if (point.isEqual(p))
                return index;
        }
        return -1;
    }

    public removeSpawnPoint(p: iPoint): boolean {
        let point: iPoint;
        for (let index: uint = 0; index < this._spawnPoints.length; index++) {
            point = this._spawnPoints[index]
            if (point.isEqual(p)) {
                this._spawnPoints.splice(index, 1)
                return true
            }
        }
        return false;
    }

    public clearSpawnPoints(): IMapStorage {
        for (let i: int = this._spawnPoints.length; i > 0; --i)
            this._spawnPoints.shift();
        return this;
    }

    public get mapWidth(): uint {
        return this.borderRight - this.borderLeft;
    }

    public get mapHeight(): uint {
        return this.borderDown - this.borderUp;
    }

    public getMapSizeAt(dim: uint): uint {
        return this._borderMax[dim] - this._borderMin[dim];
    }

    /**
     * ! 默认其边界之内都为**合法**；使用缓存技术，因为获得的量是只读的
     */
    protected readonly _temp_randomPoint: iPoint = new iPoint(); // ! 现在因为`xPoint`中的`copy`方法改良，无需带维数初始化
    // 实现：直接调用缓存
    public get randomPoint(): iPoint {
        // return this._temp_randomPoint.generate(this._randomPGenerateF, this._nDim);
        for (let i: uint = 0; i < this._nDim; ++i) {
            this._temp_randomPoint[i] = randIntBetween(this._borderMin[i], this._borderMax[i] + 1)
        }
        return this._temp_randomPoint
    }

    // 使用缓存
    protected readonly _temp_forEachPoint: iPoint = new iPoint(); // ! 现在因为`xPoint`中的`copy`方法改良，无需带维数初始化
    /**
     * 兼容任意维的「所有坐标遍历」
     * * 思想：边界之内，均为合法：会遍历边界内所有内容⇒直接对遍历到的点调用回调即可
     * * 【20230913 0:08:06】暂时不调用geometricTools中的方法，将其内联以提升性能
     * 
     * ! 已知问题：直接使用args数组，TS编译会不通过
     * 
     * @param f 用于遍历回调的函数
     * @param args 用于附加的参数 // ? 是否需要把类型整得更精确些？
     */
    public forEachValidPositions(f: (p: iPoint, ...args: any[]) => void, ...args: any[]): IMapStorage {
        // 临时变量
        let i: uint = 0;
        // 检查：如果是空地图，就直接退出
        for (i = 0; i < this._nDim; i++)
            if (
                this._borderMax[i] == undefined || this._borderMin[i] == undefined ||
                isNaN(this._borderMax[i]) || isNaN(this._borderMin[i])
            )
                return this;
        // 当前点坐标的表示：复制this._border_min数组
        this._temp_forEachPoint.copyFrom(this._borderMin);
        // 不断遍历，直到「最高位进位」后返回
        for (i = 0; i < this._nDim;) {
            // 执行当前点：调用回调函数
            f(this._temp_forEachPoint, ...args)
            // 迭代到下一个点：不断循环尝试进位
            // 先让第i轴递增，然后把这个值和最大值比较：若比最大值大，证明越界，需要进位，否则进入下一次递增
            for (i = 0; i < this._nDim && ++this._temp_forEachPoint[i] > this._borderMax[i]; ++i) {
                // 旧位清零
                this._temp_forEachPoint[i] = this._borderMin[i];
                // 如果清零的是最高位（即最高位进位了），证明遍历结束，退出循环，否则继续迭代
            }
        }
        return this;
    }

    /**
     * 会直接克隆出一个与自身相同类型、相同属性的对象
     */
    public clone(deep: boolean = false): IMapStorage {
        // 复制构造函数参数
        let nStorage: MapStorageSparse = new MapStorageSparse(this._nDim);
        // 复制其它信息
        nStorage.copyFrom(this, false, deep);
        // 返回
        return nStorage;
    }

    // ! 非接口方法
    /**
     * 手动设置地图边界
     * * 可用于遍历
     * 
     * @param border_min 各维度最小值之引用
     * @param border_max 各维度最大值之引用
     * @returns 自身
     */
    public setBorder(border_min: iPoint, border_max: iPoint): IMapStorage {
        this._borderMax.copyFrom(border_max);
        this._borderMin.copyFrom(border_min);
        return this;
    }

    // ! 非接口方法
    /**
     * 从另一个「稀疏地图」中拷贝边界
     * * 用于快速构造地图
     * @param source 源「稀疏地图」
     * @returns 自身
     */
    public copyBorderFrom(source: MapStorageSparse): IMapStorage {
        this._borderMax.copyFrom(source._borderMax);
        this._borderMin.copyFrom(source._borderMin);
        return this;
    }

    protected static _temp_copyContent_F(p: iPoint, source: IMapStorage, target: IMapStorage): void {
        if (source.getBlock(p) !== null) // ! 不能省略：地图格式可能不只有此一种
            target.setBlock(p, source.getBlock(p) as Block)
    }
    protected static _temp_copyContent_F_deep(p: iPoint, source: IMapStorage, target: IMapStorage): void {
        if (source.getBlock(p) !== null) // ! 不能省略：地图格式可能不只有此一种
            target.setBlock(p, (source.getBlock(p) as Block).clone())
    }
    public copyContentFrom(source: IMapStorage, clearSelf: boolean = false, deep: boolean = false): IMapStorage {
        if (clearSelf) {
            this.clearBlocks();
            this.clearSpawnPoints();
        }
        // 复制重生点
        for (const sP of source.spawnPoints) {
            if (deep)
                this.addSpawnPointAt(sP)
            else this._spawnPoints.push(sP);
        }
        // * 函数式编程：决定是「原样」还是「拷贝」
        let blockF: (p: iPoint, source: IMapStorage, target: IMapStorage) => void = (
            deep ?
                MapStorageSparse._temp_copyContent_F_deep :
                MapStorageSparse._temp_copyContent_F
        );
        source.forEachValidPositions(
            blockF, // * 现在是抽象出俩静态函数
            source, this
        )
        return this;
    }

    public copyFrom(source: IMapStorage, clearSelf?: boolean | undefined, deep?: boolean | undefined): IMapStorage {
        // 若类型相同
        if (source instanceof MapStorageSparse) {
            // * 复制边界
            this.copyBorderFrom(source);
        }
        // 复制内容并返回
        return this.copyContentFrom(source, clearSelf, deep);
    }

    /**
     * * 恒真：在接口意义上说，因稀疏地图「找不到⇒返回默认」的特性，所以总是能返回一个对象
     * 
     * @param x x坐标
     * @param y y坐标
     */
    public hasBlock(p: iPoint): true {
        return true;
    }

    /**
     * 用于提升获取效率用的「临时寄存器」
     * * 这样不需要频繁`let`占空间
     */
    protected _temp_block: Block | undefined = undefined;

    /**
     * * 找不到方块(undefined)⇒返回默认
     * @param x x坐标
     * @param y y坐标
     */
    public getBlock(p: iPoint): Block {
        return this._dict?.[MapStorageSparse.pointToIndex(p)] ?? this._defaultBlock;
    }

    /**
     * * 因getBlock一定能返回方块实例，所以此处直接访问
     * @param x x坐标
     * @param y y坐标
     * @returns 返回的方块属性（一定有值）
     */
    public getBlockAttributes(p: iPoint): BlockAttributes {
        return this.getBlock(p).attributes;
    }

    /**
     * * 因getBlock一定能返回方块实例，所以此处直接访问
     * @param x x坐标
     * @param y y坐标
     * @returns 返回的方块类型（一定有值）
     */
    public getBlockType(p: iPoint): BlockType {
        return this.getBlock(p).type; // TODO: 具体的「.type」属性能否工作，还有待验证
    }

    /**
     * 根据更新了的坐标，更新自己的「地图边界」
     * * 【20230910 10:56:53】其实在目前「地图大小固定」的情况下，这个更新很少成功
     * @param ux 更新为「有效」的x坐标
     * @param uy 更新为「有效」的y坐标
     */
    protected updateBorder(p: iPoint): void {
        let pi: int;
        for (let i: int = 0; i < this._nDim; i++) {
            pi = p[i]
            if (pi > this._borderMax[i] || this._borderMax[i] == undefined) // 现在需要检查是否为空
                this._borderMax[i] = pi
            if (pi < this._borderMin[i] || this._borderMin[i] == undefined) // 现在需要检查是否为空
                this._borderMin[i] = pi
        }
    }

    public setBlock(p: iPoint, block: Block): IMapStorage {
        // 放置方块
        this._dict[MapStorageSparse.pointToIndex(p)] = block;
        // 更新边界
        this.updateBorder(p);
        return this;
    }

    /**
     * 判断某个位置是否为「空」
     * * 实质上直接判断返回的「方块类型」是否为`BlockVoid`即可
     * @param x x坐标
     * @param y y坐标
     */
    public isVoid(p: iPoint): boolean {
        return this.getBlockType(p) === NativeBlockTypes.VOID; // ! 已经锁定「默认方块」就是「空」
    }

    /**
     * 设置某个位置的方块为「空」
     * 
     * ! 直接删除键，而非「覆盖为空」
     * 
     * @param x x坐标
     * @param y y坐标
     */
    public setVoid(p: iPoint): IMapStorage {
        delete this._dict[MapStorageSparse.pointToIndex(p)];
        return this;
    }

    public clearBlocks(deleteBlock?: boolean | undefined): IMapStorage {
        let deleteF: (p: iPoint, target: IMapStorage) => void = (
            deleteBlock ?
                (p: iPoint, target: IMapStorage): void => {
                    target.getBlock(p)?.destructor();
                    target.setVoid(p);
                } :
                (p: iPoint, target: IMapStorage): void => {
                    target.setVoid(p);
                }
        )
        return this.forEachValidPositions(
            deleteF, this
        )
    }

    //============Display Implements============//

    // TODO: 有待对接

    // public setDisplayTo(target: IMapDisplayer): void {
    // 	target.clearBlock();
    // 	let ix: int, iy: int, iBlock: Block;
    // 	for (let index in this._Content) {
    // 		iBlock = this.storage.getBlock(ix, iy);
    // 		target.setBlock(ix, iy, iBlock);
    // 	}
    // }

    // public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
    // 	targetBottom.clearBlock();
    // 	targetMiddle.clearBlock();
    // 	targetTop.clearBlock();
    // 	let ix: int, iy: int, iBlock: Block, iLayer: int;

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
