// import batr.common.*;
// import batr.general.*;
// import batr.game.stat.*;

import { iPoint } from "../../common/intPoint";
import I18nText from "../../i18n/I18nText";
import I18ns from "../../i18n/I18ns";
import { int, uint } from "../../legacy/AS3Legacy";
import BlockAttributes from "../block/BlockAttributes";
import BlockCommon, { BlockType } from "../block/BlockCommon";
import IMap from "../block/system/IMap";
import IMapDisplayer from "../../display/map/IMapDisplayer";
import EffectCommon from "../effect/EffectCommon";
import EffectSystem from "../effect/EffectSystem";
import EntityCommon from "../entity/EntityCommon";
import EntitySystem from "../entity/EntitySystem";
import BonusBox from "../entity/entities/item/BonusBox";
import AIPlayer from "../entity/entities/player/AIPlayer";
import Player from "../entity/entities/player/Player";
import PlayerTeam from "../entity/entities/player/team/PlayerTeam";
import Lightning from "../entity/entities/projectile/Lightning";
import ProjectileCommon from "../entity/entities/projectile/ProjectileCommon";
import ThrownBlock from "../entity/entities/projectile/ThrownBlock";
import BonusType from "../registry/BonusRegistry";
import ToolType from "../registry/ToolType";
import GameRule from "../rule/GameRule";
import GameRuleEvent from "../rule/GameRuleEvent";
import GameResult from "../stat/GameResult";
import Wave from "../entity/entities/projectile/Wave";
import { IBatrShapeContainer } from "../../display/BatrDisplayInterfaces";

// import flash.display.*;
// import flash.text.*;
// import flash.utils.*;
// import flash.events.*;
// import flash.geom.*;
// import flash.system.fscommand;

/**
 * TODO: 有待施工
 * 1. 抽象出一个带说明、包含「事件处理」「显示管理」的「游戏接口」
 * 2. 让游戏实现这个接口
 */

export default interface IBatrGame {

	/**
	 * 游戏中所有加载的地图
	 * * 用于地图切换时在此中选择
	 * ! 游戏地图不再以「ID」作为索引：当一个游戏/游戏规则被导出成JS对象时，会直接原样输出所有地图文件
	 * ? 具体实现有待商议：或许需要某种「内联机制」比如「NativeMapPointer」（ID→指向内联地图的「内联指针」）
	 */
	get loadedMaps(): IMap[];
	get numLoadedMaps(): uint;


	//============Instance Variables============//
	// General

	//============Instance Getter And Setter============//
	//======Main Getters======//

	get rule(): GameRule;

	//============Display Implements============//
	get translations(): I18ns

	/**
	 * * 在设置「是否激活」的时候，可能需要「更改侦听器」等附加动作辅助
	 */
	get isActive(): boolean;

	set isActive(value: boolean);

	get visibleHUD(): boolean

	set visibleHUD(value: boolean)

	get isLoaded(): boolean

	get speed(): number

	set speed(value: number)

	get enableFrameComplement(): boolean

	set enableFrameComplement(value: boolean)

	//======Entity Getters======//
	get playerContainer(): IBatrShapeContainer

	get projectileContainer(): IBatrShapeContainer

	get bonusBoxContainer(): IBatrShapeContainer

	get playerGUIContainer(): IBatrShapeContainer

	get effectContainerBottom(): IBatrShapeContainer

	get effectContainerTop(): IBatrShapeContainer

	get entitySystem(): EntitySystem

	get effectSystem(): EffectSystem

	get numPlayers(): uint

	get nextPlayerID(): uint

	get nextAIID(): uint

	//======Map Getters======//
	get map(): IMap

	get mapIndex(): uint

	get mapWidth(): uint

	get mapHeight(): uint

	get mapTransformPeriod(): uint

	set mapVisible(value: boolean)

	set entityAndEffectVisible(value: boolean)

	//========Game AI Interface========//
	get allAvailableBonusBox(): BonusBox[]

	getBlockPlayerDamage(x: int, y: int): int

	isKillZone(x: int, y: int): boolean

	//============Instance Functions============//
	//========About Game End========//

	/**
	 * Condition: Only one team's player alive.
	 */
	isPlayersEnd(players: Player[]): boolean

	getAlivePlayers(): Player[]

	getInMapPlayers(): Player[]

	testGameEnd(force?: boolean/* = false*/): void

	resetPlayersTeamInDifferent(players: Player[]): void

	onGameEnd(winners: Player[]): void

	getGameResult(winners: Player[]): GameResult

	getResultMessage(winners: Player[]): I18nText

	//====Functions About Init====//
	onAddedToStage(E: Event): void

	initDisplay(): void

	addChildren(): void

	//====Functions About Game Global Running====//
	load(rule: GameRule, becomeActive?: boolean/* = false*/): boolean

	clearGame(): boolean

	restartGame(rule: GameRule, becomeActive?: boolean/* = false*/): void

