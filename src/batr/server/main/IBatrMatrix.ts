import { fPoint, iPoint } from "../../common/geometricTools";
import { Class, int, uint } from "../../legacy/AS3Legacy";
import BlockAttributes from "../api/block/BlockAttributes";
import Block, { BlockType } from "../api/block/Block";
import IMap from "../api/map/IMap";
import IMapDisplayer from "../../display/api/map/IMapDisplayer";
import Entity from "../api/entity/Entity";
import EntitySystem from "../api/entity/EntitySystem";
import BonusBox from "../mods/native/entities/item/BonusBox";
import IPlayer from "../mods/native/entities/player/IPlayer";
import PlayerTeam from "../mods/native/entities/player/team/PlayerTeam";
import Lightning from "../mods/native/entities/projectile/other/Lightning";
import Projectile from "../mods/native/entities/projectile/Projectile";
import ThrownBlock from "../mods/native/entities/projectile/other/ThrownBlock";
import WorldRuleEvent from "../rule/WorldRuleEvent";
import MatrixResult from "../mods/native/stat/MatrixResult";
import Wave from "../mods/native/entities/projectile/other/Wave";
import Tool from "../mods/native/tool/Tool";
import { BonusType } from "../mods/native/registry/BonusRegistry";
import Laser from "../mods/native/entities/projectile/laser/Laser";
import IMatrixRule from "../rule/IMatrixRule";
import { mRot } from "../general/GlobalRot";
import IBatrRegistry from "../mods/native/registry/IBatrRegistry";

/**
 * 母体：承载并控制所有「世界运行」有关的事物
 * * 负责如「实体管理」「地图变换」「世界规则」等机制运作
 * * 不负责「世界运行」以外的事务
 *   * 有关「世界注册信息」的处理：如「实体类型列表」
 *   * 有关「世界呈现/显示」的功能，如「国际化文本」「显示端」
 * 
 * TODO: 是否要把「实体系统」「地图」这两遍历内置（封装），仅对外部保留必要接口（以便后续显示更新）？
 * 
 * 可以基于此假设多种「端侧」
 * * 服务端：世界在实际上运作于此上，用于实际运行代码
 * * 客户端：类似Minecraft，世界只有一部分机制运行于此上（仅为流畅考虑）
 *   * 用于「呈现远程服务端运行结果」「与服务端进行交互同步」
 */
export default interface IBatrMatrix {

	/**
	 * 持有一个「注册表引用」，用于在分派事件时查表
	 */
	get registry(): IBatrRegistry;

	//========🌟实体部分：实体管理、实体事件等========//
	/**
	 * ? 是否要把这个「实体管理系统」暴露出去？
	 * * 📌或许这个应该把「内部的实体管理者」封装好，不要让外界过多访问
	 */
	// get entitySystem(): EntitySystem;
	// get numPlayers(): uint; // !【2023-10-03 23:42:20】目前废弃：这里不应该留有任何「专用代码」……通用与效率的冲突，且「没有任何后门……」
	// get nextPlayerID(): uint // !【2023-10-02 22:04:47】废弃：应该在外部缓存，而非在母体之中
	// get nextAIID(): uint // !【2023-10-02 22:04:47】废弃：应该在外部缓存，而非在母体之中
	// set entityAndEffectVisible(value: boolean); // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」

	/**
	 * 获取所有实体
	 */
	get entities(): Entity[];

	/**
	 * （新）管理实体
	 * * 但一般上是「转交给相应的『实体系统』处理」
	 * 
	 * @returns 是否添加成功
	 */
	addEntity(entity: Entity): boolean;

	/**
	 * 批量添加一系列实体
	 */
	addEntities(...entities: Entity[]): void;

	/**
	 * @returns 是否删除成功
	 */
	removeEntity(entity: Entity): boolean;

	//========🗺️地图部分：地图加载、地图变换等========//
	/**
	 * 世界中所有加载的地图
	 * * 用于地图切换时在此中选择
	 * 
	 * ! 世界地图不再以「ID」作为索引：当一个世界/世界规则被导出成JS对象时，会直接原样输出所有地图文件
	 * 
	 * ? 具体实现有待商议：或许需要某种「内联机制」比如「NativeMapPointer」（ID→指向内联地图的「内联指针」）
	 * 
	 * !【2023-10-04 23:25:48】现在母体不再管理地图，转而由其「规则」管理。。。
	 */
	// get loadedMaps(): IMap[];
	// get numLoadedMaps(): uint;

