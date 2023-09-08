package batr.game.entity.objects {

	import batr.game.entity.entity.player.*;
	import batr.general.*;

	import flash.display.*;
	import flash.text.*;
	/*
	 * It's A GUI Attach to Player(x=0,y=0)
	 * */
	export default class PlayerGUI extends Sprite {
		//============Static Variables============//
		// Display Color
		public static readonly HEALTH_COLOR: uint = 0xff0000;
		public static readonly HEALTH_BAR_FRAME_COLOR: uint = 0xbbbbbb;
		public static readonly CHARGE_COLOR: uint = 0x88ffff;
		public static readonly CHARGE_BAR_FRAME_COLOR: uint = 0xaadddd;
		public static readonly CD_COLOR: uint = 0x88ff88;
		public static readonly CD_BAR_FRAME_COLOR: uint = 0xaaddaa;
		public static readonly EXPERIENCE_COLOR: uint = 0xcc88ff;
		public static readonly EXPERIENCE_BAR_FRAME_COLOR: uint = 0xbbaadd;
		public static readonly LEVEL_COLOR: uint = 0x8800ff;

		// Display Graphics
		public static readonly HEALTH_BAR_HEIGHT: number = DEFAULT_SIZE / 10;
		public static readonly BAR_FRAME_SIZE: number = DEFAULT_SIZE / 320;
		public static readonly UNDER_BAR_HEIGHT: number = DEFAULT_SIZE / 16;
		public static readonly UNDER_BAR_Y_0: number = 0.5 * DEFAULT_SIZE;
		public static readonly UNDER_BAR_Y_1: number = UNDER_BAR_Y_0 + UNDER_BAR_HEIGHT;
		public static readonly UNDER_BAR_Y_2: number = UNDER_BAR_Y_1 + UNDER_BAR_HEIGHT;

		// Display Texts
		public static readonly EXPERIENCE_FORMAT: TextFormat = new TextFormat(
			GlobalGameVariables.MAIN_FONT.fontName,
			0.4 * DEFAULT_SIZE,
			LEVEL_COLOR, true,
			null, null, null, null,
			TextFormatAlign.CENTER
		);
		public static readonly LEVEL_TEXT_HEAD: string = 'Lv.';

		//============Instance Functions============//
		public static getUnderBarY(barNum: uint = 0): number {
			var result: number = UNDER_BAR_Y_0;
			while (barNum > 0) {
				result += UNDER_BAR_HEIGHT;
				barNum--;
			}
			return result;
		}

		//============Instance Variables============//
		protected _owner: Player;

		// Texts
		protected _healthBarFormat: TextFormat = new TextFormat();
		protected _nameTagFormat: TextFormat = new TextFormat();

		// Graphics
		protected _pointerTriangle: Shape = new Shape();
		protected _healthBarHealth: Shape = new Shape();
		protected _healthBarFrame: Shape = new Shape();
		protected _chargeBarCharge: Shape = new Shape();
		protected _chargeBarFrame: Shape = new Shape();
		protected _CDBarCD: Shape = new Shape();
		protected _CDBarFrame: Shape = new Shape();
		protected _experienceBarExperience: Shape = new Shape();
		protected _experienceBarFrame: Shape = new Shape();

		protected _healthBarText: TextField = new TextField();
		protected _nameTagText: TextField = new TextField();
		protected _levelText: TextField = new TextField();

		//============Constructor & Destructor============//
		public constructor(owner: Player) {
			// Set Owner
			this._owner = owner;
			// Set Graphics
			this.setFormats();
			this.drawShape();
			this.setFromatsToFields();
			this.update();
			this.addChildren();
		}

		//============Instance Getter And Setter============//
		public get owner(): Player {
			return this._owner;
		}

		public get entityX(): number {
			return PosTransform.realPosToLocalPos(this.x);
		}

		public get entityY(): number {
			return PosTransform.realPosToLocalPos(this.y);
		}

		public set entityX(value: number) {
			if (value == this.entityX)
				return;
			this.x = PosTransform.localPosToRealPos(value);
		}

		public set entityY(value: number) {
			if (value == this.entityY)
				return;
			this.y = PosTransform.localPosToRealPos(value);
		}

		public getVisibleCD(player: boolean = true): boolean {
			if (player)
				return this._owner.toolNeedsCD && this._owner.toolCDPercent > 0;
			return this._CDBarFrame.visible;
		}

		public getVisibleCharge(player: boolean = true): boolean {
			if (player)
				return this._owner.isCharging;
			return this._chargeBarFrame.visible;
		}

		public getVisibleExperience(player: boolean = true): boolean {
			if (player)
				return true;
			return this._experienceBarFrame.visible;
		}

		//============Instance Functions============//
		public update(): void {
			this.updateHealth();
			this.updateCD(false);
			this.updateCharge(false);
			this.updateExperience(false);
			this.sortUnderBars();
			this.updateName();
			this.updateTeam();
		}

		public updateName(): void {
			if (this._owner == null)
				return;
			this._nameTagText.text = this._owner.customName == null ? '' : this._owner.customName;
		}

		public updateTeam(): void {
			if (this._owner == null)
				return;
			this.drawPointerTriangle(this._pointerTriangle.graphics);
			this._nameTagText.textColor = this._owner.lineColor;
		}

		public updateHealth(): void {
			if (this._owner == null)
				return;
			this._healthBarHealth.scaleX = this._owner.healthPercent;
			this._healthBarText.text = this._owner.healthText == null ? '' : this._owner.healthText;
		}

		public updateCharge(sort: boolean = true): void {
			if (this._owner == null)
				return;
			this._chargeBarCharge.visible = this._chargeBarFrame.visible = this.getVisibleCharge();
			if (sort)
				sortUnderBars();
			this._chargeBarCharge.scaleX = this._owner.chargingPercent;
		}

		public updateCD(sort: boolean = true): void {
			if (this._owner == null)
				return;
			this._CDBarCD.visible = this._CDBarFrame.visible = this.getVisibleCD();
			if (sort)
				sortUnderBars();
			this._CDBarCD.scaleX = this._owner.toolCDPercent;
		}

		public updateExperience(sort: boolean = true): void {
			if (this._owner == null)
				return;
			this._experienceBarExperience.visible = this._experienceBarFrame.visible = this.getVisibleExperience();
			/*if(sort) sortUnderBars()*/
			this._experienceBarExperience.scaleX = this._owner.experiencePercent;
			this._levelText.text = LEVEL_TEXT_HEAD + this._owner.level;
		}

		protected sortUnderBars(): void {
			var sortCD: uint = 0, sortCharge: uint = 0; /*,sortExperience:uint=0*/
			/*if(this.getVisibleExperience(false)) {
				sortCD++;
				sortCharge++;
			}*/
			if (this.getVisibleCD(false))
				sortCharge++;
			this._CDBarCD.y = this._CDBarFrame.y = getUnderBarY(sortCD);
			this._chargeBarCharge.y = this._chargeBarFrame.y = getUnderBarY(sortCharge);
			// this._experienceBarExperience.y=this._experienceBarFrame.y=getUnderBarY(sortExperience);
		}

		protected setFormats(): void {
			// Health Bar
			this._healthBarFormat.font = GlobalGameVariables.MAIN_FONT.fontName;
			this._healthBarFormat.align = TextFormatAlign.CENTER;
			this._healthBarFormat.bold = true;
			this._healthBarFormat.color = HEALTH_COLOR;
			this._healthBarFormat.size = 0.3 * DEFAULT_SIZE;
			// NameTag
			this._nameTagFormat.font = GlobalGameVariables.MAIN_FONT.fontName;
			this._nameTagFormat.align = TextFormatAlign.CENTER;
			this._nameTagFormat.bold = true;
			// this._nameTagFormat.color=this._owner.fillColor;
			this._nameTagFormat.size = 0.5 * DEFAULT_SIZE;
		}

		protected setFromatsToFields(): void {
			this._healthBarText.defaultTextFormat = this._healthBarFormat;
			this._nameTagText.defaultTextFormat = this._nameTagFormat;
			this._levelText.defaultTextFormat = EXPERIENCE_FORMAT;
			this._healthBarText.selectable = this._nameTagText.selectable = this._levelText.selectable = false;
			this._healthBarText.multiline = this._nameTagText.multiline = this._levelText.multiline = false;
			this._healthBarText.embedFonts = this._nameTagText.embedFonts = this._levelText.embedFonts = true;
			this._healthBarText.autoSize = this._nameTagText.autoSize = this._levelText.autoSize = TextFieldAutoSize.CENTER;
			// this._healthBarText.border=this._nameTagText.border=true;
		}

		protected drawShape(): void {
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
			// Health Bar
			drawHealthBar();
			this._healthBarFrame.x = this._healthBarHealth.x = -0.46875 * DEFAULT_SIZE;
			this._healthBarFrame.y = this._healthBarHealth.y = -0.725 * DEFAULT_SIZE;
			this._healthBarText.x = -1.5625 * DEFAULT_SIZE;
			this._healthBarText.y = -1.1 * DEFAULT_SIZE;
			this._healthBarText.width = 3.125 * DEFAULT_SIZE;
			this._healthBarText.height = 0.375 * DEFAULT_SIZE;
			// CD Bar
			drawCDBar();
			this._CDBarFrame.x = this._CDBarCD.x = -0.5 * DEFAULT_SIZE;
			this._CDBarFrame.y = this._CDBarCD.y = UNDER_BAR_Y_1;
			// Charge Bar
			drawChargeBar();

			this._chargeBarFrame.x = this._chargeBarCharge.x = -0.5 * DEFAULT_SIZE;
			this._chargeBarFrame.y = this._chargeBarCharge.y = UNDER_BAR_Y_2;
			// Experience Bar
			drawExperienceBar();

			this._experienceBarFrame.x = this._experienceBarExperience.x = -0.5 * DEFAULT_SIZE;
			this._experienceBarFrame.y = this._experienceBarExperience.y = -0.6 * DEFAULT_SIZE;
		}

		protected drawPointerTriangle(graphics: Graphics): void {
			var realRadiusX: number = 0.1875 * DEFAULT_SIZE;
			var realRadiusY: number = 0.1875 * DEFAULT_SIZE;
			graphics.clear();
			graphics.beginFill(this._owner.fillColor);
			graphics.moveTo(-realRadiusX, -realRadiusY);
			graphics.lineTo(0, realRadiusY);
			graphics.lineTo(realRadiusX, -realRadiusY);
			graphics.lineTo(-realRadiusX, -realRadiusY);
			graphics.endFill();
		}

		protected drawHealthBar(): void {
			this._healthBarFrame.graphics.lineStyle(DEFAULT_SIZE / 200, HEALTH_BAR_FRAME_COLOR);
			this._healthBarFrame.graphics.drawRect(0, 0,
				0.9375 * DEFAULT_SIZE,
				HEALTH_BAR_HEIGHT);
			this._healthBarFrame.graphics.endFill();
			this._healthBarHealth.graphics.beginFill(HEALTH_COLOR);
			this._healthBarHealth.graphics.drawRect(0, 0,
				0.9375 * DEFAULT_SIZE,
				HEALTH_BAR_HEIGHT);
			this._healthBarFrame.graphics.endFill();
		}

		protected drawCDBar(): void {
			this._CDBarFrame.graphics.lineStyle(BAR_FRAME_SIZE, CD_BAR_FRAME_COLOR);
			this._CDBarFrame.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._CDBarFrame.graphics.endFill();
			this._CDBarCD.graphics.beginFill(CD_COLOR);
			this._CDBarCD.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._CDBarCD.graphics.endFill();
		}

		protected drawChargeBar(): void {
			this._chargeBarFrame.graphics.lineStyle(BAR_FRAME_SIZE, CHARGE_BAR_FRAME_COLOR);
			this._chargeBarFrame.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._chargeBarFrame.graphics.endFill();
			this._chargeBarCharge.graphics.beginFill(CHARGE_COLOR);
			this._chargeBarCharge.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._chargeBarCharge.graphics.endFill();
		}

		protected drawExperienceBar(): void {
			this._experienceBarFrame.graphics.lineStyle(BAR_FRAME_SIZE, EXPERIENCE_BAR_FRAME_COLOR);
			this._experienceBarFrame.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._experienceBarFrame.graphics.endFill();
			this._experienceBarExperience.graphics.beginFill(EXPERIENCE_COLOR);
			this._experienceBarExperience.graphics.drawRect(0, 0,
				DEFAULT_SIZE,
				UNDER_BAR_HEIGHT);
			this._experienceBarExperience.graphics.endFill();
		}

		protected addChildren(): void {
			this.addChild(this._healthBarHealth);
			this.addChild(this._healthBarFrame);
			this.addChild(this._healthBarText);
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
			this.removeChild(this._healthBarHealth);
			this.removeChild(this._healthBarFrame);
			this.removeChild(this._healthBarText);
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

		public destructor(): void {
			this.removeChildren();
			this._healthBarHealth = null;
			this._healthBarFrame = null;
			this._healthBarText = null;
			this._CDBarCD = null;
			this._CDBarFrame = null;
			this._chargeBarCharge = null;
			this._chargeBarFrame = null;
			this._experienceBarExperience = null;
			this._experienceBarFrame = null;
			this._levelText = null;
			this._nameTagText = null;
			this._pointerTriangle = null;
			this._healthBarFormat = null;
			this._nameTagFormat = null;
			this._owner = null;
		}
	}
}