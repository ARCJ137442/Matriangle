/**
 * ...
 * @author ARCJ137442
 */
export default class MapGenerator implements IMapGenerator {
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