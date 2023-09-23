import { fPoint, iPoint } from "../../common/geometricTools";
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
import IPlayer from "../mods/native/entities/player/IPlayer";
import PlayerTeam from "../mods/native/entities/player/team/PlayerTeam";
import Lightning from "../mods/native/entities/projectile/other/Lightning";
import Projectile from "../mods/native/entities/projectile/Projectile";
import ThrownBlock from "../mods/native/entities/projectile/other/ThrownBlock";
import GameRuleEvent from "../api/rule/GameRuleEvent";
import GameResult from "../mods/native/stat/GameResult";
import Wave from "../mods/native/entities/projectile/other/Wave";
import { IBatrShapeContainer } from "../../display/api/BatrDisplayInterfaces";
import Tool from "../mods/native/tool/Tool";
import { BonusType, NativeBonusTypes } from "../mods/native/registry/BonusRegistry";
import Laser from "../mods/native/entities/projectile/laser/Laser";
import IGameRule from "../api/rule/IGameRule";
import { mRot } from "../general/GlobalRot";

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

	/**
	 * 游戏所对应的「游戏规则」
	 * * 用于在不修改源码的情况下，更简单地定制游戏玩法
	 * 
	 * TODO: 添加下列所有函数的注释，并在添加的同时分离功能（解耦）
	 */
	get rule(): IGameRule;

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

	getBlockPlayerDamage(position: iPoint): int

	isKillZone(position: iPoint): boolean

	//============Instance Functions============//
	//========About Game End========//

	/** Condition: Only one team's player alive. */
	isPlayersEnd(players: IPlayer[]): boolean

	getAlivePlayers(): IPlayer[]

	getInMapPlayers(): IPlayer[]

	testGameEnd(force?: boolean/* = false*/): void

	resetPlayersTeamInDifferent(players: IPlayer[]): void

	onGameEnd(winners: IPlayer[]): void

	getGameResult(winners: IPlayer[]): GameResult

	getResultMessage(winners: IPlayer[]): I18nText

	//====Functions About Init====//
	onAddedToStage(E: Event): void

	initDisplay(): void

	addChildren(): void

	//====Functions About Game Global Running====//
	load(rule: IGameRule, becomeActive?: boolean/* = false*/): boolean

	clearGame(): boolean

	restartGame(rule: IGameRule, becomeActive?: boolean/* = false*/): void

	forceStartGame(rule: IGameRule, becomeActive?: boolean/* = false*/): boolean

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
	testCanPass(position: fPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testIntCanPass(position: iPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	/** return testCanPass in player's front position. */
	testFrontCanPass(entity: Entity, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testBonusBoxCanPlaceAt(position: iPoint): boolean

	/** return testCanPass as player in other position. */
	testPlayerCanPass(player: IPlayer, position: iPoint, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testFullPlayerCanPass(player: IPlayer, position: iPoint, oldX: int, oldY: int, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean

	testPlayerCanPassToFront(player: IPlayer, rotatedAsDirection: mRot/* = 5*/, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean

	testCarriableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean

	toolCreateExplode(
		position: fPoint,
		finalRadius: number,
		damage: uint, projectile: Projectile,
		color: uint, edgePercent: number/* = 1*/): void


	waveHurtPlayers(wave: Wave): void

	laserHurtPlayers(laser: Laser): void

	thrownBlockHurtPlayer(block: ThrownBlock): void

	lightningHurtPlayers(lightning: Lightning, players: IPlayer[], damages: uint[]): void

	/**
	 * * 应用：当方块更新时，对所有处于其上的「格点实体」回调事件
	 */
	blockTestWithEntitiesInGrid(): void

	/**
	 * 当玩家「进入某个位置」（玩家当前位置）时触发的事件
	 * @param player 「进入某个方块位置」的玩家
	 * @param isLocationChange 是否为「位置改变」引起的
	 * @returns 是否有对玩家的作用（用于向玩家反馈，重置「伤害冷却」）
	 */
	onPlayerWalkIn(player: IPlayer, isLocationChange: boolean/* = false*/): boolean

	/**
	 * Operate damage to player by blockAtt.playerDamage,
	 * int.MAX_VALUE -> uint$MAX_VALUE
	 * [...-2) -> 0
	 * -1 -> uint$MAX_VALUE
	 * [0,100] -> player.maxHealth*playerDamage/100
	 * (100...] -> playerDamage-100
	 * @return	The damage.
	 */
	computeFinalPlayerHurtDamage(player: IPlayer, position: iPoint, playerDamage: int): uint

	/**
	 * Execute when Player Move out block
	 * @param	x	the old X
	 * @param	y	the old Y
	 */
	moveOutTestPlayer(player: IPlayer, position: iPoint, isLocationChange: boolean/* = false*/): void

	/** Function about Player pickup BonusBox */
	bonusBoxTest(player: IPlayer, x: number/* = NaN*/, y: number/* = NaN*/): boolean

	//====Functions About Map====//
	hasBlock(position: iPoint): boolean

	getBlock(position: iPoint): Block

	getBlockAttributes(position: iPoint): BlockAttributes

	getBlockType(position: iPoint): BlockType

	/**
	 * Set Block in map,and update Block in map displayer.
	 * @param	x	the Block position x.
	 * @param	y	the Block position y.
	 * @param	block	the current Block.
	 */
	setBlock(position: iPoint, block: Block): void

	isVoid(position: iPoint): boolean

	/**
	 * Set void in map,and clear Block in map displayer.
	 * @param	x	the void position x.
	 * @param	y	the void position y.
	 */
	setVoid(position: iPoint): void

	forceMapDisplay(): void

	updateMapDisplay(position: iPoint, block: Block): void

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
	createPlayer(position: iPoint, id: uint, team: PlayerTeam, isActive: boolean/* = true*/): IPlayer

	addPlayer(id: uint, team: PlayerTeam, position: iPoint, direction: mRot/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): IPlayer

	// Set player datas for gaming
	setupPlayer(player: IPlayer): IPlayer

	// Add a player uses random position and tool
	appendPlayer(controlKeyID: uint/* = 0*/): IPlayer

	createAI(position: iPoint, team: PlayerTeam, isActive: boolean/* = true*/): AIPlayer

	addAI(team: PlayerTeam, position: iPoint, direction: mRot/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): AIPlayer

	appendAI(): IPlayer

	autoGetAIName(player: AIPlayer): string

	spawnPlayersByRule(): void

	teleportPlayerTo(player: IPlayer, position: iPoint, rotateTo: uint/* = GlobalDirection.NULL*/, effect: boolean/* = false*/): IPlayer

	spreadPlayer(player: IPlayer, rotatePlayer: boolean/* = true*/, createEffect: boolean/* = true*/): IPlayer

	/**
	 * Respawn player to spawn point(if map contained)
	 * @param	player	The player will respawn.
	 * @return	The same as param:player.
	 */
	respawnPlayer(player: IPlayer): IPlayer

	/**
	 * @param	x	SpawnPoint.x
	 * @param	y	SpawnPoint.y
	 * @return	The nearest point from SpawnPoint.
	 */
	findFitSpawnPoint(player: IPlayer, position: iPoint): iPoint

	subFindSpawnPoint(player: IPlayer, position: iPoint, r: int): iPoint

	spreadAllPlayer(): void

	hitTestOfPlayer(p1: IPlayer, p2: IPlayer): boolean

	hitTestPlayer(player: IPlayer, position: iPoint): boolean

	isHitAnyPlayer_F(position: fPoint): boolean

	isHitAnyPlayer_I(position: iPoint): boolean

	isHitAnotherPlayer(player: IPlayer): boolean

	hitTestOfPlayers(...players: IPlayer[]): boolean

	getHitPlayers(position: fPoint): IPlayer[]

	getHitPlayerAt(position: iPoint): IPlayer

	randomizeAllPlayerTeam(): void

	randomizePlayerTeam(player: IPlayer): void

	setATeamToNotAIPlayer(team: PlayerTeam/* = null*/): void

	setATeamToAIPlayer(team: PlayerTeam/* = null*/): void

	changeAllPlayerTool(tool: Tool/* = null*/): void

	changeAllPlayerToolRandomly(): void

	movePlayer(player: IPlayer, direction: mRot, distance: number): void

	playerUseTool(player: IPlayer, direction: mRot, chargePercent: number): void

	playerUseToolAt(
		player: IPlayer | null,
		tool: Tool,
		position: fPoint, toolDirection: mRot,
		chargePercent: number, projectilesSpawnDistance: number
	): void

	getLaserLength(player: IPlayer, direction: mRot): uint

	getLaserLength2(position: iPoint, direction: mRot): uint

	lockEntityInMap(entity: Entity): void

	lockPosInMap(posNum: number, returnAsX: boolean): number

	lockIntPosInMap(posNum: int, returnAsX: boolean): int

	lockIPointInMap(point: iPoint): iPoint

	clearPlayer(onlyDisplay: boolean/* = false*/): void

	//======Entity Functions======//
	updateProjectilesColor(player: IPlayer/* = null*/): void

	addBonusBox(position: iPoint, type: BonusType): void

	randomAddBonusBox(type: BonusType): void

	randomAddRandomBonusBox(): void

	fillBonusBox(): void

	addSpawnEffect(position: fPoint): void

	addTeleportEffect(position: fPoint): void

	addPlayerDeathLightEffect(
		position: fPoint, direction: mRot,
		color: uint,
		aiPlayer: AIPlayer/* = null*/,
		reverse: boolean/* = false*/
	): void

	addPlayerDeathFadeoutEffect(
		position: fPoint, direction: mRot,
		color: uint,
		aiPlayer: AIPlayer/* = null*/,
		reverse: boolean/* = false*/
	): void

	addPlayerDeathLightEffect2(
		position: fPoint,
		player: IPlayer,
		reverse: boolean/* = false*/
	): void

	addPlayerDeathFadeoutEffect2(
		position: fPoint,
		player: IPlayer,
		reverse: boolean/* = false*/
	): void

	addPlayerLevelupEffect(position: fPoint, color: uint, scale: number): void

	addBlockLightEffect(position: fPoint, color: uint, alpha: uint, reverse: boolean/* = false*/): void

	addBlockLightEffect2(position: fPoint, block: Block, reverse: boolean/* = false*/): void

	addPlayerHurtEffect(player: IPlayer, reverse: boolean/* = false*/): void

	//======Hook Functions======//
	onPlayerMove(player: IPlayer): void

	onPlayerUse(player: IPlayer, direction: mRot, distance: number): void

	onPlayerHurt(attacker: IPlayer, victim: IPlayer, damage: uint): void

	/**
	 * Deal the (victim&attacker)'s (stat&heal),add effect and reset (CD&charge)
	 * @param	attacker
	 * @param	victim
	 * @param	damage
	 */
	onPlayerDeath(attacker: IPlayer, victim: IPlayer, damage: uint): void

	onPlayerRespawn(player: IPlayer): void

	prePlayerLocationChange(player: IPlayer, oldX: number, oldY: number): void

	onPlayerLocationChange(player: IPlayer, newX: number, newY: number): void

	onPlayerTeamsChange(event: GameRuleEvent): void

	onPlayerLevelup(player: IPlayer): void

	onRandomTick(position: iPoint): void

	onBlockUpdate(position: iPoint, block: Block): void

}
