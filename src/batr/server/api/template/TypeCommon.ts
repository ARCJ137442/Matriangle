/**
 * It's used for commonly define rich-enum types.
 * 
 * * Child Classes: BlockType, EntityType, EffectType, Tool, BonusType
 */
export default class TypeCommon {

	// 工具函数：列表相关 //
	public static isIncludeIn<T extends TypeCommon>(type: T, types: T[]): boolean {
		for (let type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	public static fromName<T extends TypeCommon>(str: string, types: T[]): T | null {
		for (let type of types) {
			if (type.name == str) return type;
		}
		return null;
	}

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(
		/**
		 * 只读名称：只需设置一次
		 */
		public readonly name: string,
		/**
		 * 只读的「所属标签」：用于在「国际化接口」中的「唯一所指ID」
		 */
		public readonly label: string,
	) { }

}
