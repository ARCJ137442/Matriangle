import { addNReturnKey, identity, key } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { IDisplayable } from '../../display/DisplayInterfaces'
import BlockAttributes from './BlockAttributes'
import {
	IJSObjectifiable,
	JSObject,
	JSObjectifyMap,
	fastAddJSObjectifyMapProperty_dash,
	fastGenerateJSObjectifyMapProperty,
	loadRecursiveCriterion_false,
	loadRecursiveCriterion_true,
	uniLoadJSObject,
} from 'matriangle-common/JSObjectify'
import { typeID } from '../registry/IWorldRegistry'
import BlockState, { IDisplayDataBlockState } from './BlockState'
import { IDisplayDataBlock } from '../../display/RemoteDisplayAPI'

/**
 * One of the fundamental element in BaTr
 *
 * !【2023-10-02 23:12:26】方块不存储位置信息
 *
 * TODO: 【2023-09-24 18:42:16】这玩意儿也要参与序列化吗？
 */
export default class Block<BS extends BlockState | null = BlockState | null>
	implements IDisplayable<IDisplayDataBlock>, IJSObjectifiable<Block<BS>>
{
	// JS对象 //

	/** JS对象化映射表 */
	// TODO: 【2023-09-24 18:43:55】有待建设。一个方法是借助BlockType等对象存储「id」借以映射到类，再往各个类塞入「模板函数」（累）
	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {}
	get objectifyMap(): JSObjectifyMap {
		return Block.OBJECTIFY_MAP
	}

	/**
	 * 🔬ID：用于在「对象化」前后识别出「是哪一个类」
	 * * 默认返回的是「其类型之名」，技术上是「构造函数的名字」
	 */
	// public abstract readonly id: BlockID;
	public readonly id: typeID
	// public get id(): string { return this.type.name }
	// public set id(never: string) { } // 空setter，代表「不从外界获得id」 // ! 但实际上会被「非法id」筛掉
	public static readonly key_id: key = addNReturnKey(
		this.OBJECTIFY_MAP,
		'id',
		fastGenerateJSObjectifyMapProperty(
			'id',
			'string',
			identity,
			identity,
			loadRecursiveCriterion_false
		)
	)

	/**
	 * 存储「方块状态」
	 */
	protected _state: BS
	public get state(): BS {
		return this._state
	}
	public static readonly key_state: key = fastAddJSObjectifyMapProperty_dash(
		this.OBJECTIFY_MAP,
		'_state',
		BlockState,
		identity,
		identity,
		loadRecursiveCriterion_true // 一定要递归加载
	)

	/**
	 * 实现「复制白板」：深拷贝各参数
	 */
	cloneBlank(): Block<BS> {
		return this.deepCopy()
	}

	/**
	 * 方块的「基础属性」
	 *
	 * ! 该属性是「共享引用」的：其自身平时无需存储其值，只需共用一个导出的常量
	 */
	protected _baseAttributes: BlockAttributes
	/**
	 * 方块的（外显）属性
	 * * 决定了方块在「世界的通用机制」上的行为
	 *   * 例如：「是否允许玩家通过」
	 * * 内部计算逻辑：基础叠加
	 *   * 状态为空⇒直接返回「基础属性」
	 *   * 有状态⇒与状态「叠加」出「最终属性」
	 */
	public get attributes(): BlockAttributes {
		return this._state === null
			? this._baseAttributes
			: this._state.getFullAttributes(this._baseAttributes)
	}
	// TODO: 还缺一个「属性对象化」逻辑

	/**
	 * @param typeMap 用于「id⇒白板对象」的构造函数
	 * @override 从JS对象中加载，并且附带一个「id⇒白板对象」的映射
	 */
	public static fromJSObject(
		jso: JSObject,
		typeMap: Map<typeID, () => Block>
	): Block {
		if (jso?.id === undefined) throw new Error('方块类型不存在！')
		const blankConstructor: (() => Block) | undefined = typeMap.get(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			(jso as any).id
		)
		if (blankConstructor === undefined)
			throw new Error(`方块类型${jso.id?.toString()}不存在！`)
		return uniLoadJSObject(
			blankConstructor(), // 用「白板构造函数」来获取「白板对象」
			jso
		)
	}

	//============Constructor & Destructor============//
	/**
	 * 构造方法
	 *
	 * @param id 设置的方块ID
	 * @param baseAttributes 传入的「方块属性」
	 * @param state 设置的方块状态
	 */
	public constructor(id: typeID, baseAttributes: BlockAttributes, state: BS) {
		this.id = id
		this._baseAttributes = baseAttributes
		this._state = state
	}

	public destructor(): void {
		// this._state = null; // !【2023-10-07 17:51:52】因为需要满足类型规范，故无法消除引用
	}

	/**
	 * （浅）拷贝
	 * * 属性：引用
	 * * 状态：引用
	 * @returns 浅拷贝后的自身，所有「属性」「状态」的引用不变
	 */
	public copy(): Block<BS> {
		return new Block<BS>(this.id, this._baseAttributes, this._state)
	}

	/**
	 * 软拷贝
	 * * 属性：引用
	 * * 状态：值
	 *
	 * @returns 软拷贝后的自身，「属性」不变而「状态」全新
	 */
	public softCopy(): Block<BS> {
		return new Block<BS>(
			this.id,
			this._baseAttributes,
			(this._state === null ? null : this._state.copy()) as BS
		)
	}

	/**
	 * 深拷贝
	 * * 属性：值
	 * * 状态：值
	 *
	 * @returns 深拷贝后的自身，「属性」「状态」都是全新的
	 */
	public deepCopy(): Block<BS> {
		return new Block<BS>(
			this.id,
			this._baseAttributes.copy(),
			(this._state === null ? null : this._state.copy()) as BS
		)
	}

	/**
	 * 随机化状态
	 */
	public randomizeState(): this {
		this._state?.randomize()
		return this
	}

	/**
	 * 通过链式操作设置自身
	 * * ✅使用「数组访问」格式设置值，仍然能触发`setter`
	 */
	public setState(options: { [k: key]: unknown }): this {
		this.state?.setState(options)
		return this
	}

	//============Display Implements============// ? 日后可能不再留在这里
	protected _zIndex: uint = 0
	get zIndex(): uint {
		return this._zIndex
	}
	set zIndex(value: uint) {
		this._zIndex = value
		// TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
	}

	/** Determinate the single-pixel color */
	public get pixelColor(): uint {
		return this._state === null
			? this.attributes.defaultPixelColor // default
			: this._state.calculatePixelColor(this.attributes)
	}

	/** 像素不透明度：使用「整数百分比」表示 */
	public get pixelAlpha(): uint {
		return this._state === null
			? this.attributes.defaultPixelAlpha // default
			: this._state.calculatePixelAlpha(this.attributes)
	}

	// TODO: 有待改进

	/** 可显示 */
	public readonly i_displayable = true as const

	getDisplayDataInit(): IDisplayDataBlock<IDisplayDataBlockState | null> {
		return {
			id: this.id,
			state: this.state?.generateDisplayData() ?? null,
		}
	}

	getDisplayDataRefresh(): IDisplayDataBlock<IDisplayDataBlockState | null> {
		// TODO: 暂时是「所有数据都需要更新」
		return this.getDisplayDataInit()
	}
}
