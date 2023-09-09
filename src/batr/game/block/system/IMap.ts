
import IMapLogic from './IMapLogic';
import IMapStorage from "./IMapStorage";

/**
 * 一个封装好的的「游戏地图」
 * * 同时继承「逻辑结构」与「存储结构」
 */
export default interface IMap extends IMapLogic, IMapStorage {

}
