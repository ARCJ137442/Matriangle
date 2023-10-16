import { iPoint, iPointRef, iPointVal } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import { mapVH地图可视化_高维 } from '../../mods/visualization/textVisualizations'
import { BatrDefaultMaps } from 'matriangle-mod-bats/registry/MapRegistry'
import IMap from 'matriangle-api/server/map/IMap'

/**
 * 堆叠合并多个地图
 * @param maps 待合并的地图（目前只支持稀疏地图）
 * @param pileAxis 堆叠所在的朝向
 * @param [deep=false] 是否深拷贝（对方块是「软拷贝」）
 */
export function stackMaps(
	maps: MapStorageSparse[],
	pileAxis: uint = maps[0].numDimension,
	deep: boolean = false
): MapStorageSparse {
	// 先检查除了「待堆叠轴向」外的尺寸
	const otherAxisSizes: uint[] = []
	let nDim: uint = 0
	const pileAxisSizes: Map<MapStorageSparse, uint | -1> = new Map()
	/** 是否是在一个新维度上堆叠 */
	let isInNewAxis: boolean = false
	for (const map of maps) {
		// 维数校对
		if (nDim === 0) nDim = map.numDimension
		else if (map.numDimension !== nDim) throw new Error('维数不一致！')
		// 除了「堆叠维度」外的其它尺寸校对
		const lSize = map.size.length
		for (let i = 0; i < lSize; i++) {
			// 计入「堆叠维数尺寸」
			if (i === pileAxis) pileAxisSizes.set(map, map.size[i])
			// 逐一比对
			else {
				otherAxisSizes[i] ??= map.size[i]
				if (otherAxisSizes[i] !== map.size[i])
					throw new Error('尺寸不一致！')
			}
		}
		// 若「待堆叠尺寸」没有⇒1
		if (!pileAxisSizes.has(map)) {
			pileAxisSizes.set(map, 1)
			isInNewAxis = true
		}
	}
	/** 待返回的新地图 */
	const nMap: MapStorageSparse = new MapStorageSparse(
		isInNewAxis ? nDim + 1 : nDim
	)
	// 开始合并
	const copyPointer: iPointVal = new iPoint()
	let pilePointer: uint = 0 // 堆叠从零开始
	let map: MapStorageSparse
	for (let i = 0; i < maps.length; ++i) {
		map = maps[i]
		// * 遍历所有位置，复制方块
		map.forEachValidPositions((p: iPointRef): void => {
			// 指针跟随
			copyPointer.copyFrom(p)
			copyPointer[pileAxis] = pilePointer // 可能会被覆写
			// 复制方块
			// * 函数式编程：决定是「原样」还是「拷贝」
			if (map.hasBlock(p))
				// ! 不能省略：地图格式可能不只有此一种
				nMap.setBlock(
					copyPointer,
					deep ? map.getBlock(p).copy() : map.getBlock(p).softCopy()
				)
		})
		// 复制重生点
		for (const sP of map.spawnPoints) {
			// 指针跟随
			copyPointer.copyFrom(sP)
			copyPointer[pileAxis] = pilePointer
			// 直接复制
			nMap.addSpawnPointAt(copyPointer)
		}
		// 最后向「上」递增
		pilePointer += pileAxisSizes.get(map) as uint
	}
	return nMap
}

console.log(
	mapVH地图可视化_高维(
		stackMaps(
			BatrDefaultMaps._ALL_MAPS.map(
				(map: IMap) => map.storage as MapStorageSparse
			)
		)
	)
)
