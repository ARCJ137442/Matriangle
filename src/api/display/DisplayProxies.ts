/**
 * 本文件存储一些「显示代理」类型
 * * 用于最大化分离「逻辑功能」与「显示更新」
 */
import {
	Optional,
	OptionalRecursive2,
	clearObjectKeys,
} from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { typeID } from '../server/registry/IWorldRegistry'
import {
	IDisplayDataEntityState,
	IDisplayDataEntity,
	IDisplayData,
	IDisplayDataMap,
	pointToLocationStr,
} from './RemoteDisplayAPI'
import { iPoint, iPointRef } from 'matriangle-common'
import { IDisplayable } from './DisplayInterfaces'
import Block from '../server/block/Block'
import BlockState from '../server/block/BlockState'
import IMapStorage from '../server/map/IMapStorage'

// * 整体代理 * //
/**
 * 所有「显示代理」所实现的总接口
 * * 均实现「可显示对象」
 */
export interface IDisplayProxy<DisplayDataT extends IDisplayData>
	extends IDisplayable<DisplayDataT> {}

// * 地图代理 * //

/**
 * 所有地图通用的「代理接口」
 * * 实质上只需是「存储结构」接口
 */
export interface IDisplayProxyMap extends IDisplayProxy<IDisplayDataMap> {
	/** 更新尺寸 */
	updateSize(size: uint[]): void
	/** 更新方块 */
	updateBlock(location: iPoint, block: Block): void
}

/**
 * 「地图代理」的标准实现
 */
export class DisplayProxyMap implements IDisplayProxyMap {
	readonly i_displayable = true as const

	// * 自身数据构造 * //

	/** 完整显示数据 */
	protected _data: IDisplayDataMap = {
		blocks: {},
	} as IDisplayDataMap // ! 一定会在构造函数中补完

	/** 待更新显示数据 */
	protected _dataToRefresh: OptionalRecursive2<IDisplayDataMap> = {
		blocks: {},
	}

	/** 构造函数 */
	public constructor(storage: IMapStorage) {
		// 尺寸更新
		this.updateSize(storage.size)
		// 遍历所有位置，存储方块
		storage.forEachValidPositions((p: iPointRef): void => {
			this.updateBlock(
				p, // 获取方块
				storage.getBlock(p)
			)
		})
	}

	/** @implements 直接更新 */
	updateSize(size: uint[]): void {
		this._data.size = this._dataToRefresh.size = [...size] // !【2023-11-19 02:40:57】复制一个，避免转换成
	}
	/**
	 * @implements 直接使用「方块」对象更新
	 * TODO: 目前一个问题——方块状态被其它地方改变（如「门の开关」）后，无法及时进行更新
	 */
	updateBlock(
		location: iPointRef,
		block: Block<BlockState | null> | null
	): void {
		const locationStr: string = pointToLocationStr(location)
		this._data.blocks[locationStr] = this._dataToRefresh.blocks![
			locationStr
		] =
			block === null
				? null
				: {
						id: block.id,
						// !【2023-11-15 21:18:36】现在不再直接使用（逻辑上的）「方块状态」了——现在使用「方块状态的显示数据」
						state: block.state?.generateDisplayData() ?? null,
				  }
	}

	// * 标准显示接口 * //

	getDisplayDataInit(): IDisplayDataMap {
		return this._data
	}

	getDisplayDataRefresh(): OptionalRecursive2<IDisplayDataMap> {
		return this._dataToRefresh
	}

	/** @implements 删除`size`属性，删除`blocks`中的所有内容 */
	flushDisplayData(): void {
		// -size
		delete this._dataToRefresh.size
		// -blocks.*
		for (const key in this._dataToRefresh.blocks)
			delete this._dataToRefresh.blocks[key]
	}
}

// * 实体代理 * //

/**
 * 所有实体通用的「显示代理」接口
 * * 定义了一套修改「实体状态」的方法
 * * 允许实体将自身自定义数据存入「实体状态」中
 */
export interface IDisplayProxyEntity<
	EntityStateT extends IDisplayDataEntityState,
