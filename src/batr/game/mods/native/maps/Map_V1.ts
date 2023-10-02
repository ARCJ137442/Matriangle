import IMap from "../../../api/map/IMap";
import IMapStorage from "../../../api/map/IMapStorage";
import IMapLogic from "../../../api/map/IMapLogic";
import { JSObjectifyMap, fastAddJSObjectifyMapProperty_dash, fastAddJSObjectifyMapProperty_dashP, loadRecursiveCriterion_true } from "../../../../common/JSObjectify";
import { fPoint, fPointRef, iPoint, iPointRef } from "../../../../common/geometricTools";
import { identity, key } from "../../../../common/utils";
import { int, int$MAX_VALUE } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../api/block/BlockAttributes";
import Entity from "../../../api/entity/Entity";
import { mRot, mRot2axis, towardX_MF } from "../../../general/GlobalRot";
import { alignToGrid_P } from "../../../general/PosTransform";
import Player from "../entities/player/Player";
import { IEntityInGrid, IEntityOutGrid } from "../../../api/entity/EntityInterfaces";
import IPlayer from "../entities/player/IPlayer";
import { IEntityWithDirection } from './../../../api/entity/EntityInterfaces';

/**
 * 第一版地图
 * * 迁移自AS3版本
 * 
 * ! 【2023-09-24 16:56:55】现在自身不再是逻辑层
 * * 因为二者「需要使用不同的方式进行对象化」
 */
export default class Map_V1 implements IMap {


	public static readonly OBJECTIFY_MAP: JSObjectifyMap = {};

	public get objectifyMap(): JSObjectifyMap { return Map_V1.OBJECTIFY_MAP }

	/** 存储层 */
	protected _storage: IMapStorage;
	public get storage(): IMapStorage { return this._storage }
	public static readonly key_storage: key = fastAddJSObjectifyMapProperty_dash(
		Map_V1.OBJECTIFY_MAP,
		'storage', undefined, /* 接口留通配符`undefined` */
		identity, identity,
		loadRecursiveCriterion_true, /* 复合对象总需要对象化 */
		(this_: any): IMapStorage => (this_ as Map_V1)._storage.cloneBlank()
	)

	/** 地图名称 */
	protected _name: string;
	public get name(): string { return this._name; }
	public static readonly key_name: key = fastAddJSObjectifyMapProperty_dashP(
		Map_V1.OBJECTIFY_MAP,
		'name', 'string',
	)

	/** 
	 * TODO: 所谓「竞技场」还有待进一步明确语义
	 */
	protected _isArena: boolean;
	public get isArenaMap(): boolean { return this._isArena; }

	// JS对象化 //

	/**
	 * 面向JS对象化：实现一个空白对象
	 * @param storage 所用的「存储结构」
	 */
	public static getBlank(storage: IMapStorage): IMap {
		return new Map_V1(
			'blank', storage,
		)
	}

	//============Constructor & Destructor============//
	public constructor(name: string, storage: IMapStorage, isArena: boolean = false) {
		this._name = name;
		this._storage = storage;
		this._isArena = isArena;
	}

	public destructor(): void {
		// this.storage.clearBlock(); // ! 存储结构可能共用，不能陪葬
	}


	//============Game Mechanics: 原「逻辑层」的机制============//
	public getBlockPlayerDamage(p: iPointRef, defaultValue: int = 0): int {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(p);
		if (blockAtt !== null)
			return blockAtt.playerDamage;
		return defaultValue;
	}

	public isKillZone(p: iPointRef, defaultValue: boolean = false): boolean {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(p);
		if (blockAtt !== null)
			return blockAtt.playerDamage == int$MAX_VALUE;
		return defaultValue;
	}

	// TODO: 更多待迁移

	// * 实现：取整→变到地图中
	protected _temp_isInMap_P: iPoint = new iPoint()
	public isInMap_F(p: fPointRef): boolean {
		return this.isInMap_I(
			alignToGrid_P(
				p, this._temp_isInMap_P // ! 使用缓存
			)
		);
	}

	// 实现：直接用地图的方法
	public isInMap_I(p: iPointRef): boolean {
		return this.storage.isInMap(p);
	}

	// 实现：直接用
	public towardWithRot_FF(p: fPointRef, rot: mRot, step: number = 1.0): fPointRef {
		p[mRot2axis(rot)] += (rot & 1) === 0 ? step : -step;
		return p
	}

	// 实现：直接用
	public towardWithRot_II(p: iPointRef, rot: mRot, step: int = 1): iPointRef {
		p[mRot2axis(rot)] += (rot & 1) === 0 ? step : -step;
		return p
	}

