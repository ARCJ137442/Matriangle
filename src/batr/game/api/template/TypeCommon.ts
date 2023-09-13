/**
 * It's used for commonly define rich-enum types.
 * 
 * * Child Classes: BlockType, EntityType, EffectType, ToolType, BonusType
 */
export default class TypeCommon {
	//============Static Variables============//

	//============Static Getter And Setter============//

	//============Static Functions============//
	public static isIncludeIn(type: TypeCommon, types: TypeCommon[]): boolean {
		for (let type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Instance Variables============//
	protected _name: string;

	//============Constructor & Destructor============//
	public constructor(name: string) {
		this._name = name;
	}

	//============Instance Getter And Setter============//
	public get name(): string {
		return this._name;
	}

	public get label(): string {
		return 'common';
	}
}
