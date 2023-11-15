/**
 * 用于「远程WS交换信息」的显示
 * * 只用于「统一规定『方块呈现要什么数据』『实体呈现要什么数据』」
 * * 不用于规定「具体的『呈现者』对象」
 *
 * !【2023-11-15 18:16:30】梳理后的「本质思路」：
 * * 📍核心思想：整个「逻辑端显示数据」和「显示端显示数据」作为一个大object进行同步
 *   * 📌核心假设：显示端根据「显示端显示数据」就可以完全绘制出「环境图形」
 * * 每次「初始化」时，「逻辑端」向「显示端」发送完整的「显示数据」，作为「初始化数据」
 *   * 并且，只有「显示端」向「逻辑端」发送请求时，逻辑端才会回传相应的「显示数据」
 *     * 📌此即「响应式更新」的思想核心
 * * 在「初始化」后，对「显示端」的「刷新/更新」请求，「逻辑端」只会发送「已经更新而未同步的数据」
 *   * 此时「显示端」会根据这些「可选数据」进行「部分化更新」
 *     * 📌此即「部分化更新」的思想核心
 *   * 💡在处理「多显示端」的时候，或许可以通过以下方案解决「这边刷新了数据，后边就以为『没刷新』」的问题
 *     * 根据连接克隆多个「面向不同地址进行不同更新」的「逻辑端显示数据」
 *     * 这些「逻辑端显示数据」以「一对一」的关系，分别与各处「显示端显示数据」进行同步
 *     * ✨这样就无需再纠结「何时刷新掉『待更新数据』以便反映『数据已更新，后续可能无需再更新』」了
 *
 * @example
 *
 * 一个（逻辑端）node服务器（在从消息服务接收到消息后）要
 * 1. 把（母体的）方块/实体抽象为「图形显示の数据」
 * 2. 以JSON为载体传递「图形更新信息」
 *
 * 然后（显示端）浏览器客户端要
 * 1. 接收解析服务器信息
 * 2. 解析要更新哪些图形对象
 * 3. 推导要更新对象的哪些属性
 * 4. 具体去更改图形对象的属性（部分地，比如「透明度不变就不用更新」）
 *
 * TODO: 有待和`DisplayInterfaces.ts`整合
 */

import { OptionalRecursive2 } from 'matriangle-common'
import { int, uint } from 'matriangle-legacy/AS3Legacy'
import BlockState from '../server/block/BlockState'
import { typeID } from '../server/registry/IWorldRegistry'
import { key } from 'matriangle-common/utils'

/**
 * 状态数据 / 显示数据
 * * 一切「用于初始化、更新图形呈现的数据」的基类
 * * 用于存储一个Shape通用的东西
 *   * 目前对于「位置」还不知道要如何处理
 */
export interface IDisplayStateData {}

/**
 * 显示状态加载包
 * * 其中的「显示状态数据」都是「必选的」，以实现「显示状态初始化」
 */
export interface DisplayStateInitPackage extends IDisplayStateData {
	[proxyID: string]: IDisplayStateData
}

/**
 * 显示状态更新包
 * * 其中的所有「显示状态数据」都是「可选的」，以实现「部分更新」机制
 *   * 这种「可选性」是**递归**的，不受「键层次」的影响
 *   * 故每次更新时，都需要进行「非空判断」
 * * 这样也不用「为每个状态都写一个对应的『更新包』类型」了
 */
export interface DisplayStateRefreshPackage extends IDisplayStateData {
	[proxyID: string]: OptionalRecursive2<IDisplayStateData>
}

/**
 * 所有「数据呈现者」的统一接口
 * * 拥有「初始化」「更新」「销毁」三个主要功能
 *   * 分别对应「初始化」「更新」「销毁」三个阶段
 *   * 同时与显示API相互对接
 */
export interface IStateDisplayer<StateDataT extends IDisplayStateData> {
	/**
	 * （图形）初始化
	 * * 使用完整的「显示数据」
	 */
	shapeInit(data: StateDataT, ...otherArgs: any[]): void
	/**
	 * 图形更新
	 * * 使用部分的「显示数据」（补丁形式）
	 * @param data 需要更新的「显示数据补丁」
	 */
	shapeRefresh(
		data: OptionalRecursive2<StateDataT>,
		...otherArgs: any[]
	): void
	/**
	 * 图形销毁
	 * * 不使用任何「显示数据」
	 */
	shapeDestruct(...otherArgs: any[]): void
}

