/**
 * 这个文件是为了「先做出一个最精简版本，然后再逐渐复刻旧有机制」方法所实践的代码
 * * 后续`Matrix_V1.ts`等文件会从中逐渐迁移代码
 */

import { IBatrShape } from "../../display/api/DisplayInterfaces";
import { DISPLAY_SIZE, DISPLAY_GRIDS, DEFAULT_SCALE, DEFAULT_SIZE } from "../../display/api/GlobalDisplayVariables";
import FixedI18nText from "../../display/api/i18n/FixedI18nText";
import I18nKey from "../../display/api/i18n/I18nKey";
import I18nText from "../../display/api/i18n/I18nText";
import I18ns from "../../display/api/i18n/I18ns";
import IMapDisplayer from "../../display/api/map/IMapDisplayer";
import I18nsChangeEvent from "../../display/menu.deprecated/event/I18nsChangeEvent";
import Menu from "../../display/menu.deprecated/main/Menu";
import { int, uint } from "../../legacy/AS3Legacy";
import { Sprite, DisplayObject } from "../../legacy/flash/display";
import { getTimer } from "../../legacy/flash/utils";
import Block from "../api/block/Block";
import BlockAttributes from "../api/block/BlockAttributes";
import Entity from "../api/entity/Entity";
import EntitySystem from "../api/entity/EntitySystem";
import IMap from "../api/map/IMap";
import IWorldRegistry from "../api/registry/IWorldRegistry";
import BonusBox from "../mods/native/entities/item/BonusBox";
import IPlayer from "../mods/native/entities/player/IPlayer";
import Player from "../mods/native/entities/player/Player";
import PlayerTeam from "../mods/native/entities/player/team/PlayerTeam";
import { getPlayers } from "../mods/native/mechanics/NativeMatrixMechanics";
import { BonusType } from "../mods/native/registry/BonusRegistry";
import MatrixResult from "../mods/native/stat/MatrixResult";
import MatrixStats from "../mods/native/stat/MatrixStats";
import Tool from "../mods/native/tool/Tool";
import WorldRuleEvent from "../rule/WorldRuleEvent";
import { TICK_TIME_MS } from "./GlobalWorldVariables";
import IMatrix from "./IMatrix";

/**
 * 母体的第一代实现
 * * 具体功能&作用，参考其实现的接口
 */
export default class Matrix_V1 implements IMatrix {

	// TODO: 🏗️事件订阅、分派机制完善
	// protected _eventBus: Function[] = [];//EventBus;

	protected _registry: IWorldRegistry;
	get registry(): IWorldRegistry { }

	//============Static Variables============//

	/* public static readonly MAP_TRANSFORM_TEXT_FORMAT: TextFormat = new TextFormat(
		new MainFont().fontName,
		DEFAULT_SIZE * 5 / 8,
		0x3333ff,
		true,
		null,
		null,
		null,
		null,
		TextFormatAlign.LEFT); */

	/**
	 * 用于专门「分层级显示实体」的「显示地图」
	 * * 主要是为了后续与显示端对接，便于分层级管理（而无需使用额外容器）
	 * 
	 * ! 利用了JS中「数组可以跳跃式赋值，而不用担心越界」的特性
	 * 
	 * TODO: 后续专门提取出「显示对接模块」用于对接代码
	 */
	protected static readonly _displayLayer_Map: IBatrShape[][] = [];

	/* public static readonly WORLD_PLAYING_TIME_TEXT_FORMAT: TextFormat = new TextFormat(
		new MainFont().fontName,
		DEFAULT_SIZE * 5 / 8,
		0x66ff66,
		true,
		null,
		null,
		null,
		null,
		TextFormatAlign.LEFT); */

	public static debugMode: boolean = false;

	//============Static Getter And Setter============//
	public static get VALID_MAP_COUNT(): int {
		return World.ALL_MAPS.length;
	}

	//============Static Functions============//
	public static getMapFromID(id: int): IMap {
		if (id >= 0 && id < World.VALID_MAP_COUNT)
			return World.ALL_MAPS[id];
		return null;
	}

	public static getIDFromMap(map: IMap): int {
		return World.ALL_MAPS.indexOf(map);
	}

