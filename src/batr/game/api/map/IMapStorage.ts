

import { ISelfModifyingGenerator } from "../../../common/abstractInterfaces";
import { iPoint, intPoint } from "../../../common/geometricTools";
import { intRot } from "../general/GlobalRot";
import { uint, int } from "../../../legacy/AS3Legacy";
import BlockAttributes from "../block/BlockAttributes";
import BlockCommon, { BlockType } from "../block/BlockCommon";


/**
 * 定义地图的「存储层」，定义地图的「存储结构」
 * * 用于「增删改查」地图中的方块信息
 */
export default interface IMapStorage extends ISelfModifyingGenerator<IMapStorage> {
	//============Interface Functions============//

	/**
	 * 决定地图「一般意义上的宽度」，对应地图在x方向的尺寸
	 */
	get mapWidth(): uint;

	/**
	 * 决定地图「一般意义上的高度」，对应地图在y方向的尺寸
	 */
	get mapHeight(): uint;

	/**
	 * 获取地图在指定轴向的尺寸
	 * * 对二维地图而言：0=x, 1=y
	 * @param dim 地图尺寸的具体维度
	 */
	getMapSizeAt(dim: uint): uint;

	/**
	 * 获取地图在所有轴向的尺寸
	 * * 可以复用`getMapSizeAt`
	 * @returns 所有轴向尺寸组成的一个整数点
	 */
	get size(): uint[];

	/**
	 * 仅在地图层面判断一个点是否「在地图之内」
	 * @param x 判断用的x坐标
	 * @param y 判断用的y坐标
	 */

	/**
	 * 仅在地图层面判断一个点是否「在地图之内」
	 * @param p 判断用的位置
	 */
	isInMap(p: intPoint): boolean;

	/**
	 * 获取地图的维数
	 * * 可以复用`size`
	 */
	get numDimension(): uint;

	/**
	 * 获取地图中所有可用的方向
	 * * 一般表示为自然数数组
	 * * 是「所有位置的所有方向」的并集
	 */
	get allDirection(): intRot[];

	/**
	 * 获取地图在某位置「可前进的所有方向」
	 */

	/**
	 * ! 高维版本
	 * 获取地图在某位置「可前进的所有方向」
	 */
	getForwardDirectionsAt(p: iPoint): intRot[];

	/**
	 * 在某一处随机获取一个「可前进方向」
	 * * 可以借用上面的代码
	 */

	/**
	 * ! 高维版本
	 * 在某一处随机获取一个「可前进方向」
	 * * 可以借用上面的代码
	 */
	randomForwardDirectionAt(p: iPoint): intRot;

	// ! 【20230910 20:27:44】现在地图必须要「获取完整的随机坐标」而非再设计什么分离的坐标，即便只用其中几个分量也是如此

	/**
	 * 【对接游戏】获取地图上的一个（有效）随机位置
	 * 
	 * ! 与两个维度都有关
	 * 
	 * ! 从此处获取的量是只读的
	 */
	get randomPoint(): iPoint;

	/**
	 * 【对接游戏、显示】遍历地图上每个有效位置
	 * * 用于地图的复制等
	 * * 或将用于显示模块的非密集型处理
	 * 
	 * TODO: 兼容性能的同时，完全使用通用系统
	 * * 原则：能不`new`就尽可能不`new`
	 * 
	 * @param f ：用于在每个遍历到的坐标中调用（会附加上调用到的坐标）
	 * @param args ：用于在回调后附加的其它参数
	 */
	forEachValidPositions(f: (p: iPoint, ...args: any[]) => void, ...args: any[]): IMapStorage;

	/**
	 * 复制地图本身
	 * @param deep 是否为深拷贝，即「复制所有其内的方块对象，而非仅复制引用」
	 */
	clone(deep?: boolean/* = true*/): IMapStorage;

	/**
	 * 从另一个地图中复制所有内容
	 * * 方块
	 * * 重生点
	 * 
	 * @param source 复制的来源
	 * @param clearSelf 是否先清除自身（调用「清除方法」）
	 * @param deep 是否为深拷贝
	 */
	copyContentFrom(source: IMapStorage, clearSelf?: boolean/* = false*/, deep?: boolean/* = true*/): IMapStorage;

