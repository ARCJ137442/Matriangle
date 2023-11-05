import { uint } from 'matriangle-legacy/AS3Legacy'
import { randInt } from 'matriangle-common/exMath'
import BlockState from 'matriangle-api/server/block/BlockState'

/**
 * 「有颜色状态」是
 * * 「有颜色」的
 * 方块状态
 *
 * !【2023-10-16 23:43:32】现在作为「原生」模组的一部分
 * * 除「演示『方块状态的注册』」外，也有「预置能快速用于（视觉）机制的工具」的作用
 *   * 例如：通过读写其中的`color`值，实现所谓「有颜色方块」，可用于「最基本的视觉识别区分」
 *
 * @property {uint} color 十六进制颜色码
 */
export default class BSColored extends BlockState {
	protected _color: uint

	//============Constructor & Destructor============//
	public constructor(color: uint = 0x000000) {
		super()
		this._color = color
	}

	override destructor(): void {
		this._color = 0
		super.destructor()
	}

	copy(): BSColored {
		return new BSColored(this._color)
	}

	cloneBlank(): BSColored {
		return new BSColored(0x000000)
	}

	randomize(): this {
		this._color = randInt(0xffffff)
		return this
	}

	//============Display Implements============//
	public get color(): uint {
		return this._color
	}

	public set color(value: uint) {
		if (this._color != value) {
			this._color = value
		}
	}

	override calculatePixelColor(): uint {
		return this._color
	}
}
