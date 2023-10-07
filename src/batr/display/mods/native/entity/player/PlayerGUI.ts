import { uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../api/GlobalDisplayVariables";
import Player from "../../../../../server/mods/native/entities/player/Player";
import { IBatrGraphicContext, IBatrShape, IBatrShapeContainer } from '../../../../api/DisplayInterfaces';
import { logical2Real, real2Logical } from "../../../../api/PosTransform";

/**
 * It's A GUI Attach to Player(x=0,y=0)
 * TODO: 【2023-09-27 21:45:44】面向显示，以后再慢慢实现
 */
export default class PlayerGUI implements IBatrShapeContainer {
	//============Static Variables============//
	// Display Color
	public static readonly HP_COLOR: uint = 0xff0000;
	public static readonly HP_BAR_FRAME_COLOR: uint = 0xbbbbbb;
	public static readonly CHARGE_COLOR: uint = 0x88ffff;
	public static readonly CHARGE_BAR_FRAME_COLOR: uint = 0xaadddd;
	public static readonly CD_COLOR: uint = 0x88ff88;
	public static readonly CD_BAR_FRAME_COLOR: uint = 0xaaddaa;
	public static readonly EXPERIENCE_COLOR: uint = 0xcc88ff;
	public static readonly EXPERIENCE_BAR_FRAME_COLOR: uint = 0xbbaadd;
	public static readonly LEVEL_COLOR: uint = 0x8800ff;

	// Display Graphics
	public static readonly HP_BAR_HEIGHT: number = DEFAULT_SIZE / 10;
	public static readonly BAR_FRAME_SIZE: number = DEFAULT_SIZE / 320;
	public static readonly UNDER_BAR_HEIGHT: number = DEFAULT_SIZE / 16;
	public static readonly UNDER_BAR_Y_0: number = 0.5 * DEFAULT_SIZE;
	public static readonly UNDER_BAR_Y_1: number = PlayerGUI.UNDER_BAR_Y_0 + PlayerGUI.UNDER_BAR_HEIGHT;
	public static readonly UNDER_BAR_Y_2: number = PlayerGUI.UNDER_BAR_Y_1 + PlayerGUI.UNDER_BAR_HEIGHT;

	// Display Texts
	public static readonly EXPERIENCE_FORMAT: TextFormat = new TextFormat(
		MAIN_FONT.fontName,
		0.4 * DEFAULT_SIZE,
		PlayerGUI.LEVEL_COLOR, true,
		null, null, null, null,
		TextFormatAlign.CENTER
	);
	public static readonly LEVEL_TEXT_HEAD: string = 'Lv.';

	//============Instance Functions============//
	public static getUnderBarY(barNum: uint = 0): number {
		let result: number = PlayerGUI.UNDER_BAR_Y_0;
		while (barNum > 0) {
			result += PlayerGUI.UNDER_BAR_HEIGHT;
			barNum--;
		}
		return result;
	}

	//============Instance Variables============//
	protected _owner: IPlayer | null;

	// Texts
	protected _HPBarFormat: TextFormat = new TextFormat();
	protected _nameTagFormat: TextFormat = new TextFormat();

	// Graphics
	protected _pointerTriangle: IBatrShape = new Shape();
	protected _HPBarHP: IBatrShape = new Shape();
	protected _HPBarFrame: IBatrShape = new Shape();
	protected _chargeBarCharge: IBatrShape = new Shape();
	protected _chargeBarFrame: IBatrShape = new Shape();
	protected _CDBarCD: IBatrShape = new Shape();
	protected _CDBarFrame: IBatrShape = new Shape();
	protected _experienceBarExperience: IBatrShape = new Shape();
	protected _experienceBarFrame: IBatrShape = new Shape();

	protected _HPBarText: TextField = new TextField();
	protected _nameTagText: TextField = new TextField();
	protected _levelText: TextField = new TextField();

	//============Constructor & Destructor============//
	public constructor(owner: IPlayer) {
		// Set Owner
		this._owner = owner;
		// Set Graphics
		this.setFormats();
		this.shapeInit();
		this.setFormatsToFields();
		this.update();
		this.addChildren();
	}

	public destructor(): void {
		this.removeChildren();
		// ! 与其自身显示相关的（子元素这些）不用置空，其引用与自身绑定
		// this._HPBarHP = null;
		// this._HPBarFrame = null;
		// this._HPBarText = null;
		// this._CDBarCD = null;
		// this._CDBarFrame = null;
		// this._chargeBarCharge = null;
		// this._chargeBarFrame = null;
		// this._experienceBarExperience = null;
		// this._experienceBarFrame = null;
		// this._levelText = null;
		// this._nameTagText = null;
		// this._pointerTriangle = null;
		// this._HPBarFormat = null;
		// this._nameTagFormat = null;
		// 清空其对所链接玩家的引用，使之可以在析构后被删除
		this._owner = null;
	}

	//============Display Implements============// TODO: 有待实现
	get scaleX(): number {
		throw new Error("Method not implemented.");
	}
	set scaleX(value: number) {
		throw new Error("Method not implemented.");
	}
	get scaleY(): number {
		throw new Error("Method not implemented.");
	}
	set scaleY(value: number) {
		throw new Error("Method not implemented.");
	}
	get graphics(): IBatrGraphicContext {
		throw new Error("Method not implemented.");
	}
	get isVisible(): boolean {
		throw new Error("Method not implemented.");
	}
	set isVisible(value: boolean) {
		throw new Error("Method not implemented.");
	}
	get x(): number {
		throw new Error("Method not implemented.");
	}
	set x(x: number) {
		throw new Error("Method not implemented.");
	}
	get y(): number {
		throw new Error("Method not implemented.");
	}
	set y(y: number) {
		throw new Error("Method not implemented.");
	}
	get rot(): number {
		throw new Error("Method not implemented.");
	}
	set rot(rot: number) {
		throw new Error("Method not implemented.");
	}
	get alpha(): number {
		throw new Error("Method not implemented.");
	}
	set alpha(alpha: number) {
		throw new Error("Method not implemented.");
	}

	public readonly i_displayable: true = true;
	shapeRefresh(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	shapeDestruct(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	get zIndex(): number {
		throw new Error("Method not implemented.");
	}
	set zIndex(value: number) {
		throw new Error("Method not implemented.");
	}
	get children(): IBatrShape[] {
		throw new Error("Method not implemented.");
	}
	get numChildren(): number {
		throw new Error("Method not implemented.");
	}
	getChildAt(index: number): IBatrShape {
		throw new Error("Method not implemented.");
	}
	indexOfChild(child: IBatrShape): number | void {
		throw new Error("Method not implemented.");
	}
	firstChildBy(criteria: (child: IBatrShape) => boolean): void | IBatrShape {
		throw new Error("Method not implemented.");
	}
	addChild(child: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	addChildAt(index: number): void {
		throw new Error("Method not implemented.");
	}
	removeChildBy(criteria: (child: IBatrShape) => boolean): void {
		throw new Error("Method not implemented.");
	}
	removeChild(child: IBatrShape): void {
		throw new Error("Method not implemented.");
	}
	removeChildAt(index: number): void {
		throw new Error("Method not implemented.");
	}
	clearChildren(): void {
		throw new Error("Method not implemented.");
	}

	// TODO: 后续的「位置更新」
	public updateLocation(): void {
		if (this._GUI !== null) {
			this._GUI.logicalX = this.owner.entityX;
			this._GUI.logicalY = this.owner.entityY;
		}
	}

	//============Instance Getter And Setter============//
	public get owner(): IPlayer | null {
		return this._owner;
	}

	/** 从「显示坐标」获取自身「逻辑坐标」 */ // ? 是否其实只是一个「单向过程」？
	public get logicalX(): number { return real2Logical(this.x); }

	/** 从「显示坐标」获取自身「逻辑坐标」 */ // ? 是否其实只是一个「单向过程」？
	public get logicalY(): number { return real2Logical(this.y); }

	/** 以「逻辑坐标」设置自身「显示坐标」 */ // ? 是否其实只是一个「单向过程」？
	public set logicalX(value: number) {
		// 相等⇒不更新
		if (value == this.logicalX) return;
		this.x = logical2Real(value);
	}

	/** 以「逻辑坐标」设置自身「显示坐标」 */ // ? 是否其实只是一个「单向过程」？
	public set logicalY(value: number) {
		// 相等⇒不更新
		if (value == this.logicalY) return;
		this.y = logical2Real(value);
	}

	public getVisibleCD(): boolean { return this._CDBarFrame.visible; }
	public getVisibleCharge(): boolean { return this._chargeBarFrame.visible; }
	public getVisibleExperience(): boolean { return this._experienceBarFrame.visible; }

	//============Instance Functions============//
	public update(): void {
		this.updateHP();
		this.updateCD(false);
		this.updateCharge(false);
		this.updateExperience(false);
		this.sortUnderBars();
		this.updateName();
		this.updateTeam();
	}

	public updateName(): void {
		if (this._owner === null)
			return;
		this._nameTagText.text = this._owner.customName === null ? '' : this._owner.customName;
	}

	public updateTeam(): void {
		if (this._owner === null)
			return;
		this.drawPointerTriangle(this._pointerTriangle.graphics);
		this._nameTagText.textColor = this._owner.lineColor;
	}

	public updateHP(): void {
		if (this._owner === null)
			return;
		this._HPBarHP.scaleX = this._owner.HPPercent;
		this._HPBarText.text = this._owner.HPText === null ? '' : this._owner.HPText;
	}

	public updateCharge(sort: boolean = true): void {
		if (this._owner === null)
			return;
		this._chargeBarCharge.visible = this._chargeBarFrame.visible = this.getVisibleCharge();
		if (sort)
			this.sortUnderBars();
		this._chargeBarCharge.scaleX = this._owner.toolChargingPercent;
	}

	public updateCD(sort: boolean = true): void {
		if (this._owner === null)
			return;
		this._CDBarCD.visible = this._CDBarFrame.visible = this.getVisibleCD();
		if (sort)
			this.sortUnderBars();
		this._CDBarCD.scaleX = this._owner.toolCDPercent;
	}

	public updateExperience(sort: boolean = true): void {
		if (this._owner === null)
			return;
		this._experienceBarExperience.visible = this._experienceBarFrame.visible = this.getVisibleExperience();
		/*if(sort) sortUpperBars()*/
		this._experienceBarExperience.scaleX = this._owner.experiencePercent;
		this._levelText.text = PlayerGUI.LEVEL_TEXT_HEAD + this._owner.level;
	}

	protected sortUnderBars(): void {
		let sortCD: uint = 0, sortCharge: uint = 0; /*,sortExperience:uint=0*/
		/*if(this.getVisibleExperience(false)) {
			sortCD++;
			sortCharge++;
		}*/
		if (this.getVisibleCD(false))
			sortCharge++;
		this._CDBarCD.y = this._CDBarFrame.y = PlayerGUI.getUnderBarY(sortCD);
		this._chargeBarCharge.y = this._chargeBarFrame.y = PlayerGUI.getUnderBarY(sortCharge);
		// this._experienceBarExperience.y=this._experienceBarFrame.y=getUnderBarY(sortExperience);
	}

	protected setFormats(): void {
		// HP Bar
		this._HPBarFormat.font = MAIN_FONT.fontName;
		this._HPBarFormat.align = TextFormatAlign.CENTER;
		this._HPBarFormat.bold = true;
		this._HPBarFormat.color = PlayerGUI.HP_COLOR;
		this._HPBarFormat.size = 0.3 * DEFAULT_SIZE;
		// NameTag
		this._nameTagFormat.font = MAIN_FONT.fontName;
		this._nameTagFormat.align = TextFormatAlign.CENTER;
		this._nameTagFormat.bold = true;
		// this._nameTagFormat.color=this._owner.fillColor;
		this._nameTagFormat.size = 0.5 * DEFAULT_SIZE;
	}

	protected setFormatsToFields(): void {
		this._HPBarText.defaultTextFormat = this._HPBarFormat;
		this._nameTagText.defaultTextFormat = this._nameTagFormat;
		this._levelText.defaultTextFormat = PlayerGUI.EXPERIENCE_FORMAT;
		this._HPBarText.selectable = this._nameTagText.selectable = this._levelText.selectable = false;
		this._HPBarText.multiline = this._nameTagText.multiline = this._levelText.multiline = false;
		this._HPBarText.embedFonts = this._nameTagText.embedFonts = this._levelText.embedFonts = true;
		this._HPBarText.autoSize = this._nameTagText.autoSize = this._levelText.autoSize = TextFieldAutoSize.CENTER;
		// this._HPBarText.border=this._nameTagText.border=true;
	}

	public shapeInit(): void {
		// Pointer Triangle
		this._pointerTriangle.x = 0;
		this._pointerTriangle.y = -1.2 * DEFAULT_SIZE;
		// Name Tag
		this._nameTagText.x = -1.875 * DEFAULT_SIZE;
		this._nameTagText.y = -2.5 * DEFAULT_SIZE;
		this._nameTagText.width = 3.75 * DEFAULT_SIZE;
		this._nameTagText.height = 0.625 * DEFAULT_SIZE;
		// Level Text
		this._levelText.x = -1.875 * DEFAULT_SIZE;
		this._levelText.y = -1.9375 * DEFAULT_SIZE;
		this._levelText.width = 3.75 * DEFAULT_SIZE;
		this._levelText.height = 0.6 * DEFAULT_SIZE;
		// HP Bar
		this.drawHPBar();
		this._HPBarFrame.x = this._HPBarHP.x = -0.46875 * DEFAULT_SIZE;
		this._HPBarFrame.y = this._HPBarHP.y = -0.725 * DEFAULT_SIZE;
		this._HPBarText.x = -1.5625 * DEFAULT_SIZE;
		this._HPBarText.y = -1.1 * DEFAULT_SIZE;
		this._HPBarText.width = 3.125 * DEFAULT_SIZE;
		this._HPBarText.height = 0.375 * DEFAULT_SIZE;
		// CD Bar
		this.drawCDBar();
		this._CDBarFrame.x = this._CDBarCD.x = -0.5 * DEFAULT_SIZE;
		this._CDBarFrame.y = this._CDBarCD.y = PlayerGUI.UNDER_BAR_Y_1;
		// Charge Bar
		this.drawChargeBar();

		this._chargeBarFrame.x = this._chargeBarCharge.x = -0.5 * DEFAULT_SIZE;
		this._chargeBarFrame.y = this._chargeBarCharge.y = PlayerGUI.UNDER_BAR_Y_2;
		// Experience Bar
		this.drawExperienceBar();

		this._experienceBarFrame.x = this._experienceBarExperience.x = -0.5 * DEFAULT_SIZE;
		this._experienceBarFrame.y = this._experienceBarExperience.y = -0.6 * DEFAULT_SIZE;
	}

	protected drawPointerTriangle(graphics: IBatrGraphicContext): void {
		let realRadiusX: number = 0.1875 * DEFAULT_SIZE;
		let realRadiusY: number = 0.1875 * DEFAULT_SIZE;
		graphics.clear();
		graphics.beginFill(this._owner.fillColor);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(0, realRadiusY);
		graphics.lineTo(realRadiusX, -realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		graphics.endFill();
	}

	protected drawHPBar(): void {
		this._HPBarFrame.graphics.lineStyle(DEFAULT_SIZE / 200, PlayerGUI.HP_BAR_FRAME_COLOR);
		this._HPBarFrame.graphics.drawRect(0, 0,
			0.9375 * DEFAULT_SIZE,
			PlayerGUI.HP_BAR_HEIGHT);
		this._HPBarFrame.graphics.endFill();
		this._HPBarHP.graphics.beginFill(PlayerGUI.HP_COLOR);
		this._HPBarHP.graphics.drawRect(0, 0,
			0.9375 * DEFAULT_SIZE,
			PlayerGUI.HP_BAR_HEIGHT);
		this._HPBarFrame.graphics.endFill();
	}

	protected drawCDBar(): void {
		this._CDBarFrame.graphics.lineStyle(PlayerGUI.BAR_FRAME_SIZE, PlayerGUI.CD_BAR_FRAME_COLOR);
		this._CDBarFrame.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._CDBarFrame.graphics.endFill();
		this._CDBarCD.graphics.beginFill(PlayerGUI.CD_COLOR);
		this._CDBarCD.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._CDBarCD.graphics.endFill();
	}

	protected drawChargeBar(): void {
		this._chargeBarFrame.graphics.lineStyle(PlayerGUI.BAR_FRAME_SIZE, PlayerGUI.CHARGE_BAR_FRAME_COLOR);
		this._chargeBarFrame.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._chargeBarFrame.graphics.endFill();
		this._chargeBarCharge.graphics.beginFill(PlayerGUI.CHARGE_COLOR);
		this._chargeBarCharge.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._chargeBarCharge.graphics.endFill();
	}

	protected drawExperienceBar(): void {
		this._experienceBarFrame.graphics.lineStyle(PlayerGUI.BAR_FRAME_SIZE, PlayerGUI.EXPERIENCE_BAR_FRAME_COLOR);
		this._experienceBarFrame.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._experienceBarFrame.graphics.endFill();
		this._experienceBarExperience.graphics.beginFill(PlayerGUI.EXPERIENCE_COLOR);
		this._experienceBarExperience.graphics.drawRect(0, 0,
			DEFAULT_SIZE,
			PlayerGUI.UNDER_BAR_HEIGHT);
		this._experienceBarExperience.graphics.endFill();
	}

	protected addChildren(): void {
		this.addChild(this._HPBarHP);
		this.addChild(this._HPBarFrame);
		this.addChild(this._HPBarText);
		this.addChild(this._CDBarCD);
		this.addChild(this._CDBarFrame);
		this.addChild(this._chargeBarCharge);
		this.addChild(this._chargeBarFrame);
		this.addChild(this._experienceBarExperience);
		this.addChild(this._experienceBarFrame);
		this.addChild(this._levelText);
		this.addChild(this._nameTagText);
		this.addChild(this._pointerTriangle);
	}

	protected removeChildren(): void {
		this.removeChild(this._HPBarHP);
		this.removeChild(this._HPBarFrame);
		this.removeChild(this._HPBarText);
		this.removeChild(this._CDBarCD);
		this.removeChild(this._CDBarFrame);
		this.removeChild(this._chargeBarCharge);
		this.removeChild(this._chargeBarFrame);
		this.removeChild(this._experienceBarExperience);
		this.removeChild(this._experienceBarFrame);
		this.removeChild(this._levelText);
		this.removeChild(this._nameTagText);
		this.removeChild(this._pointerTriangle);
	}
}