	/**
	 * ? 是否要把这个「当前地图」暴露出去？
	 * * 📌或许这个也应该被封装好，不要让外界过多访问？
	 * * 💭另一个取舍之处：地图接口中太多的函数需要「传递性实现」了，这样还不如复合一个地图/直接继承「地图」。。。
	 */
	get map(): IMap;
	// get mapIndex(): uint; // !【2023-10-02 23:26:35】现在讨论「索引」无意义
	// get mapWidth(): uint; // !【2023-10-02 22:46:28】高维化现在不再需要
	// get mapHeight(): uint; // !【2023-10-02 22:46:28】高维化现在不再需要
	/**
	 * 获取地图的「变换周期」
	 * * 或许也需要外置？
	 */
	get mapTransformPeriod(): uint;
	// set mapVisible(value: boolean); // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」

	//========🎯规则部分：规则加载、规则读写========//
	/**
	 * 世界所对应的「世界规则」
	 * * 用于在不修改源码的情况下，更简单地定制世界玩法
	 * 
	 * TODO: 添加下列所有函数的注释，并在添加的同时分离功能（解耦）
	 */
	get rule(): IMatrixRule;

	/**
	 * 根据自身所加载的规则初始化
	 * * 源自`World.load`方法
	 * 
	 * @returns 是否初始化成功
	 */
	initByRule(): boolean;
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃

	/**
	 * 重置母体状态
	 * * 重置规则
	 * * 删除侦听器
	 * * 清空实体
	 * * 清空地图
	 * * 取消活跃状态
	 */
	reset(): boolean;
	/**
	 * 使用当前规则重新开始
	 * * 具体以原有实现为准
	 */
	restart(rule: IMatrixRule,): void;
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃
	/**
	 * 使用某个规则强制重置&重启
	 * * 具体以原有实现为准
	 */
	forceStart(rule: IMatrixRule,): boolean;
	// becomeActive?: boolean/* = false*/ // !【2023-10-04 23:44:00】现已废弃
	/**
	 * 世界主时钟
	 * * 决定世界各个实体的运行
	 */
	tick(): void;

	//========🤖控制部分：主循环、控制器等========//
	/**
	 * 控制世界自身「是否活跃」
	 * * 在设置「是否活跃」的时候，可能需要「更改侦听器」等附加动作辅助
	 * 
	 * !【2023-10-04 23:39:22】现在因「作用不明」取消该特性
	*/
	// get isActive(): boolean;
	// set isActive(value: boolean);
	/**
	 * 母体本身「是否已加载」
	 * 
	 * !【2023-10-04 23:39:22】现在因「作用不明」取消该特性
	 */
	// get isLoaded(): boolean;

	/**
	 * 决定「世界速度」
	 * 
	 * !【2023-10-04 23:40:44】现在其作用已准备外迁，故不应出现于此
	*/
	// get speed(): number;
	// set speed(value: number);
	/**
	 * 决定「世界补帧」效果
	 * * 曾用于解决「世界卡顿」的补救措施
	 * 
	 * !【2023-10-04 23:40:44】现在其作用已准备外迁，故不应出现于此
	 */
	// get enableFrameComplement(): boolean;
	// set enableFrameComplement(value: boolean);

	/**
	 * !【2023-10-04 23:42:08】旧Flash事件系统遗留，废弃
	 */
	// onWorldTick(E: Event): void;

	//========💭其它函数：考虑外迁========//
	//====About World End====// ? 是否也可以实现为一个「世界控制器」
	// TODO: 待外置
	/** Condition: Only one team's player alive. */
	// isPlayersEnd(players: IPlayer[]): boolean;
	// getAlivePlayers(): IPlayer[]
	// getInMapPlayers(): IPlayer[]
	// testWorldEnd(force?: boolean/* = false*/): void;
	// onWorldEnd(winners: IPlayer[]): void;
	// getMatrixResult(winners: IPlayer[]): MatrixResult;
	// resetPlayersTeamInDifferent(players: IPlayer[]): void; // !【2023-10-04 23:45:31】作用不明，已移除
	// getResultMessage(winners: IPlayer[]): I18nText; // !【2023-10-02 22:36:32】弃用：不再涉及「国际化文本」