	// Tools
	public static joinNamesFromPlayers(players: IPlayer[]): string {
		let result: string = '';
		for (let i: uint = 0; i < players.length; i++) {
			if (players[i] === null)
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

	/** The reference of Subject */
	/* protected _subject: BatrSubject; */
	protected _map: IMap;

	/** Internal WorldRule copy from Subject */
	protected _rule: WorldRule;

	protected _stat: MatrixStats;

	// System
	protected _entitySystem: EntitySystem;

	protected _effectSystem: EffectSystem;

	// Background
	protected _backGround: Background = new Background(0, 0, true, false, true);

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
	protected _isActive: boolean = false;
	public get isActive(): boolean { return this._isActive; }
	protected _isLoaded: boolean = false;
	public get isLoaded(): boolean { return this._isLoaded; }

	protected _tickTimer: Timer = new Timer(TICK_TIME_MS);
	// protected _secondTimer:Timer=new Timer(1000);//When a timer stop and start the timer will lost its phase.
	protected _speed: number;

	// Frame Complement
	protected _lastTime: int;
	protected _timeDistance: uint;
	protected _expectedFrames: uint;
	protected _enableFrameComplement: boolean;

	// Temp
	protected _tempUniformTool: Tool;

	protected _tempMapTransformSecond: uint;

	// protected _tempTimer:int=getTimer();
	protected _tempSecondPhase: uint = 0;
	protected _second: uint;
	protected _temp_world_rate: number = 0.0;

	//========🎯规则部分：规则加载、规则读写========//


	//========🗺️地图部分：地图加载、地图变换等========//
	get loadedMaps(): IMap[] {
		throw new Error("Method not implemented.");
	}

	get numLoadedMaps(): number {
		throw new Error("Method not implemented.");
	}

	//============Constructor & Destructor============//
	public constructor(subject: BatrSubject, active: boolean = false) {
		super();
		this._subject = subject;
		this._entitySystem = new EntitySystem(this);
		this._effectSystem = new EffectSystem(this);
		this.initDisplay();
		this.isActive = active;
		this.addEventListener(Event.ADDED_TO_STAGE, this.onAddedToStage);
	}

	//========🌟实体部分：实体管理、实体事件等========//

	// 实现：委托到「实体系统」
	public addEntity(entity: Entity): boolean {
		this._entitySystem.add(entity)
		return true;
	}

	// 实现：委托到「实体系统」
	public addEntities(...entities: Entity[]): void {
		for (const entity of entities)
			this._entitySystem.add(entity);
	}

	// 实现：委托到「实体系统」
	public removeEntity(entity: Entity): boolean {
		return this._entitySystem.remove(entity);
	}

	//============Instance Getter And Setter============//
	//======Main Getters======//
	public get subject(): BatrSubject {
		return this._subject;
	}

	public get menu(): Menu {
		return this._subject.menuObj;
	}

	public get rule(): WorldRule {
		return this._rule;
	}

	public set isActive(value: boolean) {
		if (value == this._isActive)
			return;
		this._isActive = value;
		if (value) {
			// Key
			this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.onWorldKeyDown);
			this.stage.addEventListener(KeyboardEvent.KEY_UP, this.onWorldKeyUp);
			// Timer
			this._tickTimer.addEventListener(TimerEvent.TIMER, this.onWorldTick);
			this._tickTimer.start();
			// this._secondTimer.addEventListener(TimerEvent.TIMER,this.dealSecond);
			// this._secondTimer.start();
			// lastTime
			this._lastTime = getTimer();
		}
		else {
			// Key
			this.stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.onWorldKeyDown);
			this.stage.removeEventListener(KeyboardEvent.KEY_UP, this.onWorldKeyUp);
			// Timer
			this._tickTimer.removeEventListener(TimerEvent.TIMER, this.onWorldTick);
			this._tickTimer.stop();
			// this._secondTimer.removeEventListener(TimerEvent.TIMER,this.dealSecond);
			// this._secondTimer.stop();
		}
	}

	public get visibleHUD(): boolean {
		return this._globalHUDContainer.visible;
	}

	public set visibleHUD(value: boolean) {
		this._globalHUDContainer.visible = value;
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
	}

	public get enableFrameComplement(): boolean {
		return this._enableFrameComplement;
	}

	public set enableFrameComplement(value: boolean) {
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
		let id: uint = 1;
		for (let player of getPlayers(this)) {
			if (!Player.isAI(player))
				id++;
		}
		return id;
	}

