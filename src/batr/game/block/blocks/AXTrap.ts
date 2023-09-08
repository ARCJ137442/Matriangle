import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import BlockAttributes from "../BlockAttributes";
import BlockColored from "./Colored";

export default abstract class AbstractBlockXTrap extends BlockColored {

	//============Constructor & Destructor============//
	public constructor(color: uint, attributes: BlockAttributes) {
		super(color);
		this._attributes = attributes;
	}

	//============Display Implements============//
	protected static readonly LINE_SIZE: uint = DEFAULT_SIZE / 20;
	protected static readonly ALPHA: number = 1;
	protected static readonly ALPHA_BACK: number = 0.4;
	protected static readonly COLOR_NULL: uint = 0;
	protected static readonly COLOR_HURT: uint = 0xff8000;
	protected static readonly COLOR_KILL: uint = 0xff0000;
	protected static readonly COLOR_ROTATE: uint = 0x0000ff;

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Back
		shape.graphics.beginFill(this._color, AbstractBlockXTrap.ALPHA_BACK);
		shape.graphics.drawRect(0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
		shape.graphics.endFill();

		// X
		shape.graphics.lineStyle(AbstractBlockXTrap.LINE_SIZE, this._color, AbstractBlockXTrap.ALPHA);
		shape.graphics.moveTo(AbstractBlockXTrap.LINE_SIZE / 2, AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.lineTo(DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2, DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.moveTo(AbstractBlockXTrap.LINE_SIZE / 2, DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2);
		shape.graphics.lineTo(DEFAULT_SIZE - AbstractBlockXTrap.LINE_SIZE / 2, AbstractBlockXTrap.LINE_SIZE / 2);
	}
}