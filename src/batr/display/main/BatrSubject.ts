

import Map_V1 from "../../game/mods/native/maps/Map_V1";
import Game from "../../game/main/Game";
import ToolType from "../game/registry/ToolType";
import GameRule from "../../game/api/rule/GameRule";
import I18ns from "../api/i18n/I18ns";
import { uint } from "../../legacy/AS3Legacy";
import I18nsChangeEvent from "../menu/event/I18nsChangeEvent";
import Menu from "../menu/main/Menu";
import { DEFAULT_SIZE } from "../api/GlobalDisplayVariables";

export default class BatrSubject extends Sprite {
	//============Static Variables============//
	protected static readonly FOR_TEST: boolean = false;

	//============Instance Variables============//
	protected _game: Game;
	protected _menu: Menu;

	protected _gameRule: GameRule;
	protected _translations: I18ns;

	//============Constructor & Destructor============//
	public constructor() {
		// Init Variables
		this._translations = I18ns.getI18nByLanguage();
		this._gameRule = new GameRule();
		this._game = new batr.game.main.Game(this, false);
		this._menu = new batr.menu.main.Menu(this);
		// Add Event Listener
		this.addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
	}

	//============Instance Getter And Setter============//
	public get gameRule(): GameRule {
		return this._gameRule;
	}

	public get gameObj(): Game {
		return this._game;
	}

	public get menuObj(): Menu {
		return this._menu;
	}

	public get gameVisible(): boolean {
		return this._game.visible;
	}

	public set gameVisible(value: boolean) {
		this._game.visible = value;
	}

	public get menuVisible(): boolean {
		return this._menu.visible;
	}

	public set menuVisible(value: boolean) {
		this._menu.visible = value;
	}

	public get translations(): I18ns {
		return this._translations;
	}

	//============Instance Functions============//
	protected onStageResize(E: Event = null): void {
		// Information
		let originalStageWidth: number = GlobalGameVariables.DISPLAY_SIZE;
		let originalStageHeight: number = originalStageWidth; // Square
		let nowStageWidth: number = this.stage.stageWidth;
		let nowStageHeight: number = this.stage.stageHeight;
		let mapGridWidth: uint = this._game.isLoaded ? this._game.mapWidth : GlobalGameVariables.DISPLAY_GRIDS;
		let mapGridHeight: uint = this._game.isLoaded ? this._game.mapHeight : GlobalGameVariables.DISPLAY_GRIDS;
		let mapDisplayWidth: number = GlobalGameVariables.DEFAULT_SCALE * mapGridWidth * DEFAULT_SIZE;
		let mapDisplayHeight: number = GlobalGameVariables.DEFAULT_SCALE * mapGridHeight * DEFAULT_SIZE;
		// let distanceBetweenBorderX:Number=0(nowStageWidth-originalStageWidth)/2
		// let distanceBetweenBorderY:Number=0(nowStageHeight-originalStageHeight)/2
		// Operation
		let isMapDisplayWidthMax: boolean = mapDisplayWidth >= mapDisplayHeight;

		let isStageWidthMax: boolean = nowStageWidth >= nowStageHeight;

		let mapDisplaySizeMax: number = isMapDisplayWidthMax ? mapDisplayWidth : mapDisplayHeight;

		let mapDisplaySizeMin: number = isMapDisplayWidthMax ? mapDisplayHeight : mapDisplayWidth;

		let stageSizeMax: number = isStageWidthMax ? nowStageWidth : nowStageHeight;

		let stageSizeMin: number = isStageWidthMax ? nowStageHeight : nowStageWidth;

		// Output
		let displayScale: number = stageSizeMin / mapDisplaySizeMin;

		let shouldX: number = /*-distanceBetweenBorderX+*/(isStageWidthMax ? (nowStageWidth - mapDisplayWidth * displayScale) / 2 : 0);
		let shouldY: number = /*-distanceBetweenBorderY+*/(isStageWidthMax ? 0 : (nowStageHeight - mapDisplayHeight * displayScale) / 2);
		let shouldScale: number = displayScale * GlobalGameVariables.DEFAULT_SCALE;

		// Deal
		this.x = shouldX;

		this.y = shouldY;

		this.scaleX = this.scaleY = shouldScale;

		// Patch
		_menu.onStageResize(E);

		_game.onStageResize(E);
	}