	forceStartGame(rule: GameRule, becomeActive?: boolean/* = false*/): boolean

	dealGameTick(): void

	//====Listener Functions====//
	/*onEnterFrame(E:Event):void 
	onGameTick(E: Event): void

	refreshLastTime(): void

	dealSecond(): void

	updateGUIText(): void

	onI18nsChange(event: Event): void

	onGameKeyDown(E: KeyboardEvent): void

	onGameKeyUp(E: KeyboardEvent): void

	dealKeyDownWithPlayers(code: uint, isKeyDown: boolean): void

	onStageResize(E: Event): void

	//====Functions About Gameplay====//

	/**
	 * @param	x	The position x.
	 * @param	y	The position y.
	 * @param	asPlayer	Judge as player
	 * @param	asBullet	Judge as Bullet
	 * @param	asLaser	Judge as Laser
	 * @param	includePlayer	Avoid player(returns false)
	 * @param	avoidHurting	Avoid harmful block(returns false)
	 * @return	true if can pass.
	 */
	testCanPass(x: number, y: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testIntCanPass(x: int, y: int, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	/**
	 * return testCanPass in player's front position.
	 */
	testFrontCanPass(entity: EntityCommon, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testBonusBoxCanPlaceAt(x: int, y: int): boolean

	/**
	 * return testCanPass as player in other position.
	 */
	testPlayerCanPass(player: Player, x: int, y: int, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testFullPlayerCanPass(player: Player, x: int, y: int, oldX: int, oldY: int, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testPlayerCanPassToFront(player: Player, rotatedAsRot: uint/* = 5*/, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testCarriableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	toolCreateExplode(
		x: number, y: number,
		finalRadius: number,
		damage: uint, projectile: ProjectileCommon,
		color: uint, edgePercent: number/* = 1*/): void


	waveHurtPlayers(wave: Wave): void

	thrownBlockHurtPlayer(block: ThrownBlock): void

	lightningHurtPlayers(lightning: Lightning, players: Player[], damages: uint[]): void

	moveInTestWithEntity(): void

	/**
	 * Execute when Player Move in block
	 */
	moveInTestPlayer(player: Player, isLocationChange: boolean/* = false*/): boolean

	/**
	 * Operate damage to player by blockAtt.playerDamage,
	 * int.MAX_VALUE -> uint$MAX_VALUE
	 * [...-2) -> 0
	 * -1 -> uint$MAX_VALUE
	 * [0,100] -> player.maxHealth*playerDamage/100
	 * (100...] -> playerDamage-100
	 * @return	The damage.
	 */
	computeFinalPlayerHurtDamage(player: Player, x: int, y: int, playerDamage: int): uint

	/**
	 * Execute when Player Move out block
	 * @param	x	the old X
	 * @param	y	the old Y
	 */
	moveOutTestPlayer(player: Player, x: int, y: int, isLocationChange: boolean/* = false*/): void

	/**
	 * Function about Player pickup BonusBox
	 */
	bonusBoxTest(player: Player, x: number/* = NaN*/, y: number/* = NaN*/): boolean

	//====Functions About Map====//
	hasBlock(x: int, y: int): boolean

	getBlock(x: int, y: int): BlockCommon

	getBlockAttributes(x: int, y: int): BlockAttributes

	getBlockType(x: int, y: int): BlockType

	/**
	 * Set Block in map,and update Block in map displayer.
	 * @param	x	the Block position x.
	 * @param	y	the Block position y.
	 * @param	block	the current Block.
	 */
	setBlock(x: int, y: int, block: BlockCommon): void

	isVoid(x: int, y: int): boolean

	/**
	 * Set void in map,and clear Block in map displayer.
	 * @param	x	the void position x.
	 * @param	y	the void position y.
	 */
	setVoid(x: int, y: int): void

	forceMapDisplay(): void

	updateMapDisplay(x: int, y: int, block: BlockCommon): void

	getDisplayerThenLayer(layer: int): IMapDisplayer

	updateMapSize(updateBackground: boolean/* = true*/): void

	/* Change Map into Other
	 */
	loadMap(isInitial: boolean/* = false*/, update: boolean/* = true*/, reSpreadPlayer: boolean/* = false*/): void

	/* Get Map from Rule
	 */
	getRandomMap(): IMap

	/* Change Map into the other
	 */
	changeMap(map: IMap, update: boolean/* = true*/, reSpreadPlayer: boolean/* = false*/): void

	transformMap(destination: IMap/* = null*/): void

	//====Functions About Player====//
	createPlayer(x: int, y: int, id: uint, team: PlayerTeam, isActive: boolean/* = true*/): Player

	addPlayer(id: uint, team: PlayerTeam, x: int, y: int, rot: uint/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): Player

	// Set player datas for gaming
	setupPlayer(player: Player): Player

	// Add a player uses random position and tool
	appendPlayer(controlKeyID: uint/* = 0*/): Player

	createAI(x: int, y: int, team: PlayerTeam, isActive: boolean/* = true*/): AIPlayer

	addAI(team: PlayerTeam, x: int, y: int, rot: uint/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): AIPlayer

	appendAI(): Player

	autoGetAIName(player: AIPlayer): string

	spawnPlayersByRule(): void

	teleportPlayerTo(player: Player, x: int, y: int, rotateTo: uint/* = GlobalRot.NULL*/, effect: boolean/* = false*/): Player

	spreadPlayer(player: Player, rotatePlayer: boolean/* = true*/, createEffect: boolean/* = true*/): Player

	/**
	 * Respawn player to spawn point(if map contained)
	 * @param	player	The player will respawn.
	 * @return	The same as param:player.
	 */
	respawnPlayer(player: Player): Player

	/**
	 * @param	x	SpawnPoint.x
	 * @param	y	SpawnPoint.y
	 * @return	The nearest point from SpawnPoint.
	 */
	findFitSpawnPoint(player: Player, x: int, y: int): iPoint

	subFindSpawnPoint(player: Player, x: int, y: int, r: int): iPoint

	spreadAllPlayer(): void

	hitTestOfPlayer(p1: Player, p2: Player): boolean

	hitTestPlayer(player: Player, x: int, y: int): boolean

	isHitAnyPlayer(x: int, y: int): boolean

	isHitAnotherPlayer(player: Player): boolean

	hitTestOfPlayers(...players: Player[]): boolean

	getHitPlayers(x: number, y: number): Player[]

	getHitPlayerAt(x: int, y: int): Player

	randomizeAllPlayerTeam(): void

	randomizePlayerTeam(player: Player): void

	setATeamToNotAIPlayer(team: PlayerTeam/* = null*/): void

	setATeamToAIPlayer(team: PlayerTeam/* = null*/): void

	changeAllPlayerTool(tool: ToolType/* = null*/): void

	changeAllPlayerToolRandomly(): void

	movePlayer(player: Player, rot: uint, distance: number): void

	playerUseTool(player: Player, rot: uint, chargePercent: number): void

	playerUseToolAt(player: Player, tool: ToolType, x: number, y: number, toolRot: uint, chargePercent: number, projectilesSpawnDistance: number): void

	getLaserLength(player: Player, rot: uint): uint

	getLaserLength2(eX: number, eY: number, rot: uint): uint

	lockEntityInMap(entity: EntityCommon): void

	lockPosInMap(posNum: number, returnAsX: boolean): number

	lockIntPosInMap(posNum: int, returnAsX: boolean): int

	lockIPointInMap(point: iPoint): iPoint

	clearPlayer(onlyDisplay: boolean/* = false*/): void

	//======Entity Functions======//
	updateProjectilesColor(player: Player/* = null*/): void

	addBonusBox(x: int, y: int, type: BonusType): void

	randomAddBonusBox(type: BonusType): void

	randomAddRandomBonusBox(): void

	fillBonusBox(): void
	addEffectChild(effect: EffectCommon): void

	addSpawnEffect(x: number, y: number): void

	addTeleportEffect(x: number, y: number): void

	addPlayerDeathLightEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer/* = null*/, reverse: boolean/* = false*/): void

	addPlayerDeathFadeoutEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer/* = null*/, reverse: boolean/* = false*/): void

	addPlayerDeathLightEffect2(x: number, y: number, player: Player, reverse: boolean/* = false*/): void

	addPlayerDeathFadeoutEffect2(x: number, y: number, player: Player, reverse: boolean/* = false*/): void

	addPlayerLevelupEffect(x: number, y: number, color: uint, scale: number): void

	addBlockLightEffect(x: number, y: number, color: uint, alpha: uint, reverse: boolean/* = false*/): void

	addBlockLightEffect2(x: number, y: number, block: BlockCommon, reverse: boolean/* = false*/): void

	addPlayerHurtEffect(player: Player, reverse: boolean/* = false*/): void

	//======Hook Functions======//
	onPlayerMove(player: Player): void

	onPlayerUse(player: Player, rot: uint, distance: number): void

	onPlayerHurt(attacker: Player, victim: Player, damage: uint): void

	/**
	 * Deal the (victim&attacker)'s (stat&heal),add effect and reset (CD&charge)
	 * @param	attacker
	 * @param	victim
	 * @param	damage
	 */
	onPlayerDeath(attacker: Player, victim: Player, damage: uint): void

	onPlayerRespawn(player: Player): void

	prePlayerLocationChange(player: Player, oldX: number, oldY: number): void

	onPlayerLocationChange(player: Player, newX: number, newY: number): void

	onPlayerTeamsChange(event: GameRuleEvent): void

	onPlayerLevelup(player: Player): void

	onRandomTick(x: int, y: int): void

	onBlockUpdate(x: int, y: int, block: BlockCommon): void

}
