import { OptionalRecursive } from 'matriangle-common/utils'
import { uint } from 'matriangle-legacy/AS3Legacy'
import BSColored from 'matriangle-mod-native/block/BSColored'

/**
 * 「二重颜色状态」是
 * * 「有线条颜色」的
 * 有颜色状态
 *
 * @property {uint} lineColor 线条颜色（十六进制颜色码）
 */
export default class BSBiColored extends BSColored {
	/** 内部线条颜色 */
	protected _lineColor: uint
	/** 线条颜色 */
	public get lineColor(): uint {
		return this._lineColor
	}
	public set lineColor(color: uint) {
		this._lineColor = color
	}

	//============Constructor & Destructor============//
	public constructor(lineColor: uint = 0xaaaaaa, fillColor: uint = 0xbbbbbb) {
		super(fillColor) // ! won't give the attributes // ↑上面的默认值是为了「白板构造函数」
		this._lineColor = lineColor
	}

	override destructor(): void {
		this._lineColor = 0
		super.destructor()
	}

	override copy(): BSBiColored {
		return new BSBiColored(this._lineColor, this._color)
	}

	/** @implements 软更新→返回自身 */
	override updateFrom(other: OptionalRecursive<BSBiColored>): this {
		// 父类更新
		super.updateFrom(other)
		// 软更新状态
		if (other.lineColor !== undefined) this.lineColor = other.lineColor
		// 返回自身
		return this
	}
}
