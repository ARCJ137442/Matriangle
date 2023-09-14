
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { floatPoint, iPoint, intPoint } from "../../../../common/geometricTools";
import { mRot } from "../../../api/general/GlobalRot";
import { int, int$MAX_VALUE } from "../../../../legacy/AS3Legacy";
import Entity from "../../../api/entity/Entity";
import Player from "../entities/player/Player";
import BlockAttributes from "../../../api/block/BlockAttributes";
import IMapLogic from "../../../api/map/IMapLogic";
import IMapStorage from "../../../api/map/IMapStorage";

// import batr.game.map.*;
// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.map.main.*;

// import flash.utils.getQualifiedClassName;

/* This's a Game Map<Version 1>
 * This Map only save BlockType,not Block
 */
export default class MapLogic_V1 implements IMapLogic {

	protected _name: string;
	public get name(): string { return this._name; }

	protected _storage: IMapStorage;
	public get storage(): IMapStorage { return this._storage; }

	protected _isArena: boolean;
	public get isArenaMap(): boolean { return this._isArena; }

	//============Constructor & Destructor============//
	public constructor(name: string, storage: IMapStorage, isArena: boolean = false) {
		this._name = name;
		this._storage = storage;
		this._isArena = isArena;
	}

	/**
	 * 析构函数：删除所有方块（的引用）
	 */
	public destructor(): void {
		// this.clearBlock(); //! 现在「存储结构」可能是公用的，所以不能「跟着陪葬」
	}

	//============Interface Functions============//

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
	public towardWithRot_F(p: floatPoint, rot: mRot, step: number = 1.0): floatPoint {
		p[rot >> 1] += (rot & 1) === 0 ? step : -step;
		return p
	}

	public towardWithRot_I(p: intPoint, rot: mRot, step: int = 1): intPoint {
		p[rot >> 1] += (rot & 1) === 0 ? step : -step;
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
	public testBonusBoxCanPlaceAt(p: intPoint): boolean {
		throw new Error("Method not implemented.");
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testPlayerCanGo(player: Player, p: intPoint, includePlayer: boolean = false, avoidHurt: boolean = false): boolean {
		throw new Error("Method not implemented.");
	}

	// TODO: 后续完善实体系统后，再进行处理
	public testPlayerCanGoForward(player: Player, rotatedAsRot?: number | undefined, includePlayer: boolean = false, avoidHurt: boolean = false): boolean {
		throw new Error("Method not implemented.");
	}

	public isCarriable(blockAtt: BlockAttributes): boolean {
		return blockAtt.isCarriable && !(this._isArena && blockAtt.unbreakableInArenaMap);
	}
	// ! 目前这俩函数还没啥不同
	public isBreakable(blockAtt: BlockAttributes): boolean {
		return blockAtt.isBreakable && !(this.isArenaMap && blockAtt.unbreakableInArenaMap);
	}
}
function alignToGrid_P(p: floatPoint, _temp_testCanPass_IP: intPoint): intPoint {
	throw new Error("Function not implemented.");
}

