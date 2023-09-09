

import { iPoint } from "../../../common/intPoint";
import { uint, int } from "../../../legacy/AS3Legacy";
import IMapStorage from "./IMapStorage";


/**
 * 定义地图的「逻辑层」，定义地图的逻辑结构
 * * 用于对接游戏机制
 *   * 提供一系列与地图有关的「工具函数」，供游戏本身调用
 *   * 提供对「存储结构」的访问，以便声明其「与『存储结构』的链接」
 *     * 在响应游戏机制时，一般从链接的「存储结构」中访问
 *     * 例：存储结构需要导出，而逻辑结构无需导出
 */
export default interface IMapLogic {
	//============Interface Functions============//
	/**
	 * 【对接显示】获取（经国际化的）地图的显示名称
	 */
	get name(): string;

	/**
	 * 用于获取其链接的「存储结构」
	 */
	get storage(): IMapStorage;

	/**
	 * 【对接游戏】获取所有重生点的位置
	 */
	get spawnPoints(): iPoint[];

	/**
	 * 【对接游戏】获取重生点的数量
	 */
	get numSpawnPoints(): uint;

	/**
	 * 【对接游戏】获取「是否有重生点」
	 */
	get hasSpawnPoint(): boolean;

	/**
	 * 【对接游戏】随机获取一个重生点
	 */
	get randomSpawnPoint(): iPoint;

	/**
	 * 【对接游戏】获取「是否」为「竞技场地图」
	 * * 定义：「竞技场地图」中，除了指定种类的方块外，不允许对大多数方块进行更改
	 * ? TODO: 或许日后通过「方块修改权限」机制做到「非特殊化」
	 */
	get isArenaMap(): boolean;

	//============Game Mechanics============//
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

	//============Display Implements============//
	// setDisplayTo(target: IMapDisplayer): void;

	// forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

	// updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

}