package batr.game.main {

	import batr.common.*;
	import batr.general.*;
	import batr.game.stat.*;

	import batr.game.block.*;
	import batr.game.block.blocks.*;

	import batr.game.effect.*;
	import batr.game.effect.effects.*;

	import batr.game.entity.*;
	import batr.game.entity.object.*;
	import batr.game.entity.entity.*;
	import batr.game.entity.entity.player.*;
	import batr.game.entity.entity.projectile.*;

	import batr.game.main.*;
	import batr.game.map.*;
	import batr.game.map.main.*;
	import batr.game.model.*;
	import batr.game.events.*;

	import batr.menu.events.*;
	import batr.menu.main.*;
	import batr.menu.object.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.i18n.*;

	import flash.display.*;
	import flash.text.*;
	import flash.utils.*;
	import flash.events.*;
	import flash.geom.*;
	import flash.system.fscommand;

	export default class Game extends Sprite {
		//============Static Variables============//
		public static const ALL_MAPS: IMap[] = new < IMap > [
			Map_V1.EMPTY,
			Map_V1.FRAME,
			Map_V1.MAP_1,
			Map_V1.MAP_2,
			Map_V1.MAP_3,
			Map_V1.MAP_4,
			Map_V1.MAP_5,
			Map_V1.MAP_6,
			Map_V1.MAP_7,
			Map_V1.MAP_8,
			Map_V1.MAP_9,
			Map_V1.MAP_A,
			Map_V1.MAP_B,
			Map_V1.MAP_C,
			Map_V1.MAP_D,
			Map_V1.MAP_E,
			Map_V1.MAP_F,
			Map_V1.MAP_G,
			Map_V1.MAP_H
		];

		public static const MAP_TRANSFORM_TEXT_FORMAT: TextFormat = new TextFormat(
			new MainFont().fontName,
			GlobalGameVariables.DEFAULT_SIZE * 5 / 8,
			0x3333ff,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.LEFT);

		public static const GAME_PLAYING_TIME_TEXT_FORMET: TextFormat = new TextFormat(
			new MainFont().fontName,
			GlobalGameVariables.DEFAULT_SIZE * 5 / 8,
			0x66ff66,
			true,
			null,
			null,
			null,
			null,
			TextFormatAlign.LEFT);

		public static var debugMode: boolean = false;

		//============Static Getter And Setter============//
		public static function get VALID_MAP_COUNT(): int {
			return Game.ALL_MAPS.length;
		}

		//============Static Functions============//
		public static function getMapFromID(id: int): IMap {
			if (id >= 0 && id < Game.VALID_MAP_COUNT)
				return Game.ALL_MAPS[id];
			return null;
		}

		public static function getIDFromMap(map: IMap): int {
			return Game.ALL_MAPS.indexOf(map);
		}

		// Tools
		public static function joinNamesFromPlayers(players: Player[]): string {
			var result: string = '';
			for (var i: uint = 0; i < players.length; i++) {
				if (players[i] == null)
					result += 'NULL';
				else
					result += players[i].customName;
				if (i < players.length - 1)
					result += ',';
			}
			return result;
		}

		//============Instance Variables============//
		// General

		/**
		 * The reference of Subject
		 */
		protected _subject: BatrSubject;
		protected _map: IMap;

		/**
		 * Internal GameRule copy from Subject
		 */
		protected _rule: GameRule;

		protected _stat: GameStats;

		// Background
		protected _backGround: Background = new Background(0, 0, true, false, true);

		// System
		protected _entitySystem: EntitySystem;

		protected _effectSystem: EffectSystem;

		// Map
		protected _mapDisplayerBottom: IMapDisplayer = new MapDisplayer();

		protected _mapDisplayerMiddle: IMapDisplayer = new MapDisplayer();

		protected _mapDisplayerTop: IMapDisplayer = new MapDisplayer();

		// Players
		protected _playerGUIContainer: Sprite = new Sprite();

		protected _playerContainer: Sprite = new Sprite();

		protected _projectileContainer: Sprite = new Sprite();

		protected _bonusBoxContainer: Sprite = new Sprite();

		// Effects
		protected _effectContainerBottom: Sprite = new Sprite();

		protected _effectContainerMiddle: Sprite = new Sprite();

		protected _effectContainerTop: Sprite = new Sprite();

		// Global
		protected _isActive: boolean;
		protected _isLoaded: boolean;
		protected _tickTimer: Timer = new Timer(GlobalGameVariables.TICK_TIME_MS);
		// protected _secondTimer:Timer=new Timer(1000);//When a timer stop and start the timer will lost its phase.
		protected _speed: number;

		// Frame Complement
		protected _lastTime: int;
		protected _timeDistance: uint;
		protected _expectedFrames: uint;
		protected _enableFrameComplement: boolean;

		// Temp
		protected _tempUniformWeapon: WeaponType;

		protected _tempMapTransformSecond: uint;

		// protected _tempTimer:int=getTimer();
		protected _tempSecordPhase: uint = 0;
		protected _second: uint;
		protected _temp_game_rate: number = 0.0;

		// HUD
		protected _globalHUDContainer: Sprite = new Sprite();

		protected _mapTransformTimeText: BatrTextField = BatrTextField.fromKey(null, null);

		protected _gamePlayingTimeText: BatrTextField = BatrTextField.fromKey(null, null);

		//============Constructor Function============//
		public Game(subject: BatrSubject, active: boolean = false): void {
			super();
			this._subject = subject;
			this._entitySystem = new EntitySystem(this);
			this._effectSystem = new EffectSystem(this);
			this.initDisplay();
			this.isActive = active;
			this.addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}

		//============Instance Getter And Setter============//
		//======Main Getters======//
		public get subject(): BatrSubject {
			return this._subject;
		}

		public get menu(): Menu {
			return this._subject.menuObj;
		}

		public get rule(): GameRule {
			return this._rule;
		}

		public get translations(): I18ns {
			return this._subject.translations;
		}

		public get isActive(): boolean {
			return this._isActive;
		}

		public set isActive(value: boolean): void {
			if (value == this._isActive)
				return;
			this._isActive = value;
			if (value) {
				// Key
				this.stage.addEventListener(KeyboardEvent.KEY_DOWN, onGameKeyDown);
				this.stage.addEventListener(KeyboardEvent.KEY_UP, onGameKeyUp);
				// Timer
				this._tickTimer.addEventListener(TimerEvent.TIMER, this.onGameTick);
				this._tickTimer.start();
				// this._secondTimer.addEventListener(TimerEvent.TIMER,this.dealSecond);
				// this._secondTimer.start();
				// lastTime
				this._lastTime = getTimer();
			}
			else {
				// Key
				this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, onGameKeyDown);
				this.stage.removeEventListener(KeyboardEvent.KEY_UP, onGameKeyUp);
				// Timer
				this._tickTimer.removeEventListener(TimerEvent.TIMER, this.onGameTick);
				this._tickTimer.stop();
				// this._secondTimer.removeEventListener(TimerEvent.TIMER,this.dealSecond);
				// this._secondTimer.stop();
			}
		}

		public get visibleHUD(): boolean {
			return this._globalHUDContainer.visible;
		}

		public set visibleHUD(value: boolean): void {
			this._globalHUDContainer.visible = value;
		}

		public get isLoaded(): boolean {
			return this._isLoaded;
		}

		public get speed(): number {
			return this._speed;
		}

		public set speed(value: number): void {
			this._speed = value;
		}

		public get enableFrameComplement(): boolean {
			return this._enableFrameComplement;
		}

		public set enableFrameComplement(value: boolean): void {
			this._enableFrameComplement = value;
		}

		//======Entity Getters======//
		public get playerContainer(): Sprite {
			return this._playerContainer;
		}

		public get projectileContainer(): Sprite {
			return this._projectileContainer;
		}

		public get bonusBoxContainer(): Sprite {
			return this._bonusBoxContainer;
		}

		public get playerGUIContainer(): Sprite {
			return this._playerGUIContainer;
		}

		public get effectContainerBottom(): Sprite {
			return this._effectContainerBottom;
		}

		public get effectContainerTop(): Sprite {
			return this._effectContainerTop;
		}

		public get entitySystem(): EntitySystem {
			return this._entitySystem;
		}

		public get effectSystem(): EffectSystem {
			return this._effectSystem;
		}

		public get numPlayers(): uint {
			return this._entitySystem.player.length;

			// Includes AI players
		}

		public get nextPlayerID(): uint {
			var id: uint = 1;
			for (var player of this._entitySystem.players) {
				if (!Player.isAI(player))
					id++;
			}
			return id;
		}

		public get nextAIID(): uint {
			var id: uint = 1;
			for (var player of this._entitySystem.players) {
				if (Player.isAI(player))
					id++;
			}
			return id;
		}

		//======Map Getters======//
		public get map(): IMap {
			return this._map;
		}

		public get mapIndex(): uint {
			return Game.getIDFromMap(this._map);
		}

		public get mapWidth(): uint {
			return this._map.mapWidth;
		}

		public get mapHeight(): uint {
			return this._map.mapHeight;
		}

		public get mapTransformPeriod(): uint {
			return this._rule.mapTransformTime;
		}

		public set mapVisible(value: boolean): void {
			if (this._mapDisplayerBottom as DisplayObject != null)
				(this._mapDisplayerBottom as DisplayObject).visible = value;
			if (this._mapDisplayerMiddle as DisplayObject != null)
				(this._mapDisplayerMiddle as DisplayObject).visible = value;
			if (this._mapDisplayerTop as DisplayObject != null)
				(this._mapDisplayerTop as DisplayObject).visible = value;
		}

		public set entityAndEffectVisible(value: boolean): void {
			this._effectContainerTop.visible = this._effectContainerMiddle.visible = this._effectContainerBottom.visible = this._bonusBoxContainer.visible = this._playerGUIContainer.visible = this._playerContainer.visible = value;
		}

		//========Game AI Interface========//
		public get allAvaliableBonusBox(): BonusBox[] {
			return this.entitySystem.bonusBoxes;
		}

		public getBlockPlayerDamage(x: int, y: int): int {
			var blockAtt: BlockAttributes = this._map.getBlockAttributes(x, y);
			if (blockAtt != null)
				return blockAtt.playerDamage;
			return 0;
		}

		public isKillZone(x: int, y: int): boolean {
			var blockAtt: BlockAttributes = this._map.getBlockAttributes(x, y);
			if (blockAtt != null)
				return blockAtt.playerDamage == int.MAX_VALUE;
			return false;
		}

		//============Instance Functions============//
		//========About Game End========//

		/**
		 * Condition: Only one team's player alive.
		 */
		protected isPlayersEnd(players: Player[]): boolean {
			if (this.numPlayers < 2)
				return false;
			var team: PlayerTeam = null;
			for (var player of players) {
				if (team == null)
					team = player.team;
				else if (player.team != team)
					return false;
			}
			return true;
		}

		public getAlivePlayers(): Player[] {
			var result: Player[] = new Player[]();
			for (var player of this._entitySystem.players) {
				if (player == null)
					continue;
				if (!player.isCertainlyOut)
					result.push(player);
			}
			return result;
		}

		public getInMapPlayers(): Player[] {
			var result: Player[] = new Player[]();
			for (var player of this._entitySystem.players) {
				if (player == null)
					continue;
				if (player.health > 0 && !(player.isRespawning || this.isOutOfMap(player.entityX, player.entityY)))
					result.push(player);
			}
			return result;
		}

		public testGameEnd(force: boolean = false): void {
			var alivePlayers: Player[] = this.getAlivePlayers();
			if (this.isPlayersEnd(alivePlayers) || force) {
				// if allowTeamVictory=false,reset team colors
				if (!force && alivePlayers.length > 1 && !this.rule.allowTeamVictory) {
					this.resetPlayersTeamInDifferent(alivePlayers);
				}
				// Game End with winners
				else
					this.onGameEnd(alivePlayers);
			}
		}

		protected resetPlayersTeamInDifferent(players: Player[]): void {
			var tempTeamIndex: uint = exMath.random(this.rule.playerTeams.length);
			for (var player of players) {
				player.team = this.rule.playerTeams[tempTeamIndex];
				tempTeamIndex = (tempTeamIndex + 1) % this.rule.playerTeams.length;
			}
		}

		protected onGameEnd(winners: Player[]): void {
			this.subject.pauseGame();
			this.subject.gotoMenu();
			this.subject.menuObj.loadResult(this.getGameResult(winners));
		}

		protected getGameResult(winners: Player[]): GameResult {
			var result: GameResult = new GameResult(this,
				this.getResultMessage(winners),
				this._stat
			);
			return result;
		}

		protected getResultMessage(winners: Player[]): I18nText {
			if (winners.length < 1) {
				return new I18nText(this.translations, I18nKey.NOTHING_WIN);
			}
			else if (winners.length == this.numPlayers) {
				return new I18nText(this.translations, I18nKey.WIN_ALL_PLAYER);
			}
			else if (winners.length > 3) {
				return new FixedI18nText(
					this.translations,
					I18nKey.WIN_PER_PLAYER,
					winners.length.toString()
				);
			}
			else {
				return new FixedI18nText(
					this.translations,
					winners.length > 1 ? I18nKey.WIN_MULTI_PLAYER : I18nKey.WIN_SINGLE_PLAYER,
					joinNamesFromPlayers(winners)
				);
			}
		}

		//====Functions About Init====//
		protected onAddedToStage(E: Event): void {
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			// this.addEventListener(Event.ENTER_FRAME,onEnterFrame);
			this.subject.addEventListener(I18nsChangeEvent.TYPE, this.onI18nsChange);
			this.addChildren();
		}

		protected initDisplay(): void {
			// HUD Text
			this._mapTransformTimeText.setBlockPos(0, 23);
			this._mapTransformTimeText.defaultTextFormat = MAP_TRANSFORM_TEXT_FORMAT;
			this._mapTransformTimeText.selectable = false;
			this._gamePlayingTimeText.setBlockPos(0, 0);
			this._gamePlayingTimeText.defaultTextFormat = GAME_PLAYING_TIME_TEXT_FORMET;
			this._gamePlayingTimeText.selectable = false;
			// Initial HUD visible
			this.visibleHUD = false;
		}

		protected addChildren(): void {
			this.addChild(this._backGround);

			this.addChild(this._effectContainerBottom);
			this.addChild(this._mapDisplayerBottom as DisplayObject);
			this.addChild(this._bonusBoxContainer);
			this.addChild(this._effectContainerMiddle);
			this.addChild(this._playerContainer);
			this.addChild(this._mapDisplayerMiddle as DisplayObject);
			this.addChild(this._projectileContainer);
			this.addChild(this._mapDisplayerTop as DisplayObject);
			this.addChild(this._effectContainerTop);
			this.addChild(this._playerGUIContainer);
			this.addChild(this._globalHUDContainer);

			this._globalHUDContainer.addChild(this._mapTransformTimeText);
			this._globalHUDContainer.addChild(this._gamePlayingTimeText);
		}

		//====Functions About Game Global Running====//
		public load(rule: GameRule, becomeActive: boolean = false): boolean {
			// Check
			if (this._isLoaded)
				return false;
			// Update
			this._rule = rule;
			this.loadMap(true, true, false);
			this.updateMapSize(true);
			this._isLoaded = true;
			this._tempUniformWeapon = this._rule.randomWeaponEnable;
			this._tempMapTransformSecond = this.mapTransformPeriod;
			this._speed = 1;
			// Stats
			this._stat = new GameStats(this._rule); // will be load by spawnPlayersByRule
			// Players
			this.spawnPlayersByRule();
			// Timer
			this._tickTimer.reset();
			// this._tempTimer=getTimer();
			this._tempSecordPhase = 0;
			this._second = 0;
			this.updateGUIText();
			// Listen
			this._rule.addEventListener(GameRuleEvent.TEAMS_CHANGE, this.onPlayerTeamsChange);
			// Active
			if (becomeActive)
				this.isActive = true;
			// Return
			return true;
		}

		public clearGame(): boolean {
			// Check
			if (!this._isLoaded)
				return false;
			// Listen
			this._rule.removeEventListener(GameRuleEvent.TEAMS_CHANGE, this.onPlayerTeamsChange);
			// Global
			this.isActive = false;
			this._isLoaded = false;
			this._rule = null;
			this._stat = null;
			// Map
			this._map.destructor();
			this._map = null;
			this.forceMapDisplay();
			this.updateMapSize(false);
			this.removeAllPlayer(false);
			// Entity
			this._entitySystem.removeAllEntity(); // NonPlayer Entity
			// Effect
			this._effectSystem.removeAllEffect();
			// Return
			return true;
		}

		public restartGame(rule: GameRule, becomeActive: boolean = false): void {
			this.clearGame();
			this.load(rule, becomeActive);
		}

		public forceStartGame(rule: GameRule, becomeActive: boolean = false): boolean {
			return (this._isLoaded ? this.restartGame : this.load)(rule, becomeActive);
		}

		public dealGameTick(): void {
			//=====Ticking=====//
			this._tempSecordPhase += this._tickTimer.delay;
			if (this._tempSecordPhase >= 1000) {
				this._tempSecordPhase -= 1000;
				this._second++;
				this.dealSecond();
			}
			//=====Entity TickRun=====//
			for (var entity of this._entitySystem.entities) {
				if (entity != null) {
					if (entity.isActive) {
						entity.tickFunction();
					}
				}
				else {
					this._entitySystem.GC();
				}
			}
			//=====Player TickRun=====//
			for (var player of this._entitySystem.players) {
				if (player != null) {
					// Respawn About
					if (player.infinityLife || player.lives > 0) {
						if (!player.isActive && player.respawnTick >= 0) {
							player.dealRespawn();
						}
					}
				}
			}
			//=====Effect TickRun=====//
			for (var effect of this._effectSystem.effects) {
				if (effect != null) {
					if (effect.isActive) {
						effect.onEffectTick();
					}
				}
				else {
					this._effectSystem.GC();
				}
			}
			//=====Random Tick=====//
			this.onRandomTick(this._map.randomX, this._map.randomY);
		}

		//====Listener Functions====//
		/*protected onEnterFrame(E:Event):void {
			//Reset
			this._tempTimer=getTimer();
		}*/

		protected onGameTick(E: Event): void {
			var i: number = this._speed;

			// Frame Complement
			if (this._enableFrameComplement) {
				// Ranging
				this._timeDistance = getTimer() - this._lastTime;
				// Computing<Experimental>
				this._expectedFrames = this._timeDistance / GlobalGameVariables.TICK_TIME_MS;
				if (this._expectedFrames > 1)
					trace('this._expectedFrames>1! value=', this._expectedFrames, 'distance=', this._timeDistance);

				i = this._expectedFrames * this._speed;
				// Synchronize
				this._lastTime += this._expectedFrames * GlobalGameVariables.TICK_TIME_MS; // this._timeDistance;
			}
			// i end at 0
			this._temp_game_rate += i;
			while (this._temp_game_rate >= 1) {
				this._temp_game_rate--;
				this.dealGameTick();
			}
		}

		public refreshLastTime(): void {
			this._lastTime = getTimer();
			this._timeDistance = this._expectedFrames = 0;
		}

		protected dealSecond(): void {
			//=====Map Transform=====//
			if (this.mapTransformPeriod > 0) {
				this._mapTransformTimeText.visible = true;
				if ((this._tempMapTransformSecond--) == 0) {
					this._tempMapTransformSecond = this.mapTransformPeriod;
					this.transformMap();
				}
			}
			//=====Update Text=====//
			this.updateGUIText();
			// this._secondTimer.delay=1000;
		}

		protected updateGUIText(): void {
			if (this.translations == null || this.rule == null)
				return;
			this._mapTransformTimeText.setText(
				I18ns.getI18n(
					this.translations,
					I18nKey.REMAIN_TRANSFORM_TIME
				) + ': ' + this._tempMapTransformSecond +
				'/' + this.rule.mapTransformTime
			);
			this._gamePlayingTimeText.setText(
				I18ns.getI18n(
					this.translations,
					I18nKey.GAME_DURATION
				) + ': ' + this._second);
			this._mapTransformTimeText.visible = this.rule.mapTransformTime > 0;
		}

		protected onI18nsChange(event: Event): void {
			this.updateGUIText();
		}

		protected onGameKeyDown(E: KeyboardEvent): void {
			var code: uint = E.keyCode;
			var ctrl: boolean = E.ctrlKey;
			var alt: boolean = E.altKey;
			var shift: boolean = E.shiftKey;
			// End Game
			if (shift && code == KeyCode.ESC) {
				fscommand('quit');
				return;
			}
			// Player Contol
			this.dealKeyDownWithPlayers(E.keyCode, true);
		}

		protected onGameKeyUp(E: KeyboardEvent): void {
			// Player Contol
			dealKeyDownWithPlayers(E.keyCode, false);
		}

		protected dealKeyDownWithPlayers(code: uint, isKeyDown: boolean): void {
			if (this._entitySystem.playerCount > 0) {
				for (var player of this._entitySystem.players) {
					// Detect - NOT USE:if(player.isRespawning) continue;
					// Initial Action
					if (isKeyDown && !player.isOwnKeyDown(code)) {
						player.runActionByKeyCode(code);
					}
					// Set Rot
					switch (code) {
						case player.contolKey_Up:
							player.pressUp = isKeyDown;
							break;
						case player.contolKey_Down:
							player.pressDown = isKeyDown;
							break;
						case player.contolKey_Left:
							player.pressLeft = isKeyDown;
							break;
						case player.contolKey_Right:
							player.pressRight = isKeyDown;
							break;
						case player.contolKey_Use:
							player.pressUse = isKeyDown;
							break; /*
						case player.contolKey_Select_Left:
							player.pressLeftSelect=isKeyDown;
							break;
						case player.contolKey_Select_Right:
							player.pressRightSelect=isKeyDown;
							break;*/
					}
				}
			}
		}

		public onStageResize(E: Event): void {
		}

		//====Functions About Gameplay====//

		/**
		 * @param	x	The position x.
		 * @param	y	The position y.
		 * @param	asPlayer	Judge as player
		 * @param	asBullet	Judge as Bullet
		 * @param	asLaser	Judge as Laser
		 * @param	includePlayer	Avoidplayer(returns false)
		 * @param	avoidHurting	Avoidharmful block(returns false)
		 * @return	true if can pass.
		 */
		public testCanPass(x: number, y: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = true, avoidHurting: boolean = false): boolean {
			return testIntCanPass(PosTransform.alignToGrid(x), PosTransform.alignToGrid(y), asPlayer, asBullet, asLaser, includePlayer, avoidHurting);
		}

		public testIntCanPass(x: int, y: int, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = true, avoidHurting: boolean = false): boolean {
			// Debug: trace('testCanPass:'+arguments+';'+this.getBlockAttributes(x,y).bulletCanPass,isHitAnyPlayer(x,y))
			var mapX: int = this.lockPosInMap(x, true);

			var mapY: int = this.lockPosInMap(y, false);

			// if(isOutOfMap(gridX,gridY)) return true
			var attributes: BlockAttributes = this.getBlockAttributes(mapX, mapY);

			if (avoidHurting && attributes.playerDamage > -1)
				return false;

			if (asPlayer && !attributes.playerCanPass)
				return false;

			if (asBullet && !attributes.bulletCanPass)
				return false;

			if (asLaser && !attributes.laserCanPass)
				return false;

			if (includePlayer && isHitAnyPlayer(mapX, mapY))
				return false;

			return true;
		}

		/**
		 * return testCanPass in player's front position.
		 */
		public testFrontCanPass(entity: EntityCommon, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = true, avoidTrap: boolean = false): boolean {
			// Debug: trace('testFrontCanPass:'+entity.type.name+','+entity.getFrontX(distance)+','+entity.getFrontY(distance))
			return testCanPass(entity.getFrontX(distance),
				entity.getFrontY(distance),
				asPlayer, asBullet, asLaser,
				includePlayer, avoidTrap);
		}

		public testBonusBoxCanPlaceAt(x: int, y: int): boolean {
			return this.testIntCanPass(x, y, true, false, false, true, true);
		}

		/**
		 * return testCanPass as player in other position.
		 */
		public testPlayerCanPass(player: Player, x: int, y: int, includePlayer: boolean = true, avoidHurting: boolean = false): boolean {
			// Debug: trace('testPlayerCanPass:'+player.customName+','+x+','+y+','+includePlayer)
			// Define
			var gridX: int = this.lockIntPosInMap(x, true);

			var gridY: int = this.lockIntPosInMap(y, false);

			var attributes: BlockAttributes = this.getBlockAttributes(gridX, gridY);

			// Test
			// if(isOutOfMap(gridX,gridY)) return true
			if (avoidHurting && attributes.playerDamage > -1)
				return false;

			if (!attributes.playerCanPass)
				return false;

			if (includePlayer && isHitAnyPlayer(gridX, gridY))
				return false;

			return true;
		}

		public testFullPlayerCanPass(player: Player, x: int, y: int, oldX: int, oldY: int, includePlayer: boolean = true, avoidHurting: boolean = false): boolean {
			// Debug: trace('testFullPlayerCanPass:'+player.customName+','+x+','+y+','+oldX+','+oldY+','+includePlayer)
			// Target can pass
			if (!testPlayerCanPass(player, x, y, includePlayer, avoidHurting))
				return false;
			// Test Whether OldBlock can Support
			// if(!testPlayerCanPass(player,oldX,oldY,includePlayer,avoidHurting)) return false;//don't support
			return true;
		}

		public testPlayerCanPassToFront(player: Player, rotatedAsRot: uint = 5, includePlayer: boolean = true, avoidTrap: boolean = false): boolean {
			return this.testFullPlayerCanPass(player,
				PosTransform.alignToGrid(player.getFrontIntX(player.moveDistence, rotatedAsRot)),
				PosTransform.alignToGrid(player.getFrontIntY(player.moveDistence, rotatedAsRot)),
				player.gridX, player.gridY,
				includePlayer, avoidTrap);
		}

		public testCarryableWithMap(blockAtt: BlockAttributes, map: IMap): boolean {
			return blockAtt.isCarryable && !(map.isArenaMap && blockAtt.unbreakableInArenaMap);
		}

		public testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean {
			return blockAtt.isBreakable && !(map.isArenaMap && blockAtt.unbreakableInArenaMap);
		}

		public weaponCreateExplode(x: number, y: number, finalRadius: number,
			damage: uint, projectile: ProjectileCommon,
			color: uint, edgePercent: number = 1): void {
			// Operate
			var creater: Player = projectile.owner;
			// Effect
			this._effectSystem.addEffect(new EffectExplode(this, x, y, finalRadius, color));
			// Hurt Player
			var distanceP: number;
			for (var player of this._entitySystem.players) {
				if (player == null)
					continue;
				distanceP = exMath.getDistanceSquare(x, y, player.entityX, player.entityY) / (finalRadius * finalRadius);
				if (distanceP <= 1) {
					// Operate damage by percent
					if (edgePercent < 1)
						damage *= edgePercent + (distanceP * (1 - edgePercent));
					if (projectile == null ||
						(creater == null || creater.canUseWeaponHurtPlayer(player, projectile.currentWeapon))) {
						// Hurt With FinalDamage
						player.finalRemoveHealth(creater, projectile.currentWeapon, damage);
					}
				}
			}
		}

		public laserHurtPlayers(laser: LaserBasic): void {
			// Set Variables
			var attacker: Player = laser.owner;

			var damage: uint = laser.damage;

			var length: uint = laser.length;

			var rot: uint = laser.rot;

			var teleport: boolean = laser is LaserTeleport;

			var absorption: boolean = laser is LaserAbsorption;

			var pulse: boolean = laser is LaserPulse;

			// Pos
			var baseX: int = PosTransform.alignToGrid(laser.entityX);

			var baseY: int = PosTransform.alignToGrid(laser.entityY);

			var vx: int = GlobalRot.towardXInt(rot, 1);

			var vy: int = GlobalRot.towardYInt(rot, 1);

			var cx: int = baseX, cy: int = baseY, players: Player[];

			// var nextBlockAtt:BlockAttributes
			// Damage
			laser.isDamaged = true;

			var finalDamage: uint;
			for (var i: uint = 0; i < length; i++) {
				// nextBlockAtt=this.getBlockAttributes(cx+vx,cy+vy);
				players = getHitPlayers(cx, cy);

				for (var victim of players) {
					if (victim == null)
						continue;

					// Operate
					finalDamage = attacker == null ? damage : victim.computeFinalDamage(attacker, laser.currentWeapon, damage);
					// Effects
					if (attacker == null || attacker.canUseWeaponHurtPlayer(victim, laser.currentWeapon)) {
						// Damage
						victim.removeHealth(finalDamage, attacker);

						// Absorption
						if (attacker != null && !attacker.isRespawning && absorption)
							attacker.heal += damage;
					}
					if (victim != attacker && !victim.isRespawning) {
						if (teleport) {
							spreadPlayer(victim);
						}
						if (pulse) {
							if ((laser as LaserPulse).isPull) {
								if (this.testCanPass(cx - vx, cy - vy, true, false, false, true, false))
									victim.addXY(-vx, -vy);
							}
							else if (this.testCanPass(cx + vx, cy + vy, true, false, false, true, false))
								victim.addXY(vx, vy);
						}
					}
				}
				cx += vx;
				cy += vy;
			}
		}

		public waveHurtPlayers(wave: Wave): void {
			// Set Variables
			var attacker: Player = wave.owner;

			var damage: uint = wave.damage;

			var scale: number = wave.finalScale;

			var rot: uint = wave.rot;

			// Pos
			var baseX: number = wave.entityX;

			var baseY: number = wave.entityY;

			var radius: number = scale;

			for (var victim of this._entitySystem.players) {
				if (victim == null)
					continue;
				// FinalDamage
				if (attacker == null || attacker.canUseWeaponHurtPlayer(victim, wave.currentWeapon)) {
					if (exMath.getDistance(baseX, baseY, victim.entityX, victim.entityY) <= radius) {
						victim.finalRemoveHealth(attacker, wave.currentWeapon, damage);
					}
				}
			}
		}

		public thrownBlockHurtPlayer(block: ThrownBlock): void {
			var attacker: Player = block.owner;
			var damage: uint = block.damage;
			for (var victim of this._entitySystem.players) {
				if (victim == null)
					continue;
				// FinalDamage
				if (attacker == null || attacker.canUseWeaponHurtPlayer(victim, block.currentWeapon)) {
					if (victim.gridX == block.gridX && victim.gridY == block.gridY) {
						victim.finalRemoveHealth(attacker, block.currentWeapon, damage);
					}
				}
			}
		}

		public lightningHurtPlayers(lightning: Lightning, players: Player[], damages: uint[]): void {
			var p: Player, d: uint;
			for (var i: any in players) {
				p = players[i];
				d = damages[i];
				if (p != null)
					p.finalRemoveHealth(lightning.owner, lightning.currentWeapon, d);
			}
		}

		public moveInTestWithEntity(): void {
			// All Player
			for (var player of this._entitySystem.players) {
				player.dealMoveInTest(player.entityX, player.entityY, true, false);
			}
			// BonusBox Displace by Asphyxia/Trap
			for (var i: int = this._entitySystem.bonusBoxCount - 1; i >= 0; i--) {
				var box: BonusBox = this._entitySystem.bonusBoxes[i];
				if (box != null && !testCanPass(box.entityX, box.entityY, true, false, false, false, true)) {
					this._entitySystem.removeBonusBox(box);
				}
			}
		}

		/**
		 * Execute when Player Move in block
		 */
		public moveInTestPlayer(player: Player, isLocationChange: boolean = false): boolean {
			if (!player.isActive)
				return false;
			var x: int = player.gridX;
			var y: int = player.gridY;
			var type: BlockType = this.getBlockType(player.gridX, player.gridY);
			var attributes: BlockAttributes = BlockAttributes.fromType(type);
			var returnBoo: boolean = false;
			if (attributes != null) {
				if (attributes.playerDamage == -1) {
					player.removeHealth(this.computeFinalPlayerHurtDamage(player, x, y, this.rule.playerAsphyxiaDamage), null);
					returnBoo = true;
				}
				else if (attributes.playerDamage > -1) {
					player.removeHealth(this.computeFinalPlayerHurtDamage(player, x, y, attributes.playerDamage), null);
					returnBoo = true;
				}
				else if (attributes.playerDamage == -2) {
					if (!isLocationChange) {
						if (!player.isFullHealth)
							player.addHealth(1);
						else
							player.heal++;
						returnBoo = true;
					}
				}
				if (attributes.rotateWhenMoveIn) {
					player.rot = GlobalRot.randomWithout(player.rot);
					returnBoo = true;
				}
			}
			return returnBoo;
		}

		/**
		 * Operate damage to player by blockAtt.playerDamage,
		 * int.MAX_VALUE -> uint$MAX_VALUE
		 * [...-2) -> 0
		 * -1 -> uint$MAX_VALUE
		 * [0,100] -> player.maxHealth*playerDamage/100
		 * (100...] -> playerDamage-100
		 * @return	The damage.
		 */
		public computeFinalPlayerHurtDamage(player: Player, x: int, y: int, playerDamage: int): uint {
			if (playerDamage < -1)
				return 0;
			if (playerDamage == -1)
				return this.rule.playerAsphyxiaDamage;
			if (playerDamage == int.MAX_VALUE)
				return uint$MAX_VALUE;
			if (playerDamage <= 100)
				return player.maxHealth * playerDamage / 100;
			return playerDamage - 100;
		}

		/**
		 * Execute when Player Move out block
		 * @param	x	the old X
		 * @param	y	the old Y
		 */
		public moveOutTestPlayer(player: Player, x: int, y: int, isLocationChange: boolean = false): void {
			if (!player.isActive)
				return;
			var type: BlockType = this.getBlockType(x, y);
			if (type == BlockType.GATE_OPEN) {
				this.setBlock(x, y, BlockCommon.fromType(BlockType.GATE_CLOSE));
			}
		}

		/**
		 * Function about Player pickup BonusBox
		 */
		public bonusBoxTest(player: Player, x: number = NaN, y: number = NaN): boolean {
			if (!player.isActive)
				return false;
			x = isNaN(x) ? player.gridX : x;
			y = isNaN(y) ? player.gridY : y;
			for (var bonusBox of this._entitySystem.bonusBoxes) {
				if (this.hitTestPlayer(player, bonusBox.gridX, bonusBox.gridY)) {
					bonusBox.onPlayerPickup(player);
					player.onPickupBonusBox(bonusBox);
					this.testGameEnd();
					return true;
				}
			}
			return false;
		}

		//====Functions About Map====//
		public hasBlock(x: int, y: int): boolean {
			return this._map.hasBlock(x, y);
		}

		public getBlock(x: int, y: int): BlockCommon {
			return this._map.getBlock(x, y);
		}

		public getBlockAttributes(x: int, y: int): BlockAttributes {
			return this._map.getBlockAttributes(x, y);
		}

		public getBlockType(x: int, y: int): BlockType {
			return this._map.getBlockType(x, y);
		}

		/**
		 * Set Block in map,and update Block in map displayer.
		 * @param	x	the Block position x.
		 * @param	y	the Block position y.
		 * @param	block	the current Block.
		 */
		public setBlock(x: int, y: int, block: BlockCommon): void {
			this._map.setBlock(x, y, block);
			this.onBlockUpdate(x, y, block);
		}

		public isVoid(x: int, y: int): boolean {
			return this._map.isVoid(x, y);
		}

		/**
		 * Set voidin map,and clear Block in map displayer.
		 * @param	x	the voidposition x.
		 * @param	y	the voidposition y.
		 */
		public setVoid(x: int, y: int): void {
			this._map.setVoid(x, y);
			this.onBlockUpdate(x, y, null);
		}

		public forceMapDisplay(): void {
			if (this._map == null) {
				this._mapDisplayerBottom.removeAllBlock();
				this._mapDisplayerMiddle.removeAllBlock();
				this._mapDisplayerTop.removeAllBlock();
			}
			else
				this._map.forceDisplayToLayers(this._mapDisplayerBottom, this._mapDisplayerMiddle, this._mapDisplayerTop);
		}

		public updateMapDisplay(x: int, y: int, block: BlockCommon): void {
			this._map.updateDisplayToLayers(x, y, block, this._mapDisplayerBottom, this._mapDisplayerMiddle, this._mapDisplayerTop);
		}

		public getDisplayerThenLayer(layer: int): IMapDisplayer {
			return layer > 0 ? this._mapDisplayerTop : ((layer < 0) ? this._mapDisplayerBottom : this._mapDisplayerMiddle);
		}

		public updateMapSize(updateBackground: boolean = true): void {
			// Information
			var originalStageWidth: number = GlobalGameVariables.DISPLAY_SIZE;

			var originalStageHeight: number = originalStageWidth;

			// Square
			var mapGridWidth: uint = this._map == null ? GlobalGameVariables.DISPLAY_GRIDS : this._map.mapWidth;

			var mapGridHeight: uint = this._map == null ? GlobalGameVariables.DISPLAY_GRIDS : this._map.mapHeight;

			var mapShouldDisplayWidth: number = GlobalGameVariables.DEFAULT_SCALE * mapGridWidth * GlobalGameVariables.DEFAULT_SIZE;

			var mapShouldDisplayHeight: number = GlobalGameVariables.DEFAULT_SCALE * mapGridHeight * GlobalGameVariables.DEFAULT_SIZE;

			// Operation
			var isMapDisplayWidthMax: boolean = mapShouldDisplayWidth >= mapShouldDisplayHeight;

			var isStageWidthMax: boolean = originalStageWidth >= originalStageHeight;

			var mapShouldDisplaySizeMax: number = isMapDisplayWidthMax ? mapShouldDisplayWidth : mapShouldDisplayHeight;

			var mapShouldDisplaySizeMin: number = isMapDisplayWidthMax ? mapShouldDisplayHeight : mapShouldDisplayWidth;

			var stageSizeMax: number = isStageWidthMax ? originalStageWidth : originalStageHeight;

			var stageSizeMin: number = isStageWidthMax ? originalStageHeight : originalStageWidth;

			// Oputput
			var displayScale: number = stageSizeMin / mapShouldDisplaySizeMin;

			var shouldX: number = /*-distanceBetweenBorderX+*/(isStageWidthMax ? (originalStageWidth - mapShouldDisplayWidth * displayScale) / 2 : 0);

			var shouldY: number = /*-distanceBetweenBorderY+*/(isStageWidthMax ? 0 : (originalStageHeight - mapShouldDisplayHeight * displayScale) / 2);

			var shouldScale: number = displayScale;

			// Deal
			this.x = shouldX;

			this.y = shouldY;

			this.scaleX = this.scaleY = shouldScale;

			if (updateBackground) {
				this._backGround.x = shouldX;

				this._backGround.y = shouldY;

				this._backGround.scaleX = this._backGround.scaleY = shouldScale;

				this._backGround.updateGrid(mapGridWidth, mapGridHeight);
			}
		}

		/* Change Map into Other
		 */
		public loadMap(isInitial: boolean = false, update: boolean = true, reSperadPlayer: boolean = false): void {
			if (isInitial && this.rule.initialMap != null)
				this.changeMap(this.rule.initialMap, update, reSperadPlayer);
			else if (this.rule.mapRandomPotentials == null && this.rule.initialMapID)
				this.changeMap(getRandomMap(), update, reSperadPlayer);
			else
				this.changeMap(Game.ALL_MAPS[exMath.intMod(exMath.randomByWeightV(this.rule.mapWeightsByGame), Game.VALID_MAP_COUNT)], update, reSperadPlayer);
		}

		/* Get Map from Rule
		 */
		protected getRandomMap(): IMap {
			return this.rule.randomMapEnable.generateNew(); // ALL_MAPS[exMath.random(Game.VALID_MAP_COUNT)].clone()
		}

		/* Change Map into the other
		 */
		public changeMap(map: IMap, update: boolean = true, reSperadPlayer: boolean = false): void {
			// Remove and generateNew
			if (this._map != null)
				this._map.destructor();
			this._map = map.generateNew();
			if (update)
				this.forceMapDisplay();
			if (reSperadPlayer)
				this.spreadAllPlayer();
		}

		public transformMap(destination: IMap = null): void {
			this._entitySystem.removeAllProjectile();
			this._entitySystem.removeAllBonusBox();
			if (destination == null)
				this.loadMap(false, true, true);
			else
				this.changeMap(destination, true, true);
			// Call AI
			var players: Player[] = this.getAlivePlayers();
			for (var player of players) {
				if (player is Player)
				(player as Player).onMapTransform();
			}
			// Stat
			this._stat.mapTransformCount++;
		}

		public isOutOfMap(x: number, y: number): boolean {
			var outCount: uint = 0;

			var posNum: number, posMaxNum: uint;

			for (var i: uint = 0; i < 2; i++) {
				posNum = i == 0 ? x : y;

				posMaxNum = i == 0 ? this.mapWidth : this.mapHeight;

				if (posNum < 0 || posNum >= posMaxNum) {
					return true;
				}
			}
			return false;
		}

		public isIntOutOfMap(x: int, y: int): boolean {
			return (x < 0 || x >= this.mapWidth) || (y < 0 || y >= this.mapHeight);
		}

		//====Functions About Player====//
		protected createPlayer(x: int, y: int, id: uint, team: PlayerTeam, isActive: boolean = true): Player {
			return new Player(this, x, y, team, id, isActive);
		}

		public addPlayer(id: uint, team: PlayerTeam, x: int, y: int, rot: uint = 0, isActive: boolean = true, name: string = null): Player {
			// Define
			var p: Player = createPlayer(x, y, id, team, isActive);
			this._entitySystem.registerPlayer(p);
			// Set
			p.rot = rot;
			p.customName = name == null ? 'P' + id : name;
			// Add
			this._playerContainer.addChild(p);
			// Return
			return p;
		}

		// Set player datas for gaming
		public setupPlayer(player: Player): Player {
			// Position
			this.respawnPlayer(player);
			// Variables
			player.initVariablesByRule(this.rule.defaultWeaponID, this._tempUniformWeapon);
			// GUI
			player.gui.updateHealth();
			// Stats
			this._stat.addPlayer(player);

			return player;
		}

		// Add a player uses random position and weapon
		public appendPlayer(controlKeyID: uint = 0): Player {
			var id: uint = controlKeyID == 0 ? this.nextPlayerID : controlKeyID;
			trace('Append Player in ID', id);
			return this.setupPlayer(
				this.addPlayer(id, this.rule.randomTeam, -1, -1, 0, false, null)
			);
		}

		protected createAI(x: int, y: int, team: PlayerTeam, isActive: boolean = true): AIPlayer {
			return new AIPlayer(this, x, y, team, isActive);
		}

		public addAI(team: PlayerTeam, x: int, y: int, rot: uint = 0, isActive: boolean = true, name: string = null): AIPlayer {
			// Define
			var p: AIPlayer = createAI(x, y, team, isActive);
			this._entitySystem.registerPlayer(p);
			// Set
			p.rot = rot;
			p.customName = name == null ? this.autoGetAIName(p) : name;
			// Add
			this._playerContainer.addChild(p);
			// Return
			return p;
		}

		public appendAI(): Player {
			return this.setupPlayer(
				this.addAI(this.rule.randomTeam, -1, -1, 0, false, null)
			);
		}

		public autoGetAIName(player: AIPlayer): string {
			return 'AI-' + this._entitySystem.AICount + '[' + player.AIProgram.labelShort + ']';
		}

		public spawnPlayersByRule(): void {
			var i: uint, player: Player;

			// Setup Player
			for (i = 0; i < this.rule.playerCount; i++) {
				this.appendPlayer(i + 1);
			}
			// Setup AIPlayer
			for (i = 0; i < this.rule.AICount; i++) {
				this.appendAI();
			}
			// Active Player
			for each(player in this._entitySystem.players) {
				player.isActive = true;
			}
		}

		public teleportPlayerTo(player: Player, x: int, y: int, rotateTo: uint = GlobalRot.NULL, effect: boolean = false): Player {
			player.isActive = false;
			if (GlobalRot.isValidRot(rotateTo))
				player.setPositions(PosTransform.alignToEntity(x), PosTransform.alignToEntity(y), rotateTo);
			else
				player.setXY(PosTransform.alignToEntity(x), PosTransform.alignToEntity(y));
			// Bonus Test<For remove BUG
			this.bonusBoxTest(player, x, y);
			if (effect) {
				this.addTeleportEffect(player.entityX, player.entityY);
				// Stat
				player.stats.beTeleportCount++;
			}
			player.isActive = true;
			return player;
		}

		public spreadPlayer(player: Player, rotatePlayer: boolean = true, createEffect: boolean = true): Player {
			if (player == null || player.isRespawning)
				return player;
			var p: iPoint = new iPoint(0, 0);
			for (var i: uint = 0; i < 0xff; i++) {
				p.x = this.map.randomX;
				p.y = this.map.randomY;
				if (testPlayerCanPass(player, p.x, p.y, true, true)) {
					this.teleportPlayerTo(player, p.x, p.y, (rotatePlayer ? GlobalRot.getRandom() : GlobalRot.NULL), createEffect);
					break;
				}
			}
			// Debug: trace('Spread '+player.customName+' '+(i+1)+' times.')
			return player;
		}

		/**
		 * Respawn player to spawnpoint(if map contained)
		 * @param	player	The player will respawn.
		 * @return	The same as param:player.
		 */
		public respawnPlayer(player: Player): Player {
			// Test
			if (player == null || player.isRespawning)
				return player;
			var p: iPoint = this.map.randomSpawnPoint;
			// Position offer
			if (p != null)
				p = this.findFitSpawnPoint(player, p.x, p.y);
			// p as spawnpoint
			if (p == null)
				this.spreadPlayer(player, true, false);
			else
				player.setPositions(
					PosTransform.alignToEntity(p.x),
					PosTransform.alignToEntity(p.y),
					GlobalRot.getRandom()
				);
			// Spawn Effect
			this.addSpawnEffect(player.entityX, player.entityY);
			this.addPlayerDeathLightEffect2(player.entityX, player.entityY, player, true);
			// Return
			// Debug: trace('respawnPlayer:respawn '+player.customName+'.')
			return player;
		}

		/**
		 * @param	x	SpawnPoint.x
		 * @param	y	SpawnPoint.y
		 * @return	The nearest point from SpawnPoint.
		 */
		protected findFitSpawnPoint(player: Player, x: int, y: int): iPoint {
			// Older Code uses Open List/Close List
			/*{
				var oP:uint[]=new <uint>[UintPointCompress.compressFromPoint(x,y)];
				var wP:uint[]=new uint[]();
				var cP:uint[]=new uint[]();
				var tP:iPoint;
				while(oP.length>0) {
					for(var p of oP) {
						if(cP.indexOf(p)>=0) continue;
						tP=UintPointCompress.releaseFromUint(p);
						if(this.isIntOutOfMap(tP.x,tP.y)) continue;
						if(this.testPlayerCanPass(player,tP.x,tP.y,true,true)) return tP;
						wP.push(
							this.lockIPointInMap(UintPointCompress.compressFromPoint(tP.x-1,tP.y)),
							this.lockIPointInMap(UintPointCompress.compressFromPoint(tP.x+1,tP.y)),
							this.lockIPointInMap(UintPointCompress.compressFromPoint(tP.x,tP.y-1)),
							this.lockIPointInMap(UintPointCompress.compressFromPoint(tP.x,tP.y+1))
						);
						cP.push(p);
					}
					oP=oP.splice(0,oP.length).concat(wP);
					wP.splice(0,wP.length);
				}
			}*/
			// Newest code uses subFindSpawnPoint
			var p: iPoint = null;
			for (var i: uint = 0; p == null && i < (this.mapWidth + this.mapHeight); i++) {
				p = this.subFindSpawnPoint(player, x, y, i);
			}
			return p;
		}

		protected subFindSpawnPoint(player: Player, x: int, y: int, r: int): iPoint {
			for (var cx: int = x - r; cx <= x + r; cx++) {
				for (var cy: int = y - r; cy <= y + r; cy++) {
					if (exMath.intAbs(cx - x) == r && exMath.intAbs(cy - y) == r) {
						if (!this.isOutOfMap(cx, cy) && this.testPlayerCanPass(player, cx, cy, true, true))
							return new iPoint(cx, cy);
					}
				}
			}
			return null;
		}

		public spreadAllPlayer(): void {
			for (var player of this._entitySystem.players) {
				spreadPlayer(player);
			}
		}

		public hitTestOfPlayer(p1: Player, p2: Player): boolean {
			return (p1.getX() == p2.getX() && p1.getY() == p2.getY());
		}

		public hitTestPlayer(player: Player, x: int, y: int): boolean {
			return (x == player.gridX && y == player.gridY);
		}

		public isHitAnyPlayer(x: int, y: int): boolean {
			// Loop
			for (var player of this._entitySystem.players) {
				if (hitTestPlayer(player, x, y))
					return true;
			}
			// Return
			return false;
		}

		public isHitAnotherPlayer(player: Player): boolean {
			// Loop
			for (var p2 of this._entitySystem.players) {
				if (p2 == player)
					continue;

				if (hitTestOfPlayer(player, p2))
					return true;
			}
			// Return
			return false;
		}

		public hitTestOfPlayers(...players): boolean {
			// Transform
			var _pv: Player[] = new Player[];

			var p: any;

			for each(p in players) {
				if(p is Player) {
					_pv.push(p as Player);
				}
			}
			// Test
			for (var p1 of _pv) {
					for (var p2 of _pv) {
						if (p1 == p2)
							continue;

						if (hitTestOfPlayer(p1, p2))
							return true;
					}
				}
			// Return
			return false;
		}

		public getHitPlayers(x: number, y: number): Player[] {
			// Set
			var returnV: Player[] = new Player[];

			// Test
			for (var player of this._entitySystem.players) {
				if (hitTestPlayer(player, x, y)) {
					returnV.push(player);
				}
			}
			// Return
			return returnV;
		}

		public getHitPlayerAt(x: int, y: int): Player {
			for (var player of this._entitySystem.players) {
				if (hitTestPlayer(player, x, y)) {
					return player;
				}
			}
			return null;
		}

		public randomizeAllPlayerTeam(): void {
			for (var player of this._entitySystem.players) {
				this.randomizePlayerTeam(player);
			}
		}

		public randomizePlayerTeam(player: Player): void {
			var tempT: PlayerTeam, i: uint = 0;
			do {
				tempT = this.rule.randomTeam;
			}
			while (tempT == player.team && ++i < 0xf);
			player.team = tempT;
		}

		public setATeamToNotAIPlayer(team: PlayerTeam = null): void {
			var tempTeam: PlayerTeam = team == null ? this.rule.randomTeam : team;

			for (var player of this._entitySystem.players) {
				if (!Player.isAI(player))
					player.team = tempTeam;
			}
		}

		public setATeamToAIPlayer(team: PlayerTeam = null): void {
			var tempTeam: PlayerTeam = team == null ? this.rule.randomTeam : team;

			for (var player of this._entitySystem.players) {
				if (Player.isAI(player))
					player.team = tempTeam;
			}
		}

		public changeAllPlayerWeapon(weapon: WeaponType = null): void {
			if (weapon == null)
				weapon = WeaponType.RANDOM_AVAILABLE;

			for (var player of this._entitySystem.players) {
				player.weapon = weapon;
			}
		}

		public changeAllPlayerWeaponRandomly(): void {
			for (var player of this._entitySystem.players) {
				player.weapon = WeaponType.RANDOM_AVAILABLE;

				player.weaponUsingCD = 0;
			}
		}

		public movePlayer(player: Player, rot: uint, distance: number): void {
			// Detect
			if (!player.isActive || !player.visible)
				return;

			/*For Debug:trace('movePlayer:',player.customName,rot,'pos 1:',player.getX(),player.getY(),
						'pos 2:',player.getFrontX(distance),player.getFrontY(distance),
						'pos 3:',player.getFrontIntX(distance),player.getFrontIntY(distance))
			*/
			player.rot = rot;

			if (testPlayerCanPassToFront(player))
				player.setXY(player.frontX, player.frontY);

			this.onPlayerMove(player);
		}

		public playerUseWeapon(player: Player, rot: uint, chargePercent: number): void {
			// Test CD
			if (player.weaponUsingCD > 0)
				return;
			// Set Variables
			var spawnX: number = player.weapon.useOnCenter ? player.entityX : player.getFrontIntX(GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			var spawnY: number = player.weapon.useOnCenter ? player.entityY : player.getFrontIntY(GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			// Use
			this.playerUseWeaponAt(player, player.weapon, spawnX, spawnY, rot, chargePercent, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
			// Set CD
			player.weaponUsingCD = _rule.weaponsNoCD ? GlobalGameVariables.WEAPON_MIN_CD : player.computeFinalCD(player.weapon);
		}

		public playerUseWeaponAt(player: Player, weapon: WeaponType, x: number, y: number, weaponRot: uint, chargePercent: number, projectilesSpawnDistance: number): void {
			// Set Variables
			var p: ProjectileCommon = null;

			var centerX: number = PosTransform.alignToEntity(PosTransform.alignToGrid(x));

			var centerY: number = PosTransform.alignToEntity(PosTransform.alignToGrid(y));

			var frontBlock: BlockCommon;

			var laserLength: number = this.rule.defaultLaserLength;

			if (WeaponType.isIncludeIn(weapon, WeaponType._LASERS) &&
				!_rule.allowLaserThroughAllBlock) {
				laserLength = this.getLaserLength2(x, y, weaponRot);

				// -projectilesSpawnDistance
			}
			// Debug: trace('playerUseWeapon:','X=',player.getX(),spawnX,'Y:',player.getY(),y)
			// Summon Projectile
			switch (weapon) {
				case WeaponType.BULLET:
					p = new BulletBasic(this, x, y, player);

					break;
				case WeaponType.NUKE:
					p = new BulletNuke(this, x, y, player, chargePercent);

					break;
				case WeaponType.SUB_BOMBER:
					p = new SubBomber(this, x, y, player, chargePercent);

					break;
				case WeaponType.TRACKING_BULLET:
					p = new BulletTracking(this, x, y, player, chargePercent);

					break;
				case WeaponType.LASER:
					p = new LaserBasic(this, x, y, player, laserLength, chargePercent);

					break;
				case WeaponType.PULSE_LASER:
					p = new LaserPulse(this, x, y, player, laserLength, chargePercent);

					break;
				case WeaponType.TELEPORT_LASER:
					p = new LaserTeleport(this, x, y, player, laserLength);

					break;
				case WeaponType.ABSORPTION_LASER:
					p = new LaserAbsorption(this, x, y, player, laserLength);

					break;
				case WeaponType.WAVE:
					p = new Wave(this, x, y, player, chargePercent);

					break;
				case WeaponType.BLOCK_THROWER:
					var carryX: int = this.lockPosInMap(PosTransform.alignToGrid(centerX), true);
					var carryY: int = this.lockPosInMap(PosTransform.alignToGrid(centerY), false);
					frontBlock = this.getBlock(carryX, carryY);
					if (player.isCarriedBlock) {
						// Throw
						if (this.testCanPass(carryX, carryY, false, true, false, false, false)) {
							// Add Block
							p = new ThrownBlock(this, centerX, centerY, player, player.carriedBlock.clone(), weaponRot, chargePercent);
							// Clear
							player.setCarriedBlock(null);
						}
					}
					else if (chargePercent >= 1) {
						// Carry
						if (frontBlock != null && this.testCarryableWithMap(frontBlock.attributes, this.map)) {
							player.setCarriedBlock(frontBlock, false);
							this.setBlock(carryX, carryY, null);
							// Effect
							this.addBlockLightEffect2(centerX, centerY, frontBlock, true);
						}
					}
					break;
				case WeaponType.MELEE:

					break;
				case WeaponType.LIGHTNING:
					p = new Lightning(this, centerX, centerY, weaponRot, player, player.computeFinalLightningEnergy(100) * (0.25 + chargePercent * 0.75));
					break;
				case WeaponType.SHOCKWAVE_ALPHA:
					p = new ShockWaveBase(this, centerX, centerY, player, player == null ? GameRule.DEFAULT_DRONE_WEAPON : player.droneWeapon, player.droneWeapon.chargePercentInDrone);
					break;
				case WeaponType.SHOCKWAVE_BETA:
					p = new ShockWaveBase(this, centerX, centerY, player, player == null ? GameRule.DEFAULT_DRONE_WEAPON : player.droneWeapon, player.droneWeapon.chargePercentInDrone, 1);
					break;
			}
			if (p != null) {
				p.rot = weaponRot;
				this._entitySystem.registerProjectile(p);
				this._projectileContainer.addChild(p);
			}
		}

		protected getLaserLength(player: Player, rot: uint): uint {
			return getLaserLength2(player.entityX, player.entityY, rot);
		}

		protected getLaserLength2(eX: number, eY: number, rot: uint): uint {
			var vx: int = GlobalRot.towardX(rot);

			var vy: int = GlobalRot.towardY(rot);

			var cx: int, cy: int;

			for (var i: uint = 0; i <= this.rule.defaultLaserLength; i++) {
				cx = PosTransform.alignToGrid(eX + vx * i);

				cy = PosTransform.alignToGrid(eY + vy * i);

				if (!_map.getBlockAttributes(cx, cy).laserCanPass)
					break;
			}
			return i;
		}

		public lockEntityInMap(entity: EntityCommon): void {
			var posNum: number, posMaxNum: uint, posFunc: Function;

			for (var i: uint = 0; i < 2; i++) {
				posNum = i == 0 ? entity.entityX : entity.entityY;

				posMaxNum = i == 0 ? this.mapWidth : this.mapHeight;

				posFunc = i == 0 ? entity.setX : entity.setY;

				if (posNum < 0) {
					posFunc(posMaxNum + posNum);
				}
				if (posNum >= posMaxNum) {
					posFunc(posNum - posMaxNum);
				}
			}
		}

		public lockPosInMap(posNum: number, returnAsX: boolean): number {
			var posMaxNum: uint = returnAsX ? this.mapWidth : this.mapHeight;

			if (posNum < 0)
				return lockPosInMap(posMaxNum + posNum, returnAsX);

			else if (posNum >= posMaxNum)
				return lockPosInMap(posNum - posMaxNum, returnAsX);

			else
				return posNum;
		}

		public lockIntPosInMap(posNum: int, returnAsX: boolean): int {
			var posMaxNum: uint = returnAsX ? this.mapWidth : this.mapHeight;

			if (posNum < 0)
				return lockIntPosInMap(posMaxNum + posNum, returnAsX);

			else if (posNum >= posMaxNum)
				return lockIntPosInMap(posNum - posMaxNum, returnAsX);

			else
				return posNum;
		}

		public lockIPointInMap(point: iPoint): iPoint {
			if (point == null)
				return null;
			point.x = exMath.lockInt(point.x, this.mapWidth);
			point.y = exMath.lockInt(point.y, this.mapHeight);
			return point;
		}

		public removeAllPlayer(onlyDisplay: boolean = false): void {
			// Display
			while (this._playerContainer.numChildren > 0)
				this._playerContainer.removeChildAt(0);
			// Entity
			if (!onlyDisplay)
				this._entitySystem.removeAllPlayer();
		}

		//======Entity Functions======//
		public updateProjectilesColor(player: Player = null): void {
			// null means update all projectiles
			for (var projectile of this._entitySystem.projectile) {
				if (player == null || projectile.owner == player) {
					projectile.drawShape();
				}
			}
		}

		public addBonusBox(x: int, y: int, type: BonusType): void {
			// Cannot override
			if (this.hasBonusBoxAt(x, y))
				return;
			// Execute
			var bonusBox: BonusBox = new BonusBox(this, x, y, type);
			this._entitySystem.registerBonusBox(bonusBox);
			this._bonusBoxContainer.addChild(bonusBox);
			// Stat
			this._stat.bonusGenerateCount++;
		}

		protected hasBonusBoxAt(x: int, y: int): boolean {
			for (var box of this.entitySystem.bonusBoxes) {
				if (box.gridX == x && box.gridY == y)
					return true;
			}
			return false;
		}

		public randomAddBonusBox(type: BonusType): void {
			var bonusBox: BonusBox = new BonusBox(this, x, y, type);
			var i: uint = 0, rX: int, rY: int;
			do {
				rX = this._map.randomX;
				rY = this._map.randomY;
			}
			while (!this.testBonusBoxCanPlaceAt(rX, rY) && i < 0xff);

			this.addBonusBox(rX, rY, type);
		}

		public randomAddRandomBonusBox(): void {
			this.randomAddBonusBox(this.rule.randomBonusEnable);
		}

		public fillBonusBox(): void {
			for (var x: uint = 0; x < this.map.mapWidth; x++) {
				for (var y: uint = 0; y < this.map.mapHeight; y++) {
					if (this.testBonusBoxCanPlaceAt(x, y))
						this.addBonusBox(x, y, this.rule.randomBonusEnable);
				}
			}
		}

		//======Effect Functions======//
		public addEffectChild(effect: EffectCommon): void {
			if (effect.layer > 0)
				this._effectContainerTop.addChild(effect);

			else if (effect.layer == 0)
				this._effectContainerMiddle.addChild(effect);

			else
				this._effectContainerBottom.addChild(effect);
		}

		public addSpawnEffect(x: number, y: number): void {
			this._effectSystem.addEffect(new EffectSpawn(this, x, y));
		}

		public addTeleportEffect(x: number, y: number): void {
			this._effectSystem.addEffect(new EffectTeleport(this, x, y));
		}

		public addPlayerDeathLightEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer = null, reverse: boolean = false): void {
			this._effectSystem.addEffect(new EffectPlayerDeathLight(this, x, y, rot, color, aiPlayer == null ? null : aiPlayer.AILabel, reverse));
		}

		public addPlayerDeathFadeoutEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer = null, reverse: boolean = false): void {
			this._effectSystem.addEffect(new EffectPlayerDeathFadeout(this, x, y, rot, color, aiPlayer == null ? null : aiPlayer.AILabel, reverse));
		}

		public addPlayerDeathLightEffect2(x: number, y: number, player: Player, reverse: boolean = false): void {
			this._effectSystem.addEffect(EffectPlayerDeathLight.fromPlayer(this, x, y, player, reverse));
		}

		public addPlayerDeathFadeoutEffect2(x: number, y: number, player: Player, reverse: boolean = false): void {
			this._effectSystem.addEffect(EffectPlayerDeathFadeout.fromPlayer(this, x, y, player, reverse));
		}

		public addPlayerLevelupEffect(x: number, y: number, color: uint, scale: number): void {
			this._effectSystem.addEffect(new EffectPlayerLevelup(this, x, y, color, scale));
		}

		public addBlockLightEffect(x: number, y: number, color: uint, alpha: uint, reverse: boolean = false): void {
			this._effectSystem.addEffect(new EffectBlockLight(this, x, y, color, alpha, reverse));
		}

		public addBlockLightEffect2(x: number, y: number, block: BlockCommon, reverse: boolean = false): void {
			this._effectSystem.addEffect(EffectBlockLight.fromBlock(this, x, y, block, reverse));
		}

		public addPlayerHurtEffect(player: Player, reverse: boolean = false): void {
			this._effectSystem.addEffect(EffectPlayerHurt.fromPlayer(this, player, reverse));
		}

		//======Hook Functions======//
		public onPlayerMove(player: Player): void {
		}

		public onPlayerUse(player: Player, rot: uint, distance: number): void {
		}

		public onPlayerHurt(attacker: Player, victim: Player, damage: uint): void {
			// It's no meaningless of hurt NULL
			if (victim == null)
				return;

			// Set Stats
			if (this.rule.recordPlayerStats) {
				victim.stats.damageBy += damage;

				victim.stats.addDamageByPlayerCount(attacker, damage);

				if (attacker != null) {
					attacker.stats.causeDamage += damage;

					attacker.stats.addCauseDamagePlayerCount(victim, damage);

					if (victim.isSelf(attacker))
						victim.stats.causeDamageOnSelf += damage;

					if (victim.isAlly(attacker))
						victim.stats.damageByAlly += damage;

					if (attacker.isAlly(victim))
						attacker.stats.causeDamageOnAlly += damage;
				}
			}
		}

		/**
		 * Deal the (victim&attacker)'s (stat&heal),add effect and reset (CD&charge)
		 * @param	attacker
		 * @param	victim
		 * @param	damage
		 */
		public onPlayerDeath(attacker: Player, victim: Player, damage: uint): void {
			// It's no meaningless of kill NULL
			if (victim == null)
				return;

			// Clear Heal
			victim.heal = 0;
			// Add Effect
			addPlayerDeathLightEffect2(victim.entityX, victim.entityY, victim);

			addPlayerDeathFadeoutEffect2(victim.entityX, victim.entityY, victim);

			// Set Victim
			victim.visible = false;

			victim.isActive = false;

			// victim.turnAllKeyUp()
			victim.resetCD();

			victim.resetCharge();

			if (Player.isAI(victim))
				(victim as AIPlayer).resetAITick();

			// Set Respawn
			var deadX: int = victim.lockedEntityX, deadY: int = victim.lockedEntityY;

			victim.setXY(this.rule.deadPlayerMoveToX, this.rule.deadPlayerMoveToY);

			victim.respawnTick = this.rule.defaultRespawnTime;

			victim.gui.visible = false;

			// Store Stats
			if (this.rule.recordPlayerStats) {
				victim.stats.deathCount++;

				if (attacker != null) {
					// Attacker
					attacker.stats.killCount++;

					if (Player.isAI(victim))
						attacker.stats.killAICount++;

					attacker.stats.addKillPlayerCount(victim);

					if (attacker.isAlly(victim))
						attacker.stats.killAllyCount++;

					// Victim
					victim.stats.deathByPlayer++;

					if (Player.isAI(attacker))
						victim.stats.deathByAI++;

					if (victim.isSelf(attacker))
						victim.stats.suicideCount++;

					if (victim.isAlly(attacker))
						victim.stats.deathByAllyCount++;

					victim.stats.addDeathByPlayerCount(attacker);
				}
			}
			// Add Bonus By Rule
			if (this.rule.bonusBoxSpawnAfterPlayerDeath &&
				(this.rule.bonusBoxMaxCount < 0 || this._entitySystem.bonusBoxCount < this.rule.bonusBoxMaxCount) &&
				this.testCanPass(deadX, deadY, true, false, true, true, true)) {
				this.addBonusBox(deadX, deadY, this.rule.randomBonusEnable);
			}
			// If Game End
			this.testGameEnd();
		}

		public onPlayerRespawn(player: Player): void {
			// Active
			player.health = player.maxHealth;
			player.isActive = true;
			// Visible
			player.visible = true;
			player.gui.visible = true;
			// Spread&Effect
			this.respawnPlayer(player);
		}

		public prePlayerLocationChange(player: Player, oldX: number, oldY: number): void {
			this.moveOutTestPlayer(player, oldX, oldY);
		}

		public onPlayerLocationChange(player: Player, newX: number, newY: number): void {
			// Detect
			if (!player.isActive || !player.visible)
				return;
			// TransForm Pos:Lock Player In Map
			if (isOutOfMap(player.entityX, player.entityY))
				lockEntityInMap(player);
			player.dealMoveInTestOnLocationChange(newX, newY, true, true);
			this.bonusBoxTest(player, newX, newY);
		}

		public onPlayerTeamsChange(event: GameRuleEvent): void {
			this.randomizeAllPlayerTeam();
		}

		public onPlayerLevelup(player: Player): void {
			var color: uint;
			var i: uint = 0;
			var nowE: uint = exMath.random(4);
			// Add buff of cd,resistance,radius,damage
			while (i < 3) {
				switch (nowE) {
					case 1:
						color = BonusBoxSymbol.BUFF_CD_COLOR;
						player.buffCD += this.rule.bonusBuffAdditionAmount;
						break;
					case 2:
						color = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;
						player.buffResistance += this.rule.bonusBuffAdditionAmount;
						break;
					case 3:
						color = BonusBoxSymbol.BUFF_RADIUS_COLOR;
						player.buffRadius += this.rule.bonusBuffAdditionAmount;
						break;
					default:
						color = BonusBoxSymbol.BUFF_DAMAGE_COLOR;
						player.buffDamage += this.rule.bonusBuffAdditionAmount;
				}
				nowE = (nowE + 1) & 3;
				i++;
				// Add Effect
				this.addPlayerLevelupEffect(player.entityX + (i & 1) - 0.5, player.entityY + (i >> 1) - 0.5, color, 0.75);
			}
		}

		public onRandomTick(x: int, y: int): void {
			// BonusBox(Supply)
			if (testCanPass(x, y, true, false, false, true, true)) {
				if (this.getBlockAttributes(x, y).supplyingBonus ||
					((this.rule.bonusBoxMaxCount < 0 || this._entitySystem.bonusBoxCount < this.rule.bonusBoxMaxCount) &&
						Utils.randomBoolean2(this.rule.bonusBoxSpawnChance))) {
					this.addBonusBox(x, y, this.rule.randomBonusEnable);
				}
			}
			// Other
			switch (this.getBlockType(x, y)) {
				case BlockType.COLOR_SPAWNER:
					this.colorSpawnerSpawnBlock(x, y);
					break;
				case BlockType.LASER_TRAP:
					this.laserTrapShootLaser(x, y);
					break;
				case BlockType.MOVEABLE_WALL:
					this.moveableWallMove(x, y, this.getBlock(x, y));
					break;
				case BlockType.GATE_CLOSE:
					this.setBlock(x, y, BlockCommon.fromType(BlockType.GATE_OPEN));
					break;
			}
		}

		protected onBlockUpdate(x: int, y: int, block: BlockCommon): void {
			this.updateMapDisplay(x, y, block);
			this.updateMapSize();
			this.moveInTestWithEntity();
		}

		//====Block Functions====//
		protected colorSpawnerSpawnBlock(x: int, y: int): void {
			var randomX: int = x + exMath.random1() * (exMath.random(3));

			var randomY: int = y + exMath.random1() * (exMath.random(3));

			var block: ColoredBlock = new ColoredBlock(exMath.random(0xffffff));

			if (!this.isOutOfMap(randomX, randomY) && this.isVoid(randomX, randomY)) {
				this.setBlock(randomX, randomY, block);

				// Add Effect
				this.addBlockLightEffect2(PosTransform.alignToEntity(randomX), PosTransform.alignToEntity(randomY), block, false);
			}
		}

		protected laserTrapShootLaser(x: int, y: int): void {
			var randomRot: uint, rotX: number, rotY: number, laserLength: number;
			// add laser by owner=null
			var p: LaserBasic;
			var i: uint;
			do {
				randomRot = GlobalRot.getRandom();
				rotX = PosTransform.alignToEntity(x) + GlobalRot.towardIntX(randomRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
				rotY = PosTransform.alignToEntity(y) + GlobalRot.towardIntY(randomRot, GlobalGameVariables.PROJECTILES_SPAWN_DISTANCE);
				if (isOutOfMap(rotX, rotY))
					continue;
				laserLength = getLaserLength2(rotX, rotY, randomRot);
				if (laserLength <= 0)
					continue;
				switch (exMath.random(4)) {
					case 1:
						p = new LaserTeleport(this, rotX, rotY, null, laserLength);
						break;
					case 2:
						p = new LaserAbsorption(this, rotX, rotY, null, laserLength);
						break;
					case 3:
						p = new LaserPulse(this, rotX, rotY, null, laserLength);
						break;
					default:
						p = new LaserBasic(this, rotX, rotY, null, laserLength, 1);
						break;
				}
				if (p != null) {
					p.rot = randomRot;
					this.entitySystem.registerProjectile(p);
					this._projectileContainer.addChild(p);
					// trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
				}
			}
			while (laserLength <= 0 && ++i < 0x10);
		}

		protected moveableWallMove(x: int, y: int, block: BlockCommon): void {
			var randomRot: uint, rotX: number, rotY: number, laserLength: number;
			// add laser by owner=null
			var p: ThrownBlock;
			var i: uint;
			do {
				randomRot = GlobalRot.getRandom();
				rotX = x + GlobalRot.towardXInt(randomRot);
				rotY = y + GlobalRot.towardYInt(randomRot);
				if (this.isIntOutOfMap(rotX, rotY) || !this.testIntCanPass(rotX, rotY, false, true, false, false))
					continue;
				p = new ThrownBlock(this, PosTransform.alignToEntity(x), PosTransform.alignToEntity(y), null, block.clone(), randomRot, Math.random());
				this.setVoid(x, y);
				this.entitySystem.registerProjectile(p);
				this._projectileContainer.addChild(p);
				// trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
				if (!(block is MoveableWall && (block as MoveableWall).virus))
				break;
			}
			while (++i < 0x10);
		}
	}
}