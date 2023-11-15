import {
	IJSObjectifiable,
	JSObject,
	JSObjectifyMap,
} from '../../../common/JSObjectify'
import { OptionalRecursive, key } from '../../../common/utils'
import { uint } from '../../../legacy/AS3Legacy'
import BlockAttributes from './BlockAttributes'

/**
 * 记录「方块状态」
 *
 * @example
 * * 「有方向状态」的「方向」
 * * 「有颜色状态」的「颜色」
 */
export default abstract class BlockState
	// 可被JS对象化（从而转换成JSON）
	implements IJSObjectifiable<BlockState>
{
	//============Constructor & Destructor============//
	/** 构造函数 */
	public constructor() {}

	/** 析构函数 */
	public destructor(): void {}

	// JS对象 //

	/**
	 * TODO: 有待实现
	 */
	get objectifyMap(): JSObjectifyMap {
		throw new Error('Method not implemented.')
	}

	/**
	 * 实现：获取一个「空状态/默认状态」
	 */
	abstract cloneBlank(): BlockState

	/**
	 * （深）拷贝
	 * @returns 一个与自身同类型的实例
	 *
	 * ! 使用`this`标注会导致「"BS_XXX" 可赋给 "this" 类型的约束，但可以使用约束 "BS_XXX" 的其他子类型实例化 "this"」
	 */
	abstract copy(): BlockState

	// Block //

	/**
	 * 从另一个相同类型的「方块状态」进行「部分化更新」
	 * * 一般是「软更新」
	 *   * 有状态⇒设置状态
	 *   * 无状态⇒不更改
	 *
	 * @returns 自身
	 */
	abstract updateFrom(other: OptionalRecursive<BlockState>): this

	/**
	 * 以随机状态初始化
	 * ! 原地操作：会改变自身
	 */
	abstract randomize(): this

	/**
	 * 通过链式操作设置自身
	 * * ✅使用「数组访问」格式设置值，仍然能触发`setter`
	 */
	public setState(options: { [k: key]: unknown }): this {
		for (const k in options) {
			// * AnyScript：直接使用数组访问设置值
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			;(this as any)[k] = options[k]
		}
		return this
	}

	/**
	 * 结合自身状态获取「完整属性」
	 * * 应用：「门」的开关状态
	 *
	 * * 📌理论上「基础属性+方块状态」足以推导出「完整属性」
	 *   * 所以实际上不需要「把属性纳入其中」，无需「把属性纳入『方块状态』」从而导致「方块状态没法为空」
	 *
	 * @param baseAttr 从Block传入的「基础属性」
	 * @default 默认行为：
	 */
	public getFullAttributes(baseAttr: BlockAttributes): BlockAttributes {
		return baseAttr
	}

	/**
	 * 基于「自身状态」「基础属性」计算「最终像素颜色」
	 * @param attributes 用于参考的「基础属性」
	 */
	public calculatePixelColor(attributes: BlockAttributes): uint {
		return attributes.defaultPixelColor
	}

	/**
	 * 基于「自身状态」「基础属性」计算「最终像素不透明度」
	 * @param attributes 用于参考的「基础属性」
	 */
	public calculatePixelAlpha(attributes: BlockAttributes): uint {
		return attributes.defaultPixelAlpha
	}

	// * 对接「显示端」 * //
	/**
	 * 获取「显示数据」
	 * * 本来这些「显示数据」就没多复杂。。。
	 *
	 * !【2023-11-15 21:11:43】本来要限制这里返回值的类型（以便匹配其自身属性）的，但现在：不是太行
	 */
	public abstract generateDisplayData(): IDisplayDataBlockState
}

/** 对接显示端的「门」数据 */
export interface IDisplayDataBlockState extends JSObject {}
