import { uint } from "../../../../legacy/AS3Legacy";
import { randomBoolean2 } from "../../../../common/utils";
import BlockState from "../../../api/block/BlockState";
import BlockAttributes from "../../../api/block/BlockAttributes";

/**
 * 用于存储「门」的开闭
 * * 其在最初获取「最终方块属性」时缓存之，并且只在此之上diff
 */
export default class BSGate extends BlockState {

	cloneBlank(): BlockState {
		return new BSGate(false);
	}

	randomize(): this {
		this._open = randomBoolean2();
		return this;
	}

	copy(): this {
		return new BSGate(this._open) as this;
	}

	//============Constructor & Destructor============//
	public constructor(open: boolean) {
		super();
		this._open = open;
	}

	override destructor(): void {
		this._open = false;
		super.destructor();
	}


	//============World Mechanics============//
	protected _open: boolean;
	public get open(): boolean { return this._open }
	public set open(open: boolean) { this._open = this.updateOpen(open); }

	/**
	 * 更新属性「是否打开」
	 */
	protected updateOpen(open: boolean): boolean {
		if (this._temp_fullAttr !== undefined) {
			// 玩家通过
			this._temp_fullAttr.canEnter = open;
			// 子弹通过
			this._temp_fullAttr.canShotIn = open;
			this._temp_fullAttr.electricResistance = open ?
				0 :
				this._temp_fullAttr_electricResistanceClosed
			this._temp_fullAttr.defaultPixelAlpha = (open ? 0.25 : 1) * this._temp_fullAttr_pixelAlpha
		}
		return open;
	}
	protected _temp_fullAttr_pixelAlpha: uint = 0;
	protected _temp_fullAttr_electricResistanceClosed: uint = 0;

	/**
	 * @override 根据门的「开关」状态，修改其中的「可通过」属性
	 */
	override getFullAttributes(baseAttr: BlockAttributes): BlockAttributes {
		if (this._temp_fullAttr === undefined) {
			// 缓存整个属性
			this._temp_fullAttr = baseAttr.copy();
			// 缓存需要临时改变的属性
			this._temp_fullAttr_pixelAlpha = this._temp_fullAttr.defaultPixelAlpha;
			this._temp_fullAttr_electricResistanceClosed = this._temp_fullAttr.electricResistance;
			// 更新属性
			this.updateOpen(this._open);
		}
		// 使用自身缓存的属性 // ! 绝对由状态完全决定，无需存储到JS对象中
		return this._temp_fullAttr
	}
	protected _temp_fullAttr?: BlockAttributes;

}
