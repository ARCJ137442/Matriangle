
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { uint, int, int$MAX_VALUE } from "../../../legacy/AS3Legacy";
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

	public getBlockPlayerDamage(x: int, y: int, defaultValue: int = 0): int {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(x, y);
		if (blockAtt != null)
			return blockAtt.playerDamage;
		return defaultValue;
	}

	public isKillZone(x: int, y: int, defaultValue: boolean = false): boolean {
		let blockAtt: BlockAttributes | null = this._storage.getBlockAttributes(x, y);
		if (blockAtt != null)
			return blockAtt.playerDamage == int$MAX_VALUE;
		return defaultValue;
	}

	// TODO: 更多待迁移

}