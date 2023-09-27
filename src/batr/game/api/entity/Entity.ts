import EntityType from "./EntityType";

/**
 * @author ARCJ137442
 * @class 一切「游戏内实体」的抽象基类
 * @abstract 【20230913 23:21:10】使用抽象类，但因其特殊性不使用Abstract前缀
 * 
 * TODO: 增加序列化方案
 */
export default abstract class Entity {

	/**
	 * 存储「实体是否激活」的信息
	 * * 用于在事件分派时「是否忽略」（激活⇔需要分派）
	 * 
	 * ! 注意：与「活跃实体」的概念不同
	 */
	protected _isActive: boolean = false;

	/** 只读：「实体类型」 */
	public abstract get type(): EntityType

	/** 读写「实体是否激活」 */
	public get isActive(): boolean { return this._isActive }
	public set isActive(value: boolean) { this._isActive = value }

	//============Constructor & Destructor============//
	public constructor() { }

	/**
	 * ! 默认的析构行为：停止激活
	 * * 当然也有其它途径使其不被激活
	 */
	public destructor(): void {
		this._isActive = false;
	}

}
