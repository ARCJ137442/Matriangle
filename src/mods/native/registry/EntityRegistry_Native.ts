import { DisplayLevel } from 'matriangle-api/display/DisplayInterfaces'
import Player_V1 from '../entities/player/Player_V1'
import EntityType from 'matriangle-api/server/entity/EntityType'

/**
 * 用于识别的「实体类型」
 * * 存储与「实体类」有关的元信息
 *
 * ! 这应该是静态的：即「一个『类型实例』对应多个『实体实例』的引用」
 *
 * !【2023-10-01 16:18:46】这不应该在「所有实体类加载完成前」被导入
 *
 * TODO: 这个module有待重构——EntityType还有无必要？
 *
 */
export module NativeEntityTypes {
	//============Registry============//

	// （初代）玩家
	export const PLAYER: EntityType = new EntityType(
		Player_V1.ID,
		Player_V1,
		DisplayLevel.PLAYER
	)

	/**
	 * 注册表：声明所有原生实体
	 * * 在后面直接使用「filter」方法筛选，避免「各类型数组」的难以管理问题
	 */
	export const _ALL_ENTITY: EntityType[] = [
		// 玩家
		PLAYER,
	]
}
