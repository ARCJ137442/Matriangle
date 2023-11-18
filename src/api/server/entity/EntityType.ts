import { DisplayLevel } from '../../display/DisplayInterfaces'
import { Class, int } from 'matriangle-legacy/AS3Legacy'
import TypeCommon from '../template/TypeCommon'

/**
 * 用于识别的「实体类型」
 * * 存储与「实体类」有关的元信息
 *
 * ! 这应该是静态的：即「一个『类型实例』对应多个『实体实例』的引用」
 */
export default class EntityType extends TypeCommon {
	//============Constructor & Destructor============//
	public constructor(
		// ! 现在不能用entityClass，因为「循环导入」可能没有初始化
		name: string,
		/**
		 * 对应的实体类
		 *
		 * ! 📌现在使用其类名作为名称
		 */
		public readonly entityClass: Class,
		/**
		 * （面向显示端）控制实体在显示端的显示堆叠层级
		 * * 参考：DisplayLayers
		 * * 默认：与玩家同层次
		 */
		public readonly displayLayer: int = DisplayLevel.PLAYER
	) {
		super(name, 'entity')
		if (!entityClass) throw new Error('entityClass is required')
	}
}
