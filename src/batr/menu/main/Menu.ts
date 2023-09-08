package batr.menu.main {

	import batr.common.*;
	import batr.general.*;
	import batr.game.stat.PlayerStats;
	import batr.menu.event.BatrGUIEvent;

	import batr.game.block.*;
	import batr.game.map.*;
	import batr.game.main.*;
	import batr.game.model.*;

	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.i18n.*;

	import flash.text.*;
	import flash.display.Sprite;
	import flash.events.*;
	import flash.utils.Timer;

	export default class Menu extends Sprite {
		//============Static Variables============//
		protected static readonly _TITLE_HIDE_Y: int = -Title.HEIGHT - DEFAULT_SIZE * 1;
		protected static readonly _TITLE_SHOW_Y: int = PosTransform.localPosToRealPos(2);
		protected static readonly _TITLE_ANIMATION_TIME: uint = GlobalGameVariables.FIXED_TPS;

		/**
		 * Menu Text Format
		 */
		public static readonly TEXT_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE * 5 / 8,
			0x000000,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.CENTER);

		public static readonly TEXT_TITLE_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE * 15 / 8,
			0x000000,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.CENTER);

		public static readonly VERSION_TEXT_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE * 5 / 8,
			0x6666ff,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.LEFT);

		public static readonly RESULT_TITLE_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE,
			0x333333,
			true,
			false,
			false,
			null,
			null,
			TextFormatAlign.LEFT);

		public static readonly RANK_Content_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE * 4 / 5,
			0x444444,
			true,
			false,
			false,
			null,
			null,
			TextFormatAlign.LEFT);

		public static readonly INPUT_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			DEFAULT_SIZE * 3.5 / 8,
			0x000000,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.LEFT);

		//============Static Functions============//
		protected static setFixedTextSuffix(text: BatrTextField, suffix: any): void {
			var fText: FixedI18nText = text.translationalText as FixedI18nText;
			if (fText != null) {
				fText.suffix = '\t\t' + String(suffix);
				text.updateByI18n();
			}
		}

		//============Instance Variables============//
		protected _isActive: boolean;

		protected _subject: BatrSubject;
		protected _backGround: Background = new Background(GlobalGameVariables.DISPLAY_GRIDS, GlobalGameVariables.DISPLAY_GRIDS, true, true, false);

		protected _titleTimer: Timer = new Timer(1000 / GlobalGameVariables.TPS, _TITLE_ANIMATION_TIME);
		protected _isShowingMenu: boolean = false;

		protected _languageSelector: BatrSelector;
		protected _playerStatSelector: BatrSelector;
		protected _frameComplementSelector: BatrSelector;

		// Sheets
		// List
		protected _sheetMain: BatrMenuSheet;
		protected _sheetSelect: BatrMenuSheet;
		protected _sheetAdvancedCustom: BatrMenuSheet;
		protected _sheetCustomGameConfig: BatrMenuSheet;
		protected _sheetGameResult: BatrMenuSheet;
		protected _sheetScoreRanking: BatrMenuSheet;
		protected _sheetPause: BatrMenuSheet;

		// Functional
		protected _sheets: BatrMenuSheet[];
		protected _nowSheet: BatrMenuSheet;
		protected _lastSheet: BatrMenuSheet;

		protected _selectorListCustom: BatrSelectorList;
		protected _selectorListAdvanced_L: BatrSelectorList;
		protected _selectorListAdvanced_R: BatrSelectorList;

		protected _storedGameResult: GameResult;
		protected _gameResultText: BatrTextField;
		protected _rankContentText: BatrTextField;

		protected _playerStatLevel: BatrTextField;
		protected _playerStatKill: BatrTextField;
		protected _playerStatDeath: BatrTextField;
		protected _playerStatDeathByPlayer: BatrTextField;
		protected _playerStatCauseDamage: BatrTextField;
		protected _playerStatDamageBy: BatrTextField;
		protected _playerStatPickupBonus: BatrTextField;
		protected _playerStatBeTeleport: BatrTextField;
		protected _playerStatTotalScore: BatrTextField;

		protected _gameStatMapTransform: BatrTextField;
		protected _gameStatBonusGenerate: BatrTextField;

		protected _gameRuleConfig: BatrTextInput;

		/**
		 * A integer combine with limited indexes.
		 */
		protected _sheetHistory: uint;
		/* 
		 * s=<1,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,1>:[l=17,m=2],
		 * A Complex example: To Sum(pow(m,n)*s[n],n,0,l-1)=96217
		 */

		// GUI
		protected _title: Title = new Title();

		//============Constructor & Destructor============//
		public constructor(subject: BatrSubject) {
			super();
			this._subject = subject;
			this.initDisplay();
			this.addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			this._subject.addEventListener(I18nsChangeEvent.TYPE, onI18nChange);
		}

		//============Instance Getter And Setter============//
		public get isActive(): boolean {
			return this._isActive;
		}

		public set isActive(value: boolean) {
			if (value == this._isActive)
				return;
			this._isActive = value;
		}

		public get backGround(): Background {
			return this._backGround;
		}

		public get subject(): BatrSubject {
			return this._subject;
		}

		public get game(): Game {
			return this._subject.gameObj;
		}

		public get gameRule(): GameRule {
			return this.subject.gameRule;
		}

		public get translations(): I18ns {
			return this._subject.translations;
		}

		public get nowSheet(): BatrMenuSheet {
			return this._nowSheet;
		}

		public set nowSheet(value: BatrMenuSheet) {
			this.setNowSheet(value, true);
		}

		public get lastSheet(): BatrMenuSheet {
			return this._lastSheet;
		}

		public get sheetPause(): BatrMenuSheet {
			return this._sheetPause;
		}

		public get numSheet(): int {
			return this._sheets.length;
		}

		/**
		 * Returns a uint.
		 * @return	A unsigned integer
		 */
		public get historyLength(): uint {
			// Get 12314 -> 5,1101201 ->7, ...
			return this._sheetHistory < 2 ? this._sheetHistory : Math.ceil(Math.log(this._sheetHistory) / Math.log(this.numSheet + 1));
		}

		/**
		 * Returns a uint>0
		 * @return	0:null,>0:sheet.indexOf(...)+1/sheet#0,sheet#1,sheet#2,...
		 */
		public get lastSheetHistory(): uint {
			return Math.floor(this._sheetHistory / Math.pow(this.numSheet + 1, this.historyLength - 1));
		}

		public set storedGameResult(value: GameResult) {
			this._storedGameResult = value;
		}

		public get languageSelector(): BatrSelector {
			return this._languageSelector;
		}

		public get frameComplementSelector(): BatrSelector {
			return this._frameComplementSelector;
		}

		//============Instance Functions============//
		//========Advanced Functions========//

		/**
		 * Add a sheet index to the sheet history.
		 * @param	history	An unsigned integer that specified the index of the sheet character to be
		 *   used to add to history. If history=0, the sheet
		 *   history will be add nothing.
		 */
		protected addSheetHistory(history: uint): void {
			// Add to the Head of UnsignedInteger
			// history>0,r=this.numSheet+1
			// trace('Before:',history,this.historyLength,this._sheetHistory,this.lastSheetHistory);
			this._sheetHistory += Math.pow(this.numSheet + 1, this.historyLength) * history;
			// trace('After:',history,this.historyLength,this._sheetHistory,this.lastSheetHistory);
		}

		protected popSheetHistory(): uint {
			// Remove from the Head of UnsignedInteger
			// trace('Before:',this.historyLength,this._sheetHistory,this.lastSheetHistory);
			var lSH: uint = this.lastSheetHistory;
			this._sheetHistory -= this.lastSheetHistory * Math.pow(this.numSheet + 1, this.historyLength - 1);
			// trace('After:',this.historyLength,this._sheetHistory,this.lastSheetHistory);
			return lSH;
		}

		//========Event Functions========//
		public onStageResize(E: Event): void {
		}

		protected onAddedToStage(E: Event): void {
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			playTitleAnimation();
			addChildren();
		}

		public updateMapSize(): void {
			if (this._backGround == null)
				return;
			this._backGround.x = this.x;
			this._backGround.y = this.y;
			this._backGround.scaleX = this.scaleX;
			this._backGround.scaleY = this.scaleY;
		}

		protected playTitleAnimation(): void {
			_title.x = PosTransform.localPosToRealPos(2);
			_title.y = _TITLE_HIDE_Y;
			this.animaShowMenu();
			this.addEventListener(MenuEvent.TITLE_SHOWN, constructMainMenu);
		}

		protected addChildren(): void {
			this.addChild(this._backGround);
			this.addChild(this._title);
		}

		public setNowSheet(value: BatrMenuSheet, addHistory: boolean = true): void {
			// Change
			if (this._nowSheet != null)
				this.removeChild(this._nowSheet);
			this._lastSheet = this._nowSheet;
			this._nowSheet = value;
			// Set
			if (addHistory)
				this.addSheetHistory(this._sheets.indexOf(this._lastSheet) + 1);
			if (this._nowSheet != null)
				this.addChildAt(this._nowSheet, 0);
			this._title.visible = this._nowSheet.keepTitle;
		}

		//========Menu Build Methods========//
		// Button Build
		protected quickButtonBuild(tKey: string, clickListenerFunction: Function, blockWidth: number = 6, blockHeight: number = 1): BatrButton {
			var button: BatrButton = new BatrButton(DEFAULT_SIZE * blockWidth,
				DEFAULT_SIZE * blockHeight,
				this.translations, tKey);
			this._subject.addEventListener(I18nsChangeEvent.TYPE, button.onI18nsChange);
			if (clickListenerFunction != null)
				button.addEventListener(BatrGUIEvent.CLICK, clickListenerFunction);
			return button;
		}

		// quickButtonBuild with color
		protected quickButtonBuild2(tKey: string, clickListenerFunction: Function, color: uint, blockWidth: number = 6, blockHeight: number = 1): BatrButton {
			var button: BatrButton = new BatrButton(DEFAULT_SIZE * blockWidth,
				DEFAULT_SIZE * blockHeight,
				this.translations, tKey, true, color);
			this._subject.addEventListener(I18nsChangeEvent.TYPE, button.onI18nsChange);
			if (clickListenerFunction != null)
				button.addEventListener(BatrGUIEvent.CLICK, clickListenerFunction);
			return button;
		}

		protected quickBackButtonBuild(): BatrButton {
			return this.quickButtonBuild2(I18nKey.BACK, this.onBackButtonClick, 0x333333);
		}

		protected quickLinkageButtonBuild(tKey: string, sheetLinkage: string, color: uint, blockX: int = 0, blockY: int = 0, blockWidth: number = 6, blockHeight: number = 1): BatrButton {
			return quickButtonBuild2(tKey, this.onLinkageButtonClick, color, blockWidth, blockHeight).setLinkage(sheetLinkage).setBlockPos(blockX, blockY);
		}

		// TextField Build
		protected quickTextFieldBuild(tKey: string, blockX: number = 0, blockY: number = 0, autoSize: string = TextFieldAutoSize.LEFT): BatrTextField {
			var textField: BatrTextField = BatrTextField.fromKey(this.translations, tKey, autoSize);
			textField.x = DEFAULT_SIZE * blockX;
			textField.y = DEFAULT_SIZE * blockY;
			textField.initFormatAsMenu();
			this._subject.addEventListener(I18nsChangeEvent.TYPE, textField.onI18nChange);
			return textField;
		}

		// StatTextField Build
		protected quickStatTextFieldBuild(tKey: string, blockX: number = 0, blockY: number = 0, autoSize: string = TextFieldAutoSize.LEFT): BatrTextField {
			var textField: BatrTextField = new BatrTextField(new FixedI18nText(this.translations, tKey), autoSize);
			textField.x = DEFAULT_SIZE * blockX;
			textField.y = DEFAULT_SIZE * blockY;
			textField.initFormatAsMenu();
			this._subject.addEventListener(I18nsChangeEvent.TYPE, textField.onI18nChange);
			return textField;
		}

		// StatTextField Build
		protected quickTextInputBuild(text: string, blockX: number = 0, blockY: number = 0, blockW: number = 10, blockH: number = 5, autoSize: string = TextFieldAutoSize.LEFT): BatrTextInput {
			var textInput: BatrTextInput = new BatrTextInput(text, autoSize);
			textInput.x = DEFAULT_SIZE * blockX;
			textInput.y = DEFAULT_SIZE * blockY;
			textInput.width = DEFAULT_SIZE * blockW;
			textInput.height = DEFAULT_SIZE * blockH;
			return textInput;
		}

		// selector Build
		protected quickSelectorBuild(content: BatrSelectorContent,
			minTextBlockWidth: number = 1, selectorClickFunction: Function = null): BatrSelector {
			var selector: BatrSelector = new BatrSelector(content, PosTransform.localPosToRealPos(minTextBlockWidth));
			this._subject.addEventListener(I18nsChangeEvent.TYPE, selector.onI18nChange);
			if (selectorClickFunction != null)
				selector.addEventListener(BatrGUIEvent.CLICK, selectorClickFunction);
			return selector;
		}

		// I18nText Build
		protected quickI18nTextBuild(key: string, forcedText: string = null): I18nText {
			return new ForcedI18nText(this.translations, key, forcedText);
		}

		// Menu Main
		protected initDisplay(): void {
		}

		protected constructMainMenu(event: MenuEvent): void {
			this.removeEventListener(MenuEvent.TITLE_SHOWN, constructMainMenu);
			// Call Subject
			this.subject.onTitleComplete();
			// Build Sheets
			this.buildSheets();
			for (var sheet of this._sheets)
				sheet.addChildPerDirectElements();
			this.nowSheet = this._sheetMain;
			// Add VersionText
			var versionText = new TextField();
			versionText.text = GlobalGameInformation.GAME_FULL_VERSION;
			versionText.setTextFormat(Menu.VERSION_TEXT_FORMAT);
			versionText.width = versionText.textWidth + 20;
			versionText.height = versionText.textHeight + 5;
			versionText.x = PosTransform.localPosToRealPos(1);
			versionText.y = PosTransform.localPosToRealPos(23) - versionText.textHeight;
			this.addChild(versionText);
			versionText.selectable = false;
			// Add Language selector
			this._languageSelector = new BatrSelector(BatrSelectorContent.createLanguageContent(I18ns.getIDFromI18n(this.translations)));
			this._languageSelector.x = PosTransform.localPosToRealPos(21);
			this._languageSelector.y = PosTransform.localPosToRealPos(22.5);
			this._languageSelector.addEventListener(BatrGUIEvent.CLICK, this.onLanguageChange);
			this.addChild(this._languageSelector);
			// Add Frame-Complement selector
			this._frameComplementSelector = new BatrSelector(BatrSelectorContent.createBinaryChoiceContent(uint(game.enableFrameComplement), this.translations, I18nKey.FILL_FRAME_OFF, I18nKey.FILL_FRAME_ON));
			this._frameComplementSelector.x = PosTransform.localPosToRealPos(21);
			this._frameComplementSelector.y = PosTransform.localPosToRealPos(21.5);
			this._frameComplementSelector.addEventListener(BatrGUIEvent.CLICK, this.onFillFrameChange);
			this.subject.addEventListener(I18nsChangeEvent.TYPE, this._frameComplementSelector.onI18nChange);
			this.addChild(this._frameComplementSelector);
		}

		protected buildSheets(): void {
			// Set Variables
			var pcS, acS, imS, pcS_2, acS_2, imS_2: BatrSelector;
			var customLeftSelectorX: uint = 10;
			//===Build Sheets===//
			this._sheets = [
				// Main
				this._sheetMain = this.buildSheet(I18nKey.MAIN_MENU, true).appendDirectElements(
					(new BatrButtonList().appendDirectElements(
						this.quickButtonBuild2(I18nKey.CONTINUE, this.onContinueButtonClick, 0xff8000),
						this.quickButtonBuild2(I18nKey.QUICK_GAME, this.onQuickGameButtonClick, 0x0080ff),
						this.quickLinkageButtonBuild(I18nKey.SELECT_GAME, I18nKey.SELECT_GAME, 0x00ff80),
						this.quickLinkageButtonBuild(I18nKey.CUSTOM_MODE, null, 0xff0080)
					) as BatrButtonList).setPos(
						DEFAULT_SIZE * 9,
						DEFAULT_SIZE * 9
					)
				) as BatrMenuSheet,
				// Select
				this._sheetSelect = this.buildSheet(I18nKey.SELECT_GAME, true).appendDirectElements(
					(new BatrButtonList().appendDirectElements(
						this.quickButtonBuild2(I18nKey.START, this.onSelectStartButtonClick, 0x0080ff),
						this.quickLinkageButtonBuild(I18nKey.ADVANCED, I18nKey.ADVANCED, 0x00ff80),
						this.quickButtonBuild2(I18nKey.SAVES, null, 0xff0080),
						this.quickBackButtonBuild()
					) as BatrButtonList).setPos(
						DEFAULT_SIZE * 9,
						DEFAULT_SIZE * 9
					),
					this._selectorListCustom = new BatrSelectorList(PosTransform.localPosToRealPos(5.5)).setBlockPos(
						16, 9
					).appendSelectorAndText(
						this._subject,
						pcS = this.quickSelectorBuild(
							BatrSelectorContent.createUnsignedIntegerContent(this.gameRule.playerCount)
						).setName(I18nKey.PLAYER_COUNT),
						I18nKey.PLAYER_COUNT,
						false
					).appendSelectorAndText(
						this._subject,
						acS = this.quickSelectorBuild(
							BatrSelectorContent.createUnsignedIntegerContent(this.gameRule.AICount)
						).setName(I18nKey.AI_PLAYER_COUNT),
						I18nKey.AI_PLAYER_COUNT,
						true
					).appendSelectorAndText(
						this._subject,
						imS = this.quickSelectorBuild(new BatrSelectorContent().initAsEnum(
							([
								this.quickI18nTextBuild(I18nKey.MAP_RANDOM)
							]).concat(
								I18nText.getTextsByMapNames()
							), 0, 0
						).initAsInt(
							Game.VALID_MAP_COUNT, 0, this.gameRule.initialMapID + 1
						).autoInitLoopSelect(), 1 /*,this.onMapPreviewSwitch*/
						).setName(I18nKey.INITIAL_MAP),
						I18nKey.INITIAL_MAP,
						true
					)
				) as BatrMenuSheet,
				// Advanced Custom
				this._sheetAdvancedCustom = this.buildSheet(I18nKey.ADVANCED, true).appendDirectElements(
					(new BatrButtonList().appendDirectElements(
						this.quickButtonBuild2(I18nKey.START, this.onSelectStartButtonClick, 0x0080ff),
						this.quickBackButtonBuild()
					) as BatrButtonList).setBlockPos(9, 19),
					// Left
					this._selectorListAdvanced_L = new BatrSelectorList(PosTransform.localPosToRealPos(8)).setBlockPos(
						2, 9
					).appendSelectorAndText( // Old
						this._subject,
						pcS_2 = this.quickSelectorBuild(null),
						I18nKey.PLAYER_COUNT,
						false
					).appendSelectorAndText(
						this._subject,
						acS_2 = this.quickSelectorBuild(null),
						I18nKey.AI_PLAYER_COUNT,
						false
					).appendSelectorAndText(
						this._subject,
						imS_2 = this.quickSelectorBuild(null, 1),
						I18nKey.INITIAL_MAP,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createYorNContent(this.gameRule.allowPlayerChangeTeam ? 0 : 1, this.translations),
						I18nKey.LOCK_TEAMS,
						false
					).quickAppendSelector( // New
						this,
						BatrSelectorContent.createPositiveIntegerContent(this.gameRule.defaultHealth),
						I18nKey.DEFAULT_HEALTH,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createPositiveIntegerContent(this.gameRule.defaultMaxHealth),
						I18nKey.DEFAULT_MAX_HEALTH,
						false,
						this.onMaxHealthSelectorClick
					).quickAppendSelector(
						this,
						BatrSelectorContent.createUnsignedIntegerAndOneSpecialContent(
							this.getLivesFromRule(false),
							this.quickI18nTextBuild(I18nKey.INFINITY)
						),
						I18nKey.REMAIN_LIVES_PLAYER,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createUnsignedIntegerAndOneSpecialContent(
							this.getLivesFromRule(true),
							this.quickI18nTextBuild(I18nKey.INFINITY)
						),
						I18nKey.REMAIN_LIVES_AI,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createPositiveIntegerContent(int(this.gameRule.defaultRespawnTime / GlobalGameVariables.TPS)),
						I18nKey.RESPAWN_TIME,
						false
					),
					// Right
					this._selectorListAdvanced_R = new BatrSelectorList(PosTransform.localPosToRealPos(9)).setBlockPos(
						12, 9
					).quickAppendSelector(
						this,
						new BatrSelectorContent().initAsEnum(
							([
								this.quickI18nTextBuild(I18nKey.COMPLETELY_RANDOM),
								this.quickI18nTextBuild(I18nKey.UNIFORM_RANDOM)
							]).concat(I18nText.getTextsByAllAvailableTools(this.translations, false)),
							0, 2
						).initAsInt(
							this.gameRule.enableToolCount - 1, -2, this.gameRule.defaultToolID
						).autoInitLoopSelect(),
						I18nKey.DEFAULT_TOOL,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createYorNContent(this.gameRule.toolsNoCD ? 1 : 0, this.translations),
						I18nKey.TOOLS_NO_CD,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createPositiveIntegerAndOneSpecialContent(
							this.gameRule.mapTransformTime,
							this.quickI18nTextBuild(I18nKey.NEVER)
						),
						I18nKey.MAP_TRANSFORM_TIME,
						true
					).quickAppendSelector(
						this,
						BatrSelectorContent.createUnsignedIntegerAndOneSpecialContent(
							this.gameRule.bonusBoxMaxCount,
							this.quickI18nTextBuild(I18nKey.INFINITY)
						),
						I18nKey.MAX_BONUS_COUNT,
						true
					).quickAppendSelector(
						this,
						BatrSelectorContent.createYorNContent(this.gameRule.bonusBoxSpawnAfterPlayerDeath ? 1 : 0, this.translations),
						I18nKey.BONUS_SPAWN_AFTER_DEATH,
						false
					).quickAppendSelector(
						this,
						BatrSelectorContent.createUnsignedIntegerAndOneSpecialContent(
							this.gameRule.playerAsphyxiaDamage,
							this.quickI18nTextBuild(I18nKey.CERTAINLY_DEAD)
						),
						I18nKey.ASPHYXIA_DAMAGE,
						true
					),
					// Config Entry
					this.quickButtonBuild2(I18nKey.ADVANCED_CONFIG, this.onCustomGameConfigButtonClick, 0x8000ff).setBlockPos(16, 19)
				) as BatrMenuSheet,
				// Config File
				this._sheetCustomGameConfig = this.buildSheet(I18nKey.ADVANCED_CONFIG, false).appendDirectElements(
					this.quickTextFieldBuild(I18nKey.ADVANCED_CONFIG, 1, 1),
					// input
					this._gameRuleConfig = this.quickTextInputBuild('JSON', 1, 2, 22, 18, TextFieldAutoSize.NONE),
					// start
					this.quickButtonBuild2(I18nKey.START, this.onCustomGameConfigStartButtonClick, 0x0080ff).setBlockPos(9, 21),
					this.quickBackButtonBuild().setBlockPos(2, 21)
				) as BatrMenuSheet,
				// Game Result
				this._sheetGameResult = this.buildSheet(I18nKey.GAME_RESULT, false).appendDirectElements(
					// Text Title
					this._gameResultText = quickTextFieldBuild(I18nKey.GAME_RESULT, 2, 2).setBlockSize(20, 2).setFormat(RESULT_TITLE_FORMAT, true),
					// button
					this.quickButtonBuild2(I18nKey.MAIN_MENU, this.onMainMenuButtonClick, 0xcccccc).setBlockPos(9, 21),
					this.quickLinkageButtonBuild(I18nKey.SCORE_RANKING, I18nKey.SCORE_RANKING, 0xccffff).setBlockPos(9, 19),
					// player
					this._playerStatSelector = this.quickSelectorBuild(null, 1, this.onPlayerStatSelectorClick).setBlockPos(5, 4.5),
					this._playerStatLevel = this.quickStatTextFieldBuild(I18nKey.FINAL_LEVEL, 3, 5),
					this._playerStatKill = this.quickStatTextFieldBuild(I18nKey.KILL_COUNT, 3, 6),
					this._playerStatDeath = this.quickStatTextFieldBuild(I18nKey.DEATH_COUNT, 3, 7),
					this._playerStatDeathByPlayer = this.quickStatTextFieldBuild(I18nKey.DEATH_COUNT_FROM_PLAYER, 3, 8),
					this._playerStatCauseDamage = this.quickStatTextFieldBuild(I18nKey.DAMAGE_CAUSE, 3, 9),
					this._playerStatDamageBy = this.quickStatTextFieldBuild(I18nKey.DAMAGE_BY, 3, 10),
					this._playerStatPickupBonus = this.quickStatTextFieldBuild(I18nKey.PICKUP_BONUS, 3, 12),
					this._playerStatBeTeleport = this.quickStatTextFieldBuild(I18nKey.BE_TELEPORT_COUNT, 3, 13),
					this._playerStatTotalScore = this.quickStatTextFieldBuild(I18nKey.TOTAL_SCORE, 3, 14),
					// global
					this._gameStatMapTransform = this.quickStatTextFieldBuild(I18nKey.GLOBAL_STAT, 14, 4, TextFieldAutoSize.CENTER),
					this._gameStatMapTransform = this.quickStatTextFieldBuild(I18nKey.TRANSFORM_MAP_COUNT, 13, 5),
					this._gameStatBonusGenerate = this.quickStatTextFieldBuild(I18nKey.BONUS_GENERATE_COUNT, 13, 6)
				) as BatrMenuSheet,
				// Ranking
				this._sheetScoreRanking = this.buildSheet(I18nKey.SCORE_RANKING, false).appendDirectElements(
					// Text Title
					this.quickTextFieldBuild(I18nKey.SCORE_RANKING, 2, 2).setBlockSize(20, 2).setFormat(RESULT_TITLE_FORMAT, true),
					// ranking
					this._rankContentText = quickTextFieldBuild(null, 2, 4, TextFieldAutoSize.NONE).setBlockSize(20, 20).setFormat(RANK_Content_FORMAT, true),
					// button
					this.quickBackButtonBuild().setBlockPos(9, 21)
				) as BatrMenuSheet,
				// Pause
				this._sheetPause = this.buildSheet(I18nKey.PAUSED, false).setMaskColor(0x7f7f7f, 0.5).appendDirectElements(
					// Text Title
					quickTextFieldBuild(I18nKey.PAUSED, 2, 2, TextFieldAutoSize.CENTER).setBlockSize(20, 2).setFormat(TEXT_TITLE_FORMAT, true),
					// Buttons
					(new BatrButtonList().appendDirectElements(
						this.quickButtonBuild2(I18nKey.CONTINUE, this.onContinueButtonClick, 0xff8000),
						this.quickButtonBuild2(I18nKey.RESTART, this.onRestartButtonClick, 0xff0080),
						this.quickButtonBuild2(I18nKey.GAME_RESULT, this.onResultButtonClick, 0x00ff80),
						this.quickButtonBuild2(I18nKey.MAIN_MENU, this.onMainMenuButtonClick, 0x0080ff),
						this.quickButtonBuild2(I18nKey.ADVANCED_CONFIG, this.onCustomGameConfigButtonClick2, 0x8000ff)
					) as BatrButtonList).setPos(
						DEFAULT_SIZE * 9,
						DEFAULT_SIZE * 9
					)
				) as BatrMenuSheet
			];
			// Set Variable 2
			BatrSelector.setRelativeLink(pcS, pcS_2);
			BatrSelector.setRelativeLink(acS, acS_2);
			BatrSelector.setRelativeLink(imS, imS_2);
		}

		protected getLivesFromRule(isAI: boolean): int {
			return transformLivesFromRule(isAI ? this.gameRule.remainLivesAI : this.gameRule.remainLivesPlayer);
		}

		protected transformLivesFromRule(value: number): int {
			return (value == Infinity ? -1 : int(value));
		}

		// Sheet
		public buildSheet(name: string, keepTitle: boolean = true): BatrMenuSheet {
			var sheet: BatrMenuSheet = new BatrMenuSheet(keepTitle);
			sheet.x = sheet.y = 0;
			sheet.name = name;
			return sheet;
		}

		public getSheetByName(name: string): BatrMenuSheet {
			for (var sheet of this._sheets) {
				if (sheet.name == name)
					return sheet;
			}
			return null;
		}

		public turnSheet(): void {
			this.nowSheet = this._sheets[(this._sheets.indexOf(this._nowSheet) + 1) % this.numSheet];
		}

		// Title
		public animaShowMenu(): void {
			this._isShowingMenu = true;
			startTitleTimer();
		}

		public animaHideMenu(): void {
			this._isShowingMenu = false;
			startTitleTimer();
		}

		protected startTitleTimer(): void {
			this._titleTimer.reset();
			this._titleTimer.addEventListener(TimerEvent.TIMER, onTitleTimerTick);
			this._titleTimer.addEventListener(TimerEvent.TIMER_COMPLETE, onTitleTimerComplete);
			this._titleTimer.start();
		}

		/**
		 * Loading game result when game end.
		 */
		public loadResult(result: GameResult): void {
			// set
			this._gameResultText.translationalText = result.message;
			this._playerStatSelector.setContent(BatrSelectorContent.createPlayerNamesContent(result.stats.players));
			this._storedGameResult = result;
			this.updateStatByResult();
			// rank
			this._rankContentText.translationalText = result.rankingText;
			// load
			// turn
			this.setNowSheet(this._sheetGameResult);
		}

		protected updateStatByResult(): void {
			this.onPlayerStatSelectorClick(null);
			Menu.setFixedTextSuffix(this._gameStatMapTransform, this._storedGameResult.stats.mapTransformCount);
			Menu.setFixedTextSuffix(this._gameStatBonusGenerate, this._storedGameResult.stats.bonusGenerateCount);
		}

		protected onTitleTimerTick(event: TimerEvent): void {
			var percent: number = this._titleTimer.currentCount / this._titleTimer.repeatCount;
			var forcePercent: number = this._isShowingMenu ? (1 - percent) : percent;
			this._title.y = (forcePercent * _TITLE_HIDE_Y + (1 - forcePercent) * _TITLE_SHOW_Y);
		}

		protected onTitleTimerComplete(event: TimerEvent): void {
			this._titleTimer.stop();
			this._titleTimer.removeEventListener(TimerEvent.TIMER, onTitleTimerTick);
			this._titleTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, onTitleTimerComplete);
			this.dispatchEvent(new MenuEvent(MenuEvent.TITLE_SHOWN));
		}

		protected onI18nChange(E: I18nsChangeEvent): void {
		}

		// GameRule Generation
		protected getRuleFromMenu(): GameRule {
			var rule: GameRule = this._subject.gameRule;
			try {
				//====Select====//
				// PlayerCount
				var playerCountSelector: BatrSelector = this._selectorListCustom.getSelectorByName(I18nKey.PLAYER_COUNT);
				rule.playerCount = playerCountSelector == null ? 4 : playerCountSelector.currentValue;
				// AIPlayerCount
				var AIPlayerCountSelector: BatrSelector = this._selectorListCustom.getSelectorByName(I18nKey.AI_PLAYER_COUNT);
				rule.AICount = AIPlayerCountSelector == null ? 6 : AIPlayerCountSelector.currentValue;
				// InitialMap(Map)
				var initialMapSelector: BatrSelector = this._selectorListCustom.getSelectorByName(I18nKey.INITIAL_MAP);
				rule.initialMapID = initialMapSelector == null ? -1 : initialMapSelector.currentValue - 1;
				//========Advanced========//
				//====Left====//
				// DefaultHealth
				var defaultHealthSelector: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.DEFAULT_HEALTH);
				rule.defaultHealth = defaultHealthSelector == null ? 100 : defaultHealthSelector.currentValue;
				// DefaultMaxHealth
				var defaultMaxHealthSelector: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.DEFAULT_MAX_HEALTH);
				rule.defaultMaxHealth = defaultMaxHealthSelector == null ? 100 : defaultMaxHealthSelector.currentValue;
				// DefaultLivesPlayer
				var defaultLivesSelectorP: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.REMAIN_LIVES_PLAYER);
				rule.remainLivesPlayer = defaultLivesSelectorP == null ? -1 : defaultLivesSelectorP.currentValue;
				// DefaultLivesAI
				var defaultLivesSelectorA: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.REMAIN_LIVES_AI);
				rule.remainLivesAI = defaultLivesSelectorA == null ? -1 : defaultLivesSelectorA.currentValue;
				// DefaultRespawnTime
				var defaultRespawnTimeSelector: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.RESPAWN_TIME);
				rule.defaultRespawnTime = defaultRespawnTimeSelector.currentValue * GlobalGameVariables.TPS;
				// LockTeam
				var lockTeam: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.LOCK_TEAMS);
				rule.allowPlayerChangeTeam = defaultRespawnTimeSelector.currentValue == 0; // inverted boolean
				//====Right====//
				// DefaultTool
				var defaultToolSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.DEFAULT_TOOL);
				rule.defaultToolID = defaultToolSelector == null ? -2 : defaultToolSelector.currentValue;
				// ToolsNoCD
				var toolsNoCDSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.TOOLS_NO_CD);
				rule.toolsNoCD = toolsNoCDSelector.currentValue > 0;
				// MapTransformTime
				var mapTransformTimeSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.MAP_TRANSFORM_TIME);
				rule.mapTransformTime = mapTransformTimeSelector.currentValue;
				// BonusBoxMaxCount
				var bonusBoxMaxCountSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.MAX_BONUS_COUNT);
				rule.bonusBoxMaxCount = bonusBoxMaxCountSelector.currentValue;
				// BonusBoxSpawnAfterDeath
				var bonusBoxSpawnAfterDeathSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.BONUS_SPAWN_AFTER_DEATH);
				rule.bonusBoxSpawnAfterPlayerDeath = bonusBoxSpawnAfterDeathSelector.currentValue > 0;
				// AsphyxiaDamage
				var asphyxiaDamageSelector: BatrSelector = this._selectorListAdvanced_R.getSelectorByName(I18nKey.ASPHYXIA_DAMAGE);
				rule.playerAsphyxiaDamage = asphyxiaDamageSelector.currentValue;
			}
			catch (err: Error) {
				trace('Load GameRule Error:' + err.message);
			}
			return rule;
		}

		protected getRuleFromConfigField(input: TextField): GameRule {
			return GameRule.fromJSON(input.text);
		}

		// Game Button
		protected onLinkageButtonClick(event: BatrGUIEvent): void {
			for (var sheet of this._sheets) {
				if (sheet.name == (event.gui as BatrButton).sheetLinkage)
					this.nowSheet = sheet;
			}
		}

		protected onContinueButtonClick(event: BatrGUIEvent): void {
			if (this.game.isLoaded)
				this._subject.turnToGame();
		}

		protected onQuickGameButtonClick(event: BatrGUIEvent): void {
			this._subject.resetRule();
			this.game.forceStartGame(this.gameRule);
			this._subject.turnToGame();
		}

		protected onRestartButtonClick(event: BatrGUIEvent): void {
			this.game.restartGame(this.gameRule);
			this._subject.turnToGame();
		}

		protected onResultButtonClick(event: BatrGUIEvent): void {
			this.game.testGameEnd(true);
		}

		protected onBackButtonClick(event: BatrGUIEvent): void {
			if (this._sheetHistory < 1)
				return;
			this.setNowSheet(this._sheets[this.lastSheetHistory - 1], false);
			this.popSheetHistory();
		}

		protected onMapPreviewSwitch(event: BatrGUIEvent): void {
			var selector: BatrSelector = event.gui as BatrSelector;
			if (selector == null)
				return;
			var nowMapIndex: int = selector.currentValue;
			// trace('Now Map ID: '+nowMapIndex);
			// work in process
		}

		protected onSelectStartButtonClick(event: BatrGUIEvent): void {
			this.game.forceStartGame(this.getRuleFromMenu(), false);
			this._subject.turnToGame();
		}

		protected onCustomGameConfigButtonClick(event: BatrGUIEvent): void {
			this.setNowSheet(this._sheetCustomGameConfig);
			this._gameRuleConfig.text = GameRule.toJSON(this.getRuleFromMenu(), null, 4);
		}

		// from pause screen
		protected onCustomGameConfigButtonClick2(event: BatrGUIEvent): void {
			this.setNowSheet(this._sheetCustomGameConfig);
			this._gameRuleConfig.text = GameRule.toJSON(this.gameRule, null, 4);
		}

		protected onCustomGameConfigStartButtonClick(event: BatrGUIEvent): void {
			try {
				var rule: GameRule = this.getRuleFromConfigField(this._gameRuleConfig);
			}
			catch (e: Error) {
				trace('Load Rule Error:', e);
				return;
			}
			this.game.forceStartGame(rule, false);
			this._subject.turnToGame();
		}

		protected onMainMenuButtonClick(event: BatrGUIEvent): void {
			this._sheetHistory = 0;
			this.setNowSheet(this._sheetMain);
		}

		protected onMaxHealthSelectorClick(event: BatrGUIEvent): void {
			var healthSelector: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.DEFAULT_HEALTH) as BatrSelector;
			var maxHealthSelector: BatrSelector = this._selectorListAdvanced_L.getSelectorByName(I18nKey.DEFAULT_MAX_HEALTH) as BatrSelector;
			if (healthSelector == null && maxHealthSelector != null)
				return;
			if (healthSelector.currentValue > maxHealthSelector.currentValue) {
				healthSelector.content.intMax = maxHealthSelector.currentValue;
				healthSelector.updateTextByContent();
			}
		}

		protected onPlayerStatSelectorClick(event: BatrGUIEvent): void {
			// Change Texts
			try {
				var currentPlayer: PlayerStats = this._storedGameResult.stats.players[this._playerStatSelector.currentValue];
				setFixedTextSuffix(this._playerStatCauseDamage, currentPlayer.causeDamage);
				setFixedTextSuffix(this._playerStatDamageBy, currentPlayer.damageBy);
				setFixedTextSuffix(this._playerStatDeath, currentPlayer.deathCount);
				setFixedTextSuffix(this._playerStatDeathByPlayer, currentPlayer.deathByPlayer);
				setFixedTextSuffix(this._playerStatKill, currentPlayer.killCount);
				setFixedTextSuffix(this._playerStatLevel, currentPlayer.profile.level);
				setFixedTextSuffix(this._playerStatPickupBonus, currentPlayer.pickupBonusBoxCount);
				setFixedTextSuffix(this._playerStatBeTeleport, currentPlayer.beTeleportCount);
				setFixedTextSuffix(this._playerStatTotalScore, currentPlayer.totalScore);
			}
			catch (err: Error) {
				trace('ERROR:', err);
			}
		}

		protected onLanguageChange(event: BatrGUIEvent): void {
			this.subject.turnI18nsTo(I18ns.getI18nFromID(this._languageSelector.currentValue));
		}

		protected onFillFrameChange(event: BatrGUIEvent): void {
			// refresh
			this.game.refreshLastTime();
			// set
			this.game.enableFrameComplement = Boolean(this._frameComplementSelector.currentValue);
		}
	}
}
