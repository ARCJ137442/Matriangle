
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { iPoint } from "../../../common/geometricTools";
import { DISPLAY_GRIDS } from "../../../display/GlobalDisplayVariables";
import { uint, int } from "../../../legacy/AS3Legacy";
import IMap from "./IMap";
import MapLogic_V1 from "./MapLogic_V1";
import IMapStorage from "./IMapStorage";
import IMapLogic from "./IMapLogic";

// import batr.game.map.*;
// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.map.main.*;

// import flash.utils.getQualifiedClassName;

/**
 * 第一版地图
 * * 迁移自AS3版本
 * * 自身即逻辑层，继承自MapLogic_V1
 */
export default class Map_V1 extends MapLogic_V1 implements IMap {
	//============Static Variables============//
	protected static readonly _SIZE: uint = DISPLAY_GRIDS;

	//============Static Functions============//
	public static pointToIndex(x: int, y: int): string {
		return String(x + '_' + y);
	}

	public static indexToPoint(str: string): iPoint {
		let s: string[] = str.split('_');

		return new iPoint(int(s[0]), int(s[1]));
	}

	//============Constructor & Destructor============//
	public constructor(name: string, storage: IMapStorage, isArena: boolean = false) {
		super(name, storage, isArena);
	}

	override destructor(): void {
		// this.storage.clearBlock(); // ! 存储结构可能共用，不能陪葬
		super.destructor();
	}

	//============Instance Getter And Setter============//

	public get logic(): IMapLogic { return this }
	// public get storage(): IMapStorage { return this._storage }

}