	public get nextAIID(): uint {
		let id: uint = 1;
		for (let player of getPlayers(this)) {
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
		return World.getIDFromMap(this._map);
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

	public set mapVisible(value: boolean) {
		if (this._mapDisplayerBottom as DisplayObject !== null)
			(this._mapDisplayerBottom as DisplayObject).visible = value;
		if (this._mapDisplayerMiddle as DisplayObject !== null)
			(this._mapDisplayerMiddle as DisplayObject).visible = value;
		if (this._mapDisplayerTop as DisplayObject !== null)
			(this._mapDisplayerTop as DisplayObject).visible = value;
	}

	public set entityAndEffectVisible(value: boolean) {
		this._effectContainerTop.visible = this._effectContainerMiddle.visible = this._effectContainerBottom.visible = this._bonusBoxContainer.visible = this._playerGUIContainer.visible = this._playerContainer.visible = value;
	}

	//========World AI Interface========//
	public get allAvailableBonusBox(): BonusBox[] {
		return this.entitySystem.bonusBoxes;
	}

	public getBlockPlayerDamage(x: int, y: int): int {
		//! TODO: 从地图处移植
	}

	public isKillZone(x: int, y: int): boolean {
		//! TODO: 从地图处移植
	}

	//============Instance Functions============//
	//========About World End========//

	/** Condition: Only one team's player alive. */
	protected isPlayersEnd(players: IPlayer[]): boolean {
		if (this.numPlayers < 2)
			return false;
		let team: PlayerTeam = null;
		for (let player of players) {
			if (team === null)
				team = player.team;
			else if (player.team != team)
				return false;
		}
		return true;
	}

	public getAlivePlayers(): IPlayer[] {
		let result: IPlayer[] = new Array<Player>();
		for (let player of getPlayers(this)) {
			if (player === null)
				continue;
			if (!player.isCertainlyOut)
				result.push(player);
		}
		return result;
	}

	public getInMapPlayers(): IPlayer[] {
		let result: IPlayer[] = new Array<Player>();
		for (let player of getPlayers(this)) {
			if (player === null)
				continue;
			if (player.HP > 0 && !(player.isRespawning || this.isOutOfMap(player.entityX, player.entityY)))
				result.push(player);
		}
		return result;
	}

	public testWorldEnd(force: boolean = false): void {
		let alivePlayers: IPlayer[] = this.getAlivePlayers();
		if (this.isPlayersEnd(alivePlayers) || force) {
			// if allowTeamVictory=false,reset team colors
			if (!force && alivePlayers.length > 1 && !this.rule.allowTeamVictory) {
				this.resetPlayersTeamInDifferent(alivePlayers);
			}
			// World End with winners
			else
				this.onWorldEnd(alivePlayers);
		}
	}

	protected resetPlayersTeamInDifferent(players: IPlayer[]): void {
		let tempTeamIndex: uint = exMath.random(this.rule.playerTeams.length);
		for (let player of players) {
			player.team = this.rule.playerTeams[tempTeamIndex];
			tempTeamIndex = (tempTeamIndex + 1) % this.rule.playerTeams.length;
		}
	}

	protected onWorldEnd(winners: IPlayer[]): void {
		this.subject.pauseWorld();
		this.subject.gotoMenu();
		this.subject.menuObj.loadResult(this.getMatrixResult(winners));
	}

	protected getMatrixResult(winners: IPlayer[]): MatrixResult {
		let result: MatrixResult = new MatrixResult(this,
			this.getResultMessage(winners),
			this._stat
		);
		return result;
	}

	protected getResultMessage(winners: IPlayer[]): I18nText {
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
				World.joinNamesFromPlayers(winners)
			);
		}
	}

	//====Functions About Init====//
	protected onAddedToStage(E: Event): void {
		this.removeEventListener(Event.ADDED_TO_STAGE, this.onAddedToStage);
		// this.addEventListener(Event.ENTER_FRAME,onEnterFrame);
		this.subject.addEventListener(I18nsChangeEvent.TYPE, this.onI18nsChange);
		this.addChildren();
	}

	protected initDisplay(): void {
		// HUD Text
		this._mapTransformTimeText.setBlockPos(0, 23);
		this._mapTransformTimeText.defaultTextFormat = World.MAP_TRANSFORM_TEXT_FORMAT;
		this._mapTransformTimeText.selectable = false;
		this._worldPlayingTimeText.setBlockPos(0, 0);
		this._worldPlayingTimeText.defaultTextFormat = World.WORLD_PLAYING_TIME_TEXT_FORMAT;
		this._worldPlayingTimeText.selectable = false;
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
		this._globalHUDContainer.addChild(this._worldPlayingTimeText);
	}

