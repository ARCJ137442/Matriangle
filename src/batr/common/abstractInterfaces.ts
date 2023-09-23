/**
 * 用于通用地定义一个以「子元素+索引」为中心的「抽象容器接口」
 * * 使用「子元素」「索引」两个泛型实现通用化
 */
export interface IChildContainer<Child, Index> {

	/** 获取所有子元素 */
	get children(): Child[];

	/** 获取子元素的数量 */
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
	clearChildren(): void;

}


/**
 * 定义一个「自修改生成器」
 * * 用于：根据自身状态与（可能的）外部参数，自我修改状态
 */
export interface ISelfModifyingGenerator<Type> {

	/**
	 * 根据自身对象与外部参数，修改自身并最终返回自身
	 * * 「自身对象」使用内部的`this`访问
	 * @param args 外部参数（可在具体实现中限定更多）
	 */
	generateNext(...args: any[]): Type;
}

/**
 *  ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
 */
export type JSObjectValue = (
	number | string |
	boolean | null |
	Array<any> | JSObject
)

/**
 * 可转换为JSON的JS对象类型
 * 
 * ! 对object键的限制：只能为字符串
 */
export type JSObject = {
	[key: string]: JSObjectValue;
};


/**
 * 定义一类「可序列化」成JS原生object的对象
 */
export interface IBatrJSobject<T> {

	/**
	 * 将该对象的信息加载到为通用可交换的object格式
	 * * 该格式最大地保留了可操作性，并可直接通过`JSON.stringify`方法转化为JSON文本
	 * * 【2023-09-23 18:03:55】现在只需要「把数据加载到某个object中」，这样就很容易支持「动态继承性添加属性」了
	 *   * 其中的「目标」参数可以留空（默认为空对象），这时相当于原来的`toObject`方法
	 * 
	 * ! 对object键的限制：只能为字符串
	 * 
	 * ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
	 * 
	 * @param target 目标对象
	 */
	dumpToObject(target?: JSObject): JSObject;

	/**
	 * 用object中的属性覆盖对象
	 * * 静态方法可因此使用「`new C()`+`C.copyFromObject(json)`」实现
	 * @param source 源头对象
	 */
	copyFromObject(source: JSObject): T;

}
