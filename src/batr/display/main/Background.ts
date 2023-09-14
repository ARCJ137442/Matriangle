
// import batr.general.*;
// import batr.game.block.*;
// import batr.game.block.blocks.*;

import Block from "../../game/api/block/Block";
import { Bedrock } from "../game/registry/BlockTypeRegistry";
import { uint, int } from "../../legacy/AS3Legacy";
import { DisplayObject } from "../../legacy/flash/display";
import { DEFAULT_SIZE } from "../api/GlobalDisplayVariables";

// import flash.display.*;

export default class Background extends Sprite {
	//============Static Variables============//
	public static readonly BACKGROUND_COLOR: uint = 0xdddddd;
	public static readonly GRID_COLOR: uint = 0xd6d6d6;
	public static readonly GRID_SIZE: number = DEFAULT_SIZE / 32;
	public static readonly DEFAULT_DISPLAY_GRIDS: uint = GlobalGameVariables.DISPLAY_GRIDS;
	public static readonly GRID_SPREAD: uint = 0;
	public static readonly FRAME_LINE_COLOR: uint = 0x88ffff;
	public static readonly FRAME_LINE_SIZE: number = DEFAULT_SIZE / 8;

	//============Instance Variables============//
	protected _frame: Sprite;

	protected _enableGrid: boolean;

	protected _enableFrame: boolean;

	protected _enableBorderLine: boolean;

	//============Constructor & Destructor============//
	public constructor(width: uint, height: uint,
		enableGrid: boolean = true,
		enableFrame: boolean = true,
		enableBorderLine: boolean = true) {
		super();
		this._enableGrid = enableGrid;

		this._enableFrame = enableFrame;

		this._enableBorderLine = enableBorderLine;

		if (enableGrid)
			updateGrid(width, height);

		this._frame = new Sprite();

		drawFrame(width, height);

		addChildren();
	}

	//============Destructor Function============//
	public destructor(): void {
		shape.graphics.clear();

		this._enableFrame = false;

		this._enableGrid = false;

		this._enableBorderLine = false;

		this.deleteFrame();

		this._frame = null;
	}

	//============Instance Getter And Setter============//
	public get frameVisible(): boolean {
		if (this._frame == null)
			return false;

		return _frame.visible;
	}

	public set frameVisible(value: boolean) {
		if (this._frame == null)
			return;

		_frame.visible = value;
	}

	//============Instance Functions============//
	public addChildren(): void {
		this.addChild(this._frame);
		this._frame.visible = this._enableFrame;
	}

	protected drawGround(width: uint, height: uint): void {
		shape.graphics.beginFill(BACKGROUND_COLOR, 1);
		shape.graphics.drawRect(0, 0, PosTransform.localPosToRealPos(width), PosTransform.localPosToRealPos(height));
	}

	protected drawGrid(x: int, y: int, width: uint, height: uint): void {
		let dx: int = x, dy: int = y, mx: int = x + width, my: int = y + height;
		shape.graphics.lineStyle(GRID_SIZE, GRID_COLOR);
		// V
		while (dx <= mx) {
			drawLineInGrid(dx, y, dx, my);
			dx++;
		}
		// H
		while (dy <= my) {
			drawLineInGrid(x, dy, mx, dy);
			dy++;
		}
	}

	protected drawBorderLine(width: uint, height: uint): void {
		shape.graphics.lineStyle(FRAME_LINE_SIZE, FRAME_LINE_COLOR);
		// V
		drawLineInGrid(0, 0, 0, height);
		drawLineInGrid(width, height, 0, height);
		// H
		drawLineInGrid(0, 0, width, 0);
		drawLineInGrid(width, height, width, 0);
	}

	public updateGrid(width: uint, height: uint): void {
		shape.graphics.clear();
		this.drawGround(width, height);
		if (this._enableGrid)
			this.drawGrid(-GRID_SPREAD, -GRID_SPREAD, width + GRID_SPREAD * 2, height + GRID_SPREAD * 2);
		if (this._enableBorderLine)
			this.drawBorderLine(width, height);
	}

	public resetGrid(): void {
		this.updateGrid(DEFAULT_DISPLAY_GRIDS, DEFAULT_DISPLAY_GRIDS);
	}

	protected drawLineInGrid(x1: int, y1: int, x2: int, y2: int): void {
		shape.graphics.moveTo(PosTransform.localPosToRealPos(x1), PosTransform.localPosToRealPos(y1));
		shape.graphics.lineTo(PosTransform.localPosToRealPos(x2), PosTransform.localPosToRealPos(y2));
	}

	public toggleFrameVisible(): void {
		if (this._frame == null)
			return;
		_frame.visible = _frame.visible ? false : true;
	}

	protected drawFrame(width: uint, height: uint): void {
		if (this._frame == null)
			return;
		for (let xi: uint = 0; xi < width; xi++) {
			for (let yi: uint = 0; yi < height; yi++) {
				if ((xi == 0 || xi == width - 1) || (yi == 0 || yi == height - 1)) {
					let block: Block = new Bedrock();
					block.x = DEFAULT_SIZE * xi;
					block.y = DEFAULT_SIZE * yi;
					_frame.addChild(block);
				}
			}
		}
	}

	protected deleteFrame(): void {
		if (this._frame == null)
			return;

		let child: DisplayObject;

		while (this._frame.numChildren > 0) {
			child = this._frame.getChildAt(0);

			if (child is Block) {
				(child as Block).destructor();
			}
			this._frame.removeChild(child);
		}
	}
}
