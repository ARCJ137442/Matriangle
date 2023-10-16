import { int } from 'matriangle-legacy/AS3Legacy'
import IMapStorage from 'matriangle-api/server/map/IMapStorage'
import { BatrBlockPrototypes } from '../registry/BlockRegistry_Batr'
import { _temp_point_2d } from 'matriangle-mod-native/map/MapConstructTools_Native'

/**
 * 增加重生点，顺带在其位置附带一个「重生点标记」
 * * 继承自AS3地图逻辑
 */
export function addSpawnPointWithMark(
	storage: IMapStorage,
	x: int,
	y: int
): void {
	_temp_point_2d.copyFromArgs(x, y)
	storage.addSpawnPointAt(_temp_point_2d)
	storage.setBlock(
		_temp_point_2d,
		BatrBlockPrototypes.SPAWN_POINT_MARK.copy() // ! 属性固定且无状态，故浅拷贝
	)
}
