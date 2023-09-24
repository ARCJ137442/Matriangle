import IMap from "../../../api/map/IMap";
import IMapStorage from "../../../api/map/IMapStorage";
import IMapLogic from "../../../api/map/IMapLogic";
import { JSObjectifyMap, fastAddJSObjectifyMapProperty_dash, fastAddJSObjectifyMapProperty_dashP, loadRecursiveCriterion_true } from "../../../../common/JSObjectify";
import { iPoint, floatPoint, intPoint, iPointRef } from "../../../../common/geometricTools";
import { identity, key } from "../../../../common/utils";
import { int, int$MAX_VALUE } from "../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../api/block/BlockAttributes";
import Entity from "../../../api/entity/Entity";
import { mRot, mRot2axis } from "../../../general/GlobalRot";
import { alignToGrid_P } from "../../../general/PosTransform";
import Player from "../entities/player/Player";

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
	public getBlockPlayerDamage(p: iPoint, defaultValue: int = 0): int {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(p);
		if (blockAtt != null)
			return blockAtt.playerDamage;
		return defaultValue;
	}

	public isKillZone(p: iPoint, defaultValue: boolean = false): boolean {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(p);
		if (blockAtt != null)
			return blockAtt.playerDamage == int$MAX_VALUE;
		return defaultValue;
	}

	// TODO: 更多待迁移

	// * 实现：取整→变到地图中
	protected _temp_isInMap_P: iPoint = new iPoint()
	public isInMap_F(p: floatPoint): boolean {
		return this.isInMap_I(
			alignToGrid_P(
				p, this._temp_isInMap_P // ! 使用缓存
			)
		);
	}

	// 实现：直接用地图的方法
	public isInMap_I(p: intPoint): boolean {
		return this.storage.isInMap(p);
	}

	// 实现：直接用
	public towardWithRot_FF(p: floatPoint, rot: mRot, step: number = 1.0): floatPoint {
		p[mRot2axis(rot)] += (rot & 1) === 0 ? step : -step;
		return p
	}

	// 实现：直接用
	public towardWithRot_II(p: intPoint, rot: mRot, step: int = 1): intPoint {
		p[mRot2axis(rot)] += (rot & 1) === 0 ? step : -step;
		return p
	}

	// protected _temp_testCanPass_FP: fPoint = new fPoint()
	protected _temp_testCanPass_IP: iPoint = new iPoint()
	// 断言：永远在地图内
	public testCanPass_F(p: floatPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = false, avoidHurting: boolean = false): boolean {
		return this.testCanPass_I(
			alignToGrid_P(
				p, this._temp_testCanPass_IP // ! 使用缓存
			),
			asPlayer, asBullet, asLaser, includePlayer, avoidHurting
		)
	}
	// * 原理：根据属性逐步判断（断言：永远在地图内）
	public testCanPass_I(p: intPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = false, avoidHurting: boolean = false): boolean {

		// if(isOutOfMap(gridX,gridY)) return true
		let attributes: BlockAttributes | null = this.storage.getBlockAttributes(p);
		if (attributes === null) return false // ! 默认行为：不可通过（【20230913 20:04:42】有助于找出bug）

		if (avoidHurting && attributes.playerDamage > -1) return false;
		if (asPlayer && !attributes.playerCanPass) return false;
		if (asBullet && !attributes.bulletCanPass) return false;
		if (asLaser && !attributes.laserCanPass) return false;
		// if (includePlayer && this.isHitAnyPlayer(p)) return false; // TODO: 这段有关「玩家(格点实体)」的代码，后续要重构

		return true;
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testFrontCanPass(entity: Entity, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer: boolean = false, avoidHurt: boolean = false): boolean {
		// return this.towardWithRot_F
		throw new Error("Method not implemented.");
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testBonusBoxCanPlaceAt(p: iPointRef): boolean {
		throw new Error("Method not implemented.");
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testPlayerCanGo(player: Player, p: iPointRef, includePlayer: boolean = false, avoidHurt: boolean = false): boolean {
		throw new Error("Method not implemented.");
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testPlayerCanGoForward(player: Player, rotatedAsRot?: mRot, includePlayer: boolean = false, avoidHurt: boolean = false): boolean {
		throw new Error("Method not implemented.");
	}

	/** 实现：暂时使用「竞技场地图」判断 */
	public isBlockCarriable(position: iPoint, defaultWhenNotFound: BlockAttributes): boolean {
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
	public isBlockBreakable(position: iPoint, defaultWhenNotFound: BlockAttributes): boolean {
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
