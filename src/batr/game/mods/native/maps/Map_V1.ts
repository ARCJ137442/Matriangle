import IMap from "../../../api/map/IMap";
import MapLogic_V1 from "./MapLogic_V1";
import IMapStorage from "../../../api/map/IMapStorage";
import IMapLogic from "../../../api/map/IMapLogic";
import MapStorageSparse from "./MapStorageSparse";
import { JSObject, uniSaveJSObject, uniLoadJSObject, JSObjectifyMap } from "../../../../common/JSObjectify";

/**
 * 第一版地图
 * * 迁移自AS3版本
 * * 自身即逻辑层，继承自MapLogic_V1
 */
export default class Map_V1 extends MapLogic_V1 implements IMap {

	/** 实现：就是「地图自身的逻辑」 */
	public get logic(): IMapLogic { return this }
	// public get storage(): IMapStorage { return this._storage }

	// JS对象化 //

	/**
	 * 面向JS对象化：实现一个空白对象
	 * @param storage 所用的「存储结构」
	 */
	public static getBlank(storage: IMapStorage): IMap {
		return new Map_V1(
			'blank',
			MapStorageSparse.getBlank(), // TODO: 这里的「空方法」产生了过大的耦合
		)
	}

	// JS对象化 // TODO: 待实现：基本调用超类方法
	public saveToJSObject(target: JSObject = {}): JSObject {
		let value: JSObject | undefined = (this.logic as any)?.saveToJSObject?.({}) ?? console.error('加载出错：value===undefined', this, this.logic)
		if (value === undefined)
			throw new Error('未能加载')
		target['logic'] = value; // ! logic包括storage
		// TODO: 这里面的「逻辑」是没法改变的……这些应该交给「IGameRule」
		return target
	}

	public loadFromJSObject(source: JSObject): IMap {
		uniLoadJSObject(this.storage, source);
		return this;
	}

	/**
	 * 假实现：调用⇒返回空
	 * * 【2023-09-24 16:32:38】不报错的缘由：判断「是否有定义属性」时要访问这个getter
	 */
	public get objectifyMap(): JSObjectifyMap<Map_V1> { return {} }

	//============Constructor & Destructor============//
	public constructor(name: string, storage: IMapStorage, isArena: boolean = false) {
		super(name, storage, isArena);
	}

	override destructor(): void {
		// this.storage.clearBlock(); // ! 存储结构可能共用，不能陪葬
		super.destructor();
	}

}
