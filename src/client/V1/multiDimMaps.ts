import IMap from '../../api/server/map/IMap'
import { iPoint } from '../../common/geometricTools'
import { uint } from '../../legacy/AS3Legacy'
import MapStorageSparse from '../../mods/native/map/MapStorageSparse'
import Map_V1 from '../../mods/native/map/Map_V1'
import { NativeBlockPrototypes } from '../../mods/native/registry/BlockRegistry_Native'
import { sparseMapMV稀疏地图母体可视化 } from '../../mods/visualization/textVisualizations'

/**
 * 用于测试「一个母体，异维地图」
 */
export const MULTI_DIM_TEST_MAPS: IMap[] = []

/** 从一维到四维 */
const DIM_MIN: uint = 1
const DIM_MAX: uint = 4
const DIM_MINs: iPoint = new iPoint()
const DIM_MAXs: iPoint = new iPoint()

let map: Map_V1, mss: MapStorageSparse
for (let i: uint = DIM_MIN; i <= DIM_MAX; i++) {
	// 尺寸
	const a: uint = uint(Math.ceil((20 * i) ** (1 / i))) - 1 // 边长 = 维数✓20*维数（向上取整），20 7 4 3
	DIM_MAXs.length = DIM_MINs.length = i
	DIM_MINs.fill(0)
	DIM_MAXs.fill(a)
	if (DIM_MAXs.checkInvalid() || DIM_MINs.checkInvalid())
		throw new Error(
			`Invalid dimension size: ${DIM_MINs.toString()} ~ ${DIM_MAXs.toString()}`
		)
	// 存储
	mss = new MapStorageSparse(i)
	mss.borderMin.copyFromArgs(...DIM_MINs.slice(0, i))
	mss.borderMax.copyFromArgs(...DIM_MAXs.slice(0, i))
	// 测试
	if (i > 1)
		// 一维就不要添堵了
		mss.setBlock(
			new iPoint().copyFrom(DIM_MAXs).fill(0),
			NativeBlockPrototypes.COLORED.softCopy()
		)
	// 生成
	map = new Map_V1(
		`维度测试_${i}维@${mss.size.join('x')}`,
		mss,
		new iPoint().copyFromArgs(...mss.size)
	)
	// 注册
	MULTI_DIM_TEST_MAPS.push(map)
	console.log(sparseMapMV稀疏地图母体可视化(mss, []))
}
// console.log(MULTI_DIM_TEST_MAPS)
// console.log('It is done.')