> extends IDisplayProxy<IDisplayDataEntity<EntityStateT>> {
	// * 面向「逻辑端」：逻辑端负责读写属性 * //
	/**
	 * 决定图形x轴上的「缩放尺寸」
	 * * 取值范围：[0.0, +∞)，即「百分比的0~1表示法」
	 */
	get scaleX(): number
	set scaleX(value: number)

	/**
	 * 决定图形y轴上的「缩放尺寸」
	 * * 取值范围：[0.0, +∞)，即「百分比的0~1表示法」
	 */
	get scaleY(): number
	set scaleY(value: number)

	/**
	 * 图形「是否可见」
	 * ! 覆盖alpha属性：不可见时alpha属性无意义
	 */
	get isVisible(): boolean
	set isVisible(value: boolean)

	/**
	 * 图形的「方块坐标」
	 * * 可以是整数，也可以是浮点数
	 * * 重点在「与地图呈现座标系对齐」
	 *   * 如：地图中`[0,0]`的坐标和实体`[0~1,0~1]`重合
	 *
	 * @default 0（原点）
	 */
	get position(): number[]
	set position(value: number[])

	/**
	 * 图形的「朝向」
	 * * 类型：「任意维整数角」
	 * @default 0（x轴正方向）
	 * @type {mRot} 实际上用「无符号整数」存储
	 */
	get direction(): uint
	set direction(value: uint)

	/**
	 * 图形的**不透明度**
	 * 范围：[0, 1]（完全不可见/完全可见）
	 */
	get alpha(): number
	set alpha(value: number)

	// * 自定义「实体状态」支持 * //
	/**
	 * 向「实体状态」中存储自定义数据
	 *
	 * // @template State 用于「检验stateName是否合法」并「自动推导value的类型」的类型
	 * ! ↑ 现在直接在接口上用`EntityStateT`指代这时的「自定义实体状态」类型
	 * @param stateName 自定义数据名称
	 * @param {Primitive} value 自定义数据 // ! 只能是「可被JS对象化」的类型
	 * @returns value
	 *
	 * !【2023-11-15 20:44:55】注意：这里`extends IEntityState`非必要的缘由：`IEntityState包含了所有的key，所以限定了无法标记类型`
	 * ?【2023-11-15 22:44:53】↑但其实现在的`JSObject`也一样
	 *
	 * 📝Typescript避免「重构属性以后，直接使用`.`访问的属性改了，但使用`[key]`访问的属性没改
	 * * 🔎问题起因：`key`是个自面量，不会被一般的「重构」重命名
	 * * 📌实现思路：键值对模板公示 + `keyof`限定 + `typeof name`约束
	 *   * 使用一个类型`StateTemplate`规定「这个状态里应该只有哪些『字符串自面量』可访问」
	 *   * 使用`keyof`限定`name`的类型，确保`name`是`StateTemplate`中定义的键名
	 *   * 使用`typeof name`约束`data`的类型，确保`data`是`StateTemplate`中`name`对应的值类型
	 * * 📌【2023-11-15 23:11:27】血泪教训：使用多个`key of`会导致「几个地方的`key of`指代不同」
	 *   * 从而导致「看似能用`Keys[typeof k]`去指代『`Keys[k]`对应的类型』，但实际上报错『可以使用无关的子类实例化』」问题
	 *   * 📍SOLUTION: 使用一个统一（自动推断）的类型参数<K extends keyof Keys>去预先指定`k: K`，
	 *     * 以保证整个类型的统一性
	 *
	 * !【2023-11-15 22:44:30】似乎使用泛型类型时，因为「用其它子类型实例化」无法正确推导并约束字符串⇒所以有时还是需要特别指定泛型参数
	 *
	 * @example 实现这种「键名合法性检测」的示例代码
	 *
	 * type StateTemplate = {
	 *     name?: string
	 * }
	 *
	 * class State<T> {
	 *     setState<K extends keyof T>(name: K, data: T[K]): void {
	 *     	console.log(`this[${String(name)}] = ${String(data)}`)
	 *     }
	 * }
	 *
	 * const s = new State<StateTemplate>()
	 * s.setState('name', 'string')
	 * s.setState('name', undefined) // 这个被允许，是因为它是「可选」的
	 * s.setState('any', '这个现在不可能发生了') // ! 取消注释，就会报错「类型"any””的参数不能赋给类型“"name””的参数。 ts(2345)」

	 */
	storeState<K extends keyof EntityStateT>(
		/* <State extends IEntityState=EntityStateT> */
		stateName: K,
		value: EntityStateT[K]
	): EntityStateT[K]

	/** 这次是一次性设置多个对象 */
	storeStates(state: Optional<EntityStateT>): void

	/**
	 * 查询「实体状态」中的自定义数据
	 * * 查询范围是「当前实体数据」而非「待更新实体数据」
	 *
	 * ! 这里因为`keyof EntityStateT`没有复用需求，所以无需提取成「函数类型参数」
	 *
	 * @template State 用于「检验stateName是否合法」并「自动推导value的类型」的类型
	 * @param stateName 自定义数据名称
	 * @returns 「当前实体状态」中是否有「自定义数据」
	 */
	hasState(stateName: keyof EntityStateT): boolean

	/**
	 * 查询「实体状态」中的自定义数据
	 * * 查询范围是「待更新实体数据」而非「当前实体数据」
	 *
	 * ! 这里因为`keyof EntityStateT`没有复用需求，所以无需提取成「函数类型参数」
	 *
	 * @template State 用于「检验stateName是否合法」并「自动推导value的类型」的类型
	 * @param stateName 自定义数据名称
	 * @returns 「待更新实体数据」中是否有「自定义数据」
	 */
	hasStateToRefresh(stateName: keyof EntityStateT): boolean
}

/**
 * 所有实体通用的「显示代理」类型
 * * 标准实现
 * * 复合了相应的「显示数据」和「实体状态」
 */
