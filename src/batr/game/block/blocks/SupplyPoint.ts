import { uint } from "../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../render/BatrDisplayInterfaces";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import BlockAttributes from "../BlockAttributes";
import BlockCommon from "../BlockCommon";

export default class SupplyPoint extends BlockCommon {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x444444;
	public static readonly FILL_COLOR: uint = 0xdddddd;
	public static readonly CENTER_COLOR: uint = 0x00ff00;
	public static readonly BASE_ALPHA: number = 0.5;
	public static readonly GRID_SIZE: uint = DEFAULT_SIZE;

	public static readonly LINE_SIZE: number = SupplyPoint.GRID_SIZE / 32;

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor() {
		super(BlockAttributes.SUPPLY_POINT);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new SupplyPoint();
	}
	//============Instance Getter And Setter============//

	//============Display Implements============//

	override shapeInit(shape: IBatrShape): void {
		super.shapeInit(shape);
		// Base
		shape.graphics.beginFill(SupplyPoint.LINE_COLOR, SupplyPoint.BASE_ALPHA);
		shape.graphics.drawRect(0, 0, SupplyPoint.GRID_SIZE, SupplyPoint.GRID_SIZE);
		shape.graphics.drawRect(SupplyPoint.LINE_SIZE, SupplyPoint.LINE_SIZE, SupplyPoint.GRID_SIZE - SupplyPoint.LINE_SIZE * 2, SupplyPoint.GRID_SIZE - SupplyPoint.LINE_SIZE * 2);
		shape.graphics.endFill();
		shape.graphics.beginFill(SupplyPoint.FILL_COLOR, SupplyPoint.BASE_ALPHA);
		shape.graphics.drawRect(SupplyPoint.LINE_SIZE, SupplyPoint.LINE_SIZE, SupplyPoint.GRID_SIZE - SupplyPoint.LINE_SIZE * 2, SupplyPoint.GRID_SIZE - SupplyPoint.LINE_SIZE * 2);
		shape.graphics.endFill();
		// Center
		// V
		shape.graphics.beginFill(SupplyPoint.CENTER_COLOR);
		shape.graphics.drawRect(SupplyPoint.GRID_SIZE / 8, SupplyPoint.GRID_SIZE * 3 / 8, SupplyPoint.GRID_SIZE * 0.75, SupplyPoint.GRID_SIZE * 0.25);
		shape.graphics.endFill();
		// H
		shape.graphics.beginFill(SupplyPoint.CENTER_COLOR);
		shape.graphics.drawRect(SupplyPoint.GRID_SIZE * 3 / 8, SupplyPoint.GRID_SIZE / 8, SupplyPoint.GRID_SIZE * 0.25, SupplyPoint.GRID_SIZE * 0.75);
		shape.graphics.endFill();
	}
}