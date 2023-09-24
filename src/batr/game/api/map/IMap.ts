import { IJSObjectifiable } from '../../../common/JSObjectify';
import IMapLogic from './IMapLogic';
import IMapStorage from "./IMapStorage";

/**
 * 通用的「地图」类型
 * * 复合「存储结构」，继承「逻辑结构」
 * * 可被JS对象化
 * 
 * !【2023-09-24 17:07:13】现在直接当逻辑结构处理了，相当于「存储+逻辑=完整版地图」
 */
export default interface IMap extends IMapLogic, IJSObjectifiable<IMap> {

	// /** 获取地图的「逻辑结构」 */
	// get logic(): IMapLogic;

	/** 获取地图的「存储结构」 */
	get storage(): IMapStorage;

	/** 析构函数 */
	destructor(): void;

}