	protected onAddedToStage(E: Event): void {
		this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);

		this.stage.addEventListener(KeyboardEvent.KEY_DOWN, onSubjectKeyDown);

		this.addChildren();
		this.resize();
		// backGround
		this._menu.backGround.visible = false;
		// Menu game preview
		this.initGamePreview();
		if (FOR_TEST)
			this.forTest();
	}

	public onTitleComplete(): void {
		// Menu game preview
		this.startGamePreview();
		if (FOR_TEST)
			this.forTest();
	}

	// ForTest
	protected forTest(): void {
		this.resetRule();
		this._gameRule.playerCount = 4;
		this._gameRule.AICount = 0;
		this._gameRule.initialMap = Map_V1.MAP_5;
		this._gameRule.toolsNoCD = true;
		this._gameRule.mapTransformTime = 0;
		this._gameRule.defaultToolID = ToolType.LIGHTNING.toolID;
		this._game.forceStartGame(this.gameRule);
		this.turnToGame();
	}

	protected initGamePreview(): void {
		this._game.load(GameRule.MENU_BACKGROUND);
		this._game.visibleHUD = false;
		this.gameVisible = true;
		this._game.mapVisible = !(this._game.entityAndEffectVisible = false);
	}

	protected startGamePreview(): void {
		this._game.isActive = true;
		this._game.entityAndEffectVisible = true;
	}

	protected onSubjectKeyDown(E: KeyboardEvent): void {
		let code: uint = E.keyCode;
		let ctrl: boolean = E.ctrlKey;
		let alt: boolean = E.altKey;
		let shift: boolean = E.shiftKey;
		// P:Pause
		if (code == KeyCode.P) { // &&!this.menuVisible
			this.toggleGamePause();
		}
	}

	protected onI18nsChange(E: I18nsChangeEvent): void {
		let nowT: I18ns = E.nowI18ns;
		let oldT: I18ns = E.oldI18ns;
	}

	//====Methods====//
	protected addChildren(): void {
		this.addChild(this._game);
		this.addChild(this._menu);
	}

	public resize(): void {
		this.scaleX = this.scaleY = GlobalGameVariables.DEFAULT_SCALE;
	}

	public set enableAutoResize(value: boolean) {
		if (value) {
			this.stage.scaleMode = StageScaleMode.NO_SCALE;

			this.stage.align = StageAlign.TOP_LEFT;

			this.stage.addEventListener(Event.RESIZE, onStageResize);
		}
		else {
			this.stage.scaleMode = StageScaleMode.SHOW_ALL;

			this.stage.align = StageAlign.TOP;

			this.stage.removeEventListener(Event.RESIZE, onStageResize);
		}
	}

	public gotoGame(): void {
		// Load Game if Game won't loaded
		if (!this.gameObj.isLoaded)
			this.startGame();
		this.gameVisible = true;
		this._game.visibleHUD = true;
		this.menuVisible = false;
		this._game.updateMapSize();
	}

	public gotoMenu(): void {
		// this.gameVisible=false
		this.menuVisible = true;
		this._game.visibleHUD = true;
		this._menu.updateMapSize();
	}

	public turnToGame(): void {
		gotoGame();
		continueGame();
	}

	public turnToMenu(): void {
		gotoMenu();
		pauseGame();
	}

	public startGame(): void {
		this._game.forceStartGame(this._gameRule);
	}

	public pauseGame(): void {
		this._game.isActive = false;
	}

	public continueGame(): void {
		this._game.isActive = true;
	}

	public toggleGamePause(): void {
		// this._game.isActive=!this._game.isActive;
		if (this._game.isActive) {
			if (this.menuObj.nowSheet != this.menuObj.sheetPause)
				this.menuObj.nowSheet = this.menuObj.sheetPause;
			this.turnToMenu();
		}
		else {
			this.turnToGame();
		}
	}

	public turnI18nsTo(translations: I18ns): void {
		let oldI18ns: I18ns = this._translations;
		this._translations = translations;
		this.dispatchEvent(new I18nsChangeEvent(this._translations, oldI18ns));
	}

	public turnI18ns(): void {
		this._menu.languageSelector.turnSelectRight();
		this.turnI18nsTo(I18ns.translationsList[this._menu.languageSelector.currentValue]);
	}

	public resetRule(): void {
		this._gameRule = new GameRule();
	}
}