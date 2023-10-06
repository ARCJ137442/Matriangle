import IBatrMatrix from "../../main/IBatrMatrix";
import { BlockEventPatchMap, BlockEventType, TypePatchMap, BlockPatchIndex, randomTickEventF } from "./BlockEventTypes";

/**
 * 世界事件分派器
 * * 使用**函数式编程**，集中管理与世界方块、世界实体等相关的世界事件
 * 
 * ! 最初是为了解决「事件处理函数定义在方块类内，导致『方块 import 实体 import 母体 import 地图 import 方块』循环导入」的问题
 * 
 * TODO: 【2023-10-01 12:00:17】考虑「方块事件」与「控制器事件」的统一
 * 
 * ? 是否要「内置事件」与「自定义事件」分离开来？是否要实现整个事件系统？
 * 
 */
export default class BlockEventPatcher {
	/** 通过「方块类型」进行事件分派的字典 */
	public _blockPatchMap: BlockEventPatchMap = {};

	/** 构造函数 */
	public constructor() { }

	/**
	 * 通用事件类型注册
	 * * 若事件类型未注册，则将其设置为空对象
	 * * 若事件类型已注册，则不会覆盖
	 * 
	 * @returns 注册后的「事件分派」字典
	 */
	public registerEventType(eventType: BlockEventType): TypePatchMap {
		this._blockPatchMap[eventType] ??= {};
		return this._blockPatchMap[eventType];
	}

	/**
	 * 通用事件注册
	 * * 若事件类型未注册，则将其设置为指定处理函数（成功）
	 * * 若事件类型已注册，则不会覆盖（失败）
	 * 
	 * @returns 是否注册成功（成功新建）
	 */
	public registerEvent(eventType: BlockEventType, patchIndexType: BlockPatchIndex, handler: randomTickEventF): boolean {
		this.registerEventType(eventType)[patchIndexType] ??= handler;
		return this._blockPatchMap[eventType][patchIndexType] == handler;
	}

	/**
	 * 事件分派
	 * * 逻辑：
	 *   * 开发模式：一路访问，未注册⇒报错（提醒开发者）
	 * // 业务模式：一路非空，一路分派；没有注册，静默失败
	 * 
	 * ? 是否频繁地「数组解构封装」会导致性能降低
	 * ! 后续可能遇到效率瓶颈，但「先实现再重构」
	 */
	public dispatchEvent(host: IBatrMatrix, eventType: BlockEventType, patchIndexType: BlockPatchIndex, ...args: any[]): void {
		this._blockPatchMap[eventType][patchIndexType](host, ...args);
		// this._blockPatchMap?.[eventType]?.[patchIndexType]?.(host, ...args);
	}
}
