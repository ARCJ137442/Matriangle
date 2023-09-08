package batr.game.map.main {

	import batr.common.*;
	import batr.general.*;

	import batr.game.block.*;
	import batr.game.block.blocks.*;
	import batr.game.map.*;
	import batr.game.map.main.*;

	/**
	 * ...
	 * @author ARCJ137442
	 */
	export default class MapGenerator implements IMapGenerator {
		//============Static Variables============//
		protected static generateChaos: Function;

		//============Static Getter and Setter============//

		//============Static Functions============//

		//============Instance Variables============//
		protected _generateFunc: Function;

		//============Constructor============//
		public constructor(generateFunc: Function) {
			this._generateFunc = generateFunc;
		}

		/* INTERFACE batr.game.map.IMapGenerator */
		public generateTo(map: IMap, clearBefore: boolean): IMap {
			if (clearBefore)
				map.removeAllBlock();
			// trace('generateNew:generating!',this._generateFunc)
			if (this._generateFunc != null)
				return this._generateFunc(map);
			return map;
		}
	}
}