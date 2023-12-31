/**
 * It's used for commonly define rich-enum types.
 *
 * * Child Classes: BlockType, EntityType, EffectType, Tool, BonusType
 */
export default class TypeCommon {
	// 工具函数：列表相关 //
	public static isIncludeIn<T extends TypeCommon>(
		type: T,
		types: T[]
	): boolean {
		for (const type2 of types) {
			if (type === type2) return true
		}
		return false
	}

	public static fromName<T extends TypeCommon>(
		str: string,
		types: T[]
	): T | null {
		for (const type of types) {
			if (type.id == str) return type
		}
		return null
	}

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(
		/**
		 * 只读名称：只需设置一次
		 */
		public readonly id: string,
		/**
		 * 只读的「所属标签」：用于在「国际化接口」中的「唯一所指ID」
		 */
		public readonly label: string
	) {}
}
