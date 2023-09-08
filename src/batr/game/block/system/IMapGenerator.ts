
// import batr.game.block.*;

import IMap from "./IMap";

export default interface IMapGenerator {
	generateTo(map: IMap, clearBefore: boolean): IMap;
}