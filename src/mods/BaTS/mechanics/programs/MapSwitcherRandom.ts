import { uint } from 'matriangle-legacy/AS3Legacy'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import { IEntityActive } from 'matriangle-api/server/entity/EntityInterfaces'
import IMap from 'matriangle-api/server/map/IMap'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import { getRandomMap } from '../BatrMatrixMechanics'
import MapSwitcher from './MapSwitcher'
import { MatrixRules_Native } from 'matriangle-mod-native/rule/MatrixRules_Native'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/**
 * 「地图切换者」是
 * * 活跃的
 * * 基于「内部时钟」定期更改母体地图的
 * * 作为AS3版本「地图变换机制」继任者的
 * 母体程序
 */
export default class MapSwitcherRandom
	extends MapSwitcher
	implements IEntityActive
{
	/** ID */
	public static readonly ID: typeID = 'MapSwitcherRandom'
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'MapSwitch:Random'

	// 构造&析构 //
	public constructor(switchInterval: uint) {
		super(MapSwitcherRandom.ID, MapSwitcherRandom.LABEL)
		this._mapSwitchTick = this.mapSwitchInterval = switchInterval
	}

	// 内部时钟 //
	protected _mapSwitchTick: uint
	/**
	 * 地图「定期切换」的周期间隔时长
	 */
	public mapSwitchInterval: uint

	// 活跃实体 //
	public readonly i_active = true as const

	// *实现：定期切换地图
	onTick(host: IMatrix): void {
		if (--this._mapSwitchTick <= 0) {
			this._mapSwitchTick = this.mapSwitchInterval
			// 获取新的地图 //
			let newMap: IMap
			// 先判断母体是否有相应的规则
			if (host.rule.hasRule(MatrixRules_Native.key_mapRandomPotentials)) {
				if (
					host.rule.safeGetRule<Map<IMap, number>>(
						MatrixRules_Native.key_mapRandomPotentials
					).size > 1
				)
					// 获取随机地图 // !【2023-10-08 22:31:40】现在对地图进行深拷贝
					newMap = getRandomMap(host.rule).copy(true)
				// 如果母体只有一个地图⇒返回
				else {
					console.info(
						'MapSwitcherRandom: 母体中只有一个地图，将不会切换！'
					)
					return
				}
			} else {
				console.error('并未在母体中找到相应的「地图随机规则」！')
				return
			}
			// 开始更改地图
			this.changeMap(host, newMap)
		}
	}
}