	//====Functions About World Global Running====//
	public initByRule(rule: WorldRule, becomeActive: boolean = false): boolean {
		// Check
		if (this._isLoaded)
			return false;
		// Update
		this._rule = rule;
		this.loadMap(true, true, false);
		this.updateMapSize(true);
		this._isLoaded = true;
		this._tempUniformTool = this._rule.randomToolEnable;
		this._tempMapTransformSecond = this.mapTransformPeriod;
		this._speed = 1;
		// Stats
		this._stat = new MatrixStats(this._rule); // will be load by spawnPlayersByRule
		// Players
		this.spawnPlayersByRule();
		// Timer
		this._tickTimer.reset();
		// this._tempTimer=getTimer();
		this._tempSecondPhase = 0;
		this._second = 0;
		this.updateGUIText();
		// Listen
		this._rule.addEventListener(WorldRuleEvent.TEAMS_CHANGE, this.onPlayerTeamsChange);
		// Active
		if (becomeActive)
			this.isActive = true;
		// Return
		return true;
	}

	public reset(): boolean {
		// Check
		if (!this._isLoaded)
			return false;
		// Listen
		this._rule.removeEventListener(WorldRuleEvent.TEAMS_CHANGE, this.onPlayerTeamsChange);
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
		this.clearPlayer(false);
		// Entity
		this._entitySystem.clearEntity(); // NonPlayer Entity
		// Effect
		this._effectSystem.clearEffect();
		// Return
		return true;
	}

	public restart(rule: WorldRule, becomeActive: boolean = false): void {
		this.reset();
		this.initByRule(rule, becomeActive);
	}

	public forceStart(rule: WorldRule, becomeActive: boolean = false): boolean {
		return (this._isLoaded ? this.restart : this.initByRule)(rule, becomeActive);
	}

