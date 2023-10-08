import { iPoint } from '../src/batr/common/geometricTools';
import { uint } from '../src/batr/legacy/AS3Legacy';
import MapStorageSparse from '../src/batr/server/mods/native/maps/MapStorageSparse';
import IMap from './../src/batr/server/api/map/IMap';
import Map_V1 from './../src/batr/server/mods/native/maps/Map_V1';
import { 稀疏地图母体可视化 } from "../src/batr/server/mods/visualization/textVisualizations";

/**
 * 用于测试「一个母体，异维地图」
 */
export const MULTI_DIM_TEST_MAPS: IMap[] = [];

/** 从一维到四维 */
const DIM_MIN: uint = 1;
const DIM_MAX: uint = 4;
const DIM_MINs: iPoint = new iPoint(0, 0, 0, 0);
const DIM_MAXs: iPoint = new iPoint(3, 3, 3, 3);

let map: Map_V1, mss: MapStorageSparse;
for (let i: uint = DIM_MIN; i <= DIM_MAX; i++) {
	let a: uint = uint(Math.ceil((20 * i) ** (1 / i))) - 1 // 边长 = 维数✓20*维数（向上取整），20 7 4 3
	DIM_MAXs.fill(a);
	mss = new MapStorageSparse(i);
	mss.borderMin.copyFromArgs(...DIM_MINs.slice(0, i))
	mss.borderMax.copyFromArgs(...DIM_MAXs.slice(0, i))
	map = new Map_V1(
		`维度测试_${i}维@${mss.size.join('x')}`,
		mss,
		new iPoint().copyFromArgs(...mss.size),
	);
	MULTI_DIM_TEST_MAPS.push(map)
	console.log(稀疏地图母体可视化(mss, []))
}
// console.log(MULTI_DIM_TEST_MAPS)
// console.log('It is done.')