/** 作为常量的「坐标分隔符」 */
export const LOCATION_COORD_SEPARATOR: string = ' '

/**
 * 点⇒坐标字串
 * * 原理：即`join`方法
 */
export function pointToLocationStr(point: int[]): string {
	return point.join(LOCATION_COORD_SEPARATOR)
}

/**
 * 坐标字串⇒点
 * * 实际上可以是任何支持「数字索引」的对象
 */
export function locationStrToPoint<T extends int[] = int[]>(
	locationStr: string,
	target: T
): T {
	locationStr
		.split(LOCATION_COORD_SEPARATOR)
		.forEach((str: string, i: uint): void => {
			// ! target作为自由变量，无法分离以脱离闭包（提取为一个const）
			target[i] = parseInt(str)
		})
	return target
}

// * 具体针对「地图」「方块」「实体」的「显示数据类型」对接 * //

/**
 * 方块状态数据（全有）
 */
export interface IDisplayDataBlock<
	StateType extends BlockState | null = BlockState | null,
> extends IDisplayStateData {
	// ! 这里所有的变量都是「全可选」或「全必选」的
	blockID: typeID
	blockState: StateType
}

/**
 * 存储其中的「位置-方块数据」键值对
 */
export interface IDisplayDataMapBlocks {
	[location: string]: IDisplayDataBlock
}

/**
 * 地图的「显示数据」
 */
export interface IDisplayDataMap extends IDisplayStateData {
	/**
	 * 尺寸：整数数组
	 * * 用于显示时调整「地图大小」
	 *
	 * ! 并非实际呈现时的尺寸
	 */
	size: uint[]

	/**
	 * 方块数据：依据类似'x,y'的字符串为索引存储的数据
	 * * 用于更新方块
	 */
	blocks: IDisplayDataMapBlocks
}

/**
 * 存储所有实体列表的数据
 */

/**
 * 实体的「显示数据」
 * * 【2023-11-14 19:50:31】目前实体的情况：
 *   * 有一些像「方块坐标」「朝向」「xy缩放尺寸」的「基本属性」，但对「特殊属性」的需求比「方块」大
 *   * 可能需要通过「显示代理」传递「显示数据」
 * * 当下的处理思路：类似「多继承」的思想，但需要和一类「显示代理」绑定
 *   * 使用「显示代理」的getter/setter，将「修改属性」转换成「更新数据」
 *   * 这里「显示代理」类似一种「待更新数据缓冲区」的角色
 *
 * !【2023-11-15 18:15:39】这里的`id`应该作为「字典键」的形式被
 */
export interface IDisplayDataEntity extends IDisplayStateData {
	/**
	 * 记录实体用于更新的「唯一识别码」
	 * * 用于在「逻辑端实体」和「显示端实体」间建立连接
	 *   * 如：指派「哪个『实体呈现者』需要被更新」
	 */
	id: string

	/**
	 * 记录实体的「类型」
	 * * 用于显示端结合状态进行绘图
	 *   * 如：「id=玩家」⇒绘制玩家图形，「id=奖励箱」⇒绘制奖励箱图形
	 */
	type: typeID

	/**
	 * 记录实体的「附加状态」
	 */
	state: IEntityState
}

/**
 * 所有实体通用的「实体状态」类型
 * * 此处的「实体状态」直接作为数据进行传输
 * @example 想法笔记
 * 实体将使用一个uuid作为其标识符，并且这不由「实体」本身存储——实体自身的「实体状态」，即为「实体」这个「具有能动的方法的类」本身存储，
 * 类似 entities: {
 *     id: string
 *     type: string
 *     state: {customName: XXX, ...}
 * }
 */
export interface IEntityState {
	[stateName: key]: unknown
}

/**
 * 所有实体通用的「显示代理」接口
 * * 定义了一套修改「实体状态」的方法
 * * 允许实体将自身自定义数据存入「实体状态」中
 */
export interface IDisplayProxyEntity {
	// * 面向「可视化」：显示端负责获取、呈递、清洗（并传输）数据 * //

	/**
	 * 获取完整的「显示数据」
	 * * 面向「可视化」：数据由此转换为JSON，并最后传递给显示端显示
	 * * 用于实体显示的「初始化」
	 */
	get displayDataFull(): IDisplayDataEntity

