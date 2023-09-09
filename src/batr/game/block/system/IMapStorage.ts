

import { iPoint } from "../../../common/intPoint";
import { uint, int } from "../../../legacy/AS3Legacy";
import BlockAttributes from "../BlockAttributes";
import BlockCommon, { BlockType } from "../BlockCommon";


/**
 * 定义地图的「存储层」，定义地图的「存储结构」
 * * 用于「增删改查」地图中的方块信息
 */
export default interface IMapStorage {
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
	getMapSize(dim: uint): uint;

	/**
	 * 【对接游戏】获取地图中的一个（有效）随机x坐标
	 * ! 与另一个维度上的坐标无关
	*/
	get randomX(): int;

	/**
	 * 【对接游戏】获取地图中的一个（有效）随机x坐标
	 * ! 与另一个维度上的坐标无关
	 */
	get randomY(): int;

	/**
	 * 【对接游戏】获取地图上的一个（有效）随机位置
	 * ! 与两个维度都有关
	 */
	get randomPoint(): iPoint;

	/**
	 * 【对接游戏、显示】获取地图上每个有效位置
	 * * 用于地图的复制或遍历
	 * * 或将用于显示模块的非密集型处理
	 */
	get allValidPositions(): iPoint[];

	/**
	 * 复制地图本身
	 * @param createBlock 是否为深拷贝，即「复制所有其内的方块对象，而非仅复制引用」
	 */
	clone(createBlock?: boolean/* = true*/): IMapStorage;

	/**
	 * 从另一个地图中复制所有内容（方块）
	 * @param source 复制的来源
	 * @param clearSelf 是否先清除自身（调用「清除方法」）
	 * @param createBlock 是否为深拷贝
	 */
	copyContentFrom(source: IMapStorage, clearSelf?: boolean/* = false*/, createBlock?: boolean/* = true*/): void;

	/**
	 * 从另一个地图中复制所有属性（包括「内容」）
	 * * 目前还是以「复制方块」的形式为主
	 * @param source 复制的来源
	 * @param clearSelf 是否先清除自身
	 * @param createBlock 是否为深拷贝
	 */
	copyFrom(source: IMapStorage, clearSelf?: boolean/* = false*/, createBlock?: boolean/* = true*/): void;

	/**
	 * 【对接游戏】生成下一个地图变种
	 * * 对于「使用随机方式生成的地图」，这种方法用于动态刷新地图对象
	 *   * TODO: 「地图系统」文档
	 * ! 疑似遗留特性
	 */
	generateNew(): IMapStorage;

	/**
	 * 获取地图上某位置「是否有方块」（与「VOID」对象兼容）
	 * @param x x坐标
	 * @param y y坐标
	 */
	hasBlock(x: int, y: int): boolean;

	/**
	 * 获取地图上某位置的「方块实体」
	 * * 可能返回空值null（一般在`hasBlock(x,y)===false`时）
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlock(x: int, y: int): BlockCommon | null;

	/**
	 * 获取地图上某位置的方块属性
	 * * 可能返回空值null
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlockAttributes(x: int, y: int): BlockAttributes | null;

	/**
	 * 获取地图上某位置的方块类型
	 * ! 迁移TS后，返回的是方块实例所对应的类（构造函数）
	 * * 可能返回空值null
	 * @param x x坐标
	 * @param y y坐标
	 */
	getBlockType(x: int, y: int): BlockType | null;

	/**
	 * 设置地图上某位置的方块
	 * @param x x坐标
	 * @param y y坐标
	 * @param block 方块对象
	 */
	setBlock(x: int, y: int, block: BlockCommon): void;

	/**
	 * 【快捷方式】获取地图上某个位置「是否是『空』」
	 * * 对应原生方块类型的「Void」
	 * @param x x坐标
	 * @param y y坐标
	 */
	isVoid(x: int, y: int): boolean;

	/**
	 * 【快捷方式】将地图上某个位置设置成「空」
	 * * 对应原生方块类型的「Void」
	 * ! 应该等同于`setBlock(x, y, BLOCK_VOID)`
	 * @param x x坐标
	 * @param y y坐标
	 */
	setVoid(x: int, y: int): void;

	/**
	 * 删除地图上的所有方块
	 * ! 对其中的「方块对象」调用析构函数，可能会因「改变其引用」而导致难以预料的后果
	 * @param deleteBlock 是否在方块对象上调用析构函数
	 */
	removeAllBlock(deleteBlock?: boolean/* = true*/): void;

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
	addSpawnPoint(x: int, y: int): void;

	/**
	 * 在地图上移除（删除）重生点
	 * @param x x坐标
	 * @param y y坐标
	 */
	removeSpawnPoint(x: int, y: int): void;

	/**
	 * 移除地图上的所有重生点
	 */
	clearSpawnPoints(): void;

	// AI About

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的对象矩阵
	 * ! 即将弃用
	 */
	getMatrixObject(): (Object[])[];

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的有符号整数矩阵
	 * ! 即将弃用
	 */
	getMatrixInt(): (int[])[];

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的无符号整数矩阵
	 * ! 即将弃用
	 */
	getMatrixUint(): (uint[])[];

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的数值矩阵
	 * ! 即将弃用
	 */
	getMatrixNumber(): (Number[])[];

	/**
	 * 【用于AI】获取地图上所有「有效点」构成的布尔值矩阵
	 * ! 即将弃用
	 */
	getMatrixBoolean(): (Boolean[])[];

}