	// protected _temp_testCanPass_F: fPoint = new fPoint()
	protected _temp_testCanPass_I: iPoint = new iPoint()
	// 断言：永远在地图内
	public testCanPass_F(
		p: fPointRef,
		asPlayer: boolean,
		asBullet: boolean,
		asLaser: boolean,
		includePlayer: boolean = false,
		avoidHurting: boolean = false,
		players: IPlayer[] = [],
	): boolean {
		return this.testCanPass_I(
			alignToGrid_P(
				p, this._temp_testCanPass_I // ! 使用缓存
			),
			asPlayer, asBullet, asLaser,
			includePlayer, avoidHurting, players
		)
	}

	// * 原理：根据属性逐步判断（断言：永远在地图内）
	public testCanPass_I(
		p: iPointRef,
		asPlayer: boolean,
		asBullet: boolean,
		asLaser: boolean,
		avoidHurting: boolean = false,
		avoidOthers: boolean = false,
		others: IEntityInGrid[] = [],
	): boolean {
		// if(isOutOfMap(gridX,gridY)) return true
		let attributes: BlockAttributes | null = this.storage.getBlockAttributes(p);
		return !(
			attributes === null || // ! 默认行为：不可通过（【20230913 20:04:42】有助于找出bug）
			(avoidHurting && attributes.playerDamage > -1) || // 避免伤害
			(asPlayer && !attributes.canEnter) || // 判断「玩家是否可通过」
			(asBullet && !attributes.canShotIn) || // 判断「子弹是否可通过」
			(asLaser && !attributes.transparent) || // 判断「激光是否可通过」
			(avoidOthers && this.isHitAnyEntity_I_Grid(p, others))
		);
	}

	/**
	 * 测试「是否接触到任意一个格点实体」
	 * * 迁移自`Game.isHitAnyPlayer`
	 * 
	 * @param p 要测试的位置
	 * @param entities 需要检测的（格点）实体
	 * @returns 是否接触到任意一个格点实体
	 */
	public isHitAnyEntity_I_Grid(p: iPointRef, entities: IEntityInGrid[]): boolean {
		for (const entity of entities) {
			if (entity.position.isEqual(p)) // 暂时使用「坐标是否相等」的逻辑
				return true;
		}
		return false;
	}

	protected _temp_testFrontCanPass_P: iPoint = new iPoint()
	/**
	 * 
	 * @param entity 待测试的实体
	 * @param distance 距离（浮点数）
	 * @param asPlayer 作为玩家
	 * @param asBullet 作为子弹
	 * @param asLaser 作为激光
	 * @param includePlayer 是否包括玩家
	 * @param avoidHurt 避免伤害
	 * @param players 所涉及的玩家
	 * @returns 实体前方是否可通行
	 */
	public testFrontCanPass_FF(
		entity: IEntityOutGrid & IEntityWithDirection, distance: number,
		asPlayer: boolean,
		asBullet: boolean,
		asLaser: boolean,
		includePlayer: boolean = false,
		avoidHurt: boolean = false,
		players: IPlayer[] = [],
	): boolean {
		return this.testCanPass_F(
			this.towardWithRot_FF(
				this._temp_testFrontCanPass_P.copyFrom(entity.position),
				entity.direction, distance,
			),
			asPlayer, asBullet, asLaser,
			includePlayer, avoidHurt,
			players
		);
	}

	/**
	 * 用于判断一个地方是否适合放置奖励箱
	 * * 逻辑：玩家可通过的地方
	 * @param p 测试的地点
	 * @param avoids 用于检测「是否避免与之接触」的格点实体列表
	 * @returns 
	 */
	public testBonusBoxCanPlaceAt(p: iPointRef, avoids: IEntityInGrid[]): boolean {
		return this.testCanPass_I(
			p,
			true, false, false,
			true, true,
			avoids
		);
	}

	/** 实现：暂时使用「竞技场地图」判断 */
	public isBlockCarriable(position: iPointRef, defaultWhenNotFound: BlockAttributes): boolean {
		let blockAttributes: BlockAttributes = this.storage.getBlockAttributes(position) ?? defaultWhenNotFound
		return (
			blockAttributes.isCarriable &&
			!( // 竞技场地图「特别判断」
				this._isArena &&
				blockAttributes.unbreakableInArenaMap
			)
		)
	}

	/** 实现：暂时使用「竞技场地图」判断 */
	public isBlockBreakable(position: iPointRef, defaultWhenNotFound: BlockAttributes): boolean {
		let blockAttributes: BlockAttributes = this.storage.getBlockAttributes(position) ?? defaultWhenNotFound
		return (
			blockAttributes.isBreakable &&
			!( // 竞技场地图「特别判断」
				this.isArenaMap &&
				blockAttributes.unbreakableInArenaMap
			)
		)
	}
}
