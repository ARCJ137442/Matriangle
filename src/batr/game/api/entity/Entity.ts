/**
 * @author ARCJ137442
 * @class 一切「游戏内实体」的抽象基类，拥有「激活」属性
 * @abstract 【20230913 23:21:10】使用抽象类，但因其特殊性不使用Abstract前缀
 * 
 * TODO: 增加序列化方案
 */
export default abstract class Entity {

	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给游戏母体提供的）

	/**
	 * 内部存储「实体是否激活」的信息
	 */
	protected _isActive: boolean = false;
	/**
	 * 读写「实体是否激活」
	 * * 用于在事件分派时「是否忽略」（激活⇔需要分派）
	 * 
	 * ! 注意：与「活跃实体」的概念不同
	 */
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