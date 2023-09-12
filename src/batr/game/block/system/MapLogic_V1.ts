
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { floatPoint, iPoint, intPoint } from "../../../common/geometricTools";
import { int, int$MAX_VALUE } from "../../../legacy/AS3Legacy";
import EntityCommon from "../../entity/EntityCommon";
import Player from "../../entity/entities/player/Player";
import BlockAttributes from "../BlockAttributes";
import IMapLogic from "./IMapLogic";
import IMapStorage from "./IMapStorage";

// import batr.game.map.*;
// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.map.main.*;

// import flash.utils.getQualifiedClassName;

/* This's a Game Map<Version 1>
 * This Map only save BlockType,not BlockCommon
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
	protected _temp_isImMap_P: iPoint = new iPoint()
	isInMap_F(p: floatPoint): boolean {
		throw new Error("Method not implemented.");
	}
	isInMap_I(p: intPoint): boolean {
		throw new Error("Method not implemented.");
	}
	towardWithRot_F(p: floatPoint, rot: number, step?: number | undefined): floatPoint {
		throw new Error("Method not implemented.");
	}
	towardWithRot_I(p: intPoint, rot: number, step?: number | undefined): intPoint {
		throw new Error("Method not implemented.");
	}
	testCanPass_F(p: floatPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean | undefined, avoidHurting?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}
	testCanPass_I(p: intPoint, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean | undefined, avoidHurting?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}
	testFrontCanPass(entity: EntityCommon, distance: number, asPlayer: boolean, asBullet: boolean, asLaser: boolean, includePlayer?: boolean | undefined, avoidHurt?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}
	testBonusBoxCanPlaceAt(p: intPoint): boolean {
		throw new Error("Method not implemented.");
	}
	testPlayerCanGo(player: Player, p: intPoint, includePlayer?: boolean | undefined, avoidHurt?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}
	testPlayerCanGoForward(player: Player, rotatedAsRot?: number | undefined, includePlayer?: boolean | undefined, avoidHurt?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}
	isCarriable(blockAtt: BlockAttributes): boolean {
		throw new Error("Method not implemented.");
	}
	isBreakable(blockAtt: BlockAttributes): boolean {
		throw new Error("Method not implemented.");
	}
}