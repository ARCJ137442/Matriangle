

class BatrSelectorArrow extends BatrMenuGUI implements IBatrMenuElement {
	//============Static Variables============//
	public static readonly LINE_COLOR: uint = 0x888888;
	public static readonly FILL_COLOR: uint = 0xcccccc;
	public static readonly FILL_ALPHA: number = 0.4;
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 16;
	public static readonly HOLD_ALPHA: number = 1;
	public static readonly OVER_ALPHA: number = 0.8;
	public static readonly RELEASE_ALPHA: number = 0.6;

	//============Instance Variables============//
	protected _displayWidth: number;
	protected _displayHeight: number;
	protected _lineColor: uint;
	protected _fillColor: uint;
	protected _lineSize: number;
	protected _clickFunc: Function = null;

	//============Constructor & Destructor============//
	public constructor(width: number = DEFAULT_SIZE * 0.6,
		height: number = DEFAULT_SIZE * 0.6,
		lineColor: uint = LINE_COLOR,
		fillColor: uint = FILL_COLOR,
		lineSize: number = LINE_SIZE): void {
		super();
		this._lineColor = lineColor;
		this._fillColor = fillColor;
		this._lineSize = lineSize;
		this._displayWidth = width;
		this._displayHeight = height;
		this.initDisplay();
		this.buttonMode = true;
		this.tabEnabled = true;
		this.onMouseRollOut(null);
	}

	//============Destructor Function============//
	override destructor(): void {
		shape.graphics.clear();
		this._clickFunc = null;
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public set clickFunction(value: Function) {
		this._clickFunc = value;
	}

	public get displayWidth(): number {
		return this._displayWidth;
	}

	public get displayHeight(): number {
		return this._displayHeight;
	}

	//============Instance Functions============//
	protected initDisplay(): void {
		this.drawShape();
	}

	override drawShape(): void {
		super.drawShape();
		// Draw
		shape.graphics.lineStyle(this._lineSize, this._lineColor);
		shape.graphics.beginFill(this._fillColor, FILL_ALPHA);
		shape.graphics.moveTo(-this._displayWidth / 2, -this._displayHeight / 2);
		shape.graphics.lineTo(this._displayWidth / 2, 0);
		shape.graphics.lineTo(-this._displayWidth / 2, this._displayHeight / 2);
		shape.graphics.lineTo(-this._displayWidth / 2, -this._displayHeight / 2);
		shape.graphics.endFill();
	}

	override onMouseRollOver(event: MouseEvent): void {
		super.onMouseRollOver(event);
		this.alpha = OVER_ALPHA;
	}

	override onMouseRollOut(event: MouseEvent): void {
		super.onMouseRollOut(event);
		this.alpha = RELEASE_ALPHA;
	}

	override onMouseHold(event: MouseEvent): void {
		super.onMouseHold(event);
		this.alpha = HOLD_ALPHA;
	}

	override onMouseRelease(event: MouseEvent): void {
		super.onMouseRelease(event);
		this.alpha = RELEASE_ALPHA;
	}

	override onClick(event: MouseEvent): void {
		super.onClick(event);
		if (this._clickFunc != null)
			this._clickFunc(event);
	}
}