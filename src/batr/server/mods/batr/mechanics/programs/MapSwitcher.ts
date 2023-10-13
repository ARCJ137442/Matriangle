import { MatrixProgram, MatrixProgramLabel } from '../../../../api/control/MatrixProgram'
import Effect from '../../../../api/entity/Effect'
import Entity from '../../../../api/entity/Entity'
import IMap from '../../../../api/map/IMap'
import IMatrix from '../../../../main/IMatrix'
import BonusBox from '../../entity/item/BonusBox'
import IPlayer, { isPlayer } from '../../../native/entities/player/IPlayer'
import Projectile from '../../entity/projectile/Projectile'
import { changeMap, projectEntity } from '../../../native/mechanics/NativeMatrixMechanics'
import { spreadPlayer } from '../../../native/mechanics/NativeMatrixMechanics'
import { i_batrPlayer } from '../../entity/player/IPlayerBatr'

/**
 * 「地图切换者」是
 * * 活跃的
 * * 基于「内部时钟」定期更改母体地图的
 * * 作为AS3版本「地图变换机制」继任者的
 * 母体程序
 */
export default abstract class MapSwitcher extends MatrixProgram {
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'MapSwitch'

	/**
	 * The Main PURPOSE: 切换地图
	 * * 原`transformMap`
	 *
	 * ? 「中途切换地图」但后续还遍历到抛射体/玩家，怎么处理
	 *
	 * @param host 需要「切换地图」的母体
	 */
	protected changeMap(host: IMatrix, newMap: IMap): void {
		// 实体预备 //
		const entities: Entity[] = host.entities
		const players: IPlayer[] = []
		// 新建一个映射，缓存所有实体的激活状态 // * 避免「变换前未激活的实体，变换后异常被激活」
		const entityActives: Map<Entity, boolean> = new Map()
		// 处理旧实体
		for (const entity of entities) {
			// 清除所有抛射体、奖励箱和特效
			if (entity instanceof Projectile || entity instanceof BonusBox || entity instanceof Effect)
				host.removeEntity(entity)
			// 记录玩家
			else if (isPlayer(entity)) players.push(entity)
			// 冻结实体：取消实体激活
			entityActives.set(entity, entity.isActive)
			entity.isActive = false
		}
		// 改变地图 //
		changeMap(host, newMap, true)
		// 插入「最终代码」：恢复激活、分散并告知玩家等 //
		host.insertFinalExecution((): void => {
			// 重新激活 // !这里使用「已回收后的实体列表」，先前被删除的实体不再处理
			for (const entity of host.entities) {
				// 必须「映射里有」才能恢复
				if (entityActives.has(entity)) entity.isActive = entityActives.get(entity) as boolean
				// 分散并告知玩家 // ! 必须是「执行该函数时母体中的玩家」，因为有可能在执行到这里之前玩家发生变动（杜绝「被删除但还是被遍历到」的情况）
				if (isPlayer(entity) && entity.isRespawning /* 必须不在重生过程中 */) {
					spreadPlayer(host, entity, true, true)
					if (i_batrPlayer(entity)) entity.onMapTransform(host)
				} // 否则：不做任何事情，保留状态 // * 可能是后续又新增了实体
				// 若有坐标⇒尝试投影坐标
				projectEntity(host.map /* 地图也有可能在中途被改变 */, entity)
			}
			// 清空映射
			entityActives.clear()
		})
		// TODO: 母体统计系统（参见`MatrixStats.ts`）
	}
}
