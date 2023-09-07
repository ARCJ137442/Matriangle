/**
 * All ChildClass:BlockType,EntityType,EffectType,WeaponType,BonusType
 */
export default class TypeCommon {
	//============Static Variables============//

	//============Static Getter And Setter============//

	//============Static Functions============//
	public static isIncludeIn(type: TypeCommon, types: Vector.<TypeCommon>): Boolean {
		for each(var type2: TypeCommon in types) {
			if (type === type2)
				return true;
		}
		return false;
	}

	//============Instance Variables============//
	protected var _name: String;

	//============Constructor Function============//
	public TypeCommon(name: String) {
		super();
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