	/**
	 * 从另一个地图中复制所有属性（包括「内容」）
	 * * 目前还是以「复制方块」的形式为主
	 * @param source 复制的来源
	 * @param clearSelf 是否先清除自身
	 * @param createBlock 是否为深拷贝
	 */
	copyFrom(source: IMapStorage, clearSelf?: boolean/* = false*/, createBlock?: boolean/* = true*/): IMapStorage;/**

	/**
	* 用于构建「随机结构生成」的「生成器函数」
	* * 接受自身作为参数
	* * 返回自身作为返回值
	*/
	generatorF: (x: IMapStorage) => IMapStorage

	/**
	 * 【对接游戏】生成下一个地图变种
	 * * 对于「使用随机方式生成的地图」，这种方法用于动态刷新地图对象
	 * * 【20230910 10:46:13】现在实现「自修改式生成器」，不再需要自行定义
	 */
	// generateNew(): IMapStorage;

	/**
	 * 获取地图上某位置「是否有方块」（与「VOID」对象兼容）
	 * ! 原则上只需用于判断`getBlock`是否能获取到`BLockCommon`的实例
	 * * 不要用于和`getBlock`无关的内容
	 * 
	 * @param x x坐标
	 * @param y y坐标
	 */
	hasBlock(p: iPoint): boolean;

	/**
	 * 获取地图上某位置的「方块实体」
	 * * 可能返回空值null（一般在`hasBlock(x,y)===false`时）
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlock(p: iPoint): BlockCommon | null;

	/**
	 * 获取地图上某位置的方块属性
	 * * 可能返回空值null
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlockAttributes(p: iPoint): BlockAttributes | null;

	/**
	 * 获取地图上某位置的方块类型
	 * ! 迁移TS后，返回的是方块实例所对应的类（构造函数）
	 * * 可能返回空值null
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlockType(p: iPoint): BlockType | null;

	/**
	 * 设置地图上某位置的方块
	 * @param x x坐标
	 * @param y y坐标
	 * @param block 方块对象
	 */
	setBlock(p: iPoint, block: BlockCommon): IMapStorage;

	/**
	 * 【快捷方式】获取地图上某个位置「是否是『空』」
	 * * 对应原生方块类型的「Void」
	 * @param x x坐标
	 * @param y y坐标
	 */
	isVoid(p: iPoint): boolean;

	/**
	 * 【快捷方式】将地图上某个位置设置成「空」
	 * * 对应原生方块类型的「Void」
	 * ! 应该等同于`setBlock(x, y, BLOCK_VOID)`
	 * @param x x坐标
	 * @param y y坐标
	 */
	setVoid(p: iPoint): IMapStorage;

	/**
	 * 删除地图上的所有方块
	 * ! 对其中的「方块对象」调用析构函数，可能会因「改变其引用」而导致难以预料的后果
	 * @param deleteBlock 是否在方块对象上调用析构函数
	 */
	clearBlocks(deleteBlock?: boolean/* = true*/): IMapStorage;

	/**
	 * 【机制需要】获取所有重生点的位置
	 */
	get spawnPoints(): iPoint[];

	/**
	 * 【机制需要】获取重生点的数量
	 */
	get numSpawnPoints(): uint;

	/**
	 * 【机制需要】获取「是否有重生点」
	 */
	get hasSpawnPoint(): boolean;

	/**
	 * 【机制需要】随机获取一个重生点
	 */
	get randomSpawnPoint(): iPoint;

	/**
	 * 在地图上添加（注册）重生点
	 * @param x x坐标
	 * @param y y坐标
	 */
	addSpawnPointAt(p: iPoint): IMapStorage;

	/**
	 * 【机制需要】获取某处「是否有重生点」
	 */
	hasSpawnPointAt(p: iPoint): boolean;

	/**
	 * 在地图上移除（删除）重生点
	 * @param p 待移除的重生点
	 * @returns 是否移除成功
	*/
	removeSpawnPoint(p: iPoint): boolean;

	/**
	 * 移除地图上的所有重生点
	 */
	clearSpawnPoints(): IMapStorage;

	// AI About

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的矩阵
	 * ! 已弃用
	*/


	//============Display Implements============//

	// TODO: 有待对接

	// public setDisplayTo(target: IMapDisplayer): IMapStorage;
	// public forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): IMapStorage;

}