/**
 * All ChildClass:BlockType,EntityType,EffectType,WeaponType,BonusType
 */
export default class TypeCommon {
	//============Static Variables============//

	//============Static Getter And Setter============//

	//============Static Functions============//
	public static isIncludeIn(type: TypeCommon, types: TypeCommon[]): Boolean {
		for (var type2 of types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Instance Variables============//
	protected _name: String;

	//============Constructor Function============//
	public constructor(name: String) {
		this._name = name;
	}

	//============Instance Getter And Setter============//
	public get name(): String {
		return this._name;
	}

	public get label(): String {
		return 'common';
	}
}