export class DisplayProxyEntity<EntityStateT extends IDisplayDataEntityState>
	implements IDisplayProxyEntity<EntityStateT>
{
	i_displayable = true as const

	/**
	 * 构造函数
	 * * 用于初始化`id`值
	 */
	public constructor(id: typeID) {
		// 初始化数据
		this._data = {
			id,
			state: {} as EntityStateT, // !【2023-11-15 22:20:11】都必定包含空对象`{}`
		}
		this._dataToRefresh = {
			// !【2023-11-15 22:27:19】这里的「空对象」一定是JS对象——保证「一定有」，但不保证「有东西」
			state: (this._stateToRefresh = {} as EntityStateT),
		} // !【2023-11-15 22:16:03】这里保证「一定是这个类型」
	}
	/**
	 * 用于存储「当前的实体数据」
	 * * 主要用于「初始化」
	 */
	protected _data: IDisplayDataEntity<EntityStateT>

	getDisplayDataInit(): IDisplayDataEntity<EntityStateT> {
		return this._data
	}

	protected _stateToRefresh: EntityStateT
	/**
	 * 用于存储「更新时会传递的实体数据」
	 * * 主要用于「部分化更新」
	 */
	protected _dataToRefresh: OptionalRecursive2<
		IDisplayDataEntity<EntityStateT>
	>

	getDisplayDataRefresh(): OptionalRecursive2<
		IDisplayDataEntity<EntityStateT>
	> {
		return this._dataToRefresh
	}

	/** @implements 清除`_dataToRefresh`在`type`的值，并清除`state`上的所有属性 */
	flushDisplayData(): void {
		// 清除`type`的值
		delete this._dataToRefresh.id
		// 清除`state`上所有属性
		clearObjectKeys(this._stateToRefresh)
	}

	/* // !【2023-11-15 17:41:23】Proxy暂时还用不熟练
	protected _dataStateProxy = new Proxy(this._data.state, {
		get<T>(target: IDisplayDataEntity, key: string, receiver: any): T {
			return (this._data.state?.[key] as T) ?? (this._dataStateProxy[key] = 1)
		},
		set(target: IDisplayDataEntity, key: string, receiver: any): boolean {
			target[key] =  value
			return true
		},
	}) */
	// * 实现「显示代理」接口：对「自定义实体状态」进行修改 * //
	storeState<K extends keyof EntityStateT>(
		/* <State extends IEntityState=EntityStateT> */
		stateName: K,
		value: EntityStateT[K]
	): EntityStateT[K] {
		// * 存储自身两个「显示数据」的值 // ! 这里的`State`是`IEntityState`类型
		this._data.state[stateName] = this._stateToRefresh[stateName] = value
		// 返回设置的值
		return value
	}

	storeStates(state: EntityStateT): void {
		for (const key in state) {
			this.storeState(
				key,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
				state[key] as any // !【2023-11-15 21:00:14】这里实在不清楚为啥对不上，也实在没法as到一个合适的类型
			)
		}
	}

	hasState /* <State extends IEntityState> */(
		stateName: keyof EntityStateT
	): boolean {
		return stateName in this._data.state
	}

	hasStateToRefresh /* <State extends IEntityState> */(
		stateName: keyof EntityStateT
	): boolean {
		return stateName in this._stateToRefresh
	}

	getState /* <State extends IEntityState> */(
		stateName: keyof EntityStateT // ! 这里的`& key`是为了能用`stateName`索引`IEntityState`类型
	): EntityStateT[typeof stateName] | undefined {
		return this._data.state?.[stateName] as
			| EntityStateT[typeof stateName]
			| undefined
	}

	getStateToRefresh /* <State extends IEntityState> */(
		stateName: keyof EntityStateT
	): EntityStateT[typeof stateName] | undefined {
		return this._stateToRefresh?.[stateName] as
			| EntityStateT[typeof stateName]
			| undefined
	}

	// * 实现「显示代理」接口：代理修改，将其全部视作「更新状态」 * //
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get scaleX(): number {
		return this._data.state?.scaleX ?? (this.scaleX = 1)
	}
	set scaleX(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.scaleX = this._stateToRefresh.scaleX = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get scaleY(): number {
		return this._data.state?.scaleY ?? (this.scaleY = 1)
	}
	set scaleY(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.scaleY = this._stateToRefresh.scaleY = value
	}

	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get isVisible(): boolean {
		return this._data.state?.isVisible ?? (this.isVisible = true)
	}
	set isVisible(value: boolean) {
		// * 存储自身两个「显示数据」的值
		this._data.state.isVisible = this._stateToRefresh.isVisible = value
	}

	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get position(): number[] {
		return this._data.state?.position ?? (this.position = [])
	}
	set position(value: number[]) {
		// * 存储自身两个「显示数据」的值
		this._data.state.position = this._stateToRefresh.position = value
	}

	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get direction(): uint {
		return this._data.state?.direction ?? (this.direction = 0)
	}
	set direction(value: uint) {
		// * 存储自身两个「显示数据」的值
		this._data.state.direction = this._stateToRefresh.direction = value
	}

	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get alpha(): number {
		return this._data.state?.alpha ?? (this.alpha = 1)
	}
	set alpha(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.alpha = this._stateToRefresh.alpha = value
	}
}
