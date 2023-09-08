
// import batr.game.block.*;

export default interface IMapGenerator {
	generateTo(map: IMap, clearBefore: boolean): IMap;
}