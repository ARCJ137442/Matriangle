/**
 * 此接口用于通用地定义一个抽象的「容器」接口
 * * 使用「子元素」「索引」两个泛型实现通用化
 */
export default interface IChildContainer<Child, Index> {

	/**
	 * 获取所有子元素
	 */
	get children(): Child[];

	/**
	 * 获取子元素的数量
	 */
	get numChildren(): Index;

	/**
	 * 在指定索引获取子元素
	 * @param index 指定的索引
	 */
	getChildAt(index: Index): Child;

	/**
	 * 在元素表中搜索指定子元素，返回首个匹配的索引
	 * 
	 * ! 未找到索引时，返回`void`(undefined)
	 * @param child 待搜索的子元素
	 */
	indexOfChild(child: Child): Index | void;

	/**
	 * 搜索整个元素表，返回首个判据为true的子元素
	 * 
	 * ! 未找到索引时，返回`void`(undefined)
	 * @param child 待搜索的子元素
	 */
	firstChildBy(criteria: (child: Child) => boolean): Child | void;

	/**
	 * 直接添加子元素
	 * * 默认值：这一般意味着，添加的子元素会自动处在所有元素的最上层
	 * @param child 欲添加之子元素
	 */
	addChild(child: Child): void;

	/**
	 * 在指定位置添加子元素
	 * @param index 欲添加之子元素
	 */
	addChildAt(index: Index): void;

	/**
	 * 依据指定条件，删除children中满足指定条件的元素
	 * * 此法为通法，下面的各个删除方法，实质上可以直接用「此方法+匿名函数」实现
	 * @param criteria 决定「是否删除」的条件
	 */
	removeChildBy(criteria: (child: Child) => boolean): void;

	/**
	 * 删除指定的子元素
	 * * 实质上相当于`removeChildBy`+「子元素===child」
	 * @param child 欲删除之子元素
	 */
	removeChild(child: Child): void;

	/**
	 * 删除指定位置的（所有）子元素
	 * * 实质上相当于`removeChildBy`+「位置=index」
	 * @param index 欲删除之子元素
	 */
	removeChildAt(index: Index): void;

	/**
	 * 删除所有子元素
	 * * 实质上相当于`removeChildBy`+「true」
	 */
	removeAllChildren(): void;

}