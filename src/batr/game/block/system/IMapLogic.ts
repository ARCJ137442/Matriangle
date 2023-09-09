

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
 * ! 旧时一些AS3版本在`Game`类的函数，也会在此处作为接口
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
	 * 【对接游戏】获取「是否」为「竞技场地图」
	 * * 定义：「竞技场地图」中，除了指定种类的方块外，不允许对大多数方块进行更改
	 * ? TODO: 或许日后通过「方块修改权限」机制做到「非特殊化」
	 */
	get isArenaMap(): boolean;

	//============Game Mechanics============//

	getBlockPlayerDamage(x: int, y: int): int

	isKillZone(x: int, y: int): boolean

	//============Display Implements============//
	// setDisplayTo(target: IMapDisplayer): void;

	// forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

	// updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void;

}