	//========World AI Interface========// TODO: 待外置
	// get allAvailableBonusBox(): BonusBox[]
	// getBlockPlayerDamage(position: iPoint): int;
	// isKillZone(position: iPoint): boolean;

	//============Instance Functions============//

	//====Functions About Init====//
	// onAddedToStage(E: Event): void; // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」
	// initDisplay(): void; // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」
	// addChildren(): void; // !【2023-10-02 22:36:32】弃用：不再涉及「显示呈现」

	//====Functions About World Global Running====//

	//====Listener Functions====// TODO: 后续将被统一的「控制器」取代
	/*onEnterFrame(E:Event):void 
	refreshLastTime(): void;
	dealSecond(): void;
	updateGUIText(): void;
	onI18nsChange(event: Event): void;
	onWorldKeyDown(E: KeyboardEvent): void;
	onWorldKeyUp(E: KeyboardEvent): void;
	dealKeyDownWithPlayers(code: uint, isKeyDown: boolean): void;
	onStageResize(E: Event): void;

	//====Functions About Worldplay====//
	/**
	 * TODO: 这些函数计划被实现为Mod的「工具函数」
	 * * 实现方法：在最前面附带母体以让函数完全独立于任何一个类
	 * 
	 * !【2023-10-02 22:37:20】现已全部弃用：不再把「具体机制」内置于此，改为在「原生世界机制」中使用
	 */