	/**
	 * 获取**用于更新**的「显示数据」
	 * * 面向「可视化」：数据由此转换为JSON，并最后传递给显示端显示
	 * * 用于实体显示的「更新」
	 * * 与{@link flushDisplayData}搭配使用
	 *
	 * ! 无副作用：若需要「获取并清洗」则需要调用{@link flushDisplayData}
	 *
	 * @returns 返回「待更新显示数据」（作为「显示数据」的部分）
	 */
	get displayDataToRefresh(): OptionalRecursive2<IDisplayDataEntity>

	/**
	 * 清洗「待更新显示数据」
	 * * 清除「需要被传递到『显示端』以便更新」的数据
	 *   * 以此实现「部分化更新」
	 * *【2023-11-15 18:27:34】现在无需纠结「从何处调用」和「何时调用」的问题
	 *   * 应用：在通过{@link displayDataToRefresh}获取「待更新数据」、转换成JSON后，再执行此方法进行清除
	 *
	 * ! 副作用：调用以后，从{@link displayDataToRefresh}将无法获得有作用的「待更新显示数据」
	 *
	 * @returns 返回「待更新显示数据」
	 */
	flushDisplayData(): void

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
}

/**
 * 所有实体通用的「显示代理」类型
 * * 复合了相应的「显示数据」和「实体状态」
 */
export class DisplayProxyEntity implements IDisplayProxyEntity {
	/**
	 * 用于存储「当前的实体数据」
	 * * 主要用于「初始化」
	 */
	protected _data: IDisplayDataEntity = {
		id: '',
		type: '',
		state: {},
	}

	get displayDataFull(): IDisplayDataEntity {
		return this._data
	}

	/**
	 * 用于统一存储要复用的「实体状态」
	 *
	 * ! 与{@link _data.state}不同的对象，这样其键值对不会相互干扰——因为后续需要删除
	 */
	protected _stateToRefresh: IEntityState = {}
	/**
	 * 用于存储「更新时会传递的实体数据」
	 * * 主要用于「部分化更新」
	 */
	protected _dataToRefresh: OptionalRecursive2<IDisplayDataEntity> = {
		id: '',
		type: '',
		state: this._stateToRefresh as OptionalRecursive2<IEntityState>, // ! 这里保证「一定有」，但不保证「有东西」
	}

	get displayDataToRefresh(): OptionalRecursive2<IDisplayDataEntity> {
		return this._dataToRefresh
	}

	/** @implements 清除`_dataToRefresh`在`type`的值，并清除`state`上的所有属性 */
	flushDisplayData(): void {
		// 清除`type`的值
		delete this._dataToRefresh.type
		// 清除`state`上所有属性
		for (const key in this._stateToRefresh) {
			delete this._stateToRefresh[key]
		}
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

	// * 实现「显示代理」接口：代理修改，将其全部视作「更新状态」 * //

	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get scaleX(): number {
		return (this._data.state?.scaleX as number) ?? (this.scaleX = 1)
	}
	set scaleX(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.scaleX = this._stateToRefresh.scaleX = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get scaleY(): number {
		return (this._data.state?.scaleY as number) ?? (this.scaleY = 1)
	}
	set scaleY(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.scaleY = this._stateToRefresh.scaleY = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get isVisible(): boolean {
		return (
			(this._data.state?.isVisible as boolean) ?? (this.isVisible = true)
		)
	}
	set isVisible(value: boolean) {
		// * 存储自身两个「显示数据」的值
		this._data.state.isVisible = this._stateToRefresh.isVisible = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get position(): number[] {
		return (this._data.state?.position as number[]) ?? (this.position = [])
	}
	set position(value: number[]) {
		// * 存储自身两个「显示数据」的值
		this._data.state.position = this._stateToRefresh.position = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get direction(): uint {
		return (this._data.state?.direction as uint) ?? (this.direction = 0)
	}
	set direction(value: uint) {
		// * 存储自身两个「显示数据」的值
		this._data.state.direction = this._stateToRefresh.direction = value
	}
	/** @implements 有属性⇒直接返回；无属性⇒undefined⇒初始化+返回 */
	get alpha(): number {
		return (this._data.state?.alpha as number) ?? (this.alpha = 1)
	}
	set alpha(value: number) {
		// * 存储自身两个「显示数据」的值
		this._data.state.alpha = this._stateToRefresh.alpha = value
	}
}