	public tick(): void {
		//=====Ticking=====//
		this._tempSecondPhase += this._tickTimer.delay;
		if (this._tempSecondPhase >= 1000) {
			this._tempSecondPhase -= 1000;
			this._second++;
			this.dealSecond();
		}
		//=====Entity TickRun=====//
		for (let entity of this._entitySystem.entities) {
			if (entity !== null) {
				if (entity.isActive) {
					entity.tickFunction();
				}
			}
			else {
				this._entitySystem.GC();
			}
		}
		//=====Player TickRun=====//
		for (let player of getPlayers(this)) {
			if (player !== null) {
				// Respawn About
				if (player.infinityLife || player.lives > 0) {
					if (!player.isActive && player.respawnTick >= 0) {
						player.dealRespawn();
					}
				}
			}
		}
		//=====Effect TickRun=====//
		for (let effect of this._effectSystem.effects) {
			if (effect !== null) {
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

	protected onWorldTick(E: Event): void {
		let i: number = this._speed;

		// Frame Complement
		if (this._enableFrameComplement) {
			// Ranging
			this._timeDistance = getTimer() - this._lastTime;
			// Computing<Experimental>
			this._expectedFrames = this._timeDistance / TICK_TIME_MS;
			if (this._expectedFrames > 1)
				console.log('this._expectedFrames>1! value=', this._expectedFrames, 'distance=', this._timeDistance);

			i = this._expectedFrames * this._speed;
			// Synchronize
			this._lastTime += this._expectedFrames * TICK_TIME_MS; // this._timeDistance;
		}
		// i end at 0
		this._temp_world_rate += i;
		while (this._temp_world_rate >= 1) {
			this._temp_world_rate--;
			this.tick();
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
		if (this.translations === null || this.rule === null)
			return;
		this._mapTransformTimeText.setText(
			I18ns.getI18n(
				this.translations,
				I18nKey.REMAIN_TRANSFORM_TIME
			) + ': ' + this._tempMapTransformSecond +
			'/' + this.rule.mapTransformTime
		);
		this._worldPlayingTimeText.setText(
			I18ns.getI18n(
				this.translations,
				I18nKey.WORLD_DURATION
			) + ': ' + this._second);
		this._mapTransformTimeText.visible = this.rule.mapTransformTime > 0;
	}

	protected onI18nsChange(event: Event): void {
		this.updateGUIText();
	}

	protected onWorldKeyDown(E: KeyboardEvent): void {
		let code: uint = E.keyCode;
		let ctrl: boolean = E.ctrlKey;
		let alt: boolean = E.altKey;
		let shift: boolean = E.shiftKey;
		// End World
		if (shift && code == KeyCode.ESC) {
			fscommand('quit');
			return;
		}
		// Player Control
		this.dealKeyDownWithPlayers(E.keyCode, true);
	}

	protected onWorldKeyUp(E: KeyboardEvent): void {
		// Player Control
		this.dealKeyDownWithPlayers(E.keyCode, false);
	}

	protected dealKeyDownWithPlayers(code: uint, isKeyDown: boolean): void {
		if (this._entitySystem.playerCount > 0) {
			for (let player of getPlayers(this)) {
				// Detect - NOT USE:if(player.isRespawning) continue;
				// Initial Action
				if (isKeyDown && !player.isOwnKeyDown(code)) {
					player.runActionByKeyCode(code);
				}
				// Set Rot
				switch (code) {
					case player.controlKey_Up:
						player.pressUp = isKeyDown;
						break;
					case player.controlKey_Down:
						player.pressDown = isKeyDown;
						break;
					case player.controlKey_Left:
						player.pressLeft = isKeyDown;
						break;
					case player.controlKey_Right:
						player.pressRight = isKeyDown;
						break;
					case player.controlKey_Use:
						player.isUsing = isKeyDown;
						break; /*
						case player.controlKey_Select_Left:
							player.pressLeftSelect=isKeyDown;
							break;
						case player.controlKey_Select_Right:
							player.pressRightSelect=isKeyDown;
							break;*/
				}
			}
		}
	}

	public onStageResize(E: Event): void {
	}

	//====Functions About Worldplay====//

	public blockTestWithEntitiesInGrid(): void {
		// TODO: 泛化为「遍历所有格点实体」
		// All Player
		for (let player of getPlayers(this)) {
			player.dealMoveInTest(player.entityX, player.entityY, true, false);
		}
		// BonusBox Displace by Asphyxia/Trap
		for (let i: int = this._entitySystem.bonusBoxCount - 1; i >= 0; i--) {
			this._entitySystem.bonusBoxes[i].onPositedBlockUpdate(this);
		}
	}

	/** Execute when Player Move in block */
	public onPlayerWalkIn(player: IPlayer, isLocationChange: boolean = false): boolean {
		if (!player.isActive)
			return false;
		let x: int = player.gridX;
		let y: int = player.gridY;
		let type: BlockType = this.getBlockType(player.gridX, player.gridY);
		let attributes: BlockAttributes = BlockAttributes.fromType(type);
		let returnBoo: boolean = false;
		if (attributes !== null) {
			if (attributes.playerDamage == -1) {
				player.removeHP(this.computeFinalPlayerHurtDamage(player, x, y, this.rule.playerAsphyxiaDamage), null);
				returnBoo = true;
			}
			else if (attributes.playerDamage > -1) {
				player.removeHP(this.computeFinalPlayerHurtDamage(player, x, y, attributes.playerDamage), null);
				returnBoo = true;
			}
			else if (attributes.playerDamage == -2) {
				if (!isLocationChange) {
					if (!player.isFullHP)
						player.addHP(1);
					else
						player.heal++;
					returnBoo = true;
				}
			}
			if (attributes.rotateWhenMoveIn) {
				player.rot = 1//GlobalRot.randomWithout(player.rot); // TODO: 随机向某方向旋转
				returnBoo = true;
			}
		}
		return returnBoo;
	}

	/**
	 * 对接「原生世界机制」`getBonusBoxes`的约定
	 * 
	 * TODO: 仍然要等进一步「专用化」，或许「实体系统」要再次抽象？
	 */
	get bonusBoxes(): BonusBox[] {
		return this._entitySystem.getAllEntry().filter(
			(e) => e instanceof BonusBox
		) as BonusBox[];
	}

	//====Functions About Map====//
	public hasBlock(x: int, y: int): boolean {
		return this._map.hasBlock(x, y);
	}

	public getBlock(x: int, y: int): Block {
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
	public setBlock(x: int, y: int, block: Block): void {
		this._map.setBlock(x, y, block);
		this.onBlockUpdate(x, y, block);
	}

	public isVoid(x: int, y: int): boolean {
		return this._map.isVoid(x, y);
	}

	/**
	 * Set void in map,and clear Block in map displayer.
	 * @param	x	the void position x.
	 * @param	y	the void position y.
	 */
	public setVoid(x: int, y: int): void {
		this._map.setVoid(x, y);
		this.onBlockUpdate(x, y, null);
	}

	public forceMapDisplay(): void {
		if (this._map === null) {
			this._mapDisplayerBottom.clearBlock();
			this._mapDisplayerMiddle.clearBlock();
			this._mapDisplayerTop.clearBlock();
		}
		else
			this._map.forceDisplayToLayers(this._mapDisplayerBottom, this._mapDisplayerMiddle, this._mapDisplayerTop);
	}

	public updateMapDisplay(x: int, y: int, block: Block): void {
		this._map.updateDisplayToLayers(x, y, block, this._mapDisplayerBottom, this._mapDisplayerMiddle, this._mapDisplayerTop);
	}

	public getDisplayerThenLayer(layer: int): IMapDisplayer {
		return layer > 0 ? this._mapDisplayerTop : ((layer < 0) ? this._mapDisplayerBottom : this._mapDisplayerMiddle);
	}

	public updateMapSize(updateBackground: boolean = true): void {
		// Information
		let originalStageWidth: number = DISPLAY_SIZE;

		let originalStageHeight: number = originalStageWidth;

		// Square
		let mapGridWidth: uint = this._map === null ? DISPLAY_GRIDS : this._map.mapWidth;

		let mapGridHeight: uint = this._map === null ? DISPLAY_GRIDS : this._map.mapHeight;

		let mapShouldDisplayWidth: number = DEFAULT_SCALE * mapGridWidth * DEFAULT_SIZE;

		let mapShouldDisplayHeight: number = DEFAULT_SCALE * mapGridHeight * DEFAULT_SIZE;

		// Operation
		let isMapDisplayWidthMax: boolean = mapShouldDisplayWidth >= mapShouldDisplayHeight;

		let isStageWidthMax: boolean = originalStageWidth >= originalStageHeight;

		let mapShouldDisplaySizeMax: number = isMapDisplayWidthMax ? mapShouldDisplayWidth : mapShouldDisplayHeight;

		let mapShouldDisplaySizeMin: number = isMapDisplayWidthMax ? mapShouldDisplayHeight : mapShouldDisplayWidth;

		let stageSizeMax: number = isStageWidthMax ? originalStageWidth : originalStageHeight;

		let stageSizeMin: number = isStageWidthMax ? originalStageHeight : originalStageWidth;

		// Output
		let displayScale: number = stageSizeMin / mapShouldDisplaySizeMin;

		let shouldX: number = /*-distanceBetweenBorderX+*/(isStageWidthMax ? (originalStageWidth - mapShouldDisplayWidth * displayScale) / 2 : 0);

		let shouldY: number = /*-distanceBetweenBorderY+*/(isStageWidthMax ? 0 : (originalStageHeight - mapShouldDisplayHeight * displayScale) / 2);

		let shouldScale: number = displayScale;

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
	public loadMap(isInitial: boolean = false, update: boolean = true, reSpreadPlayer: boolean = false): void {
		if (isInitial && this.rule.initialMap !== null)
			this.changeMap(this.rule.initialMap, update, reSpreadPlayer);
		else if (this.rule.mapRandomPotentials === null && this.rule.initialMapID)
			this.changeMap(this.getRandomMap(), update, reSpreadPlayer);
		else
			this.changeMap(World.ALL_MAPS[exMath.intMod(exMath.randomByWeightV(this.rule.mapWeightsByWorld), World.VALID_MAP_COUNT)], update, reSpreadPlayer);
	}

	/* Get Map from Rule
	 */
	protected getRandomMap(): IMap {
		return this.rule.randomMapEnable.generateNew(); // ALL_MAPS[exMath.random(World.VALID_MAP_COUNT)].copy()
	}

	/* Change Map into the other
	 */
	public changeMap(map: IMap, update: boolean = true, reSpreadPlayer: boolean = false): void {
		// Remove and generateNew
		if (this._map !== null)
			this._map.destructor();
		this._map = map.generateNew();
		if (update)
			this.forceMapDisplay();
		if (reSpreadPlayer)
			this.spreadAllPlayer();
	}

	public transformMap(destination: IMap = null): void {
		this._entitySystem.clearProjectile();
		this._entitySystem.clearBonusBox();
		if (destination === null)
			this.loadMap(false, true, true);
		else
			this.changeMap(destination, true, true);
		// Call AI
		let players: IPlayer[] = this.getAlivePlayers();
		for (let player of players) {
			if (player instanceof Player)
				(player as Player).onMapTransform();
		}
		// Stat
		this._stat.mapTransformCount++;
	}

	public isOutOfMap(x: number, y: number): boolean {
		let outCount: uint = 0;

		let posNum: number, posMaxNum: uint;

		for (let i: uint = 0; i < 2; i++) {
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
	protected createPlayer(x: int, y: int, id: uint, team: PlayerTeam, isActive: boolean = true): IPlayer {
		return new Player(this, x, y, team, id, isActive);
	}

	public addPlayer(id: uint, team: PlayerTeam, x: int, y: int, rot: uint = 0, isActive: boolean = true, name: string = null): IPlayer {
		// Define
		let p: IPlayer = this.createPlayer(x, y, id, team, isActive);
		this._entitySystem.addPlayer(p);
		// Set
		p.rot = rot;
		p.customName = name === null ? 'P' + id : name;
		// Add
		this._playerContainer.addChild(p);
		// Return
		return p;
	}

	// Set player datas for gaming
	public setupPlayer(player: IPlayer): IPlayer {
		// Position
		this.respawnPlayer(player);
		// Variables
		player.initVariablesByRule(this.rule.defaultTool, this._tempUniformTool);
		// GUI
		player.gui.updateHP();
		// Stats
		this._stat.addPlayer(player);

		return player;
	}

	// Add a player uses random position and tool
	public appendPlayer(controlKeyID: uint = 0): IPlayer {
		let id: uint = controlKeyID == 0 ? this.nextPlayerID : controlKeyID;
		console.log('Append Player in ID', id);
		return this.setupPlayer(
			this.addPlayer(id, this.rule.randomTeam, -1, -1, 0, false, null)
		);
	}

	protected createAI(x: int, y: int, team: PlayerTeam, isActive: boolean = true): AIPlayer {
		return new AIPlayer(this, x, y, team, isActive);
	}

	public addAI(team: PlayerTeam, x: int, y: int, rot: uint = 0, isActive: boolean = true, name: string = null): AIPlayer {
		// Define
		let p: AIPlayer = this.createAI(x, y, team, isActive);
		this._entitySystem.addPlayer(p);
		// Set
		p.rot = rot;
		p.customName = name === null ? this.autoGetAIName(p) : name;
		// Add
		this._playerContainer.addChild(p);
		// Return
		return p;
	}

	public appendAI(): IPlayer {
		return this.setupPlayer(
			this.addAI(this.rule.randomTeam, -1, -1, 0, false, null)
		);
	}

	public autoGetAIName(player: AIPlayer): string {
		return 'AI-' + this._entitySystem.AICount + '[' + player.AIProgram.labelShort + ']';
	}

	public spawnPlayersByRule(): void {
		let i: uint, player: IPlayer;

		// Setup Player
		for (i = 0; i < this.rule.playerCount; i++) {
			this.appendPlayer(i + 1);
		}
		// Setup AIPlayer
		for (i = 0; i < this.rule.AICount; i++) {
			this.appendAI();
		}
		// Active Player
		for (player of getPlayers(this)) {
			player.isActive = true;
		}
	}

	/* public isHitAnotherPlayer(player: IPlayer): boolean {
		// Loop
		for (let p2 of getPlayers(this)) {
			if (p2 == player)
				continue;

			if (this.hitTestOfPlayer(player, p2))
				return true;
		}
		// Return
		return false;
	} */

	public hitTestOfPlayers(...players): boolean {
		// Transform
		let _pv: IPlayer[] = new Player[];

		let p: any;

		for (p of players) {
			if (p instanceof Player) {
				_pv.push(p as Player);
			}
		}
		// Test
		for (let p1 of _pv) {
			for (let p2 of _pv) {
				if (p1 == p2)
					continue;

				if (this.hitTestOfPlayer(p1, p2))
					return true;
			}
		}
		// Return
		return false;
	}

	public getHitPlayers(x: number, y: number): IPlayer[] {
		// Set
		let returnV: IPlayer[] = new Player[];

		// Test
		for (let player of getPlayers(this)) {
			if (this.hitTestPlayer(player, x, y)) {
				returnV.push(player);
			}
		}
		// Return
		return returnV;
	}

	public getHitPlayerAt(x: int, y: int): IPlayer {
		for (let player of getPlayers(this)) {
			if (this.hitTestPlayer(player, x, y)) {
				return player;
			}
		}
		return null;
	}

	public setATeamToNotAIPlayer(team: PlayerTeam = null): void {
		let tempTeam: PlayerTeam = team === null ? this.rule.randomTeam : team;

		for (let player of getPlayers(this)) {
			if (!Player.isAI(player))
				player.team = tempTeam;
		}
	}

	public setATeamToAIPlayer(team: PlayerTeam = null): void {
		let tempTeam: PlayerTeam = team === null ? this.rule.randomTeam : team;

		for (let player of getPlayers(this)) {
			if (Player.isAI(player))
				player.team = tempTeam;
		}
	}

	public changeAllPlayerTool(tool: Tool = null): void {
		if (tool === null)
			tool = Tool.RANDOM_AVAILABLE;

		for (let player of getPlayers(this)) {
			player.tool = tool;
		}
	}

	public changeAllPlayerToolRandomly(): void {
		for (let player of getPlayers(this)) {
			player.tool = Tool.RANDOM_AVAILABLE;

			player.toolUsingCD = 0;
		}
	}

	public clearPlayer(onlyDisplay: boolean = false): void {
		// Display
		while (this._playerContainer.numChildren > 0)
			this._playerContainer.removeChildAt(0);
		// Entity
		if (!onlyDisplay)
			this._entitySystem.clearPlayer();
	}

	//======Entity Functions======//
	public updateProjectilesColor(player: IPlayer = null): void {
		// null means update all projectiles
		for (let projectile of this._entitySystem.projectile) {
			if (player === null || projectile.owner == player) {
				projectile.shapeInit(shape: IBatrShape);
			}
		}
	}

	public addBonusBox(x: int, y: int, type: BonusType): void {
		// Cannot override
		if (this.hasBonusBoxAt(x, y))
			return;
		// Execute
		let bonusBox: BonusBox = new BonusBox(this, x, y, type);
		this._entitySystem.addBonusBox(bonusBox);
		this._bonusBoxContainer.addChild(bonusBox);
		// Stat
		this._stat.bonusGenerateCount++;
	}

	protected hasBonusBoxAt(x: int, y: int): boolean {
		for (let box of this.entitySystem.bonusBoxes) {
			if (box.gridX == x && box.gridY == y)
				return true;
		}
		return false;
	}

	public randomAddBonusBox(type: BonusType): void {
		let bonusBox: BonusBox = new BonusBox(this, x, y, type);
		let i: uint = 0, rX: int, rY: int;
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
		for (let x: uint = 0; x < this.map.mapWidth; x++) {
			for (let y: uint = 0; y < this.map.mapHeight; y++) {
				if (this.testBonusBoxCanPlaceAt(x, y))
					this.addBonusBox(x, y, this.rule.randomBonusEnable);
			}
		}
	}

	//======Effect Functions======//
	// !【2023-10-03 15:12:45】后续废置
	/* public addEffectChild(effect: Effect): void {
		if (effect.layer > 0)
			this._effectContainerTop.addChild(effect);

		else if (effect.layer == 0)
			this._effectContainerMiddle.addChild(effect);

		else
			this._effectContainerBottom.addChild(effect);
	} */

	//======Hook Functions======// ? 保留这堆「钩子函数」有何意义？等待后续重构

	public onRandomTick(x: int, y: int): void {
		// BonusBox(Supply)
		if (this.testCanPass(x, y, true, false, false, true, true)) {
			if (this.getBlockAttributes(x, y).supplyingBonus ||
				((this.rule.bonusBoxMaxCount < 0 || this._entitySystem.bonusBoxCount < this.rule.bonusBoxMaxCount) &&
					Utils.randomBoolean2(this.rule.bonusBoxSpawnChance))) {
				this.addBonusBox(x, y, this.rule.randomBonusEnable);
			}
		}
		// Other
		switch (this.getBlockType(x, y)) {
			// TODO: 日后在这里建立分派机制

		}
	}

	protected onBlockUpdate(x: int, y: int, block: Block): void {
		this.updateMapDisplay(x, y, block);
		this.updateMapSize();
		this.blockTestWithEntitiesInGrid();
	}

	/** 基于「方块类型」实现多分派：使用「哈希值+字典」的形式 */
	protected _WorldEventPatcher
}