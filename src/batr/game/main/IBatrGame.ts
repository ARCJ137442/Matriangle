// import batr.common.*;
// import batr.general.*;
// import batr.game.stat.*;

import { iPoint } from "../../common/geometricTools";
import I18nText from "../../display/api/i18n/I18nText";
import I18ns from "../../display/api/i18n/I18ns";
import { int, uint } from "../../legacy/AS3Legacy";
import BlockAttributes from "../api/block/BlockAttributes";
import Block, { BlockType } from "../api/block/Block";
import IMap from "../api/map/IMap";
import IMapDisplayer from "../../display/api/map/IMapDisplayer";
import Entity from "../api/entity/Entity";
import EntitySystem from "../api/entity/EntitySystem";
import BonusBox from "../mods/native/entities/item/BonusBox";
import AIPlayer from "../mods/native/entities/player/AIPlayer";
import Player from "../mods/native/entities/player/Player";
import PlayerTeam from "../mods/native/entities/player/team/PlayerTeam";
import Lightning from "../mods/native/entities/projectile/Lightning";
import Projectile from "../mods/native/entities/projectile/Projectile";
import ThrownBlock from "../mods/native/entities/projectile/ThrownBlock";
import GameRule from "../api/rule/GameRule";
import GameRuleEvent from "../api/rule/GameRuleEvent";
import GameResult from "../mods/native/stat/GameResult";
import Wave from "../mods/native/entities/projectile/Wave";
import { IBatrShapeContainer } from "../../display/api/BatrDisplayInterfaces";
import Tool from "../mods/native/tool/Tool";
import BonusType from "../mods/native/registry/BonusRegistry";
import Laser from "../mods/native/entities/projectile/laser/Laser";

/**
 * TODO: 有待施工
 * 1. 抽象出一个带说明、包含「事件处理」的「游戏接口」
 * 2. 让游戏实现这个接口
 * 
 * ```
 * 游戏只需要提供一个通用的API
 * 负责最基本的加载（方块内容、实体内容、地图内容）
 * 以及运行（游戏时钟、事件分派）
 * 基本就够了
 * 
 * 剩下的一些与本身运作模式毫不相干的东西
 * 完全可以外包到某个 / 某些「注册机制」（或者更简单的说，「游戏模组」）里
 * 机制（内容）与运作（形式）分离
 * 这样就可以最大化其中的通用性……
 * ```
 * 
 * 正式文档：「游戏本体」负责
 * * 提供Mod-API，加载外置模组（包括「原生」这个最初始的模组）的数据
 * * 控制游戏进程
 *   * 地图/实体管理
 *   * 游戏统计（交给「游戏统计」实现）
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

	/** * 在设置「是否激活」的时候，可能需要「更改侦听器」等附加动作辅助 */
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

	get numPlayers(): uint

	get nextPlayerID(): uint

	get nextAIID(): uint

	/**
	 * （新）管理实体
	 * * 但一般上是「转交给相应的『实体系统』处理」
	 * 
	 * @returns 是否添加成功
	 */
	addEntity(entity: Entity): boolean

	/**
	 * @returns 是否删除成功
	 */
	removeEntity(entity: Entity): boolean

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

	/** Condition: Only one team's player alive. */
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
	 * ! 这些函数计划被实现为Mod的「工具函数」
	 * * 实现方法：在最前面附带「游戏主体」以让函数完全独立于任何一个类
	 */

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

	/** return testCanPass in player's front position. */
	testFrontCanPass(entity: Entity, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testBonusBoxCanPlaceAt(x: int, y: int): boolean

	/** return testCanPass as player in other position. */
	testPlayerCanPass(player: Player, x: int, y: int, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testFullPlayerCanPass(player: Player, x: int, y: int, oldX: int, oldY: int, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testPlayerCanPassToFront(player: Player, rotatedAsRot: uint/* = 5*/, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testCarriableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	toolCreateExplode(
		x: number, y: number,
		finalRadius: number,
		damage: uint, projectile: Projectile,
		color: uint, edgePercent: number/* = 1*/): void


	waveHurtPlayers(wave: Wave): void

	laserHurtPlayers(laser: Laser): void

	thrownBlockHurtPlayer(block: ThrownBlock): void

	lightningHurtPlayers(lightning: Lightning, players: Player[], damages: uint[]): void

	moveInTestWithEntity(): void

	/** Execute when Player Move in block */
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

	/** Function about Player pickup BonusBox */
	bonusBoxTest(player: Player, x: number/* = NaN*/, y: number/* = NaN*/): boolean

	//====Functions About Map====//
	hasBlock(x: int, y: int): boolean

	getBlock(x: int, y: int): Block

	getBlockAttributes(x: int, y: int): BlockAttributes

	getBlockType(x: int, y: int): BlockType

	/**
	 * Set Block in map,and update Block in map displayer.
	 * @param	x	the Block position x.
	 * @param	y	the Block position y.
	 * @param	block	the current Block.
	 */
	setBlock(x: int, y: int, block: Block): void

	isVoid(x: int, y: int): boolean

	/**
	 * Set void in map,and clear Block in map displayer.
	 * @param	x	the void position x.
	 * @param	y	the void position y.
	 */
	setVoid(x: int, y: int): void

	forceMapDisplay(): void

	updateMapDisplay(x: int, y: int, block: Block): void

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

	changeAllPlayerTool(tool: Tool/* = null*/): void

	changeAllPlayerToolRandomly(): void

	movePlayer(player: Player, rot: uint, distance: number): void

	playerUseTool(player: Player, rot: uint, chargePercent: number): void

	playerUseToolAt(player: Player, tool: Tool, x: number, y: number, toolRot: uint, chargePercent: number, projectilesSpawnDistance: number): void

	getLaserLength(player: Player, rot: uint): uint

	getLaserLength2(eX: number, eY: number, rot: uint): uint

	lockEntityInMap(entity: Entity): void

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

	addSpawnEffect(x: number, y: number): void

	addTeleportEffect(x: number, y: number): void

	addPlayerDeathLightEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer/* = null*/, reverse: boolean/* = false*/): void

	addPlayerDeathFadeoutEffect(x: number, y: number, color: uint, rot: uint, aiPlayer: AIPlayer/* = null*/, reverse: boolean/* = false*/): void

	addPlayerDeathLightEffect2(x: number, y: number, player: Player, reverse: boolean/* = false*/): void

	addPlayerDeathFadeoutEffect2(x: number, y: number, player: Player, reverse: boolean/* = false*/): void

	addPlayerLevelupEffect(x: number, y: number, color: uint, scale: number): void

	addBlockLightEffect(x: number, y: number, color: uint, alpha: uint, reverse: boolean/* = false*/): void

	addBlockLightEffect2(x: number, y: number, block: Block, reverse: boolean/* = false*/): void

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

	onBlockUpdate(x: int, y: int, block: Block): void

}
