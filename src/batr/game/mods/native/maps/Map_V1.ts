import IMap from "../../../api/map/IMap";
import IMapStorage from "../../../api/map/IMapStorage";
import IMapLogic from "../../../api/map/IMapLogic";
import { JSObjectifyMap, fastAddJSObjectifyMapProperty_dash, fastAddJSObjectifyMapProperty_dashP, loadRecursiveCriterion_true } from "../../../../common/JSObjectify";
import { fPoint, fPointRef, iPoint, iPointRef, modPoint_FI } from "../../../../common/geometricTools";
import { identity, key } from "../../../../common/utils";
import { int, int$MAX_VALUE, uint } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../api/block/BlockAttributes";
import Entity from "../../../api/entity/Entity";
import { mRot, mRot2axis, towardX_MF } from "../../../general/GlobalRot";
import { alignToGrid_P } from "../../../general/PosTransform";
import Player from "../entities/player/Player";
import { IEntityInGrid, IEntityOutGrid } from "../../../api/entity/EntityInterfaces";
import IPlayer from "../entities/player/IPlayer";
import { IEntityWithDirection } from './../../../api/entity/EntityInterfaces';
import { isHitAnyEntity_I_Grid } from "../registry/NativeGameMechanics";

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
			undefined
		)
	}

	//============Constructor & Destructor============//
	public constructor(
		name: string,
		storage: IMapStorage,
		size: iPointRef | undefined,
		isArena: boolean = false
	) {
		this._name = name;
		this._storage = storage;
		this._isArena = isArena;
		if (size !== undefined) this._size = size; // 复制值
	}

	public destructor(): void {
		// this.storage.clearBlock(); // ! 存储结构可能共用，不能陪葬
	}

	//============Game Mechanics: 原「逻辑层」的机制============//

	// 有限无界逻辑
	/**
	 * 地图写死的一个「固定边界」是0~x_i
	 * * 由先前AS3版本迁移而来
	 * * 或许未来某个版本会被泛化，以允许非零边界和负数坐标
	 */
	protected readonly _size: iPoint = new iPoint();
	public static readonly key_size: key = fastAddJSObjectifyMapProperty_dash(
		Map_V1.OBJECTIFY_MAP,
		'size', iPoint,
		identity, identity,
		loadRecursiveCriterion_true,
		(): iPoint => new iPoint(),
	) // ? copy的时候怎么办呢
	/** ⚠️注意：setter只复制元素 */
	public get size(): iPoint { return this._size; }
	public set size(v: iPoint) { this._size.copyFrom(v); }

	/**
	 * （非实现）将一个点的坐标做「有限无界」处理（浮点版本）
	 */
	public limitPoint_F(p: fPointRef): fPointRef {
		for (let i: uint = 0; i < p.length; i++) {
			if (p[i] < 0 || p[i] >= this._size[i])
				// modPoint_FI(p, this._size);
				p[i] %= this._size[i];
		}
		return p;
	}

	/**
	 * （非实现）将一个点的坐标做「有限无界」处理（整数版本）
	 */
	public limitPoint_I(p: iPointRef): iPointRef {
		for (let i: uint = 0; i < p.length; i++) {
			if (p[i] < 0 || p[i] > this._size[i])
				// modPoint_FI(p, this._size);
				p[i] %= this._size[i];
		}
		return p;
	}

	// 对接世界逻辑
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
		return this.limitPoint_F(p);
	}

	// 实现：直接用
	public towardWithRot_II(p: iPointRef, rot: mRot, step: int = 1): iPointRef {
		p[mRot2axis(rot)] += (rot & 1) === 0 ? step : -step;
		return this.limitPoint_I(p);
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
			(avoidOthers && isHitAnyEntity_I_Grid(p, others))
		);
	}

	protected _temp_testFrontCanPass_P: iPoint = new iPoint()
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
