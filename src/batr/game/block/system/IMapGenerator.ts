package batr.game.map {

	import batr.game.block.*;

	public interface IMapGenerator {
		function generateTo(map: IMap, clearBefore: boolean): IMap;
}
}