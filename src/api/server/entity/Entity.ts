import { typeID } from '../registry/IWorldRegistry'

/**
 * @author ARCJ137442
 * @class 一切「世界内实体」的抽象基类，拥有「激活」属性
 * @abstract 【20230913 23:21:10】使用抽象类，但因其特殊性不使用Abstract前缀
 *
 * TODO: 增加序列化方案
 */
export default abstract class Entity {
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	/**
	 * 内部存储「实体是否激活」的信息
	 */
	protected _isActive: boolean = false
	/**
	 * 读写「实体是否激活」
	 * * 用于在事件分派时「是否忽略」（激活⇔需要分派）
	 *
	 * ! 注意：与「活跃实体」的概念不同
	 */
	public get isActive(): boolean {
		return this._isActive
	}
	public set isActive(value: boolean) {
		this._isActive = value
	}

	// 对接JS API //
	public toString(): string {
		return `[Entity ${this._id} isActive=${this._isActive}]`
	}

	// id化 //
	/**
	 * 「实体ID/实体类型」
	 * * 用于确定不同类实现的实体
	 *   * 📌类构造中的体现：抽象传递，具体定值
	 *     * 抽象类的构造函数需要`id`作为参数向下传递
	 *     * 具体类的构造函数直接传递**固定常量**
	 * * 和「方块」不同，复用逻辑代码较多的实体，仍然采用「类继承」的结构
	 * * 「实体ID」在此和「实体类型的名称」是一个意思，不同于`EntityType`对象
	 */
	public get id(): typeID {
		return this._id
	}

	//============Constructor & Destructor============//
	public constructor(protected readonly _id: typeID /*  = '#undef' */) {
		// 构造时自动激活（可被覆盖）
		this._isActive = true
	}

	/**
	 * ! 默认的析构行为：停止激活
	 * * 当然也有其它途径使其不被激活
	 */
	public destructor(): void {
		this._isActive = false
	}
}