	// /**
	//  * @param	x	The position x.
	//  * @param	y	The position y.
	//  * @param	asPlayer	Judge as player
	//  * @param	asBullet	Judge as Bullet
	//  * @param	asLaser	Judge as Laser
	//  * @param	includePlayer	Avoid player(returns false);
	//  * @param	avoidHurting	Avoid harmful block(returns false);
	//  * @return	true if can pass.
	//  */
	// testCanPass(position: fPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean;
	// testIntCanPass(position: iPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean;
	// /** return testCanPass in player's front position. */
	// testFrontCanPass(entity: Entity, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean;
	// testBonusBoxCanPlaceAt(position: iPoint): boolean;
	// /**
	//  * TODO: 【2023-09-29 12:20:42】留存存疑
	//  * @param player 待测试的玩家
	//  * @param includePlayer 是否包括其它玩家
	//  * @param avoidHurting 是否避免伤害
	//  */
	// testPlayerCanPass(player: IPlayer, destination: iPoint, includePlayer: boolean/* = true*/, avoidHurting: boolean/* = false*/): boolean;
	// testPlayerCanPassToFront(player: IPlayer, rotatedAsDirection: mRot/* = 5*/, includePlayer: boolean/* = true*/, avoidTrap: boolean/* = false*/): boolean;
	// testCarriableWithMap(blockAtt: BlockAttributes, map: IMap): boolean;
	// testBreakableWithMap(blockAtt: BlockAttributes, map: IMap): boolean;
	// toolCreateExplode(
	// 	position: fPoint,
	// 	finalRadius: number,
	// 	damage: uint, projectile: Projectile,
	// 	color: uint, edgePercent: number/* = 1*/): void;
	// waveHurtPlayers(wave: Wave): void;
	// laserHurtPlayers(laser: Laser): void;
	// thrownBlockHurtPlayer(block: ThrownBlock): void;
	// lightningHurtPlayers(lightning: Lightning, players: IPlayer[], damages: uint[]): void;
	// /**
	//  * * 应用：当方块更新时，对所有处于其上的「格点实体」回调事件
	//  */
	// blockTestWithEntitiesInGrid(): void;
	// /**
	//  * 当玩家「进入某个位置」（玩家当前位置）时触发的事件
	//  * @param player 「进入某个方块位置」的玩家
	//  * @param isLocationChange 是否为「位置改变」引起的
	//  * @returns 是否有对玩家的作用（用于向玩家反馈，重置「伤害冷却」）
	//  */
	// onPlayerWalkIn(player: IPlayer, isLocationChange: boolean/* = false*/): boolean;
	// /**
	//  * Operate damage to player by blockAtt.playerDamage,
	//  * int.MAX_VALUE -> uint$MAX_VALUE
	//  * [...-2) -> 0
	//  * -1 -> uint$MAX_VALUE
	//  * [0,100] -> player.maxHP*playerDamage/100
	//  * (100...] -> playerDamage-100
	//  * @return	The damage.
	//  */
	// computeFinalPlayerHurtDamage(player: IPlayer, position: iPoint, playerDamage: int): uint;
	// /**
	//  * Execute when Player Move out block
	//  * @param	x	the old X
	//  * @param	y	the old Y
	//  */
	// moveOutTestPlayer(player: IPlayer, position: iPoint, isLocationChange: boolean/* = false*/): void;
	// /** Function about Player pickup BonusBox */
	// bonusBoxTest(player: IPlayer, x: number/* = NaN*/, y: number/* = NaN*/): boolean;
	// //====Functions About Map====//
	// hasBlock(position: iPoint): boolean;
	// getBlock(position: iPoint): Block;
	// getBlockAttributes(position: iPoint): BlockAttributes;
	// getBlockType(position: iPoint): BlockType;
	// /**
	//  * Set Block in map,and update Block in map displayer.
	//  * @param	x	the Block position x.
	//  * @param	y	the Block position y.
	//  * @param	block	the current Block.
	//  */
	// setBlock(position: iPoint, block: Block): void;
	// isVoid(position: iPoint): boolean;
	// /**
	//  * Set void in map,and clear Block in map displayer.
	//  * @param	x	the void position x.
	//  * @param	y	the void position y.
	//  */
	// setVoid(position: iPoint): void;
	// !【2023-10-02 22:38:37】废除原因：不再参与「显示机制」
	// forceMapDisplay(): void;
	// updateMapDisplay(position: iPoint, block: Block): void;
	// getDisplayerThenLayer(layer: int): IMapDisplayer;
	// updateMapSize(updateBackground: boolean/* = true*/): void;
	// /**
	//  * 加载地图
	//  */
	// loadMap(isInitial: boolean/* = false*/, update: boolean/* = true*/, reSpreadPlayer: boolean/* = false*/): void;
	// /**
	//  * 加载随机地图
	//  */
	// getRandomMap(): IMap;
	// /**
	//  * 直接变更地图（可能不会更新）
	//  */
	// changeMap(map: IMap, update: boolean/* = true*/, reSpreadPlayer: boolean/* = false*/): void;
	/**
	 * 地图变换
	 * TODO: 计划：使用一个独立的「世界控制器」去做这件事情？
	 *   * 📌这让整个母体更像Matrix了
	 */
	// transformMap(destination: IMap/* = null*/): void;
	//====Functions About Player====// TODO: 下面都计划「外置」
	// createPlayer(position: iPoint, id: uint, team: PlayerTeam, isActive: boolean/* = true*/): IPlayer;
	// addPlayer(id: uint, team: PlayerTeam, position: iPoint, direction: mRot/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): IPlayer;
	// // Set player datas for gaming
	// setupPlayer(player: IPlayer): IPlayer;
	// // Add a player uses random position and tool
	// appendPlayer(controlKeyID: uint/* = 0*/): IPlayer;
	// // TODO: 这几个应该在外部加载安排控制器时做好
	// // createAI(position: iPoint, team: PlayerTeam, isActive: boolean/* = true*/): AIPlayer;
	// // addAI(team: PlayerTeam, position: iPoint, direction: mRot/* = 0*/, isActive: boolean/* = true*/, name: string/* = null*/): AIPlayer;
	// // appendAI(): IPlayer;
	// // autoGetAIName(player: AIPlayer): string;
	// spawnPlayersByRule(): void;
	// teleportPlayerTo(player: IPlayer, position: iPoint, rotateTo: uint/* = GlobalDirection.NULL*/, effect: boolean/* = false*/): IPlayer;
	// spreadPlayer(player: IPlayer, rotatePlayer: boolean/* = true*/, createEffect: boolean/* = true*/): IPlayer;
	// /**
	//  * Respawn player to spawn point(if map contained);
	//  * @param	player	The player will respawn.
	//  * @return	The same as param:player.
	//  */
	// respawnPlayer(player: IPlayer): IPlayer;
	// /**
	//  * @param	x	SpawnPoint.x
	//  * @param	y	SpawnPoint.y
	//  * @return	The nearest point from SpawnPoint.
	//  */
	// findFitSpawnPoint(player: IPlayer, position: iPoint): iPoint;
	// subFindSpawnPoint(player: IPlayer, position: iPoint, r: int): iPoint;
	// spreadAllPlayer(): void;
	// hitTestOfPlayer(p1: IPlayer, p2: IPlayer): boolean;
	// hitTestPlayer(player: IPlayer, position: iPoint): boolean;
	// isHitAnyPlayer_F(position: fPoint): boolean;
	// isHitAnyPlayer_I(position: iPoint): boolean;
	// isHitAnotherPlayer(player: IPlayer): boolean;
	// hitTestOfPlayers(...players: IPlayer[]): boolean;
	// getHitPlayers(position: fPoint): IPlayer[]
	// getHitPlayerAt(position: iPoint): IPlayer;
	// randomizeAllPlayerTeam(): void;
	// randomizePlayerTeam(player: IPlayer): void;
	// setATeamToNotAIPlayer(team: PlayerTeam/* = null*/): void;
	// setATeamToAIPlayer(team: PlayerTeam/* = null*/): void;
	// changeAllPlayerTool(tool: Tool/* = null*/): void;
	// changeAllPlayerToolRandomly(): void;
	// movePlayer(player: IPlayer, direction: mRot, distance: number): void;
	// playerUseTool(player: IPlayer, direction: mRot, chargePercent: number): void;
	// playerUseToolAt(
	// 	player: IPlayer | null,
	// 	tool: Tool,
	// 	position: fPoint, toolDirection: mRot,
	// 	chargePercent: number, projectilesSpawnDistance: number
	// ): void;
	// getLaserLength(player: IPlayer, direction: mRot): uint;
	// getLaserLength2(position: iPoint, direction: mRot): uint;
	// lockEntityInMap(entity: Entity): void;
	// lockPosInMap(posNum: number, returnAsX: boolean): number;
	// lockIntPosInMap(posNum: int, returnAsX: boolean): int;
	// lockIPointInMap(point: iPoint): iPoint;
	// clearPlayer(onlyDisplay: boolean/* = false*/): void;
	//======Entity Functions======// TODO: 计划外置到「原生世界机制」中
	// updateProjectilesColor(player: IPlayer/* = null*/): void;
	// addBonusBox(position: iPoint, type: BonusType): void;
	// randomAddBonusBox(type: BonusType): void;
	// randomAddRandomBonusBox(): void;
	// fillBonusBox(): void;
	// addSpawnEffect(position: fPoint): void;
	// addTeleportEffect(position: fPoint): void;
	// addPlayerDeathLightEffect(
	// 	position: fPoint,
	// 	player: IPlayer,
	// 	reverse: boolean/* = false*/
	// ): void;
	// addPlayerDeathFadeoutEffect(
	// 	position: fPoint,
	// 	player: IPlayer,
	// 	reverse: boolean/* = false*/
	// ): void;
	// addPlayerLevelupEffect(position: fPoint, color: uint, scale: number): void;
	// addBlockLightEffect(position: fPoint, color: uint, alpha: uint, reverse: boolean/* = false*/): void;
	// addBlockLightEffect2(position: fPoint, block: Block, reverse: boolean/* = false*/): void;
	// addPlayerHurtEffect(player: IPlayer, reverse: boolean/* = false*/): void;
	//======Hook Functions======// TODO: 计划外置到「原生世界机制」中
	// onPlayerMove(player: IPlayer): void;
	// onPlayerUse(player: IPlayer, direction: mRot, distance: number): void;
	// onPlayerHurt(attacker: IPlayer | null, victim: IPlayer, damage: uint): void;
	// /**
	//  * Deal the (victim&attacker)'s (stat&heal),add effect and reset (CD&charge);
	//  * @param	attacker
	//  * @param	victim
	//  * @param	damage
	//  */
	// onPlayerDeath(attacker: IPlayer | null, victim: IPlayer, damage: uint): void;
	// onPlayerRespawn(player: IPlayer): void;
	// prePlayerLocationChange(player: IPlayer, oldP: iPoint): void;
	// onPlayerLocationChange(player: IPlayer, newP: iPoint): void;
	// onPlayerTeamsChange(event: WorldRuleEvent): void;
	// onPlayerLevelup(player: IPlayer): void;
	// onRandomTick(position: iPoint): void;
	// onBlockUpdate(position: iPoint, block: Block): void;

}
