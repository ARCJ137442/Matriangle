
import IMapLogic from './IMapLogic';
import IMapStorage from "./IMapStorage";

/**
 * 通用的「地图」类型
 * * 复合「逻辑结构」与「存储结构」
 */
export default interface IMap {

	/**
	 * 获取地图的「逻辑结构」
	 */
	get logic(): IMapLogic;

	/**
	 * 获取地图的「存储结构」
	 */
	get storage(): IMapStorage;

	/**
	 * 析构函数
	 */
	destructor(): void;

}
