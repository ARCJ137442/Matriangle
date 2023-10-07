

import { uint } from "../../../../../legacy/AS3Legacy";
import { DisplayLayers, IBatrShape, IBatrShapeContainer } from "../../../../../display/api/DisplayInterfaces";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import Entity from "../../../../api/entity/Entity";
import { IEntityDisplayableContainer, IEntityInGrid } from "../../../../api/entity/EntityInterfaces";
import { iPoint, iPointRef, intPoint } from "../../../../../common/geometricTools";
import { BonusType } from "../../registry/BonusRegistry";
import IMatrix from "../../../../main/IMatrix";

/**
 * 「奖励箱」是
 * * 处于网格内的
 * * 以容器形式的
 * * 根据特定的「奖励类型」显示图形的
 * * 用于在世界机制中被玩家拾取的
 * 实体
 */
export default class BonusBox extends Entity implements IEntityInGrid, IEntityDisplayableContainer {
	public static readonly LINE_COLOR: uint = 0x777777;
	public static readonly FILL_COLOR: uint = 0xdddddd;

	public static readonly BOX_SIZE: number = DEFAULT_SIZE * 0.8;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 20;
	public static readonly BOX_ELLIPSE_SIZE: number = DEFAULT_SIZE / 16;

	//============Static Functions============//

	//============Instance Variables============//
	protected _bonusType: string;
	public get bonusType(): BonusType { return this._bonusType; }
	public set bonusType(value: BonusType) {
		this._bonusType = value;
		// this._symbol.shapeInit(shape: IBatrShape); // TODO: 请求更新
	}

	// protected _symbol: BonusBoxSymbol; // !【2023-10-04 21:58:22】现在显示端不能再用了

	//============Constructor & Destructor============//
	public constructor(position: iPointRef, type: BonusType) {
		super();
		this._position.copyFrom(position);
		this._bonusType = type;
		// this._symbol = new BonusBoxSymbol(this._bonusType);
	}

	override destructor(): void {
		// this._bonusType = null; // ! 静态引用不需要
		// this._symbol.destructor(); // !【2023-10-04 21:58:22】现在显示端不能再用了
		super.destructor();
	}

	// 格点实体 //
	public readonly i_inGrid: true = true;

	public readonly _position: iPoint = new iPoint();
	public get position(): intPoint { return this._position }
	public set position(value: intPoint) { this._position.copyFrom(value) }

	//============World Mechanics============//

	/** 实现：如果更新后自身位置被遮挡，则通知母体移除自身 */
	public onPositedBlockUpdate(host: IMatrix): void {
		if (!host.map.testCanPass_I(this._position, true, false, false, false, true)) {
			host.removeEntity(this);
		}
	}

	//============Display Implements============//
	public readonly i_displayable: true = true;
	public readonly i_displayableContainer: true = true;

	/** 边缘的空白 */
	public static readonly BORDER_SPACE: number = (DEFAULT_SIZE - BonusBox.BOX_SIZE) / 2

	public shapeInit(shape: IBatrShapeContainer, symbol: IBatrShape): void {
		// 绘制盒子
		this.drawBox(shape);
		// 初始化符号
		/* this._symbol.type = this._bonusType;
		this._symbol.shapeInit(shape);
		symbol.x = symbol.y = DEFAULT_SIZE / 2; // 将「符号」置于中心
		shape.addChild(symbol); // 添加子元素 */
	}

	public shapeRefresh(shape: IBatrShapeContainer): void {
		// ? 待定
	}

	public shapeDestruct(shape: IBatrShapeContainer): void {
		// 遍历（唯一的一个）子元素
		for (let symbol of shape.children) {
			symbol.graphics.clear()
		}
	}

	protected _zIndex: uint = DisplayLayers.BONUS_BOX;
	get zIndex(): uint { return this._zIndex }
	set zIndex(value: uint) {
		this._zIndex = value;
		// this.shapeRefresh(this.shape); // TODO: 请求更新
	}

	protected drawBox(shape: IBatrShape): void {
		// Define
		// let radius:Number=DEFAULT_SIZE/2;
		// Line
		shape.graphics.beginFill(BonusBox.LINE_COLOR);
		shape.graphics.drawRoundRect(BonusBox.BORDER_SPACE, BonusBox.BORDER_SPACE, BonusBox.BOX_SIZE, BonusBox.BOX_SIZE, BonusBox.BOX_ELLIPSE_SIZE, BonusBox.BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
		// Fill
		shape.graphics.beginFill(BonusBox.FILL_COLOR);
		shape.graphics.drawRoundRect(BonusBox.BORDER_SPACE + BonusBox.LINE_SIZE, BonusBox.BORDER_SPACE + BonusBox.LINE_SIZE, BonusBox.BOX_SIZE - 2 * BonusBox.LINE_SIZE, BonusBox.BOX_SIZE - 2 * BonusBox.LINE_SIZE, BonusBox.BOX_ELLIPSE_SIZE, BonusBox.BOX_ELLIPSE_SIZE);
		shape.graphics.endFill();
	}
}
