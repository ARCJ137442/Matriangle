import { BlockEventMap, BlockTypeEventMap, BlockEventType } from "./BlockEventTypes";
import { typeID } from "../registry/IWorldRegistry";
import { combineObject } from "../../../common/utils";

/**
 * 方块事件注册表
 * * 管理一个「方块事件分派表」，本质上是收编「XXid的方块在YY时需要进行FF处理」的字典
 * * 目前用于管理各类事件
 */
export default class BlockEventRegistry {
	/** 通过「方块类型」进行事件分派的字典 */
	protected _blockPatchMap: BlockEventMap;

	// 构造&析构 //
	/**
	 * 构造函数
	 * @param [map={}] 注册时使用的「方块事件映射表」 // ! 直接使用引用
	 */
	public constructor(map: BlockEventMap = {}) {
		this._blockPatchMap = map;
	}

	/**
	 * 析构函数
	 * * 原理：通过「覆写成空对象」完成「引用解绑」
	 */
	public destructor(): void {
		this._blockPatchMap = {};
	}

	// 事件注册&管理 //
	/**
	 * 通用事件类型注册
	 * * 若事件类型未注册，则会设置为所传入「『方块ID⇒事件处理函数』映射表」的拷贝
	 * * 若事件类型已注册，则会与旧的「『方块ID⇒事件处理函数』映射表」合并（新的覆盖旧的）
	 * 
	 * @returns （引用）最新的「『方块ID⇒事件处理函数』映射表」
	 */
	public registerEventFor(id: typeID, patch: BlockTypeEventMap): BlockTypeEventMap {
		// 之前没有对ID注册过⇒开辟新对象
		this._blockPatchMap[id] ??= {};
		// 已注册⇒直接合并
		combineObject(patch, this._blockPatchMap[id])
		return this._blockPatchMap[id];
	}

	/**
	 * 获取一个id（更深入的，对应的事件）是否在此注册
	 * * 此中「注册」的含义：是否在内部映射表中有相应的键，哪怕其对应的值是空对象`{}`
	 * 
	 * @param id 所查询id
	 * @param eventType 要查询的事件类型（可空，代表「所查询id是否注册」）
	 * @returns 这个id（或对应的事件）是否已注册
	 */
	public hasRegistered(id: typeID, eventType?: BlockEventType): boolean {
		return id in this._blockPatchMap && (
			eventType === undefined || // 要么「没第二个参数」
			eventType in this._blockPatchMap[id] // 要么「查具体的id」
		);
	}

	/**
	 * 获取某个方块ID对应的「『方块ID⇒事件处理函数』映射表」
	 * * 性质：`hasRegistered`返回`false`⇒一定为`undefined`
	 * * 💭基于此分派事件时，配合`?.`运算符，不再需要`hasRegistered`（参见「原生母体机制」相关代码）
	 * 
	 * @param id 要查询的方块id
	 * @returns （引用）「方块ID⇒事件处理函数」映射表 | 空值undefined
	 */
	public getEventMapAt(id: typeID): BlockTypeEventMap | undefined {
		return this._blockPatchMap[id];
	}

	/**
	 * 注销事件分派
	 * * 原理：使用`delete`删除
	 *   * 删除所有时，目标为「方块ID」对应的键
	 *   * 删除部分时，使用`delete`删除「『方块ID⇒事件处理函数』映射表」上的一部分键
	 * * 性质：在注销之后立即使用`hasRegistered`，必将返回false
	 * 
	 * ! 这个删除可能会影响到其它持有「『方块ID⇒事件处理函数』映射表」的对象
	 * 
	 * @param id 需要操作的方块ID
	 * @param [eventTypes=undefined] 需要删除的指定类型，不提供则默认删除所有「方块事件处理器」
	 */
	public unregisterEventFor(id: typeID, eventTypes: BlockEventType[] | undefined = undefined): void {
		// 未提供⇒删除所有
		if (eventTypes === undefined)
			delete this._blockPatchMap[id];
		else
			// 已提供⇒逐个删除
			for (const eventType in eventTypes)
				delete this._blockPatchMap[id][eventType];
	}
}
