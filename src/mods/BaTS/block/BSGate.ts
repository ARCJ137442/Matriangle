import BlockAttributes from 'matriangle-api/server/block/BlockAttributes'
import BlockState, {
	IDisplayDataBlockState,
} from 'matriangle-api/server/block/BlockState'
import { OptionalRecursive, randomBoolean2 } from 'matriangle-common/utils'
import { int$MIN_VALUE, uint, int } from 'matriangle-legacy/AS3Legacy'

/**
 * 用于存储「门」的开闭
 * * 其在最初获取「最终方块属性」时缓存之，并且只在此之上diff
 */
export default class BSGate extends BlockState {
	cloneBlank(): BlockState {
		return new BSGate(false)
	}

	randomize(): this {
		this._open = randomBoolean2()
		return this
	}

	copy(): this {
		// ! "BSGate" 可赋给 "this" 类型的约束，但可以使用约束 "BSGate" 的其他子类型实例化 "this"。
		return new BSGate(this._open) as this
	}

	/** @implements 从别处更新，并且附带更新「方块属性」 */
	updateFrom(other: OptionalRecursive<BSGate>): this {
		// 软更新状态
		if (other.open !== undefined) this.open = other.open
		// 返回自身
		return this
	}

	//============Constructor & Destructor============//
	public constructor(open: boolean) {
		super()
		this._open = open
	}

	override destructor(): void {
		this._open = false
		super.destructor()
	}

	//============World Mechanics============//
	protected _open: boolean
	public get open(): boolean {
		return this._open
	}
	public set open(open: boolean) {
		this._open = this.updateOpen(open)
	}

	/**
	 * 更新属性「是否打开」
	 */
	protected updateOpen(open: boolean): boolean {
		if (this._temp_fullAttr !== undefined) {
			// 玩家通过
			this._temp_fullAttr.canEnter = open
			// 子弹通过
			this._temp_fullAttr.canShotIn = open
			// 透明（激光通过）
			this._temp_fullAttr.transparent = open
			// 电流抗性
			this._temp_fullAttr.electricResistance = open
				? 0
				: this._temp_fullAttr_electricResistance
			// 玩家伤害
			this._temp_fullAttr.playerDamage = open
				? int$MIN_VALUE
				: this._temp_fullAttr_playerDamage
			// 呈现不透明度
			this._temp_fullAttr.defaultPixelAlpha = open
				? this._temp_fullAttr_pixelAlpha >> 2 // 四分之一透明度
				: this._temp_fullAttr_pixelAlpha
		}
		return open
	}
	protected _temp_fullAttr_pixelAlpha: uint = 0
	protected _temp_fullAttr_playerDamage: int = -1
	protected _temp_fullAttr_electricResistance: uint = 0

	/**
	 * @override 根据门的「开关」状态，修改其中的「可通过」属性
	 */
	override getFullAttributes(baseAttr: BlockAttributes): BlockAttributes {
		if (this._temp_fullAttr === undefined) {
			// 缓存整个属性
			this._temp_fullAttr = baseAttr.copy()
			// 缓存需要临时改变的属性
			this._temp_fullAttr_pixelAlpha =
				this._temp_fullAttr.defaultPixelAlpha
			this._temp_fullAttr_playerDamage = this._temp_fullAttr.playerDamage
			this._temp_fullAttr_electricResistance =
				this._temp_fullAttr.electricResistance
			// 更新属性
			this.updateOpen(this._open) // !【2023-10-08 21:00:18】就是应该只有在「状态改变」时更新，除此之外应该不用更新
		}
		// 使用自身缓存的属性 // ! 绝对由状态完全决定，无需存储到JS对象中
		return this._temp_fullAttr
	}
	protected _temp_fullAttr?: BlockAttributes

	/** @implements 生成显示数据 */
	generateDisplayData(): IDisplayDataBSGate {
		return {
			open: this._open,
		}
	}
}

/** 对接显示端的「门」数据 */
export interface IDisplayDataBSGate extends IDisplayDataBlockState {
	open: boolean
}
